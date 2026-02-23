// Exporting types that API route uses, but bound to our new Agent abstraction
export interface AgentStreamEvent {
    event: string    // 'message', 'error', 'done'
    data: any        // SSE chunk data
}

export interface ChatAttachment {
    cozeFileId: string // Keep for database compatibility but we don't strictly use Coze
    name: string
    type: string
    size?: number
    url?: string       // The public COS URL of the file
}

export interface AgentChatContext {
    message: string
    userId: string
    conversationId?: string
    attachments?: ChatAttachment[]
}

/**
 * Base Agent Interface
 * Any new Agent tool must implement this interface.
 */
export interface Agent {
    /**
     * The system prompt that gives the agent its persona and instructions.
     */
    getSystemPrompt(): string

    /**
     * Model ID to use (e.g., ep-20241223204910-xxxxx for Volcengine)
     */
    getModelId(): string

    /**
     * Stream the chat completion
     */
    streamChat(context: AgentChatContext): AsyncGenerator<AgentStreamEvent>
}
