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
     * Main chat streaming function implementing the Agent interface
     */
    async *streamChat(context: AgentChatContext): AsyncGenerator<AgentStreamEvent> {
        const { message, conversationId, attachments } = context

        // 1. Fetch conversation history if a conversationId is provided
        let messages: any[] = []

        // Add system prompt first
        messages.push({
            role: 'system',
            content: this.getSystemPrompt()
        })

        if (conversationId) {
            // Fetch previous messages ordered by ascending creation time
            // Exclude the currently processing message (if it was already inserted by the route)
            const history = await db.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
                // To avoid duplicating the current user message, we'll rely on the DB already having it,
                // or we fetch history from *before* this exact request. For simplicity, we assume
                // the route hasn't saved this exact user turn yet, OR we ignore the last if needed.
                // Actually, the route.ts currently saves the user message *before* streaming.
                // So `history` already contains the current user message!
                // Wait, if it already contains the user message with attachments JSON, we parse it.
            })

            // Map history to OpenAI format
            for (let i = 0; i < history.length; i++) {
                const msg = history[i]

                // If this is the newly created message (last one and role is user), we might want to handle it directly
                // But for safety, we simply reconstruct all of them.
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

            // If the current message wasn't saved in DB yet by the caller, we'd add it here.
            // But typically route.ts does `db.message.create({role: 'user', ...})` THEN calls `streamChat`.
            // So the history `messages` array already includes the latest prompt!
        } else {
            // No conversation history provided; just use the current message
            messages.push({
                role: 'user',
                content: this.buildUserMessageContent(message, attachments)
            })
        }

        console.log(`[Volcengine Agent] Starting stream for model: ${this.getModelId()}`)

        try {
            const stream = await openai.chat.completions.create({
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
