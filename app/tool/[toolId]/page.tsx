import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/header'
import { ChatLayout } from '@/components/chat/chat-layout'
import type { Message } from '@/components/chat/chat-interface'

export default async function ToolPage({
  params,
  searchParams,
}: {
  params: Promise<{ toolId: string }>
  searchParams: Promise<{ conversationId?: string; attachmentUrl?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const { toolId } = await params
  const { conversationId, attachmentUrl } = await searchParams

  const tool = await db.tool.findUnique({
    where: { id: toolId },
  })

  if (!tool || !tool.isEnabled) {
    redirect('/')
  }

  // Load existing messages if conversationId provided
  let initialMessages: Message[] = []
  if (conversationId) {
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
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

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <ChatLayout
        tool={tool}
        conversationId={conversationId}
        initialMessages={initialMessages}
        initialAttachmentUrl={attachmentUrl}
      />
    </div>
  )
}
