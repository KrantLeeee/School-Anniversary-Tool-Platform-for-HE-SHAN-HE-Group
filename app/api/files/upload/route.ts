import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadToCoze, validateFile } from '@/lib/coze/upload'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: '请选择文件' }, { status: 400 })
    }

    const validation = validateFile(file)
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 })
    }

    const uploadedFile = await uploadToCoze(file)

    return Response.json(uploadedFile)
  } catch (error) {
    console.error('File upload error:', error)
    const message = error instanceof Error ? error.message : '上传失败'
    return Response.json({ error: message }, { status: 500 })
  }
}
