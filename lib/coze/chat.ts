import { RoleType } from '@coze/api'
import { cozeClient } from './client'
import { ChatEventType, type StreamChatOptions, type StreamChatData } from './types'

/**
 * Stream chat with Coze bot
 * Returns async generator for SSE streaming
 */
export async function* streamChat(options: StreamChatOptions): AsyncGenerator<StreamChatData> {
  const { botId, userId, message, conversationId } = options

  const stream = await cozeClient.chat.stream({
    bot_id: botId,
    user_id: userId,
    additional_messages: [
      {
        role: RoleType.User,
        content: message,
        content_type: 'text',
      },
    ],
    ...(conversationId ? { conversation_id: conversationId } : {}),
  })

  for await (const chunk of stream) {
    yield chunk
  }
}

/**
 * Check if a stream event is a message delta (contains new text content)
 */
export function isMessageDelta(event: StreamChatData): boolean {
  return event.event === ChatEventType.CONVERSATION_MESSAGE_DELTA
}

/**
 * Check if a stream event indicates completion
 */
export function isChatCompleted(event: StreamChatData): boolean {
  return event.event === ChatEventType.CONVERSATION_CHAT_COMPLETED
}

/**
 * Check if a stream event indicates an error
 */
export function isChatError(event: StreamChatData): boolean {
  return event.event === ChatEventType.CONVERSATION_CHAT_FAILED ||
         event.event === ChatEventType.ERROR
}

/**
 * Extract message content from a delta event
 */
export function getMessageContent(event: StreamChatData): string | undefined {
  if (event.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
    return (event.data as any)?.content
  }
  return undefined
}

/**
 * Extract conversation ID from chat events
 */
export function getConversationId(event: StreamChatData): string | undefined {
  return (event.data as any)?.conversation_id
}

export { ChatEventType }
