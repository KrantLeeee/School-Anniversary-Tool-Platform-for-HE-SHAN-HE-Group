'use client'

import { useState } from 'react'
import { ImageLightbox } from '@/components/ui/image-lightbox'

interface AttachmentData {
  cozeFileId: string
  name: string
  type: string
  size?: number
  url?: string
}

interface AttachmentDisplayProps {
  attachments: string | null | undefined
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function isImage(type: string): boolean {
  return type.startsWith('image/')
}

function getFileIcon(type: string): string {
  if (type.includes('pdf')) return '📄'
  if (type.includes('doc')) return '📝'
  if (type.includes('image')) return '🖼️'
  return '📁'
}

export function AttachmentDisplay({ attachments }: AttachmentDisplayProps) {
  const [previewImage, setPreviewImage] = useState<{ src: string, alt: string } | null>(null)

  if (!attachments) return null

  let parsed: AttachmentData[]
  try {
    parsed = JSON.parse(attachments)
  } catch {
    return null
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        {parsed.map((attachment, index) => {
          const isImg = isImage(attachment.type)
          return (
            <div
              key={attachment.cozeFileId || index}
              onClick={() => {
                if (isImg && attachment.url) {
                  setPreviewImage({ src: attachment.url, alt: attachment.name })
                }
              }}
              className={`flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs border border-white/20 ${isImg && attachment.url ? 'cursor-zoom-in hover:bg-white/30 transition-colors' : ''}`}
            >
              <span className="text-base">{getFileIcon(attachment.type)}</span>
              <span className="max-w-[120px] truncate font-medium">{attachment.name}</span>
              {attachment.size && (
                <span className="opacity-70">
                  {formatFileSize(attachment.size)}
                </span>
              )}
              {/* Minimal thumbnail preview for images if URL exists */}
              {isImg && attachment.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={attachment.url} alt="thumbnail" className="w-4 h-4 rounded object-cover ml-1 opacity-80" />
              )}
            </div>
          )
        })}
      </div>

      <ImageLightbox
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imgSrc={previewImage?.src || ''}
        imgAlt={previewImage?.alt}
      />
    </>
  )
}
