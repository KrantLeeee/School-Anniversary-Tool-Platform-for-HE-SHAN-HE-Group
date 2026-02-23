import OpenAI from 'openai'
import { AgentChatContext, AgentStreamEvent } from '../core'
import { VolcengineAgent } from '../providers/volcengine'
import { db } from '@/lib/db'
import { uploadUrlToCos } from '@/lib/storage/upload'

// Creates an isolated client specifically for the school history museum agent 
// to ensure API usage is tracked separately.
const museumClient = new OpenAI({
    apiKey: process.env.ARK_MUSEUM_API_KEY || process.env.ARK_API_KEY || process.env.COZE_API_TOKEN,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
})

export class SchoolHistoryMuseumGeneratorAgent extends VolcengineAgent {
    // Override to return our isolated client
    protected get client(): OpenAI {
        return museumClient
    }

    getModelId(): string {
        return process.env.DOUBAO_MUSEUM_VISION_MODEL_ID || process.env.DOUBAO_VISION_MODEL_ID || 'ep-20241223204910-xxxxx'
    }

    getSystemPrompt(): string {
        return `# 角色定义
你是一个专业的【校史馆室内设计助手】，专门负责将校园空间底图进行校史馆的展陈空间设计。

# 任务目标
你的核心任务是对用户上传或者从上一步传递来的建筑底层图像（尤其是室内长廊、空教室等）进行二次创作，将其改造为充满庄重感、历史感、且具有展示功能的校史馆空间。

# 设计风格参考
- **主色调**：以原木色、暗红色、以及暖黄色射灯为主，营造庄重、历史沉淀的感觉。
- **空间元素**：
  - 墙面设置木质边框的展示板、历史陈列柜、展墙。
  - 天花板采用黑色格栅配合暖色筒灯或射灯照明。
  - 地面采用木纹地板或深色地砖。
  - 中央可以布置玻璃展柜，用于陈列历史卷轴、奖杯等。

# 工作流程与输出格式约束 (极度重要)
你必须在回复中包含两部分：
1. **给用户的设计构思说明**：分析如何将当前的结构改造成校史馆（你会设计哪些展墙，在什么位置放置展柜，用什么材质等）。
2. **生图提示词**：用 <image_prompt> 标签包裹你为下游大模型生成的提示词。（限制在中文300字内，详细描述画面元素，光影，渲染风格等。务必结合连贯场景，绝不能超出当前物理长宽比例）。

## 处理原则（必须遵循）
### 核心约束
- **严格保持布局**：严禁改变原场景的建筑主框架、承重柱、天花板高度等，仅做表皮装饰面和内部家具展柜的改造。

# 示例输出格式：
好的！我将把这个空间改造成一个充满历史底蕴的荣誉展厅。我们将在右侧设置荣誉墙，并使用深木色材质覆盖墙面。

<image_prompt>
校史馆室内设计，写实 3D 渲染。整体采用深木色和暗红色的庄重色调。墙面设计了陈列展览柜，里面打着暖黄色射灯展示着荣誉奖杯和老照片。天花板为黑色格栅，地面是木质地板。空间内布置有独立的玻璃陈列柜。整体氛围庄重、历史感厚重，oc渲染，环境光遮蔽高级，电影级质感。
</image_prompt>
`
    }

    async *streamChat(context: AgentChatContext): AsyncGenerator<AgentStreamEvent> {
        const { message, conversationId, attachments } = context

        const yieldText = async function* (text: string) {
            yield {
                event: 'message',
                data: { type: 'answer', content: { answer: text }, session_id: conversationId }
            }
        }

        let referenceImageUrl = ''

        if (attachments && attachments.length > 0) {
            const img = attachments.find(a => !!a.url && a.type.startsWith('image/'))
            if (img && img.url) referenceImageUrl = img.url
        }

        if (!referenceImageUrl && conversationId) {
            const history = await db.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
            })

