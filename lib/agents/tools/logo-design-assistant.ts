import OpenAI from 'openai'
import { AgentChatContext, AgentStreamEvent } from '../core'
import { VolcengineAgent } from '../providers/volcengine'
import { db } from '@/lib/db'
import { uploadUrlToCos } from '@/lib/storage/upload'

// Isolated client for the Logo Design Agent
const logoClient = new OpenAI({
    apiKey: process.env.ARK_LOGO_API_KEY || process.env.ARK_API_KEY || process.env.COZE_API_TOKEN,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
})

export class LogoDesignAssistantAgent extends VolcengineAgent {
    protected get client(): OpenAI {
        return logoClient
    }

    getModelId(): string {
        return process.env.DOUBAO_LOGO_VISION_MODEL_ID || process.env.DOUBAO_VISION_MODEL_ID || 'ep-20241223204910-xxxxx'
    }

    getSystemPrompt(): string {
        return `# 角色定义
你是深耕教育行业的校庆 Logo 设计方案专家，具备品牌视觉设计、文化符号提炼、设计方案撰写的专业能力。你的核心任务是根据学校上传的资料，构建专业的 Logo 设计方案，包含设计 Prompt（用于 AI 生图）和完整的设计说明文案。

**重要定位**：你生成的方案是「设计灵感草案」，用于帮校方快速探索方向、与设计师沟通，而非直接印刷的成品 Logo。请在首次回复中自然说明这一点。

---

# 核心设计知识库

## 数字造型规则（极其重要）
校庆 Logo 的核心是周年数字的象征化造型，必须将数字与学校特色结合：
- 数字不是普通字体排版，而是有文化造型的设计符号
- 真实案例：
  - 「9」→ 跑道弧线造型（兼善中学 90 周年，寓意继往开来、蒸蒸日上）
  - 「7」→ 书法飞白笔触造型（能源工业技师学院 70 周年，寓意文化传承）
  - 「0」→ 精密齿轮造型（能源工业技师学院 70 周年，寓意工匠精神）
  - 「0」→ 地球/圆环造型（四川外国语 70 周年，寓意放眼世界）
  - 「20」→ 流动飘带造型（南开融侨 20 周年，寓意青春活力）
- 你必须根据学校的**办学特色和校训文化**来决定数字的造型，绝不能用普通字体数字

## 色彩融合规则
校庆色彩 = 庆典色（红/黄/暖色系）+ 学校标准色（蓝/紫/绿等）
- 典型组合：红蓝渐变、蓝紫渐变、红黄渐变+蓝色点缀
- 案例：兼善中学→蓝紫渐变；四川外国语→红蓝渐变；南开融侨→青莲紫+玫红
- 必须解释色彩选择的文化逻辑

## 图形抽象化规则（具象→抽象）
- 地球 → 世界地图点阵
- 大海 → 波浪曲线
- 校门 → 简洁几何拱形剪影
- 齿轮 → 同心圆/转动曲线
- 跑道 → 弧形轨迹线
- 书本 → 翻页曲线
确保抽象化后的图形有设计感且可复用

## 意向元素推导规则
- **校徽/logo**：从形态、配色、象征物提取（盾形→稳重、齿轮→工匠精神）
- **校训/文化**：关键词联想（「兼善」→包容、「放眼世界」→地球/帆船）
- **办学特色**：职业院校→齿轮/工具；外语类→地球/语言符号；中小学→书本/成长线条；综合性大学→建筑/书卷
- 校方明确要求优先采纳；若无，brainstorm 2–3 个候选供用户确认

---

# 两步工作流程

## 第一步：分析与方案构建
当用户上传资料或描述需求时：
1. 分析资料，提取：校名、校庆周年数、主题色、文化关键词、意向元素
2. 确定数字造型方案（明确说明为何选择此造型）
3. 确定色彩方案（说明庆典色与校色的融合逻辑）
4. 确定图形元素（说明具象→抽象推导过程）
5. 若关键信息缺失，自然地追问用户

输出格式：
- 分析摘要（200字内）
- <design_prompt>...</design_prompt> 标签内为生图描述
- 引导文案（询问用户是否修改 or 确认生成，以及输出规格）

## 第二步：执行生成
当用户回复「生成」或明确确认时，系统自动调用生图 API。
在调用前，你需要首先输出 <design_doc>...</design_doc> 标签内的设计说明文案。

---

# 输出格式规范

## 第一步输出（分析 + Prompt 构建）

[分析摘要]

<design_prompt>
[300字内的高精度生图描述，必须包含5个维度：
1. 数字造型：具体到每个数字的形态（"数字9呈跑道弧线造型，线条流畅向上"）
2. 色彩精度：渐变方向+色词（"从中国红渐变到学院蓝，45度角对角渐变"）
3. 元素抽象：具体到抽象形态（"校门简化为几何拱形线条，置于数字下方"）
4. 构图关系：具体到空间位置（"数字居中偏上，时间轴水平置于数字正下方"）
5. 风格锚定：具体流派（"矢量扁平风格，线条简洁干净，白色背景，现代几何感，无阴影"）]
</design_prompt>

---
📋 **以上是我构建的设计方案，请确认：**
- ✏️ 如需修改，请直接告诉我调整意见
- 📐 尺寸比例：默认 **1:1 正方**，需要调整吗？（可选：16:9 横版、9:16 竖版）
- 🎨 背景：默认 **纯白色**，是否需要透明或其他颜色？
- 🖌️ 色彩：默认 **全彩版**，是否需要单色/双色版本？

✅ 确认后回复「生成」即可开始生成设计方案！

## 第二步输出（设计说明文案，在 <design_doc> 标签内）
当用户确认「生成」时，首先输出此内容：

<design_doc>
## 📋 [校名][周年数]周年校庆 Logo 设计说明

### 一、标志释义
logo 整体分为 X 个部分：
1. **主体数字「XX」**：[造型描述及文化寓意，如"9的外形如同一条跑道，寓意学校90年来继往开来、蒸蒸日上"]
2. **时间标注**：数字[下方/旁侧]「XXXX–XXXX」标明了学校的发展历史
3. **校名与主题语**：「[主题语]」字样位于 logo [位置]，色彩沿用校庆主题色

### 二、校庆色彩释义
校庆 LOGO 色彩采用 [庆典色，如红黄渐变] 与学校标志标准色彩（[校色]）相结合，
以 [渐变方式] 的色彩形式组合成校庆之底色，隆重而热烈，
既体现喜庆氛围，又彰显学校的品牌特色，
呈现出 [文化寓意] 的视觉效果。

### 三、图形元素释义
结合校庆主题与学校办学特色，提取以下核心图形元素：
- **[具象元素A]** → 抽象为 [抽象形态]，寓意 [文化含义]
- **[具象元素B]** → 抽象为 [抽象形态]，寓意 [文化含义]

### 四、设计理念总结
本 logo 的设计遵循传播学原理与视觉心理规律，
将 [学校核心文化/办学特色] 与现代视觉设计语言有机结合，
既传达了 [周年] 周年校庆的里程碑意义，
又实现了学校品牌视觉的一致性与延展性，
适用于海报、手册、文创周边等多种物料场景。
</design_doc>

---

# 缺项追问话术
- 「从资料中暂未提取到明确的周年数，请补充一下是几周年校庆？」
- 「已根据校徽推断主题色为蓝紫，请确认是否准确，或告知具体色值/色名」
- 「结合 [办学特色]，我建议意向元素为：[元素A]、[元素B]。您有其他想法吗？」

# 错误处理
- 周年数超出合理范围（1–999）：提示「请输入合理的周年数」
- 未上传任何资料：「请先上传学校 logo、校徽、文化资料或参考图片，我才能开始构建设计方案 😊」`
    }

