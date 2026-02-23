import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { AgentRegistry } from '@/lib/agents/registry'
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

    // Instanciate our Agent
    const agent = AgentRegistry.getAgent(tool.cozeBotId || 'scene-3d-generator') || AgentRegistry.getDefaultAgent()

    // Get or create conversation in our DB
    let conversation = conversationId
      ? await db.conversation.findUnique({ where: { id: conversationId } })
      : null

    let cozeConversationId = conversation?.cozeConversationId || undefined

    if (!conversation) {
      const title = generateTitle(message || '文件上传')
      conversation = await db.conversation.create({
        data: {
          userId: session.user.id,
          toolId: tool.id,
          title,
          cozeConversationId: undefined,
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

    const clientInfo = getClientInfo(req)

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = ''
          let lastError: string | undefined

          console.log(`Starting Custom Agent stream for tool: ${tool.name} using ${agent.constructor.name}`)

          // Stream from our Custom Agent implementation
          for await (const chunk of agent.streamChat({
            message: message || '',
            conversationId: conversation!.id, // Pass our internal conversation ID for history
            userId: session.user.id,
            attachments: attachments as Attachment[] | undefined,
          })) {

            if (chunk.event === 'error') {
              console.error('Agent error:', chunk.data.message)
              lastError = chunk.data.message
            }

            if (chunk.event === 'message' && chunk.data?.content?.answer) {
              fullResponse += chunk.data.content.answer
            }

            // Send chunk to client frontend matching expected shape
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

            await db.conversation.update({
              where: { id: conversation!.id },
              data: { updatedAt: new Date() },
            })
          }

          await db.auditLog.create({
            data: {
              userId: session.user.id,
              action: 'TOOL_USE',
              detail: `Used Custom Agent: ${tool.name}`,
              ip: clientInfo.ip,
              userAgent: clientInfo.userAgent,
            },
          })

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