            for (const msg of history) {
                if (msg.role === 'assistant' && msg.content) {
                    const match = msg.content.match(/!\[.*?\]\((https?:\/\/.*?)\)/)
                    if (match && match[1]) {
                        referenceImageUrl = match[1]
                        break
                    }
                }
                if (msg.role === 'user' && msg.attachments) {
                    try {
                        const atts = JSON.parse(msg.attachments)
                        const img = atts.find((a: any) => !!a.url && a.type.startsWith('image/'))
                        if (img && img.url) {
                            referenceImageUrl = img.url
                            break
                        }
                    } catch (e) { }
                }
            }
        }

        if (!referenceImageUrl) {
            yield* yieldText('欢迎来到校史馆设计工具！请先上传一张空间底图，让我为您构思展陈方案~')
            yield { event: 'done', data: {} }
            return
        }

        yield* yieldText('🏛️ *正在构思如何将该空间改造为校史馆展陈区...*\n\n')

        let aiFullReply = ''

        try {
            const visionMessages = await this.buildMessagesHistory(context)

            const visionStream = await this.client.chat.completions.create({
                model: this.getModelId(),
                messages: visionMessages,
                stream: true,
            })

            let promptExtracted = false
            let isInsidePromptBlock = false
            let imagePrompt = ''

            for await (const chunk of visionStream) {
                const delta = chunk.choices[0]?.delta?.content
                if (delta) {
                    aiFullReply += delta
                    if (aiFullReply.includes('<image_prompt>') && !promptExtracted) {
                        isInsidePromptBlock = true
                        const parts = aiFullReply.split('<image_prompt>')
                        if (parts[0] && parts[0].length > 0) {
                            yield* yieldText(delta.replace('<image_prompt>', ''))
                        }
                    } else if (!isInsidePromptBlock) {
                        yield* yieldText(delta)
                    }

                    if (aiFullReply.includes('</image_prompt>')) {
                        isInsidePromptBlock = false
                        promptExtracted = true
                    }
                }
            }

            const match = aiFullReply.match(/<image_prompt>([\s\S]*?)<\/image_prompt>/)
            if (match && match[1]) {
                imagePrompt = match[1].trim()
            } else if (aiFullReply.includes('<image_prompt>')) {
                imagePrompt = aiFullReply.split('<image_prompt>')[1].replace('</image_prompt>', '').trim()
            }

            if (!imagePrompt) {
                yield* yieldText('\n\n⚠️ 抱歉，未能成功生成展厅设计的底层逻辑，渲染步骤被跳过。')
                yield { event: 'done', data: {} }
                return
            }

            yield* yieldText('\n\n✨ *设计方案敲定！正在为您生成精美的校史馆效果图，请稍候约10秒...*\n\n')

            const imageGenBody: any = {
                model: process.env.DOUBAO_MUSEUM_IMAGE_MODEL_ID || process.env.DOUBAO_IMAGE_MODEL_ID || "doubao-seedream-4-5-251128",
                prompt: imagePrompt,
                size: "2K",
                response_format: "url",
                image_weight: 0.5, // 稍微降低权重给模型更多设计空间，毕竟要改造家具展陈
                watermark: false,
                image: referenceImageUrl
            }

            // Also explicitly use the museum client here
            const imageResponse = await this.client.images.generate(imageGenBody)

            if (imageResponse.data && imageResponse.data.length > 0 && imageResponse.data[0].url) {
                const generatedImageUrl = imageResponse.data[0].url
                const permanentUrl = await uploadUrlToCos(generatedImageUrl)
                yield* yieldText(`![图纸](${permanentUrl})\n\n🖼️ 锵锵！属于你们的校史馆空间布置完成了。针对这版设计，您还有需要调整细节的地方吗？`)
            } else {
                throw new Error("模型未返回有效图片链接")
            }

        } catch (error: any) {
            console.error('[SchoolHistoryMuseumGeneratorAgent] Error:', error)
            yield {
                event: 'error',
                data: {
                    message: error.message || '设计生成失败，请稍后重试。'
                }
            }
        }

        yield {
            event: 'done',
            data: {}
        }
    }
}