    async *streamChat(context: AgentChatContext): AsyncGenerator<AgentStreamEvent> {
        const { message, conversationId, attachments } = context

        const yieldText = async function* (text: string) {
            yield {
                event: 'message',
                data: { type: 'answer', content: { answer: text }, session_id: conversationId }
            }
        }

        // Check if user is confirming generation
        const trimmedMessage = message.trim()
        const isGenerateCommand = /生成|确认|开始|执行|ok|好的|可以/i.test(trimmedMessage)

        try {
            const messages = await this.buildMessagesHistory(context)

            // ─────────────────────────────────────────────────────────────
            // Call the Vision LLM (non-streaming to safely strip XML tags)
            // ─────────────────────────────────────────────────────────────
            const completion = await this.client.chat.completions.create({
                model: this.getModelId(),
                messages,
                stream: false,
                temperature: 0.7,
            })

            const fullReply = completion.choices[0]?.message?.content || ''

            // Extract the hidden design_prompt block
            const designPromptMatch = fullReply.match(/<design_prompt>([\s\S]*?)<\/design_prompt>/)
            const designPromptFromThisReply = designPromptMatch ? designPromptMatch[1].trim() : null

            // Extract the design_doc block content (keep content, strip tags)
            const designDocMatch = fullReply.match(/<design_doc>([\s\S]*?)<\/design_doc>/)
            const designDoc = designDocMatch ? designDocMatch[1].trim() : null

            // Build the clean visible text – remove design_prompt block entirely, strip only design_doc tags
            const visibleText = fullReply
                .replace(/<design_prompt>[\s\S]*?<\/design_prompt>/g, '') // remove prompt block
                .replace(/<design_doc>/g, '')                              // strip opening tag
                .replace(/<\/design_doc>/g, '')                           // strip closing tag
                .trim()

            // Emit the cleaned text
            if (visibleText) {
                yield* yieldText(visibleText)
            }

            // Persist design_prompt invisibly: emit a metadata event so the API route
            // stores it in the assistant message's attachments field for later retrieval
            if (designPromptFromThisReply) {
                yield {
                    event: 'metadata',
                    data: { designPrompt: designPromptFromThisReply }
                }
            }

            // ─────────────────────────────────────────────────────────────
            // If user said 生成, trigger image generation
            // ─────────────────────────────────────────────────────────────
            if (isGenerateCommand) {
                // Find design_prompt: prefer current reply, fallback to conversation history
                let designPrompt = designPromptFromThisReply

                if (!designPrompt && conversationId) {
                    // Search DB history: check attachments metadata first, then raw content
                    const history = await db.message.findMany({
                        where: { conversationId, role: 'assistant' },
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    })
                    for (const msg of history) {
                        // Try reading from stored metadata in attachments field
                        if (msg.attachments) {
                            try {
                                const meta = JSON.parse(msg.attachments)
                                if (meta?.designPrompt) {
                                    designPrompt = meta.designPrompt
                                    break
                                }
                            } catch { }
                        }
                        // Fallback: find raw <design_prompt> tag in content
                        const match = msg.content.match(/<design_prompt>([\s\S]*?)<\/design_prompt>/)
                        if (match && match[1]) {
                            designPrompt = match[1].trim()
                            break
                        }
                    }
                }

                if (!designPrompt) {
                    yield* yieldText('\n\n⚠️ 未找到设计方案，请先描述您的校庆信息，让我构建设计 Prompt，再回复「生成」。')
                    yield { event: 'done', data: {} }
                    return
                }

                yield* yieldText('\n\n🎨 *正在生成校庆 Logo 灵感图，请稍候约 15 秒...*\n\n')

                try {
                    const imageModelId = process.env.DOUBAO_LOGO_IMAGE_MODEL_ID || process.env.DOUBAO_IMAGE_MODEL_ID || 'doubao-seedream-4-5-251128'

                    // Check for a reference image in current attachments or history
                    let referenceImageUrl = ''
                    if (attachments && attachments.length > 0) {
                        const img = attachments.find(a => !!a.url && a.type.startsWith('image/'))
                        if (img?.url) referenceImageUrl = img.url
                    }
                    if (!referenceImageUrl && conversationId) {
                        const userHistory = await db.message.findMany({
                            where: { conversationId, role: 'user' },
                            orderBy: { createdAt: 'desc' },
                            take: 20,
                        })
                        for (const msg of userHistory) {
                            if (msg.attachments) {
                                try {
                                    const atts = JSON.parse(msg.attachments)
                                    const img = atts.find((a: any) => !!a.url && a.type.startsWith('image/'))
                                    if (img) { referenceImageUrl = img.url; break }
                                } catch { }
                            }
                        }
                    }

                    // Detect aspect ratio from designPrompt to pick appropriate size
                    // Model requires minimum 3,686,400 pixels (e.g. 1920x1920)
                    const promptLower = designPrompt.toLowerCase()
                    let imageSize = '2048x2048'   // default 1:1
                    if (promptLower.includes('16:9') || promptLower.includes('横版')) {
                        imageSize = '2688x1512'   // 16:9 = 4,064,256 px ✓
                    } else if (promptLower.includes('9:16') || promptLower.includes('竖版')) {
                        imageSize = '1512x2688'   // 9:16 = 4,064,256 px ✓
                    }

                    const imageGenBody: any = {
                        model: imageModelId,
                        prompt: designPrompt,
                        size: imageSize,
                        response_format: 'url',
                        watermark: false,
                    }
                    if (referenceImageUrl) {
                        imageGenBody.image = referenceImageUrl
                        imageGenBody.image_weight = 0.3
                    }

                    const imageResponse = await logoClient.images.generate(imageGenBody)

                    if (imageResponse.data?.[0]?.url) {
                        const permanentUrl = await uploadUrlToCos(imageResponse.data[0].url)
                        yield* yieldText(`![校庆Logo灵感图](${permanentUrl})\n\n✨ **设计灵感方案已生成！**\n\n📌 *提示：这是 AI 生成的设计灵感草案，最终成品建议交由专业设计师深化。*\n\n🔄 **不满意？** 告诉我哪里需要调整（如数字造型、色彩、元素），我来重新设计`)
                    } else {
                        yield* yieldText('\n\n⚠️ 生图模型未返回有效图片，设计说明文案已生成，可参考文案与设计师沟通方向。')
                    }
                } catch (imgError: any) {
                    console.error('[LogoDesignAssistantAgent] Image generation error:', imgError)
                    let imgErrorMsg = '生图服务暂时不可用，设计说明文案已生成，您可以参考文案与设计师沟通方向。'
                    if (imgError.message?.includes('arrears')) {
                        imgErrorMsg = '抱歉，当前生图服务账户欠费，无法生成图片。请联系管理员充值后重试。'
                    } else if (imgError.message?.includes('Rate limit')) {
                        imgErrorMsg = '当前生图请求过多，请稍等片刻后回复「生成」重试。'
                    } else if (imgError.message) {
                        imgErrorMsg = `生图失败：${imgError.message}`
                    }
                    yield* yieldText(`\n\n⚠️ ${imgErrorMsg}`)
                }
            }

        } catch (error: any) {
            console.error('[LogoDesignAssistantAgent] Error:', error)
            let userMessage = '处理请求时出现错误，请稍后重试。'
            if (error.message?.includes('arrears')) {
                userMessage = '抱歉，当前 AI 服务账户欠费，请联系管理员充值。'
            } else if (error.message?.includes('Rate limit')) {
                userMessage = '当前请求过于频繁，请稍等片刻再试。'
            }
            yield { event: 'error', data: { message: userMessage } }
        }

        yield { event: 'done', data: {} }
    }
}
