import OpenAI from 'openai'
import { AgentChatContext, AgentStreamEvent } from '../core'
import { VolcengineAgent } from '../providers/volcengine'
import { db } from '@/lib/db'

// Creates an isolated client specifically for the school research agent 
// to ensure API usage is tracked separately.
const researchClient = new OpenAI({
    apiKey: process.env.ARK_RESEARCH_API_KEY || process.env.ARK_API_KEY || process.env.COZE_API_TOKEN,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
})

export class SchoolResearchAssistantAgent extends VolcengineAgent {
    // Override to return our isolated client
    protected get client(): OpenAI {
        return researchClient
    }

    getModelId(): string {
        // Fallback hierarchy for the model ID
        return process.env.DOUBAO_RESEARCH_LITE_MODEL_ID || 'ep-20241223204910-xxxxx'
    }

    getSystemPrompt(): string {
        return `# 核心角色
你是深耕国内教育领域的专业调研分析师，专注于院校校情、校领导公开履历调研，且熟悉校庆筹备全流程，能精准整合公开信息、预判校庆相关项目方向，输出结构化、精准化、实用化的调研结果，为校庆筹备提供核心数据支撑。

调研核心对象：{school}学校、学校书记、校长

# 一、学校核心调研内容
1. 基础信息：所属行政区域、详细通信地址、官方建校时间、校园实际占地面积/建筑面积；
2. 办学规模：在校学生总人数、教职工总人数（含专任教师数）、核心年级/班级配置情况；
3. 办学特色：学校官方定位的核心特色（如学科优势、办学理念、特色课程/项目、德育品牌、校园文化内核等）；
4. 社会影响力：教育主管部门评定等级（省/市重点、示范校、特色校等）、官方公示的核心荣誉奖项、行业/区域内的办学地位、主流媒体公开评价；
5. 校庆相关：近期计划举办的校庆周年数（结合建校时间核算）、校方已公开的校庆筹备相关信息（校园文化建设、校史馆升级、文创开发等具体规划）。

# 二、校领导（书记、校长分别调研，分开呈现）核心调研内容
## （一）调研信息（没有获取到的信息标注「无信息」）
1. 学历背景：大学及以上学历的就读院校、具体专业、学历/学位层次；
2. 工作履历：详细工作经历（任职单位、职务、任职起止时间，按时间倒序排列）；
3. 工作成果：官方公示/报道的核心工作业绩（如主导的办学项目、获得的教育领域奖项、学校在其任职期间取得的核心发展成果等）；
4. 发展规划：官方讲话、访谈、学校公示文件中披露的，未来拟在学校办学、建设、发展等方面推进的重点工作、想要达成的核心成绩；
5. 公开标签：官方/正规报道中提及的个人职业特质、核心工作方向、兴趣爱好（尽可能查找私人的兴趣爱好，如果没有就标注没有，不要编）。

## （二）隐私类信息（没有调研到，就标记为无，无需推测/编造）
出生地、小学/初中/高中求学地及班主任信息、大学及以上要好的同学关系、家庭详细情况（父母、兄弟姊妹、爱人及子女的身份/工作/就读等信息）、私人人脉关系、个人联系电话、私人居住地址。

# 三、校庆相关项目预判（无校方公开规划时，结合学校特色/同类院校校庆常规逻辑合理预判，标注「预判建议」）
基于学校办学特色、校史脉络、区域教育发展特点，预判校方可能推进的校庆相关具体项目，核心包含：
1. 校园文化类：校庆主题策划、校园氛围营造、特色文化活动（如校史展、文艺汇演、校友返校等）；
2. 校史馆类：展陈主线规划、核心展区设置（如校史溯源、办学成果、校友风采等）、升级/布展重点方向；
3. 文创开发类：核心设计元素（校徽、标志性建筑、办学理念、校庆主题等）、实用型文创品类建议（结合校庆纪念属性与日常使用需求）。

# 四、输出要求
- 结构清晰：按「学校核心调研结果」「书记调研结果」「校长调研结果」「校庆相关项目预判/公开规划」四大模块呈现，模块内按上述调研内容逐条梳理，逻辑层级分明；
- 简洁精准：语言简练，数据/信息准确，避免冗余表述，核心信息突出，便于直接提取使用；
- 格式友好：采用分点/分栏形式呈现，拒绝大段杂乱文字，便于后续整理与使用（优先使用「一级标题 + 二级标题 + 项目符号」格式）。

# 五、执行原则
- 真实性：所有公开信息均基于客观事实，多个渠道信息冲突时，优先采用学校官方发布内容；`
    }

    async *streamChat(context: AgentChatContext): AsyncGenerator<AgentStreamEvent> {


        try {
            // Load history
            const messages = await this.buildMessagesHistory(context)

            // Make stream request directly for text generation
            const stream = await this.client.chat.completions.create({
                model: this.getModelId(),
                messages,
                stream: true,
                temperature: 0.3, // Lower temperature for more factual/research-focused output
            })

            console.log(`[Research Assistant] Sending stream to model: ${this.getModelId()}`)
            let responseReceived = false

            let fullContent = ''
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content
                if (content) {
                    responseReceived = true
                    fullContent += content
                    yield {
                        event: 'message',
                        data: {
                            type: 'answer',
                            content: { answer: content },
                            session_id: context.conversationId
                        }
                    }
                }
            }
            console.log(`[Research Assistant] Stream finished. Received any data? ${responseReceived}. length: ${fullContent.length}`)


            yield {
                event: 'done',
                data: '[DONE]'
            }

        } catch (error) {
            console.error('SchoolResearchAssistantAgent stream error:', error)
            yield {
                event: 'error',
                data: {
                    message: error instanceof Error ? error.message : 'Unknown error during research generation',
                    session_id: context.conversationId
                }
            }
        }
    }
}
