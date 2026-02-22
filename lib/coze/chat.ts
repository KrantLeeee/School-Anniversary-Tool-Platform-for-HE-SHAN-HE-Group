/**
 * Coze Site API Integration
 * Uses the coze.site streaming endpoint format
 */

const COZE_SITE_URL = process.env.COZE_SITE_URL
const COZE_PROJECT_ID = process.env.COZE_PROJECT_ID
const COZE_API_TOKEN = process.env.COZE_API_TOKEN

export interface ChatAttachment {
  cozeFileId: string
  name: string
  type: string
  url?: string
}

export interface StreamChatOptions {
  message: string
  sessionId?: string
  userId: string
  attachments?: ChatAttachment[]
}

export interface CozeSiteStreamEvent {
  event?: string
  data?: {
    content?: string
    type?: string
    session_id?: string
    [key: string]: any
  }
}

/**
 * Generate a unique session ID for conversation tracking
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Build prompt content for Coze Site API
 */
function buildPromptContent(message: string, attachments?: ChatAttachment[]): any[] {
  const prompt: any[] = []

  // Add text message
  if (message) {
    prompt.push({
      type: 'text',
      content: {
        text: message
      }
    })
  }

  // Add attachments
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      if (attachment.type.startsWith('image/')) {
        if (attachment.url) {
          // Add image with URL
          prompt.push({
            type: 'image',
            content: {
              url: attachment.url
            }
          })
          // Also provide URL as text for tool parameters
          prompt.push({
            type: 'text',
            content: {
              text: `图片URL: ${attachment.url}`
            }
          })
        }
      } else {
        // Non-image file
        prompt.push({
          type: 'text',
          content: {
            text: `[用户上传了文件: ${attachment.name}${attachment.url ? ' URL: ' + attachment.url : ''}]`
          }
        })
      }
    }
  }

  return prompt
}

/**
 * Stream chat with Coze Site API
 */
export async function* streamCozeSiteChat(options: StreamChatOptions): AsyncGenerator<CozeSiteStreamEvent> {
  const { message, sessionId, userId, attachments } = options

  if (!COZE_SITE_URL || !COZE_PROJECT_ID) {
    throw new Error('COZE_SITE_URL and COZE_PROJECT_ID must be configured')
  }

  const promptContent = buildPromptContent(message, attachments)

  const requestBody = {
    content: {
      query: {
        prompt: promptContent
      }
    },
    type: 'query',
    session_id: sessionId || generateSessionId(),
    // Keep as string to avoid precision loss for large numbers
    project_id: COZE_PROJECT_ID
  }

  console.log('Coze Site request:', JSON.stringify(requestBody, null, 2))

  const response = await fetch(`${COZE_SITE_URL}/stream_run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COZE_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Coze Site API error:', response.status, errorText)
    throw new Error(`Coze Site API error: ${response.status} - ${errorText}`)
  }

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('No response body')
  }

  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Process complete SSE events (separated by \n\n)
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''

    for (const block of blocks) {
      const dataLines = block
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.slice(5).trim())

      if (dataLines.length === 0) continue

      const dataText = dataLines.join('\n')
      if (dataText && dataText !== '[DONE]') {
        try {
          const data = JSON.parse(dataText)
          yield { event: 'message', data }
        } catch (e) {
          yield { event: 'raw', data: { content: dataText } }
        }
      } else if (dataText === '[DONE]') {
        yield { event: 'done', data: {} }
      }
    }
  }

  // Process remaining buffer
  if (buffer.trim()) {
    const dataLines = buffer
      .split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trim())

    for (const dataText of dataLines) {
      if (dataText && dataText !== '[DONE]') {
        try {
          const data = JSON.parse(dataText)
          yield { event: 'message', data }
        } catch (e) {
          yield { event: 'raw', data: { content: dataText } }
        }
      }
    }
  }
}

/**
 * Extract text content from Coze Site stream event
 */
export function extractContent(event: CozeSiteStreamEvent): string | undefined {
  const data = event.data as any
  if (!data) return undefined

  // Primary format: type=answer with content.answer
  if (data.type === 'answer' && data.content?.answer) {
    return data.content.answer
  }

  // Fallback formats
  if (typeof data.content === 'string') {
    return data.content
  }
  if (data.message?.content) {
    return data.message.content
  }
  if (data.text) {
    return data.text
  }

  return undefined
}

/**
 * Extract error from Coze Site stream event
 */
export function extractError(event: CozeSiteStreamEvent): string | undefined {
  const data = event.data as any
  if (!data) return undefined

  // message_end with error code
  if (data.type === 'message_end' && data.message_end?.code && data.message_end.code !== '0') {
    return data.message_end.message || 'API请求失败'
  }

  // tool_response with error
  if (data.type === 'tool_response' && typeof data.content?.tool_response?.result === 'string') {
    const result = data.content.tool_response.result
    if (result.includes('Error')) {
      return result
    }
  }

  return undefined
}

/**
 * Extract session ID from response
 */
export function extractSessionId(event: CozeSiteStreamEvent): string | undefined {
  return event.data?.session_id
}
