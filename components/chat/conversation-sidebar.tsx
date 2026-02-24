'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConversationSummary } from '@/hooks/use-conversations'

interface ConversationSidebarProps {
  toolId: string
  currentConversationId?: string
  onNewChat: () => void
  conversationState: {
    conversations: ConversationSummary[]
    isLoading: boolean
    deleteConversation: (id: string) => Promise<void>
    refresh: () => Promise<void>
  }
}

function groupConversationsByDate(conversations: ConversationSummary[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const groups: { label: string; conversations: ConversationSummary[] }[] = [
    { label: '今天', conversations: [] },
    { label: '昨天', conversations: [] },
    { label: '近7天', conversations: [] },
    { label: '更早', conversations: [] },
  ]

  conversations.forEach((conv) => {
    const date = new Date(conv.updatedAt)
    if (date >= today) {
      groups[0].conversations.push(conv)
    } else if (date >= yesterday) {
      groups[1].conversations.push(conv)
    } else if (date >= lastWeek) {
      groups[2].conversations.push(conv)
    } else {
      groups[3].conversations.push(conv)
    }
  })

  return groups.filter((g) => g.conversations.length > 0)
}

export function ConversationSidebar({
  toolId,
  currentConversationId,
  onNewChat,
  conversationState,
}: ConversationSidebarProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { conversations, isLoading, deleteConversation } = conversationState
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const groups = groupConversationsByDate(conversations)

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (deletingId) return

    setDeletingId(id)
    try {
      await deleteConversation(id)
      if (id === currentConversationId) {
        onNewChat()
      }
    } finally {
      setDeletingId(null)
    }
  }

  // Go back to home
  const goHome = () => {
    router.push('/')
  }

  return (
    <>
      <div className="p-5 relative pb-2 pt-6 shrink-0 flex items-center justify-between">
        <button onClick={goHome} className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors" title="回到首页">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
      </div>
      <div className="p-5 shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3 px-4 rounded-xl transition-all shadow-md group"
        >
          <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="font-medium">新建创作</span>
        </button>
      </div>

      <ScrollArea className="flex-1 px-3 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="w-6 h-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 text-center opacity-60">
            <span className="text-3xl inline-block mb-2">💬</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">暂无历史记录</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {group.label}
                </h3>
                <ul className="space-y-1">
                  {group.conversations.map((conv) => (
                    <li key={conv.id} className="relative group/item">
                      <button
                        onClick={() => {
                          router.push(`/chat?toolId=${toolId}&conversationId=${conv.id}`)
                          router.refresh()
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${conv.id === currentConversationId
                          ? 'bg-white dark:bg-white/10 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 border border-transparent'
                          }`}
                      >
                        <svg className={`w-4 h-4 shrink-0 ${conv.id === currentConversationId ? 'text-[var(--color-accent-orange)]' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <span className="text-sm truncate font-medium flex-1">{conv.title}</span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, conv.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        title="删除"
                        disabled={deletingId === conv.id}
                      >
                        {deletingId === conv.id ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* User profile / Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 shadow-sm border border-white dark:border-slate-700 text-xs font-bold shrink-0">
          {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
            {session?.user?.name || '用户'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {session?.user?.role === 'ADMIN' ? '管理员' : '标准用户'}
          </p>
        </div>
        <button onClick={() => signOut()} className="text-slate-400 hover:text-red-500 transition-colors" title="退出登录">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>
    </>
  )
}
