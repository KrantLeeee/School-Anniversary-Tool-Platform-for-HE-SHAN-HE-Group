import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          throw new Error('用户不存在')
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const remainingMinutes = Math.ceil(
            (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
          )
          throw new Error(`账号已锁定，请${remainingMinutes}分钟后重试`)
        }

        if (!user.isApproved) {
          throw new Error('账号待审批，请联系管理员')
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) {
          // Increment failed attempts
          const newFailedAttempts = user.failedAttempts + 1
          const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts

          if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
            // Lock the account
            await db.user.update({
              where: { id: user.id },
              data: {
                failedAttempts: newFailedAttempts,
                lockedUntil: new Date(
                  Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
                ),
              },
            })
            throw new Error(
              `密码错误次数过多，账号已锁定${LOCKOUT_DURATION_MINUTES}分钟`
            )
          } else {
            await db.user.update({
              where: { id: user.id },
              data: { failedAttempts: newFailedAttempts },
            })
            throw new Error(`密码错误，还剩${remainingAttempts}次尝试机会`)
          }
        }

        // Reset failed attempts on successful login
        if (user.failedAttempts > 0 || user.lockedUntil) {
          await db.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: 0,
              lockedUntil: null,
            },
          })
        }

        // Log successful login
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            detail: `User ${user.email} logged in`,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
})
