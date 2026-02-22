/**
 * 文件上传 —— 通过腾讯云 COS 获取公开 URL
 * 用于将图片 URL 传给 Coze Site API 的工具（如 style_scene_to_3d）
 */

import { uploadBufferToCOS } from '@/lib/cos/client'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/json',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export interface UploadedFile {
  cozeFileId: string  // 存 COS 对象 key，便于后续引用
  name: string
  type: string
  size: number
  url: string         // COS 公开访问 URL，传给 Coze 工具用
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: '文件大小不能超过 10MB' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型' }
  }
  return { valid: true }
}

/**
 * 将文件上传到腾讯云 COS，返回文件信息和公开 URL
 */
export async function uploadToCoze(file: File): Promise<UploadedFile> {
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // 生成唯一的对象键，按日期分目录
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const ext = file.name.split('.').pop() || 'bin'
  const key = `uploads/${dateStr}/${uniqueId}.${ext}`

  // 读取文件为 Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // 上传到 COS
  const url = await uploadBufferToCOS(key, buffer, file.type)

  return {
    cozeFileId: key,   // 用 COS key 作为本地 ID
    name: file.name,
    type: file.type,
    size: file.size,
    url,
  }
}

export function isImageType(type: string): boolean {
  return type.startsWith('image/')
}
