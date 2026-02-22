import { ChatEventType, type StreamChatData } from '@coze/api'

export { ChatEventType }
export type { StreamChatData }

export interface StreamChatOptions {
  botId: string
  userId: string
  message: string
  conversationId?: string
}

export interface ChatStreamChunk {
  event: string
  data: any
}
