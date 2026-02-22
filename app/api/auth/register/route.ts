import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { getClientInfo } from '@/lib/request-utils'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return Response.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }

    if (password.length < 6) {
      return Response.json({ error: '密码至少需要6个字符' }, { status: 400 })
    }

    // Check if user exists
    const existing = await db.user.findUnique({
      where: { email },
    })

    if (existing) {
      return Response.json({ error: '该邮箱已被注册' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user (requires admin approval)
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: 'EMPLOYEE',
        isApproved: false,
      },
    })

    // Log registration with IP info
    const { ip, userAgent } = getClientInfo(req)
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        detail: `New user registered: ${user.email}`,
        ip,
        userAgent,
      },
    })

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      message: '注册成功！请等待管理员审批后登录。',
    })
  } catch (error) {
    console.error('Register error:', error)
    return Response.json({ error: '注册失败' }, { status: 500 })
  }
}
