'use client'

import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode, forwardRef } from 'react'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'teal' | 'subtle'
  glow?: boolean
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantStyles = {
  default: [
    'bg-[var(--glass-bg)] border-[var(--glass-border)]',
    'shadow-[var(--glass-shadow)]',
  ],
  elevated: [
    'bg-white/80 dark:bg-[rgba(32,70,82,0.4)] border-[var(--glass-border-strong)]',
    'shadow-[var(--glass-shadow-lg)]',
  ],
  teal: [
    'bg-[var(--glass-bg-teal)] border-[rgba(32,70,82,0.15)]',
    'shadow-[0_8px_32px_rgba(32,70,82,0.1)]',
  ],
  subtle: [
    'bg-[var(--glass-bg-subtle)] border-[var(--glass-border)]',
    'shadow-[0_4px_16px_rgba(32,70,82,0.06)]',
  ],
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      glow = false,
      hover = true,
      padding = 'md',
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          // Base glass styles
          'relative rounded-2xl border',
          'backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]',
          'transition-shadow duration-300',

          // Variant styles
          variantStyles[variant],

          // Padding
          paddingStyles[padding],

          // Hover shadow
          hover && 'hover:shadow-[var(--glass-shadow-lg)]',

          // Glow effect
          glow && [
            'before:absolute before:inset-0 before:-z-10',
            'before:rounded-2xl before:blur-xl',
            'before:bg-[rgba(32,70,82,0.12)]',
          ],

          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

// Subcomponents for consistent structure
interface GlassCardSectionProps {
  children: ReactNode
  className?: string
}

export function GlassCardHeader({ children, className }: GlassCardSectionProps) {
  return (
    <div className={cn('pb-4', className)}>
      {children}
    </div>
  )
}

export function GlassCardTitle({ children, className }: GlassCardSectionProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  )
}

export function GlassCardDescription({ children, className }: GlassCardSectionProps) {
  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}>
      {children}
    </p>
  )
}

export function GlassCardContent({ children, className }: GlassCardSectionProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  )
}

export function GlassCardFooter({ children, className }: GlassCardSectionProps) {
  return (
    <div className={cn('pt-4 border-t border-white/10 mt-4', className)}>
      {children}
    </div>
  )
}

// Static version without motion for server components
interface StaticGlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'teal' | 'subtle'
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function StaticGlassCard({
  children,
  className,
  variant = 'default',
  glow = false,
  padding = 'md',
}: StaticGlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border',
        'backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[var(--glass-shadow-lg)]',
        variantStyles[variant],
        paddingStyles[padding],
        glow && [
          'before:absolute before:inset-0 before:-z-10',
          'before:rounded-2xl before:blur-xl',
          'before:bg-[rgba(32,70,82,0.12)]',
        ],
        className
      )}
    >
      {children}
    </div>
  )
}
