import OpenAI from 'openai'
import { AgentChatContext, AgentStreamEvent } from '../core'
import { VolcengineAgent } from '../providers/volcengine'
import { db } from '@/lib/db'

const openai = new OpenAI({
    apiKey: process.env.ARK_API_KEY || process.env.COZE_API_TOKEN,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
})

export class Scene3DGeneratorAgent extends VolcengineAgent {
    // 移除强校验，允许灵活填写任何模型 ID，但第一步仍建议使用如 doubao-vision-pro 的对话视觉模型
    getModelId(): string {
        return process.env.DOUBAO_VISION_MODEL_ID || 'ep-20241223204910-xxxxx'
    }

    getSystemPrompt(): string {
        return `# 角色定义
你是一个专业的【校园场景 3D 底图生成助手】，专门将实拍的校园现场照片转化为写实 3D 渲染风格的底图。

# 任务目标
你的核心任务是对用户上传的图片(也可能是根据你自身之前生成的图)进行二次意图评估，在确立渲染方案后，生成一个干净、写实、有质感的底图。

# 能力
你具备以下能力：
1. **场景及语义分析能力**：能够串联上下文，对用户的进一步修改意见进行分析。如果用户提出修改（比如：移除某个柜子、改颜色等），你要能提取出这些要求。
2. **生图提示词生成**：能够严格遵循要求，结合图片上下文，输出完整丰富的生图提示词给下游专业图像模型。

# 工作流程与输出格式约束 (极度重要)
你必须在回复中包含两部分：
1. **给用户的改建说明**：说明你会做哪些核心改变（如：替换材质、移除黑板、增强自然光影等）。
2. **生图提示词**：用 <image_prompt> 标签包裹你为下游大模型生成的提示词。（限制在中文300字内，详细描述画面元素，光影，渲染风格等。务必结合连贯场景）。

## 处理原则（必须遵循）
### 核心约束
- **严格保持布局**：严禁改变原场景的建筑布局、空间结构、只能调整渲染风格局部内容。

### 室外场景生图建议
1. 建筑使用大块干净的几何形体或红砖架构，去除临时杂物和横幅。周围点缀写实的 3D 绿植。
2. 写实 3D 渲染风格，湛蓝通透的天空，柔和明亮的太阳光，"oc渲染，全局光照明亮，充满高级感，电影级质感"

### 室内场景生图建议
1. 极简大块干净几何形体，按用户需求移除或保留特定的家具物体。
2. 明亮干净的室内全局光照，保留真实材质纹理。

# 示例输出格式：
好的！我将根据您的要求，把墙上的绿色黑板和下方柜子都移除掉，让墙面保持空旷写实。

<image_prompt>
室内教室空间，写实 3D 渲染风格。极简干净大块面几何形体会，墙面整体涂白且十分空旷。原本的黑板和下方柜子已经被完全移除。明亮干净的室内全局光照，自然阳光从窗户外透入。真实高级材质纹理，oc渲染，摄影机视角不变，超分辨，电影级质感。
</image_prompt>
`
    }

    // Override the base streamChat to inject the image generation step
    async *streamChat(context: AgentChatContext): AsyncGenerator<AgentStreamEvent> {
        const { message, conversationId, attachments } = context

        // Function to yield text immediately
        const yieldText = async function* (text: string) {
            yield {
                event: 'message',
                data: { type: 'answer', content: { answer: text }, session_id: conversationId }
            }
        }

        let referenceImageUrl = ''

        // 1. Find if the user attached a new image
        if (attachments && attachments.length > 0) {
            const img = attachments.find(a => !!a.url && a.type.startsWith('image/'))
            if (img && img.url) referenceImageUrl = img.url
        }

        // 2. If no new attachment, search DB history for the latest image (either user uploaded, or assistant generated)
        if (!referenceImageUrl && conversationId) {
            const history = await db.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
            })

            for (const msg of history) {
                // If assistant previously generated an image markdown
                if (msg.role === 'assistant' && msg.content) {
                    const match = msg.content.match(/!\[.*?\]\((https?:\/\/.*?)\)/)
                    if (match && match[1]) {
                        referenceImageUrl = match[1]
                        break
                    }
                }
                // If user previously uploaded an image
                if (msg.role === 'user' && msg.attachments) {
                    try {
                        const atts = JSON.parse(msg.attachments)
                        const img = atts.find((a: any) => !!a.url && a.type.startsWith('image/'))
                        if (img) {
                            referenceImageUrl = img.url
                            break
                        }
                    } catch (e) { }
                }
            }
        }

        if (!referenceImageUrl) {
            // Cannot find any image at all in current inputs or history
            yield* yieldText('你好呀😊 我好像没有收到任何参考图片。请先上传一张校园现场照片，或者基于之前的图片发起对话~')
            yield { event: 'done', data: {} }
            return
        }

        yield* yieldText('🔍 *正在分析场景与您的沟通需求，构思 3D 渲染方案...*\n\n')

        let aiFullReply = ''

        try {
            // Build the multi-message history so Vision model understands what we did before
            const visionMessages = await this.buildMessagesHistory(context)

            const visionStream = await openai.chat.completions.create({
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

            // Extract the prompt using regex
            const match = aiFullReply.match(/<image_prompt>([\s\S]*?)<\/image_prompt>/)
            if (match && match[1]) {
                imagePrompt = match[1].trim()
            } else if (aiFullReply.includes('<image_prompt>')) {
                // In case closing tag was missing or cut off
                imagePrompt = aiFullReply.split('<image_prompt>')[1].replace('</image_prompt>', '').trim()
            }

            if (!imagePrompt) {
                yield* yieldText('\n\n⚠️ 抱歉，目前的模型未能成功生成底层的渲染提示词，生图步骤被跳过。')
                yield { event: 'done', data: {} }
                return
            }

            yield* yieldText('\n\n🎨 *底层提示词构建完成！正在进行高精度 3D 渲染，请稍候约10-15秒...*\n\n')

            const imageGenBody: any = {
                model: process.env.DOUBAO_IMAGE_MODEL_ID || "doubao-seedream-4-5-251128",
                prompt: imagePrompt,
                size: "2K",
                response_format: "url",
                image_weight: 0.6,
                watermark: false,
                image: referenceImageUrl // Pass the extracted reference image
            }

            const imageResponse = await openai.images.generate(imageGenBody)

            if (imageResponse.data && imageResponse.data.length > 0 && imageResponse.data[0].url) {
                const generatedImageUrl = imageResponse.data[0].url
                yield* yieldText(`![3D 渲染底图](${generatedImageUrl})\n\n✨ 渲染完成！这是基于刚才参考图生成的全新 3D 底图。您可以继续提出修改建议喔！`)
            } else {
                throw new Error("模型未返回有效图片链接")
            }

        } catch (error: any) {
            console.error('[Scene3DGeneratorAgent] Error:', error)
            yield {
                event: 'error',
                data: {
                    message: error.message || '图片生成失败，请稍后重试。'
                }
            }
        }

        // Final DONE event 
        yield {
            event: 'done',
            data: {}
        }
    }
}
