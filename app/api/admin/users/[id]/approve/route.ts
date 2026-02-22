import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getClientInfo } from '@/lib/request-utils'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { approved } = await req.json()

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { isApproved: approved },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
      },
    })

    // Log the action
    const { ip, userAgent } = getClientInfo(req)
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: approved ? 'USER_APPROVE' : 'USER_REJECT',
        detail: `${approved ? 'Approved' : 'Rejected'} user ${user.email}`,
        ip,
        userAgent,
      },
    })

    return Response.json(updatedUser)
  } catch (error) {
    console.error('Admin user approve error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
