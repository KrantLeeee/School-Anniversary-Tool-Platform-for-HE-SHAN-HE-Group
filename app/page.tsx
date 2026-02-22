import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Header } from '@/components/layout/header'
import Link from 'next/link'

// Define the colors for the cards based on their order
const CARD_COLORS = [
  'bg-[var(--color-accent-orange)]/20 dark:bg-[var(--color-accent-orange)]/10 hover:border-[var(--color-accent-orange)]/30 text-orange-700 dark:text-orange-300',
  'bg-[var(--color-accent-teal)]/20 dark:bg-[var(--color-accent-teal)]/10 hover:border-[var(--color-accent-teal)]/30 text-teal-700 dark:text-teal-300',
  'bg-[var(--color-accent-pink)]/20 dark:bg-[var(--color-accent-pink)]/10 hover:border-[var(--color-accent-pink)]/30 text-pink-700 dark:text-pink-300',
]

export default async function HomePage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const tools = await db.tool.findMany({
    where: { isEnabled: true },
    orderBy: { sortOrder: 'asc' },
  })

  // Group tools by conversation counts (simulated for UI demonstration as required, but using real DB length if possible)
  // To keep it clean, we just map over the DB tools.

  return (
    <div className="min-h-screen bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)] text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Header />

      <main className="pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900 dark:text-white">
            早上好, {session.user?.name || session.user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-light">
            准备好继续你的创意工作了吗？
          </p>
        </div>

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mb-16">
            {tools.map((tool, index) => {
              const colorClass = CARD_COLORS[index % CARD_COLORS.length];
              const gradientColor = colorClass.split(' ')[0].split('/')[0].replace('bg-', '');

              return (
                <Link
                  key={tool.id}
                  href={`/chat?toolId=${tool.id}`}
                  className={`group relative ${colorClass.split(' ').slice(0, 2).join(' ')} rounded-3xl p-6 h-[320px] flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 shadow-sm hover:shadow-lg cursor-pointer overflow-hidden border border-transparent ${colorClass.split(' ')[2]} animate-fade-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Decorative gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${gradientColor}/10 dark:to-${gradientColor}/5 pointer-events-none`}></div>

                  {/* Icon/Image Placeholder area - using SVG from stitch or emoji */}
                  <div className="relative w-full h-40 flex items-center justify-center mb-4">
                    <div className="w-48 h-48 absolute flex items-center justify-center opacity-80 mix-blend-multiply dark:mix-blend-screen">
                      <span className="text-8xl filter drop-shadow-md">{tool.icon || '🤖'}</span>
                    </div>
                  </div>

                  <div className="relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 opacity-80">
                      <span>{tool.cozeType === 'BOT' ? '对话 Bot' : '工作流'}</span>
                      <span>•</span>
                      <span>已启用</span>
                    </div>
                    <h3 className={`text-xl font-bold text-slate-900 dark:text-white leading-tight transition-colors group-hover:${colorClass.split(' ').pop()}`}>
                      {tool.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 animate-fade-up delay-300 w-full max-w-5xl">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-6 shadow-soft">
              <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">暂无可用工具</h3>
            <p className="text-slate-500 dark:text-slate-400">系统当前尚未配置任何 AI 创意工具，请联系管理员在后台添加。</p>
          </div>
        )}

        {/* Search / Global Input Area */}
        {tools.length > 0 && (
          <div className="w-full max-w-2xl relative group z-20 animate-fade-up delay-300">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent-orange)] to-[var(--color-accent-pink)] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white dark:bg-[var(--color-card-dark)] rounded-2xl shadow-soft p-2 flex items-center gap-2 transition-colors border border-slate-100 dark:border-slate-800">
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors whitespace-nowrap">
                <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></span>
                <span>快捷指令</span>
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <input
                type="text"
                placeholder="输入你现在的想法，或者唤醒任意工具..."
                className="w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 text-base py-3 px-2 outline-none"
                disabled
              />
              <button className="p-3 rounded-xl text-slate-400 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-not-allowed">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Quick actions chips */}
        {tools.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3 w-full max-w-3xl animate-fade-up delay-400">
            <button className="px-4 py-2 rounded-full bg-white dark:bg-[var(--color-card-dark)] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:shadow-sm transition-all shadow-sm">
              ✍️ 写个初稿
            </button>
            <button className="px-4 py-2 rounded-full bg-white dark:bg-[var(--color-card-dark)] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:shadow-sm transition-all shadow-sm">
              💡 获取建议
            </button>
            <button className="px-4 py-2 rounded-full bg-white dark:bg-[var(--color-card-dark)] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:shadow-sm transition-all shadow-sm">
              🎨 构思草图
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
