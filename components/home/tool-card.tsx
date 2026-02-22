'use client'

import { useRef, useState, MouseEvent } from 'react'
import Link from 'next/link'
import type { Tool } from '@prisma/client'

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setMousePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    })

    setTilt({
      x: (y - centerY) / 15,
      y: (centerX - x) / 15,
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <Link
      ref={cardRef}
      href={`/tool/${tool.id}`}
      className="group relative block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          boxShadow: isHovered
            ? '0 20px 40px -12px rgba(0,0,0,0.12), 0 8px 20px -8px rgba(0,0,0,0.08)'
            : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Glow effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, oklch(0.65 0.18 35 / 0.12), transparent 40%)`,
          }}
        />

        {/* Shine effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            opacity: isHovered ? 0.6 : 0,
            background: `linear-gradient(105deg, transparent 40%, oklch(1 0 0 / 0.1) 45%, oklch(1 0 0 / 0.15) 50%, oklch(1 0 0 / 0.1) 55%, transparent 60%)`,
            transform: `translateX(${isHovered ? '150%' : '-150%'})`,
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-3xl transition-transform duration-300 group-hover:scale-110">
            {tool.icon || '🤖'}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors group-hover:text-primary">
            {tool.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {tool.description}
          </p>

          {/* Action hint */}
          <div className="flex items-center text-sm font-medium text-primary opacity-0 transform translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            开始对话
            <svg
              className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>

        {/* Border glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-primary/0 transition-all duration-300"
          style={{
            borderColor: isHovered ? 'oklch(0.65 0.18 35 / 0.3)' : 'transparent',
          }}
        />
      </div>
    </Link>
  )
}
