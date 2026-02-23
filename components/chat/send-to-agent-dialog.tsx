'use client'

import { useState, useEffect } from 'react'
import { getActiveTools } from '@/app/actions/tools'
import { useRouter } from 'next/navigation'

interface SendToAgentDialogProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
}

export function SendToAgentDialog({ isOpen, onClose, imageUrl }: SendToAgentDialogProps) {
    const [tools, setTools] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true)
            getActiveTools()
                .then((data) => {
                    setTools(data)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleSelectTool = (toolId: string) => {
        // Navigate to the new tool chat and pass the image URL as a query param
        router.push(`/tool/${toolId}?attachmentUrl=${encodeURIComponent(imageUrl)}`)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="w-full max-w-lg bg-white dark:bg-[var(--color-card-dark)] rounded-3xl shadow-xl overflow-hidden animate-slide-up relative flex flex-col max-h-[80vh]"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>✨</span> 送入其他助手继续创作
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

                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <svg className="w-8 h-8 animate-spin text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    ) : tools.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            暂无其他可用工具
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {tools.map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleSelectTool(tool.id)}
                                    className="flex flex-col text-left p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[var(--color-accent-orange)] hover:bg-[var(--color-accent-orange)]/5 dark:hover:bg-[var(--color-accent-orange)]/10 transition-all duration-200 group"
                                >
                                    <div className="text-3xl mb-3 opacity-80 group-hover:scale-110 transition-transform duration-300 transform origin-left">
                                        {tool.icon || '🤖'}
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                        {tool.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {tool.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
