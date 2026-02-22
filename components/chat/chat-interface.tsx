'use client'

import { useState } from 'react'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import type { Tool } from '@prisma/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

interface ChatInterfaceProps {
  tool: Tool
  conversationId?: string
}

export function ChatInterface({ tool, conversationId: initialConversationId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState(initialConversationId)
  const [isStreaming, setIsStreaming] = useState(false)

  async function handleSendMessage(message: string) {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      createdAt: new Date(),
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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      // Create assistant message placeholder
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

                // Update conversation ID from first response
                if (parsed.data?.conversation_id && !conversationId) {
                  setConversationId(parsed.data.conversation_id)
                }

                // Accumulate content from delta events
                if (parsed.event === 'conversation.message.delta' && parsed.data?.content) {
                  assistantContent += parsed.data.content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  )
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) =>
        prev.concat({
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，发送消息时出现错误。请重试。',
          createdAt: new Date(),
        })
      )
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b bg-white px-6 py-4 dark:bg-slate-950">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{tool.icon || '🤖'}</span>
          <div>
            <h2 className="text-lg font-semibold">{tool.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {tool.description}
            </p>
          </div>
        </div>
      </div>

      <MessageList messages={messages} isStreaming={isStreaming} />
      <MessageInput onSend={handleSendMessage} disabled={isStreaming} />
    </div>
  )
}
