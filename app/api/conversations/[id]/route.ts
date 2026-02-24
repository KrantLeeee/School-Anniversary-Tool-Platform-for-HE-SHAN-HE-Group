import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const { title } = await request.json()

    if (!title || typeof title !== 'string') {
      return new NextResponse('Invalid Title', { status: 400 })
    }

    const conversation = await db.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return new NextResponse('Not Found', { status: 404 })
    }

    if (conversation.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const updated = await db.conversation.update({
      where: { id },
      data: { title },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update conversation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params

    const conversation = await db.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return new NextResponse('Not Found', { status: 404 })
    }

    if (conversation.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Delete messages first (Prisma might handle this with cascade if configured, but let's be safe)
    await db.message.deleteMany({
      where: { conversationId: id },
    })

    await db.conversation.delete({
      where: { id },
    })

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('Failed to delete conversation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
