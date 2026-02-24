'use client'

import { useState, useEffect } from 'react'

interface RenameConversationDialogProps {
    isOpen: boolean
    onClose: () => void
    onRename: (newTitle: string) => Promise<void>
    currentTitle: string
}

export function RenameConversationDialog({
    isOpen,
    onClose,
    onRename,
    currentTitle
}: RenameConversationDialogProps) {
    const [title, setTitle] = useState(currentTitle)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setTitle(currentTitle)
        }
    }, [isOpen, currentTitle])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || title === currentTitle) {
            onClose()
            return
        }

        setIsSubmitting(true)
        try {
            await onRename(title.trim())
            onClose()
        } catch (error) {
            console.error('Failed to rename:', error)
            alert('重命名失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="w-full max-w-md bg-white dark:bg-[var(--color-card-dark)] rounded-3xl shadow-xl overflow-hidden animate-slide-up relative flex flex-col"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>📝</span> 重命名对话
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            对话名称
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="输入新的对话名称"
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 focus:border-[var(--color-accent-orange)] transition-all text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || title === currentTitle}
                            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSubmitting ? '保存中...' : '确认修改'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
