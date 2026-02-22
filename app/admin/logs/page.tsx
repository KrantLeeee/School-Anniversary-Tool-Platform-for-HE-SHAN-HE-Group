'use client'

import { useState, useEffect, useCallback } from 'react'

interface AuditLog {
  id: string
  action: string
  detail: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
  user: {
    email: string
    name: string | null
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ACTION_TYPES = [
  'LOGIN',
  'REGISTER',
  'TOOL_USE',
  'USER_APPROVE',
  'USER_REJECT',
  'USER_UPDATE',
  'USER_DELETE',
  'TOOL_CREATE',
  'TOOL_UPDATE',
  'TOOL_DELETE',
]

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
    case 'USER_DELETE':
    case 'TOOL_DELETE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  })

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '50')
      if (filters.action) params.set('action', filters.action)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)

      const response = await fetch(`/api/admin/logs?${params}`)
      const data = await response.json()
      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  function handleReset() {
    setFilters({ action: '', startDate: '', endDate: '' })
    setPage(1)
  }

  return (
    <div className="space-y-8 animate-fade-up p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">审计日志</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">查看系统操作记录</p>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-[var(--color-card-dark)] p-6 shadow-sm">
        <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">操作类型</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 focus:border-[var(--color-accent-orange)] transition-all text-slate-900 dark:text-white"
            >
              <option value="">全部操作</option>
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">开始日期</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 focus:border-[var(--color-accent-orange)] transition-all text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">结束日期</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              className="h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 focus:border-[var(--color-accent-orange)] transition-all text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, oklch(0.65 0.18 35) 0%, oklch(0.6 0.19 32) 100%)',
              }}
            >
              筛选
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-accent transition-all duration-200"
            >
              重置
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-[var(--color-card-dark)] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground">暂无日志记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">时间</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">操作</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">用户</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">详情</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{log.user?.email || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-md truncate">
                      {log.detail || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs">
                      {log.ip || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
