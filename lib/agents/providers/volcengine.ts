import OpenAI from 'openai'
import { AgentChatContext, AgentStreamEvent } from '../core'
import { db } from '@/lib/db'

// Initialize OpenAI client pointing to Volcengine Ark
const openai = new OpenAI({
    apiKey: process.env.ARK_API_KEY || process.env.COZE_API_TOKEN, // Fallback if they share keys or for local testing
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
})

/**
 * Base Volcengine Agent that handles conversation history,
 * multimodal payload construction (image_url), and SSE streaming.
 */
export abstract class VolcengineAgent {
    abstract getSystemPrompt(): string
    abstract getModelId(): string

    /**
     * Get the OpenAI client instance to use for this agent.
     * Subclasses can override this to return a custom client (e.g., with a different API key).
     */
    protected get client(): OpenAI {
        return openai
    }

    /**
     * Helper to format attachments into Volcengine/OpenAI compatible multimodal content blocks.
     */
    protected buildUserMessageContent(message: string, attachments?: AgentChatContext['attachments']) {
        if (!attachments || attachments.length === 0) {
            return message || ' '
        }

        const contentArray: any[] = []

        // Map image attachments to image_url objects
        for (const attachment of attachments) {
            if (attachment.type.startsWith('image/') && attachment.url) {
                contentArray.push({
                    type: 'image_url',
                    image_url: {
                        url: attachment.url
                    }
                })
            }
        }

        // Add user text
        contentArray.push({
            type: 'text',
            text: message || '请参考图片处理'
        })

        return contentArray
    }

    /**
     * Helper to fetch and build OpenAI-compatible message history
     */
    protected async buildMessagesHistory(context: AgentChatContext): Promise<any[]> {
        const { message, conversationId, attachments } = context
        let messages: any[] = []

        // Add system prompt first
        messages.push({
            role: 'system',
            content: this.getSystemPrompt()
        })

        if (conversationId) {
            const history = await db.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
            })

            for (let i = 0; i < history.length; i++) {
                const msg = history[i]
                let parsedContent: any = msg.content || ' '

                if (msg.role === 'user' && msg.attachments) {
                    try {
                        const historyAttachments = JSON.parse(msg.attachments)
                        parsedContent = this.buildUserMessageContent(msg.content, historyAttachments)
                    } catch (e) {
                        console.error('Failed to parse history attachments', e)
                    }
                }

                messages.push({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: parsedContent
                })
            }
        } else {
            messages.push({
                role: 'user',
                content: this.buildUserMessageContent(message, attachments)
            })
        }

        return messages
    }

    /**
     * Main chat streaming function implementing the Agent interface
     */
    async *streamChat(context: AgentChatContext): AsyncGenerator<AgentStreamEvent> {
        const { conversationId } = context

        // 1. Fetch conversation history
        const messages = await this.buildMessagesHistory(context)

        console.log(`[Volcengine Agent] Starting stream for model: ${this.getModelId()}`)

        try {
            const stream = await this.client.chat.completions.create({
                model: this.getModelId(),
                messages,
                stream: true,
            })

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content

                if (delta) {
                    // Format as the standard 'answer' event frontend expects
                    yield {
                        event: 'message',
                        data: {
                            type: 'answer',
                            content: { answer: delta },
                            session_id: conversationId
                        }
                    }
                }
            }

            // Final DONE event 
            yield {
                event: 'done',
                data: {}
            }

        } catch (error: any) {
            console.error('[Volcengine Agent] Stream error:', error)
            yield {
                event: 'error',
                data: {
                    message: error.message || '模型处理失败'
                }
            }
        }
    }
}
