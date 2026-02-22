'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[var(--color-card-light)]/80 dark:bg-[var(--color-card-dark)]/80 rounded-2xl shadow-sm p-8 sm:p-10 border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="animate-fade-up rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Email field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className={`block text-sm font-medium transition-colors duration-200 ${focusedField === 'email' ? 'text-primary' : 'text-foreground'
              }`}
          >
            邮箱地址
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="your@email.com"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="block w-full pl-11 pr-4 py-3 bg-[var(--color-input-light)] dark:bg-[var(--color-input-dark)] border-transparent focus:border-primary focus:ring-primary focus:bg-white dark:focus:bg-zinc-800 rounded-xl transition-all text-gray-900 dark:text-white placeholder-gray-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className={`block text-sm font-medium transition-colors duration-200 ${focusedField === 'password' ? 'text-primary' : 'text-foreground'
              }`}
          >
            密码
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="block w-full pl-11 pr-4 py-3 bg-[var(--color-input-light)] dark:bg-[var(--color-input-dark)] border-transparent focus:border-primary focus:ring-primary focus:bg-white dark:focus:bg-zinc-800 rounded-xl transition-all text-gray-900 dark:text-white placeholder-gray-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
        >

          {/* Button content */}
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                登录中...
              </>
            ) : (
              <>
                登录
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </span>
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[var(--color-card-light)] dark:bg-[var(--color-card-dark)] px-4 text-gray-500 dark:text-gray-400">
              其他选项
            </span>
          </div>
        </div>

        {/* Divider ends */}
      </form>
    </div>
  )
}
