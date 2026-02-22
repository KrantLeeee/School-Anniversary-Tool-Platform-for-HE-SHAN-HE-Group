import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getClientInfo } from '@/lib/request-utils'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tools = await db.tool.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return Response.json(tools)
  } catch (error) {
    console.error('Admin tools API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, description, icon, cozeType, cozeBotId, cozeWorkflowId } =
      await req.json()

    if (!name || !description) {
      return Response.json(
        { error: 'Name and description are required' },
        { status: 400 }
      )
    }

    // Get max sortOrder
    const maxSort = await db.tool.aggregate({
      _max: { sortOrder: true },
    })
    const sortOrder = (maxSort._max.sortOrder || 0) + 1

    const tool = await db.tool.create({
      data: {
        name,
        description,
        icon,
        cozeType: cozeType || 'BOT',
        cozeBotId,
        cozeWorkflowId,
        sortOrder,
      },
    })

    // Log the action
    const { ip, userAgent } = getClientInfo(req)
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TOOL_CREATE',
        detail: `Created tool: ${name}`,
        ip,
        userAgent,
      },
    })

    return Response.json(tool)
  } catch (error) {
    console.error('Admin tool create error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
