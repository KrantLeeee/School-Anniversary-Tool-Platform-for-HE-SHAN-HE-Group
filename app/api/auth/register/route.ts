import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

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

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: 'EMPLOYEE',
        isApproved: true, // MVP: auto-approve
      },
    })

    // Log registration
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        detail: `New user registered: ${user.email}`,
      },
    })

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error('Register error:', error)
    return Response.json({ error: '注册失败' }, { status: 500 })
  }
}
