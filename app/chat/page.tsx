import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/header'
import { ChatInterface } from '@/components/chat/chat-interface'

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

  if (!tool) {
    redirect('/')
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-900">
      <Header />
      <ChatInterface tool={tool} conversationId={params.conversationId} />
    </div>
  )
}
