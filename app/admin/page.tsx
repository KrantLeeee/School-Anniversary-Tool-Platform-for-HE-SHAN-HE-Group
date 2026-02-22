import { db } from '@/lib/db'
import { StatsCard } from '@/components/admin/stats-card'
import { PageTransition } from '@/components/motion'

export default async function AdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalUsers,
    pendingUsers,
    totalConversationsToday,
    recentLogs,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isApproved: false } }),
    db.conversation.count({
      where: {
        createdAt: { gte: today },
      },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    }),
  ])

  function getActionColor(action: string) {
    switch (action) {
      case 'LOGIN':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'REGISTER':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'TOOL_USE':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'USER_APPROVE':
      case 'USER_REJECT':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <PageTransition>
      <div className="space-y-8 animate-fade-up p-4 md:p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">管理概览</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">查看系统运行状态和最新动态</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="总用户数"
            value={totalUsers}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatsCard
            title="待审批用户"
            value={pendingUsers}
            description={pendingUsers > 0 ? '需要处理' : '无待审批'}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="今日对话数"
            value={totalConversationsToday}
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <StatsCard
            title="最近活动"
            value={recentLogs.length}
            description="条最新日志"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>

        {/* Recent Logs */}
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-[var(--color-card-dark)] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">最近审计日志</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">时间</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">操作</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">用户</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">详情</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, index) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {log.createdAt.toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{log.user?.email || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-md truncate">{log.detail || '-'}</td>
                  </tr>
                ))}
                {recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      暂无日志记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
