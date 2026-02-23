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
你的核心任务是对用户上传的校园实拍场景照片进行 3D 化处理，生成一个干净、写实、有质感的底图，同时保持场景的真实感和氛围感。

# 能力
你具备以下能力：
1. **场景分析能力**：能够识别室内外两种不同场景并采用相应的渲染策略。
2. **生图提示词生成**：能够严格遵循室内外不同需求，生成给下游专业图像生成模型处理的提示词。

# 工作流程与输出格式约束 (极度重要)
你必须在回复中包含两部分：
1. **给用户的改建说明**：分析是室内还是室外，说明你会做哪些核心改变（如：替换材质、移除杂物杂乱招牌、增强自然光影等）。
2. **生图提示词**：用 <image_prompt> 标签包裹你为下游大模型生成的提示词。（限制在中文300字内，详细描述画面元素，光影，渲染风格等。绝对不能在此处进行闲聊，这是直接传给生图机器的参数）。

## 处理原则（必须遵循）
### 核心约束
- **严格保持布局**：严禁改变原场景的建筑布局、空间结构、只能调整渲染风格。

### 室外场景生图建议
1. 建筑使用大块干净的几何形体或红砖架构，去除临时杂物和横幅。周围点缀写实的 3D 绿植。
2. 写实 3D 渲染风格，湛蓝通透的天空，柔和明亮的太阳光，"oc渲染，全局光照明亮，充满高级感，电影级质感"

### 室内场景生图建议
1. 极简大块干净几何形体，移除所有可移动家具，只保留空旷的室内空间。
2. 明亮干净的室内全局光照，保留真实材质纹理。

# 示例输出格式：
你好！这是一张典型的室外校园场景。为了给后续的设计留出空间，我们将会把主体建筑简化为质感干净的几何体，去除现有的杂乱横幅，同时把天空调整得更加透视明朗。

<image_prompt>
室外校园建筑，写实 3D 渲染风格，保持原有建筑的结构透视，将其材质简化为干净的大块面，去除建筑表面的繁杂门窗和杂物。画面中没有横幅、标语、立牌等临时装饰。周围点缀写实的 3D 模型绿植与树木。湛蓝通透的天空，几缕薄云。柔和明亮的自然太阳光，oc渲染，全局光照明亮，充满高级感，摄影机视角不变，超分辨，电影级质感。
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

        if (!attachments || attachments.length === 0) {
            yield* yieldText('你好呀😊 请问你是否需要将校园实拍照片转化为写实3D渲染风格的底图呢？如果需要的话，你可以上传照片，并且告知我是室内场景还是室外场景~')
            yield { event: 'done', data: {} }
            return
        }

        yield* yieldText('🔍 *正在分析您的校园场景照片，构思 3D 渲染方案...*\n\n')

        let aiFullReply = ''

        // 1. Ask Vision Model to generate understanding & prompt
        try {
            const visionMessages: any[] = [
                { role: 'system', content: this.getSystemPrompt() },
                { role: 'user', content: this.buildUserMessageContent(message || '请分析并提供生图提示词', attachments) }
            ]

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
                    // Determine if we are streaming the prompt block or the user message
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
                // If the user's vision model choice doesn't output the prompt tags despite instructions, fallback gracefully.
                yield* yieldText('\n\n⚠️ 抱歉，目前的模型未能成功生成底层的渲染提示词，生图步骤被跳过。')
                yield { event: 'done', data: {} }
                return
            }

            yield* yieldText('\n\n🎨 *底层提示词构建完成！正在进行高精度 3D 渲染，请稍候约10-15秒...*\n\n')

            // 2. Call Doubao Seedream 
            const imageUrls = attachments.filter(a => !!a.url && a.type.startsWith('image/')).map(a => a.url)

            const imageGenBody: any = {
                model: process.env.DOUBAO_IMAGE_MODEL_ID || "doubao-seedream-4-5-251128",
                prompt: imagePrompt,
                size: "2K",
                response_format: "url",
                image_weight: 0.6,
                watermark: false
            }

            // If we have an image, pass it as image-to-image
            if (imageUrls.length > 0) {
                imageGenBody.image = imageUrls[0]
            }

            const imageResponse = await openai.images.generate(imageGenBody)

            if (imageResponse.data && imageResponse.data.length > 0 && imageResponse.data[0].url) {
                const generatedImageUrl = imageResponse.data[0].url
                yield* yieldText(`![3D 渲染底图](${generatedImageUrl})\n\n✨ 渲染完成！这是基于您照片生成的干净 3D 底图，随时可以用来作为设计排版的背景。`)
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
