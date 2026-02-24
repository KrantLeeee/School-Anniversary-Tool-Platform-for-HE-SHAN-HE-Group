'use client'

import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import { AttachmentDisplay } from './attachment-display'
import { TypingIndicator } from '@/components/motion'
import { useSession } from 'next-auth/react'
import { SendToAgentDialog } from './send-to-agent-dialog'
import { ImageLightbox } from '@/components/ui/image-lightbox'

import type { Tool } from '@prisma/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  attachments?: string | null
}

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  tool: Tool
  onSendMessage: (message: string) => void
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
      title="复制"
    >
      {copied ? (
        <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}

import { getAgentSuggestions } from '@/config/agent-suggestions'

export function MessageList({ messages, isStreaming, tool, onSendMessage }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<{ src: string, alt: string } | null>(null)

  const userInitial = session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'

  const suggestions = getAgentSuggestions(tool.id)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollableNode = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollableNode) {
        scrollableNode.scrollTop = scrollableNode.scrollHeight
      }
    }
  }, [messages, isStreaming])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center pt-10 pb-40 px-4 max-w-4xl mx-auto w-full">
        <div className="w-full space-y-12 animate-fade-up">
          {/* Agent Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 text-4xl mb-2 hover:scale-110 transition-transform duration-500">
              {tool.icon || '🤖'}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {tool.name}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Sample Prompts */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center">你可以这样问我</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(suggestion)}
                  className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 hover:border-[var(--color-accent-orange)] hover:text-[var(--color-accent-orange)] transition-all duration-300 hover:shadow-xl active:scale-95 text-left max-w-md shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 w-full" ref={scrollRef}>
      <div className="px-4 md:px-20 pt-20 pb-[280px]">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 md:gap-6 animate-fade-up ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {message.role === 'assistant' ? (
                // AI Avatar
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-pink)] flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  AI
                </div>
              ) : (
                // User Avatar
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 dark:bg-slate-700 shadow-sm flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm border border-white dark:border-slate-600">
                  {userInitial.toUpperCase()}
                </div>
              )}

              <div className={`flex-1 flex flex-col max-w-[85%] ${message.role === 'user' ? 'space-y-2' : 'space-y-4'}`}>
                {message.role === 'user' && (
                  <AttachmentDisplay attachments={message.attachments} mode="images" />
                )}

                {message.role === 'assistant' ? (
                  <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-5 md:p-6 rounded-2xl rounded-tl-none border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                    <div className="prose prose-sm md:prose-base dark:prose-invert prose-p:text-slate-800 dark:prose-p:text-slate-200 max-w-none prose-headings:font-bold prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-800">
                      <ReactMarkdown
                        components={{
                          img: ({ node, ...props }) => (
                            <span className="relative group inline-block my-4">
                              <img
                                {...props}
                                className="rounded-xl shadow-sm max-w-full cursor-zoom-in hover:opacity-90 transition-opacity"
                                alt={props.alt || 'Generated Graphic'}
                                onClick={() => {
                                  if (props.src && typeof props.src === 'string') {
                                    setPreviewImage({ src: props.src, alt: props.alt || 'Image Preview' })
                                  }
                                }}
                              />
                              <span className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (typeof props.src === 'string') {
                                      setSelectedImage(props.src)
                                    }
                                  }}
                                  className="p-2 bg-white/90 dark:bg-[var(--color-card-dark)]/90 hover:bg-white dark:hover:bg-[var(--color-card-dark)] text-slate-700 dark:text-slate-200 rounded-full shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:scale-110 transition-all flex items-center justify-center group/btn"
                                  title="去其他助手继续创作"
                                >
                                  <svg className="w-5 h-5 text-[var(--color-accent-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  <span className="absolute right-full mr-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                    传给其他助手
                                  </span>
                                </button>
                              </span>
                            </span>
                          )
                        }}
                      >
                        {message.content || '...'}
                      </ReactMarkdown>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {message.content && <CopyButton content={message.content} />}
                    </div>
                  </div>
                ) : (
                  (() => {
                    const hasText = message.content && message.content.trim().length > 0
                    let hasFiles = false
                    try {
                      const parsed = message.attachments ? JSON.parse(message.attachments) : []
                      hasFiles = Array.isArray(parsed) && parsed.some((a: any) => !a.type?.startsWith('image/'))
                    } catch { }

                    if (!hasText && !hasFiles) return null

                    return (
                      <div className="bg-white dark:bg-[var(--color-card-dark)]/80 p-4 md:p-5 text-sm md:text-base rounded-2xl rounded-tr-none shadow-sm border border-slate-200 dark:border-slate-800 ml-auto">
                        {hasText && (
                          <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">{message.content}</p>
                        )}
                        <AttachmentDisplay attachments={message.attachments} mode="files" />
                      </div>
                    )
                  })()
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-4 md:gap-6 animate-fade-up">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-pink)] flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                AI
              </div>
              <div className="flex-1 max-w-[85%]">
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm px-5 py-4 rounded-2xl rounded-tl-none border border-slate-200/50 dark:border-slate-800/50 shadow-sm inline-block">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SendToAgentDialog
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />

      <ImageLightbox
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imgSrc={previewImage?.src || ''}
        imgAlt={previewImage?.alt}
      />
    </ScrollArea>
  )
}
