import { RegisterForm } from '@/components/auth/register-form'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)] text-[var(--color-text-light)] dark:text-[var(--color-text-dark)] min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--color-accent-pink)]/10 dark:bg-[var(--color-accent-pink)]/5 rounded-full blur-3xl animate-float mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-80 h-80 bg-[var(--color-accent-orange)]/10 dark:bg-[var(--color-accent-orange)]/5 rounded-full blur-3xl animate-float delay-1000 mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-[var(--color-accent-green)]/10 dark:bg-[var(--color-accent-green)]/5 rounded-full blur-3xl animate-float delay-2000 mix-blend-multiply dark:mix-blend-screen pointer-events-none"></div>

      <main className="w-full max-w-md mx-4 relative z-10 my-12">
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-[var(--color-card-dark)] rounded-2xl shadow-sm mb-6">
            <svg className="w-8 h-8 text-[var(--color-accent-pink)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white">
            申请访问权限
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            加入我们，开启 AI 创意之旅
          </p>
        </div>

        <div className="animate-fade-up delay-100">
          <RegisterForm />
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400 animate-fade-up delay-200">
          已有账号?{' '}
          <Link href="/login" className="font-semibold text-primary hover:text-blue-500 transition-colors underline decoration-2 decoration-transparent hover:decoration-current underline-offset-4">
            直接登录
          </Link>
        </p>
      </main>
    </div>
  )
}
