import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { streamChat, ChatEventType, getMessageContent, getConversationId } from '@/lib/coze/chat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, toolId, conversationId } = await req.json()

    if (!message || !toolId) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Get tool configuration
    const tool = await db.tool.findUnique({
      where: { id: toolId },
    })

    if (!tool || !tool.isEnabled) {
      return new Response('Tool not found or disabled', { status: 404 })
    }

    if (!tool.cozeBotId) {
      return new Response('Tool not configured with Coze bot', { status: 400 })
    }

    // Get or create conversation in our DB
    let conversation = conversationId
      ? await db.conversation.findUnique({ where: { id: conversationId } })
      : null

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          userId: session.user.id,
          toolId: tool.id,
          title: message.slice(0, 50),
        },
      })
    }

    // Save user message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
        contentType: 'text',
      },
    })

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''
          let cozeConversationId = conversation!.cozeConversationId

          // Stream from Coze
          for await (const chunk of streamChat({
            botId: tool.cozeBotId!,
            userId: session.user.id,
            message,
            conversationId: cozeConversationId || undefined,
          })) {
            // Extract conversation ID from first response
            const newConvId = getConversationId(chunk)
            if (newConvId && !cozeConversationId) {
              cozeConversationId = newConvId
              await db.conversation.update({
                where: { id: conversation!.id },
                data: { cozeConversationId: newConvId },
              })
            }

            // Accumulate assistant response from delta events
            const content = getMessageContent(chunk)
            if (content) {
              fullResponse += content
            }

            // Send chunk to client
            const sseData = `data: ${JSON.stringify({
              event: chunk.event,
              data: chunk.data,
            })}\n\n`
            controller.enqueue(encoder.encode(sseData))
          }

          // Save assistant message after stream completes
          if (fullResponse) {
            await db.message.create({
              data: {
                conversationId: conversation!.id,
                role: 'assistant',
                content: fullResponse,
                contentType: 'text',
              },
            })

            // Update conversation timestamp
            await db.conversation.update({
              where: { id: conversation!.id },
              data: { updatedAt: new Date() },
            })
          }

          // Log tool usage
          await db.auditLog.create({
            data: {
              userId: session.user.id,
              action: 'TOOL_USE',
              detail: `Used tool: ${tool.name}`,
            },
          })

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          const errorData = `data: ${JSON.stringify({
            event: 'error',
            data: { message: 'Stream error occurred' },
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
