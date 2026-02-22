import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { streamCozeSiteChat, extractContent, extractSessionId, extractError, generateSessionId } from '@/lib/coze/chat'
import { getClientInfo } from '@/lib/request-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Attachment {
  cozeFileId: string
  name: string
  type: string
  url?: string
}

function generateTitle(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, ' ')
  if (cleaned.length <= 50) return cleaned

  const breakPoints = ['。', '，', '？', '！', '.', ',', '?', '!', ' ']
  for (const bp of breakPoints) {
    const idx = cleaned.lastIndexOf(bp, 50)
    if (idx > 20) {
      return cleaned.slice(0, idx + 1).trim()
    }
  }

  return cleaned.slice(0, 47) + '...'
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, toolId, conversationId, attachments } = await req.json()

    if ((!message && !attachments?.length) || !toolId) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Get tool configuration
    const tool = await db.tool.findUnique({
      where: { id: toolId },
    })

    if (!tool || !tool.isEnabled) {
      return new Response('Tool not found or disabled', { status: 404 })
    }

    // Get or create conversation in our DB
    let conversation = conversationId
      ? await db.conversation.findUnique({ where: { id: conversationId } })
      : null

    // Generate session ID for Coze (use existing or create new)
    let cozeSessionId = conversation?.cozeConversationId || generateSessionId()

    if (!conversation) {
      const title = generateTitle(message || 'File upload')
      conversation = await db.conversation.create({
        data: {
          userId: session.user.id,
          toolId: tool.id,
          title,
          cozeConversationId: cozeSessionId,
        },
      })
    }

    // Save user message with attachments
    await db.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message || '',
        contentType: attachments?.length ? 'multimodal' : 'text',
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
    })

    // Capture client info for audit logging
    const clientInfo = getClientInfo(req)

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''
          let lastError: string | undefined

          console.log('Starting Coze Site stream with session:', cozeSessionId)

          // Stream from Coze Site API
          for await (const chunk of streamCozeSiteChat({
            message: message || '',
            sessionId: cozeSessionId,
            userId: session.user.id,
            attachments: attachments as Attachment[] | undefined,
          })) {
            console.log('Received chunk:', JSON.stringify(chunk))

            // Check for errors
            const error = extractError(chunk)
            if (error) {
              console.error('Coze error:', error)
              lastError = error
            }

            // Extract content from the event
            const content = extractContent(chunk)
            if (content) {
              fullResponse += content
            }

            // Update session ID if returned
            const newSessionId = extractSessionId(chunk)
            if (newSessionId && newSessionId !== cozeSessionId) {
              cozeSessionId = newSessionId
              await db.conversation.update({
                where: { id: conversation!.id },
                data: { cozeConversationId: newSessionId },
              })
            }

            // Send chunk to client
            const sseData = `data: ${JSON.stringify(chunk)}\n\n`
            controller.enqueue(encoder.encode(sseData))
          }

          // Save assistant message after stream completes
          const messageToSave = fullResponse || (lastError ? `错误: ${lastError}` : '')
          if (messageToSave) {
            await db.message.create({
              data: {
                conversationId: conversation!.id,
                role: 'assistant',
                content: messageToSave,
                contentType: 'text',
              },
            })

            // Update conversation timestamp
            await db.conversation.update({
              where: { id: conversation!.id },
              data: { updatedAt: new Date() },
            })
          }

          // Log tool usage with IP info
          await db.auditLog.create({
            data: {
              userId: session.user.id,
              action: 'TOOL_USE',
              detail: `Used tool: ${tool.name}`,
              ip: clientInfo.ip,
              userAgent: clientInfo.userAgent,
            },
          })

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          const errorData = `data: ${JSON.stringify({
            event: 'error',
            data: { message: errorMessage },
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
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
