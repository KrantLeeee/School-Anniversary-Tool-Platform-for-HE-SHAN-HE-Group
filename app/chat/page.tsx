import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ChatLayout } from '@/components/chat/chat-layout'
import type { Message } from '@/components/chat/chat-interface'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ toolId?: string; conversationId?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const params = await searchParams
  const toolId = params.toolId || 'default-tool'

  const tool = await db.tool.findUnique({
    where: { id: toolId },
  })

  // If tool doesn't exist, we might want to redirect to home or show an empty state.
  // For now, if no tool is specified and there are no tools, it might crash if we enforce it.
  // But let's assume valid toolId is provided or we redirect to home.
  if (!tool) {
    redirect('/')
  }

  // Load existing messages if conversationId provided
  let initialMessages: Message[] = []
  if (params.conversationId) {
    const conversation = await db.conversation.findUnique({
      where: { id: params.conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    // Only load messages if the conversation belongs to the current user
    if (conversation?.userId === session.user.id) {
      initialMessages = conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        createdAt: msg.createdAt,
        attachments: msg.attachments,
      }))
    }
  }

  const allTools = await db.tool.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)] text-slate-800 dark:text-slate-100 transition-colors duration-200 pt-[73px]">
      <ChatLayout
        tool={tool}
        allTools={allTools}
        conversationId={params.conversationId}
        initialMessages={initialMessages}
      />
    </div>
  )
}
