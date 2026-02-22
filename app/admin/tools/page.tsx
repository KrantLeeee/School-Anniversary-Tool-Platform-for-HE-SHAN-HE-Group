'use client'

import { useState, useEffect, useCallback } from 'react'

interface Tool {
  id: string
  name: string
  description: string
  icon: string | null
  cozeType: string
  cozeBotId: string | null
  cozeWorkflowId: string | null
  isEnabled: boolean
  sortOrder: number
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const fetchTools = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/tools')
      const data = await response.json()
      setTools(data)
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTools()
  }, [fetchTools])

  async function handleToggleEnabled(tool: Tool) {
    try {
      const response = await fetch(`/api/admin/tools/${tool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tool, isEnabled: !tool.isEnabled }),
      })
      if (response.ok) {
        fetchTools()
      }
    } catch (error) {
      console.error('Failed to toggle tool:', error)
    }
  }

  async function handleSaveTool(formData: FormData) {
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      icon: formData.get('icon') as string || null,
      cozeType: formData.get('cozeType') as string,
      cozeBotId: formData.get('cozeBotId') as string || null,
      cozeWorkflowId: formData.get('cozeWorkflowId') as string || null,
    }

    try {
      if (editingTool) {
        await fetch(`/api/admin/tools/${editingTool.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingTool, ...data }),
        })
      } else {
        await fetch('/api/admin/tools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      }
      setEditingTool(null)
      setIsCreating(false)
      fetchTools()
    } catch (error) {
      console.error('Failed to save tool:', error)
    }
  }

  async function handleDelete(toolId: string) {
    if (!confirm('确定要删除此工具吗？相关的对话记录也将被删除。')) return
    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchTools()
      }
    } catch (error) {
      console.error('Failed to delete tool:', error)
    }
  }

  const showForm = editingTool || isCreating

  return (
    <div className="space-y-8 animate-fade-up p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">工具管理</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">配置和管理 AI 工具</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, oklch(0.65 0.18 35) 0%, oklch(0.6 0.19 32) 100%)',
            }}
          >
            添加工具
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-[var(--color-card-dark)] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            {editingTool ? '编辑工具' : '添加新工具'}
          </h2>
          <form action={handleSaveTool} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                名称
              </label>
              <input
                id="name"
                name="name"
                defaultValue={editingTool?.name || ''}
                required
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 focus:border-[var(--color-accent-orange)] transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="icon" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                图标 (emoji)
              </label>
              <input
                id="icon"
                name="icon"
                defaultValue={editingTool?.icon || ''}
                placeholder="🤖"
                className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                描述
              </label>
              <textarea
                id="description"
                name="description"
                defaultValue={editingTool?.description || ''}
                required
                rows={3}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cozeType" className="block text-sm font-medium text-foreground">
                Coze 类型
              </label>
              <select
                id="cozeType"
                name="cozeType"
                defaultValue={editingTool?.cozeType || 'BOT'}
                className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="BOT">Bot</option>
                <option value="WORKFLOW">Workflow</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="cozeBotId" className="block text-sm font-medium text-foreground">
                Coze Bot ID
              </label>
              <input
                id="cozeBotId"
                name="cozeBotId"
                defaultValue={editingTool?.cozeBotId || ''}
                className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="cozeWorkflowId" className="block text-sm font-medium text-foreground">
                Coze Workflow ID
              </label>
              <input
                id="cozeWorkflowId"
                name="cozeWorkflowId"
                defaultValue={editingTool?.cozeWorkflowId || ''}
                className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, oklch(0.65 0.18 35) 0%, oklch(0.6 0.19 32) 100%)',
                }}
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingTool(null)
                  setIsCreating(false)
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-medium border border-border text-foreground hover:bg-accent transition-all duration-200"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-[var(--color-card-dark)] overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : tools.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-muted-foreground">暂无工具，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">排序</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">工具</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">类型</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">状态</th>
                  <th className="px-6 py-4 text-left font-medium text-slate-500 dark:text-slate-400">操作</th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr key={tool.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{tool.sortOrder}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-pink)] text-white text-xl shadow-sm">
                          {tool.icon || '🤖'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{tool.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">{tool.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tool.cozeType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleEnabled(tool)}
                        className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${tool.isEnabled
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                          }`}
                      >
                        {tool.isEnabled ? '启用中' : '已禁用'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingTool(tool)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-foreground hover:bg-accent transition-all duration-200"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(tool.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-200"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
