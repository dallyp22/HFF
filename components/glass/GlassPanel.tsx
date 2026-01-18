'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'dark' | 'teal'
  blur?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const blurStyles = {
  sm: 'backdrop-blur-sm [-webkit-backdrop-filter:blur(8px)]',
  md: 'backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)]',
  lg: 'backdrop-blur-[32px] [-webkit-backdrop-filter:blur(32px)]',
}

const variantStyles = {
  default: 'bg-white/60 dark:bg-gray-900/60 border-white/20 dark:border-white/10',
  dark: 'bg-gray-900/80 border-white/10 text-white',
  teal: 'bg-[var(--hff-teal)]/90 border-[var(--hff-teal)]/50 text-white',
}

export function GlassPanel({
  children,
  className,
  variant = 'default',
  blur = 'md',
  animate = false,
}: GlassPanelProps) {
  const Component = animate ? motion.div : 'div'
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
      }
    : {}

  return (
    <Component
      className={cn(
        'rounded-xl border shadow-lg',
        blurStyles[blur],
        variantStyles[variant],
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  )
}

// Glass overlay for modals and dialogs
interface GlassOverlayProps {
  className?: string
  onClick?: () => void
}

export function GlassOverlay({ className, onClick }: GlassOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'fixed inset-0 z-50',
        'bg-black/20 backdrop-blur-sm',
        className
      )}
    />
  )
}

// Glass button variant
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'teal' | 'white'
  size?: 'sm' | 'md' | 'lg'
}

const buttonVariants = {
  default: [
    'bg-white/20 hover:bg-white/30 border-white/30',
    'text-gray-800 dark:text-white',
  ],
  teal: [
    'bg-[var(--hff-teal)]/20 hover:bg-[var(--hff-teal)]/30',
    'border-[var(--hff-teal)]/30 text-[var(--hff-teal)]',
  ],
  white: [
    'bg-white/80 hover:bg-white/90 border-white/50',
    'text-gray-900',
  ],
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function GlassButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-xl border font-medium',
        'backdrop-blur-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Glass input wrapper
interface GlassInputWrapperProps {
  children: ReactNode
  className?: string
}

export function GlassInputWrapper({ children, className }: GlassInputWrapperProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white/50 dark:bg-white/5',
        'border-gray-200/50 dark:border-white/10',
        'backdrop-blur-sm transition-all duration-200',
        'focus-within:border-[var(--hff-teal)] focus-within:ring-2 focus-within:ring-[var(--hff-teal)]/20',
        className
      )}
    >
      {children}
    </div>
  )
}
