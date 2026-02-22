import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)] text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--color-accent-orange)]/10 dark:bg-[var(--color-accent-orange)]/5 rounded-full blur-3xl animate-float mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-80 h-80 bg-[var(--color-accent-green)]/10 dark:bg-[var(--color-accent-green)]/5 rounded-full blur-3xl animate-float delay-1000 mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-[var(--color-accent-pink)]/10 dark:bg-[var(--color-accent-pink)]/5 rounded-full blur-3xl animate-float delay-2000 mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

      <main className="w-full max-w-md mx-4 relative z-10">
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-[var(--color-card-dark)] rounded-2xl shadow-sm mb-6">
            <svg className="w-8 h-8 text-[var(--color-accent-orange)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white">
            AI 创意助手
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            设计机构专用智能创意生成工具
          </p>
        </div>

        <div className="animate-fade-up delay-100">
          <LoginForm />
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 animate-fade-up delay-200">
          新员工入职?{' '}
          <Link href="/register" className="font-semibold text-primary hover:text-blue-500 transition-colors underline decoration-2 decoration-transparent hover:decoration-current underline-offset-4">
            注册并申请访问权限
          </Link>
        </p>

        <div className="mt-12 flex justify-center space-x-6 opacity-60 hover:opacity-100 transition-opacity animate-fade-up delay-300">
          <span className="text-xs text-gray-400">帮助中心</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-xs text-gray-400">隐私政策</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-xs text-gray-400">联系 IT 支持</span>
        </div>
      </main>
    </div>
  )
}
