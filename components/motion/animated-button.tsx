'use client'

import { useRef, MouseEvent, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface RippleEffect {
  x: number
  y: number
  id: number
}

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  ripple?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      ripple = true,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const rippleContainerRef = useRef<HTMLSpanElement>(null)

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (ripple && buttonRef.current && rippleContainerRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const rippleEl = document.createElement('span')
        const size = Math.max(rect.width, rect.height) * 2

        rippleEl.style.width = `${size}px`
        rippleEl.style.height = `${size}px`
        rippleEl.style.left = `${x - size / 2}px`
        rippleEl.style.top = `${y - size / 2}px`
        rippleEl.className = 'ripple'

        rippleContainerRef.current.appendChild(rippleEl)

        setTimeout(() => {
          rippleEl.remove()
        }, 600)
      }

      onClick?.(e)
    }

    const baseClasses = cn(
      'relative inline-flex items-center justify-center font-medium',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
      'overflow-hidden'
    )

    const variantClasses = {
      primary: cn(
        'text-primary-foreground rounded-xl',
        'bg-gradient-to-br from-primary to-primary/90',
        'hover:shadow-lg hover:shadow-primary/20',
        'hover:from-primary/90 hover:to-primary/80'
      ),
      secondary: cn(
        'bg-secondary text-secondary-foreground rounded-xl',
        'hover:bg-secondary/80'
      ),
      ghost: cn(
        'text-foreground rounded-xl',
        'hover:bg-accent'
      ),
      outline: cn(
        'border-2 border-border text-foreground rounded-xl',
        'hover:border-primary/50 hover:bg-accent/50'
      ),
    }

    const sizeClasses = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-sm',
      lg: 'h-13 px-8 text-base',
    }

    return (
      <button
        ref={(node) => {
          ;(buttonRef as any).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple container */}
        <span
          ref={rippleContainerRef}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* Loading spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* Content */}
        <span
          className={cn(
            'flex items-center gap-2',
            loading && 'opacity-0'
          )}
        >
          {children}
        </span>
      </button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'
