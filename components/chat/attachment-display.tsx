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
  mode?: 'all' | 'images' | 'files'
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

export function AttachmentDisplay({ attachments, mode = 'all' }: AttachmentDisplayProps) {
  const [previewImage, setPreviewImage] = useState<{ src: string, alt: string } | null>(null)

  if (!attachments) return null

  let parsed: AttachmentData[]
  try {
    parsed = JSON.parse(attachments)
  } catch {
    return null
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null

  const images = parsed.filter(a => isImage(a.type))
  const files = parsed.filter(a => !isImage(a.type))

  const showImages = (mode === 'all' || mode === 'images') && images.length > 0
  const showFiles = (mode === 'all' || mode === 'files') && files.length > 0

  return (
    <>
      <div className={`${showImages && showFiles ? 'space-y-3' : ''} ${mode === 'images' ? 'mb-2' : ''}`}>
        {/* Image Grid Layout */}
        {showImages && (
          <div className="flex flex-wrap gap-2 justify-end">
            {images.map((attachment, index) => (
              <div
                key={attachment.cozeFileId || index}
                onClick={() => attachment.url && setPreviewImage({ src: attachment.url, alt: attachment.name })}
                className="group relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-white/50 dark:border-slate-800/50 shadow-md cursor-zoom-in hover:scale-[1.02] transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {/* File Pill Layout */}
        {showFiles && (
          <div className="flex flex-wrap gap-2 justify-end">
            {files.map((attachment, index) => (
              <div
                key={attachment.cozeFileId || index}
                className="flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-3 py-2 text-xs border border-white/20 whitespace-nowrap"
              >
                <span className="text-base">{getFileIcon(attachment.type)}</span>
                <span className="max-w-[120px] truncate font-medium">{attachment.name}</span>
                {attachment.size && (
                  <span className="opacity-70">
                    {formatFileSize(attachment.size)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
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
