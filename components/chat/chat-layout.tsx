'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConversationSidebar } from './conversation-sidebar'
import { ChatInterface, Message } from './chat-interface'
import { useConversations } from '@/hooks/use-conversations'
import { RenameConversationDialog } from './rename-conversation-dialog'
import type { Tool } from '@prisma/client'

interface ChatLayoutProps {
  tool: Tool
  allTools?: Tool[]
  conversationId?: string
  initialMessages?: Message[]
  initialAttachmentUrl?: string | null
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function ChatLayout({
  tool,
  allTools = [],
  conversationId,
  initialMessages = [],
  initialAttachmentUrl,
}: ChatLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [toolMenuOpen, setToolMenuOpen] = useState(false)
  const [actionMenuOpen, setActionMenuOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const [isResizing, setIsResizing] = useState(false)

  // Lift conversation state
  const conversationState = useConversations(tool.id)
  const isResizingRef = useRef(false)

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizingRef.current = true
    setIsResizing(true)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopResizing)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const stopResizing = useCallback(() => {
    isResizingRef.current = false
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopResizing)
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return
    const newWidth = e.clientX
    if (newWidth >= 180 && newWidth <= 480) {
      setSidebarWidth(newWidth)
    }
  }, [])

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', stopResizing)
    }
  }, [handleMouseMove, stopResizing])

  const handleNewChat = useCallback(() => {
    router.push(`/chat?toolId=${tool.id}`)
    router.refresh()
    conversationState.refresh() // Ensure we sync from server too
  }, [router, tool.id, conversationState])

  const switchTool = (targetToolId: string) => {
    router.push(`/chat?toolId=${targetToolId}`)
    setToolMenuOpen(false)
  }

  const handleDeleteConversation = async () => {
    if (!conversationId) return
    if (confirm('确定要删除这场对话吗？')) {
      try {
        await conversationState.deleteConversation(conversationId)
        router.push(`/chat?toolId=${tool.id}`)
        router.refresh()
      } catch (err) {
        console.error('Failed to delete conversation:', err)
      }
    }
    setActionMenuOpen(false)
  }

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const handleRename = async (newTitle: string) => {
    if (!conversationId) return
    await conversationState.renameConversation(conversationId, newTitle)
    router.refresh()
  }

  const currentConversation = conversationState.conversations.find(c => c.id === conversationId)

  return (
    <div className="flex flex-1 overflow-hidden w-full h-full">
      {/* Sidebar for desktop and mobile */}
      <aside
        style={{ width: isCollapsed ? 0 : sidebarWidth }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-40 md:flex-shrink-0 bg-white/50 dark:bg-[var(--color-card-dark)]/50 border-r border-slate-200 dark:border-slate-800 flex flex-col backdrop-blur-sm transform transition-all duration-300 md:relative md:translate-x-0 overflow-visible ${isCollapsed ? 'md:hidden' : ''}`}
      >
        <ConversationSidebar
          toolId={tool.id}
          currentConversationId={conversationId}
          onNewChat={handleNewChat}
          conversationState={conversationState}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            className={`hidden md:block absolute top-0 -right-1 w-2 h-full cursor-col-resize z-50 group hover:bg-[var(--color-accent-orange)]/20 transition-colors ${isResizing ? 'bg-[var(--color-accent-orange)]/30' : ''}`}
          >
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-8 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-[var(--color-accent-orange)] transition-colors ${isResizing ? 'scale-y-150' : ''}`} />
          </div>
        )}
      </aside>

      {/* Collapse Re-open Button (Desktop only, when collapsed) */}
      {isCollapsed && (
        <button
          onClick={toggleCollapse}
          className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 w-6 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-r-lg shadow-sm items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all z-40 group"
          title="展开侧边栏"
        >
          <svg className="w-4 h-4 text-slate-400 group-hover:text-[var(--color-accent-orange)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      )}

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
          <div className="w-6"></div>
        </header>

        {/* Global Floating Header (Desktop only) */}
        <header className="hidden md:flex items-center justify-between px-8 py-5 absolute top-0 w-full z-10 pointer-events-none">
          <div className="relative pointer-events-auto">
            <button
              onClick={() => setToolMenuOpen(!toolMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-black/40 rounded-lg backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 hover:border-[var(--color-accent-orange)]/50 transition-all shadow-sm active:scale-95"
            >
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">工具:</span>
              <span className="text-sm font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                {tool.name}
                <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${toolMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </span>
            </button>

            {toolMenuOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setToolMenuOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 p-1">
                  {allTools.map(t => (
                    <button
                      key={t.id}
                      onClick={() => switchTool(t.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${t.id === tool.id ? 'bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)] font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <span className="text-lg">{t.icon || '🤖'}</span>
                      <span className="truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative flex gap-2 pointer-events-auto">
            <button
              onClick={() => setActionMenuOpen(!actionMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/80 dark:bg-black/40 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400 shadow-sm active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
            </button>

            {actionMenuOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setActionMenuOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 p-1">
                  <button
                    onClick={() => {
                      setRenameDialogOpen(true)
                      setActionMenuOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    重命名
                  </button>
                  <button
                    onClick={handleDeleteConversation}
                    className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    删除对话
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <ChatInterface
          key={`${tool.id}-${conversationId || 'new'}`}
          tool={tool}
          conversationId={conversationId}
          initialMessages={initialMessages}
          initialAttachmentUrl={initialAttachmentUrl}
        />
      </main>

      <RenameConversationDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        onRename={handleRename}
        currentTitle={currentConversation?.title || ''}
      />
    </div>
  )
}
