import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ToolGrid } from '@/components/home/tool-grid'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const tools = await db.tool.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: 'asc' },
  })

  const userName = session.user?.name || session.user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <ToolGrid initialTools={tools} userName={userName} />
      </main>
    </div>
  )
}
