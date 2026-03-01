'use client'

import { useState, useRef } from 'react'
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

  // Robustness: Persist last sent message for retries
  const lastRequestRef = useRef<{ message: string, attachments?: FileAttachment[] } | null>(null)

  async function handleSendMessage(message: string, attachments?: FileAttachment[], isRetry: boolean = false) {
    if (!isRetry) {
      lastRequestRef.current = { message, attachments }
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
    }

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
      const assistantMessageId = (Date.now() + 1).toString()
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        let currentContent = ''
        while (true) {
          try {
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
                    const errorMsg = parsed.data?.message || '未知错误'
                    currentContent = `抱歉，处理您的请求时出现错误: ${errorMsg}`
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: currentContent }
                          : msg
                      )
                    )
                    break
                  }

                  const result = extractContent(parsed)

                  if (result.sessionId && !conversationId) {
                    setConversationId(result.sessionId)
                  }

                  if (result.error) {
                    currentContent = `抱歉，模型返回了错误: ${result.error}`
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: currentContent }
                          : msg
                      )
                    )
                    break
                  }

                  if (result.content) {
                    currentContent += result.content
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: currentContent }
                          : msg
                      )
                    )
                  }
                } catch (e) {
                  // Ignore parse errors for partial chunks
                }
              }
            }
          } catch (readError) {
            console.error('Reader error:', readError)
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: `抱歉，连接中断: ${readError instanceof Error ? readError.message : '网络不稳定'}` }
                  : msg
              )
            )
            break
          }
        }

        if (!currentContent) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: '未收到有效回复，请检查配置或稍后再试。' }
                : msg
            )
          )
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMsg = error instanceof Error ? error.message : '未知错误'

      // If it's a 402 or suggests payment, let's be more specific
      let displayError = `抱歉，发送消息时出现网络错误: ${errorMsg}`
      if (errorMsg.includes('arrears') || errorMsg.includes('402')) {
        displayError = '抱歉，当前 AI 服务账户余额不足，请联系管理员充值。'
      }

      // Check if we already added the assistant message (partial success)
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1]
        if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
          return prev.map((msg, idx) =>
            idx === prev.length - 1
              ? { ...msg, content: displayError }
              : msg
          )
        } else {
          return prev.concat({
            id: Date.now().toString(),
            role: 'assistant',
            content: displayError,
            createdAt: new Date(),
          })
        }
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleRetry = () => {
    if (lastRequestRef.current && !isStreaming) {
      // Remove the last failed message if it's an assistant message
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last && last.role === 'assistant' && last.content.includes('抱歉')) {
          return prev.slice(0, -1)
        }
        return prev
      })
      handleSendMessage(lastRequestRef.current.message, lastRequestRef.current.attachments, true)
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden relative w-full">
      {/* Messages */}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        tool={tool}
        onSendMessage={handleSendMessage}
        onRetry={handleRetry}
      />

      {/* Floating Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isStreaming}
        initialAttachmentUrl={initialAttachmentUrl}
      />
    </div>
  )
}
