'use client'

import { useRef, useState, MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  glowOnHover?: boolean
  tiltOnHover?: boolean
  onClick?: () => void
}

export function AnimatedCard({
  children,
  className,
  hoverScale = 1.02,
  glowOnHover = true,
  tiltOnHover = false,
  onClick,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !tiltOnHover) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const tiltX = (y - centerY) / 20
    const tiltY = (centerX - x) / 20

    setTilt({ x: tiltX, y: tiltY })
    setMousePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/50 bg-card',
        'transition-all duration-300 ease-out',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? hoverScale : 1})`,
        boxShadow: isHovered
          ? '0 20px 40px -12px rgba(0,0,0,0.1), 0 8px 20px -8px rgba(0,0,0,0.08)'
          : '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Glow effect overlay */}
      {glowOnHover && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, oklch(0.65 0.18 35 / 0.08), transparent 40%)`,
          }}
        />
      )}

      {/* Shine effect */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.5 : 0,
          background: `linear-gradient(105deg, transparent 40%, oklch(1 0 0 / 0.1) 45%, oklch(1 0 0 / 0.2) 50%, oklch(1 0 0 / 0.1) 55%, transparent 60%)`,
          transform: `translateX(${isHovered ? '100%' : '-100%'})`,
          transition: 'transform 0.6s ease-out, opacity 0.3s ease-out',
        }}
      />

      {children}
    </div>
  )
}
