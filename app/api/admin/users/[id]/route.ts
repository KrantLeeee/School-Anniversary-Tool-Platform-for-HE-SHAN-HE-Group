import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getClientInfo } from '@/lib/request-utils'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { role, isApproved } = await req.json()

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const updateData: { role?: string; isApproved?: boolean } = {}
    if (role !== undefined) updateData.role = role
    if (isApproved !== undefined) updateData.isApproved = isApproved

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
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
        action: 'USER_UPDATE',
        detail: `Updated user ${user.email}: ${JSON.stringify(updateData)}`,
        ip,
        userAgent,
      },
    })

    return Response.json(updatedUser)
  } catch (error) {
    console.error('Admin user update error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Prevent self-deletion
    if (id === session.user.id) {
      return Response.json({ error: 'Cannot delete yourself' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    // Log the action
    const { ip, userAgent } = getClientInfo(req)
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'USER_DELETE',
        detail: `Deleted user ${user.email}`,
        ip,
        userAgent,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
