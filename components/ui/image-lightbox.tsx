'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ImageLightboxProps {
    isOpen: boolean
    onClose: () => void
    imgSrc: string
    imgAlt?: string
}

export function ImageLightbox({ isOpen, onClose, imgSrc, imgAlt }: ImageLightboxProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    if (!isMounted || !isOpen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4 md:p-8 cursor-zoom-out"
            onClick={onClose}
        >
            <button
                className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                onClick={onClose}
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={imgSrc}
                alt={imgAlt || 'Preview'}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-scale-up cursor-default"
                onClick={(e) => e.stopPropagation()}
            />
        </div>,
        document.body
    )
}
