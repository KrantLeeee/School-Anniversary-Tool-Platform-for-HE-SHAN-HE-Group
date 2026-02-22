import { CozeAPI } from '@coze/api'

// Server-side only - these environment variables are never exposed to the client
const COZE_API_TOKEN = process.env.COZE_API_TOKEN
const COZE_BASE_URL = process.env.COZE_BASE_URL || 'https://api.coze.cn'

if (!COZE_API_TOKEN) {
  console.warn('COZE_API_TOKEN is not defined - Coze features will not work')
}

// Singleton Coze client (server-side only)
export const cozeClient = new CozeAPI({
  token: COZE_API_TOKEN || '',
  baseURL: COZE_BASE_URL,
})

export { CozeAPI }
