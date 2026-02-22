'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ConversationSidebar } from './conversation-sidebar'
import { ChatInterface, Message } from './chat-interface'
import type { Tool } from '@prisma/client'

interface ChatLayoutProps {
  tool: Tool
  conversationId?: string
  initialMessages?: Message[]
}

export function ChatLayout({
  tool,
  conversationId,
  initialMessages = [],
}: ChatLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleNewChat = useCallback(() => {
    router.push(`/chat?toolId=${tool.id}`)
    router.refresh()
  }, [router, tool.id])

  return (
    <div className="flex flex-1 overflow-hidden w-full h-full">
      {/* Sidebar for desktop and mobile */}
      <aside
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-40 w-64 md:flex-shrink-0 bg-white/50 dark:bg-[var(--color-card-dark)]/50 border-r border-slate-200 dark:border-slate-800 flex flex-col backdrop-blur-sm transform transition-transform duration-300 md:relative md:translate-x-0 overflow-hidden`}
      >
        <ConversationSidebar
          toolId={tool.id}
          currentConversationId={conversationId}
          onNewChat={handleNewChat}
        />
      </aside>

      {/* Overlay for mobile sidebar */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <main className="flex-1 flex flex-col relative h-full w-full max-w-full">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--color-card-dark)] shrink-0">
          <button
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-medium truncate px-4">{tool.name}</span>
          <div className="w-6"></div> {/* Spacer for centering */}
        </header>

        {/* Global Floating Header (Desktop only) */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 absolute top-0 w-full z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer pointer-events-auto shadow-sm">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">工具:</span>
            <span className="text-sm font-semibold flex items-center gap-1 text-slate-800 dark:text-slate-100">
              {tool.name}
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </span>
          </div>
          <div className="flex gap-4 pointer-events-auto">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>
          </div>
        </header>

        <ChatInterface
          key={conversationId || 'new'}
          tool={tool}
          conversationId={conversationId}
          initialMessages={initialMessages}
        />
      </main>
    </div>
  )
}
