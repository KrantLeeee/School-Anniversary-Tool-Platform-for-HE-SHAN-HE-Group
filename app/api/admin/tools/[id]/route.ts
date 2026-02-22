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
    const data = await req.json()

    const tool = await db.tool.findUnique({ where: { id } })
    if (!tool) {
      return Response.json({ error: 'Tool not found' }, { status: 404 })
    }

    const updatedTool = await db.tool.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        cozeType: data.cozeType,
        cozeBotId: data.cozeBotId,
        cozeWorkflowId: data.cozeWorkflowId,
        isEnabled: data.isEnabled,
        sortOrder: data.sortOrder,
      },
    })

    // Log the action
    const { ip, userAgent } = getClientInfo(req)
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TOOL_UPDATE',
        detail: `Updated tool: ${tool.name}`,
        ip,
        userAgent,
      },
    })

    return Response.json(updatedTool)
  } catch (error) {
    console.error('Admin tool update error:', error)
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

    const tool = await db.tool.findUnique({ where: { id } })
    if (!tool) {
      return Response.json({ error: 'Tool not found' }, { status: 404 })
    }

    await db.tool.delete({ where: { id } })

    // Log the action
    const { ip, userAgent } = getClientInfo(req)
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TOOL_DELETE',
        detail: `Deleted tool: ${tool.name}`,
        ip,
        userAgent,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin tool delete error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
