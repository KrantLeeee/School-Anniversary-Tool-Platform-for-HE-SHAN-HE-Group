'use client'

import { useState, useEffect, useCallback } from 'react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  isApproved: boolean
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const statusParam = filter === 'all' ? '' : `&status=${filter}`
      const response = await fetch(
        `/api/admin/users?page=${page}&limit=20${statusParam}`
      )
      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, filter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleApprove(userId: string, approved: boolean) {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to update role:', error)
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('确定要删除此用户吗？')) return
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const filterButtons = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审批' },
    { key: 'approved', label: '已审批' },
  ] as const

  return (
    <div className="space-y-8 animate-fade-up p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">用户管理</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">管理系统用户和权限</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => {
                setFilter(btn.key)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filter === btn.key
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">邮箱</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">姓名</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">角色</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">状态</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">注册时间</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{user.email}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{user.name || '-'}</td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 focus:border-[var(--color-accent-orange)] transition-all text-slate-900 dark:text-white"
                      >
                        <option value="EMPLOYEE">员工</option>
                        <option value="ADMIN">管理员</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${user.isApproved
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                      >
                        {user.isApproved ? '已审批' : '待审批'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!user.isApproved && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id, true)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary-foreground transition-all duration-200 hover:opacity-90"
                              style={{
                                background: 'linear-gradient(135deg, oklch(0.65 0.18 35) 0%, oklch(0.6 0.19 32) 100%)',
                              }}
                            >
                              批准
                            </button>
                            <button
                              onClick={() => handleApprove(user.id, false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-accent transition-all duration-200"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-200"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      暂无用户数据
                    </td>
                  </tr>
                )}
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
