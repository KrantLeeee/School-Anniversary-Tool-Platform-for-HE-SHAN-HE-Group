import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">校庆策划工具平台</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            创建账号以开始使用
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
