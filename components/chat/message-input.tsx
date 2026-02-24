'use client'

import { useState, useRef, useEffect } from 'react'
import { FilePreview } from './file-preview'

export interface FileAttachment {
  cozeFileId: string
  name: string
  type: string
  size: number
  url?: string        // COS 公开访问 URL
  previewUrl?: string // 本地预览 URL（不传到 API）
}

interface MessageInputProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void
  disabled?: boolean
  initialAttachmentUrl?: string | null
}

export function MessageInput({ onSend, disabled, initialAttachmentUrl }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialAttachmentUrl) {
      setAttachments([{
        cozeFileId: 'passed-from-agent',
        name: 'Agent_Generated_Image.png',
        type: 'image/png',
        size: 0,
        url: initialAttachmentUrl,
        previewUrl: initialAttachmentUrl
      }])
    }
  }, [initialAttachmentUrl])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          alert(error.error || '上传失败')
          continue
        }

        const uploadedFile = await response.json()

        let previewUrl: string | undefined
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file)
        }

        setAttachments((prev) => [
          ...prev,
          { ...uploadedFile, previewUrl },
        ])
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('文件上传失败')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleRemoveAttachment(index: number) {
    setAttachments((prev) => {
      const file = prev[index]
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if ((message.trim() || attachments.length > 0) && !disabled && !isUploading) {
      onSend(message.trim(), attachments.length > 0 ? attachments : undefined)
      setMessage('')
      setAttachments([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto' // reset height
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-resize textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }

  const canSubmit = (message.trim() || attachments.length > 0) && !disabled && !isUploading

  return (
    <div className="absolute bottom-6 md:bottom-10 left-0 right-0 px-4 flex justify-center z-20 pointer-events-none">
      <div className="w-full max-w-3xl bg-white dark:bg-[var(--color-card-dark)] rounded-3xl shadow-float border border-slate-200/50 dark:border-slate-700/50 p-2 md:p-3 relative backdrop-blur-xl pointer-events-auto">

        {/* Attachment preview */}
        {attachments.length > 0 && (
          <div className="px-4 pt-2">
            <FilePreview files={attachments} onRemove={handleRemoveAttachment} />
          </div>
        )}

        <div className="relative flex flex-col">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.txt,.md,.json,.doc,.docx"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-light text-base md:text-lg max-h-32 outline-none"
            placeholder="输入链接或询问任何事情..."
            rows={1}
            disabled={disabled}
            style={{ minHeight: '52px' }}
          />

          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <div className="flex items-center gap-1 md:gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-50"
                title="添加附件"
              >
                {isUploading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-12 h-12 flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
