'use client'

import { useEffect, useRef, useState, Children, cloneElement, isValidElement } from 'react'
import { cn } from '@/lib/utils'

interface StaggerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  initialDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  duration?: number
  once?: boolean
}

export function Stagger({
  children,
  className,
  staggerDelay = 100,
  initialDelay = 0,
  direction = 'up',
  distance = 20,
  duration = 500,
  once = true,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [once])

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`
      case 'down':
        return `translateY(-${distance}px)`
      case 'left':
        return `translateX(${distance}px)`
      case 'right':
        return `translateX(-${distance}px)`
      default:
        return 'none'
    }
  }

  return (
    <div ref={ref} className={cn(className)}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child

        const delay = initialDelay + index * staggerDelay

        return (
          <div
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0) translateX(0)' : getInitialTransform(),
              transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
              transitionDelay: `${delay}ms`,
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}
