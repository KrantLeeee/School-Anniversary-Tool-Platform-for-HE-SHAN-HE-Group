'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Tool } from '@prisma/client'

const CARD_COLORS = [
    'bg-[var(--color-accent-orange)]/20 dark:bg-[var(--color-accent-orange)]/10 hover:border-[var(--color-accent-orange)]/30 text-orange-700 dark:text-orange-300',
    'bg-[var(--color-accent-teal)]/20 dark:bg-[var(--color-accent-teal)]/10 hover:border-[var(--color-accent-teal)]/30 text-teal-700 dark:text-teal-300',
    'bg-[var(--color-accent-pink)]/20 dark:bg-[var(--color-accent-pink)]/10 hover:border-[var(--color-accent-pink)]/30 text-pink-700 dark:text-pink-300',
]

interface ToolGridProps {
    initialTools: Tool[]
    userName: string
}

export function ToolGrid({ initialTools, userName }: ToolGridProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredTools = initialTools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 animate-fade-up">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-slate-900 dark:text-white mt-8">
                        工作空间
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-light">
                        欢迎回来, {userName}。请选择一个工具开始。
                    </p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[var(--color-accent-orange)] transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="搜索工具..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-orange)]/20 focus:border-[var(--color-accent-orange)] transition-all shadow-sm"
                    />
                </div>
            </div>

            {filteredTools.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full mb-16">
                    {filteredTools.map((tool, index) => {
                        const colorClass = CARD_COLORS[index % CARD_COLORS.length];

                        return (
                            <Link
                                key={tool.id}
                                href={`/chat?toolId=${tool.id}`}
                                className="group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col h-[280px] hover:shadow-xl hover:border-[var(--color-accent-orange)]/30 transition-all duration-300 animate-fade-up active:scale-[0.98]"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl shadow-sm bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform`}>
                                        {tool.icon || '🤖'}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        {tool.cozeType === 'BOT' ? 'Agent' : 'Workflow'}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[var(--color-accent-orange)] transition-colors line-clamp-1">
                                        {tool.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-[var(--color-accent-orange)] transition-colors">
                                    <span>立即开始会话</span>
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </Link>
                        )
                    })}

                    {/* "Add More" Placeholder */}
                    <div className="relative group">
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center h-[280px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-slate-50/50 dark:bg-transparent cursor-default">
                            <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-sm font-medium">配置新工具</span>
                        </div>

                        {/* Simple CSS Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 dark:bg-slate-800 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none transition-all duration-300 whitespace-nowrap z-50">
                            功能即将上线
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 animate-fade-up w-full">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 mb-6 shadow-soft">
                        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">未找到匹配工具</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">尝试不同的搜索词，或查看全部工具。</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        className="mt-6 text-[var(--color-accent-orange)] font-medium hover:underline"
                    >
                        重置搜索
                    </button>
                </div>
            )}
        </>
    )
}
