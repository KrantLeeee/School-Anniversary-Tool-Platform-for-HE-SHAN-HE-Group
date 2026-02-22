import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/header'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const tools = await db.tool.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="container max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">AI 工具箱</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            选择一个工具开始使用
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.id} href={`/chat?toolId=${tool.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <div className="mb-2 text-4xl">{tool.icon || '🤖'}</div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {tools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">暂无可用工具</p>
          </div>
        )}
      </main>
    </div>
  )
}
