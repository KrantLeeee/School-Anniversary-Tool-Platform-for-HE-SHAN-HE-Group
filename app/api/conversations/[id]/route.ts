import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const conversation = await db.conversation.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!conversation) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 })
    }

    await db.conversation.delete({
      where: { id },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Delete conversation error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
