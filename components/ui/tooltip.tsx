'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  delayMs?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayMs = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const showTooltip = React.useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delayMs)
  }, [delayMs])

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }, [])

  React.useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      let x = 0
      let y = 0

      // Calculate position based on side
      switch (side) {
        case 'top':
          y = -tooltipRect.height - 8
          break
        case 'bottom':
          y = triggerRect.height + 8
          break
        case 'left':
          x = -tooltipRect.width - 8
          y = (triggerRect.height - tooltipRect.height) / 2
          break
        case 'right':
          x = triggerRect.width + 8
          y = (triggerRect.height - tooltipRect.height) / 2
          break
      }

      // Adjust for alignment
      if (side === 'top' || side === 'bottom') {
        switch (align) {
          case 'start':
            x = 0
            break
          case 'center':
            x = (triggerRect.width - tooltipRect.width) / 2
            break
          case 'end':
            x = triggerRect.width - tooltipRect.width
            break
        }
      }

      setPosition({ x, y })
    }
  }, [isVisible, side, align])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const animations = {
    top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
    bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
  }

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={animations[side].initial}
            animate={animations[side].animate}
            exit={animations[side].initial}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 pointer-events-none',
              'px-3 py-2 rounded-xl',
              'bg-[var(--hff-slate)]/95 backdrop-blur-md',
              'border border-white/10',
              'shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
              'text-white text-xs font-medium',
              'max-w-xs whitespace-normal',
              className
            )}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
            }}
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-2 h-2 rotate-45',
                'bg-[var(--hff-slate)]/95 border border-white/10',
                side === 'top' && 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0',
                side === 'bottom' && 'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0',
                side === 'left' && 'right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0',
                side === 'right' && 'left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple info tooltip with icon
interface InfoTooltipProps {
  content: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
  iconClassName?: string
}

export function InfoTooltip({ content, side = 'top', className, iconClassName }: InfoTooltipProps) {
  return (
    <Tooltip content={content} side={side} className={className}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center',
          'w-4 h-4 rounded-full',
          'bg-gray-200/60 hover:bg-gray-300/60',
          'text-gray-500 hover:text-gray-700',
          'transition-colors cursor-help',
          iconClassName
        )}
      >
        <svg
          className="w-2.5 h-2.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  )
}
