'use client'

import { useState } from 'react'
import { MessageList } from './message-list'
import { MessageInput, FileAttachment } from './message-input'
import type { Tool } from '@prisma/client'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  attachments?: string | null
}

interface ChatInterfaceProps {
  tool: Tool
  conversationId?: string
  initialMessages?: Message[]
  initialAttachmentUrl?: string | null
}

interface ExtractResult {
  content?: string
  error?: string
  sessionId?: string
}

function extractContent(parsed: any): ExtractResult {
  const event = parsed.event
  const data = parsed.data

  if (!data) return {}

  // Handle error events
  if (event === 'error') {
    return {
      error: data.message || '请求失败'
    }
  }

  // Extract session ID
  const sessionId = data.session_id

  // Check for message_end with error
  if (data.type === 'message_end' && data.message_end?.code && data.message_end.code !== '0') {
    return {
      error: data.message_end.message || 'API请求失败',
      sessionId
    }
  }

  // Check for tool_response errors
  if (data.type === 'tool_response') {
    const result = data.content?.tool_response?.result
    if (typeof result === 'string' && result.includes('Error')) {
      return { error: result, sessionId }
    }
  }

  // Primary format: type=answer with content.answer (Site API)
  if (data.type === 'answer' && data.content?.answer) {
    return { content: data.content.answer, sessionId }
  }

  // Fallback formats
  if (typeof data.content === 'string') {
    return { content: data.content, sessionId }
  }
  if (data.message?.content && typeof data.message.content === 'string') {
    return { content: data.message.content, sessionId }
  }
  if (data.text) {
    return { content: data.text, sessionId }
  }

  return { sessionId }
}

export function ChatInterface({
  tool,
  conversationId: initialConversationId,
  initialMessages = [],
  initialAttachmentUrl,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [conversationId, setConversationId] = useState(initialConversationId)
  const [isStreaming, setIsStreaming] = useState(false)

  async function handleSendMessage(message: string, attachments?: FileAttachment[]) {
    const attachmentsJson = attachments
      ? JSON.stringify(attachments.map(({ cozeFileId, name, type, size }) => ({
        cozeFileId,
        name,
        type,
        size,
      })))
      : null

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      createdAt: new Date(),
      attachments: attachmentsJson,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          toolId: tool.id,
          conversationId,
          attachments: attachments?.map(({ cozeFileId, name, type, url }) => ({
            cozeFileId,
            name,
            type,
            url,
          })),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to send message: ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)

                if (parsed.event === 'error') {
                  console.error('Stream error:', parsed.data?.message)
                  assistantContent = `错误: ${parsed.data?.message || '未知错误'}`
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  )
                  continue
                }

                const result = extractContent(parsed)

                // Update session/conversation ID if provided
                if (result.sessionId && !conversationId) {
                  setConversationId(result.sessionId)
                }

                // Handle errors from Coze
                if (result.error) {
                  console.error('Coze error:', result.error)
                  if (!assistantContent) {
                    assistantContent = `错误: ${result.error}`
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessage.id
                          ? { ...msg, content: assistantContent }
                          : msg
                      )
                    )
                  }
                  continue
                }

                // Accumulate content
                if (result.content) {
                  assistantContent += result.content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  )
                }
              } catch (e) {
                if (data && data.length < 1000) {
                  console.log('Raw data received:', data)
                }
              }
            }
          }
        }
      }

      if (!assistantContent) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: '未收到回复，请检查配置或重试。' }
              : msg
          )
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) =>
        prev.concat({
          id: Date.now().toString(),
          role: 'assistant',
          content: `抱歉，发送消息时出现错误: ${error instanceof Error ? error.message : '未知错误'}`,
          createdAt: new Date(),
        })
      )
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden relative w-full">
      {/* Messages */}
      <MessageList messages={messages} isStreaming={isStreaming} />

      {/* Floating Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isStreaming}
        initialAttachmentUrl={initialAttachmentUrl}
      />
    </div>
  )
}
