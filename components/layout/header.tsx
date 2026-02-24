'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch for theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const userInitial = session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'

  // Theme toggle logic
  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    } else {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-[var(--color-background-light)]/80 dark:bg-[var(--color-background-dark)]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-accent-orange)] to-[var(--color-accent-pink)] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            AI
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">禾山禾 AI 工具平台</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link
            href="/"
            className={`transition-colors ${pathname === '/' ? "text-slate-900 dark:text-white relative after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-slate-900 dark:after:bg-white" : "hover:text-slate-900 dark:hover:text-white"}`}
          >
            工具库
          </Link>
          <Link
            href="/chat"
            className={`transition-colors ${pathname.startsWith('/chat') ? "text-slate-900 dark:text-white relative after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-slate-900 dark:after:bg-white" : "hover:text-slate-900 dark:hover:text-white"}`}
          >
            对话工作区
          </Link>

          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin/users"
              className={`transition-colors ${pathname.startsWith('/admin') ? "text-slate-900 dark:text-white relative after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-slate-900 dark:after:bg-white" : "hover:text-slate-900 dark:hover:text-white"}`}
            >
              管理后台
            </Link>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
              aria-label="Toggle Dark Mode"
            >
              <svg className="w-5 h-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              <svg className="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-slate-800 transition-transform active:scale-95 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              {userInitial.toUpperCase()}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-[var(--color-card-dark)] shadow-xl animate-fade-in origin-top-right z-50 overflow-hidden p-2">
                  <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-800/50 mb-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {session?.user?.name || '用户'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {session?.user?.email}
                    </p>
                  </div>

                  {/* Mobile nav links */}
                  <div className="md:hidden space-y-1 mb-2 border-b border-slate-100 dark:border-slate-800/50 pb-2">
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      工具库
                    </Link>
                    <Link href="/chat" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      对话记录
                    </Link>
                    {session?.user?.role === 'ADMIN' && (
                      <Link href="/admin/users" onClick={() => setIsMenuOpen(false)} className="flex items-center w-full px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        管理后台
                      </Link>
                    )}
                  </div>

                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center w-full px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
                  >
                    退出登录
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
