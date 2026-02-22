'use client'

interface FileAttachment {
  cozeFileId: string
  name: string
  type: string
  size: number
  previewUrl?: string
}

interface FilePreviewProps {
  files: FileAttachment[]
  onRemove?: (index: number) => void
  readonly?: boolean
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
  if (type.includes('json')) return '{ }'
  if (type.includes('text') || type.includes('txt') || type.includes('md')) return '📃'
  return '📁'
}

export function FilePreview({ files, onRemove, readonly }: FilePreviewProps) {
  if (files.length === 0) return null

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <div className="flex flex-wrap gap-3">
        {files.map((file, index) => (
          <div
            key={file.cozeFileId || index}
            className="group relative flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 transition-all duration-200 hover:shadow-md animate-fade-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {isImage(file.type) && file.previewUrl ? (
              <div className="relative h-14 w-14 rounded-lg overflow-hidden">
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 text-2xl">
                {getFileIcon(file.type)}
              </div>
            )}
            <div className="flex-1 min-w-0 max-w-[150px]">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            {!readonly && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
