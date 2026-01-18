import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'teal' | 'gold' | 'sage'
type BadgeSize = 'sm' | 'md' | 'lg'

interface GlassBadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  pulse?: boolean
  icon?: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--hff-slate)]/10 text-[var(--hff-slate)] border-[var(--hff-slate)]/20',
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  teal: 'bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] border-[var(--hff-teal)]/20',
  gold: 'bg-[var(--hff-gold)]/15 text-amber-800 dark:text-[var(--hff-gold)] border-[var(--hff-gold)]/30',
  sage: 'bg-[var(--hff-sage)]/15 text-emerald-800 dark:text-[var(--hff-sage)] border-[var(--hff-sage)]/30',
}

const pulseColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--hff-slate)]',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  teal: 'bg-[var(--hff-teal)]',
  gold: 'bg-[var(--hff-gold)]',
  sage: 'bg-[var(--hff-sage)]',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
  lg: 'px-4 py-1.5 text-base gap-2',
}

export function GlassBadge({
  children,
  variant = 'default',
  size = 'md',
  className,
  pulse = false,
  icon,
}: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border',
        'backdrop-blur-sm font-medium',
        'transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pulseColors[variant]
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              pulseColors[variant]
            )}
          />
        </span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

// Status-specific badges for common use cases
interface StatusBadgeProps {
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'declined' | 'info_requested'
  className?: string
  showPulse?: boolean
}

const statusConfig: Record<
  StatusBadgeProps['status'],
  { label: string; variant: BadgeVariant; pulse?: boolean }
> = {
  draft: { label: 'Draft', variant: 'default' },
  submitted: { label: 'Submitted', variant: 'info', pulse: true },
  under_review: { label: 'Under Review', variant: 'warning', pulse: true },
  approved: { label: 'Approved', variant: 'success' },
  declined: { label: 'Declined', variant: 'error' },
  info_requested: { label: 'Info Requested', variant: 'gold', pulse: true },
}

export function StatusBadge({ status, className, showPulse }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <GlassBadge
      variant={config.variant}
      pulse={showPulse ?? config.pulse}
      className={className}
    >
      {config.label}
    </GlassBadge>
  )
}

// Cycle badge
interface CycleBadgeProps {
  cycle: 'spring' | 'fall'
  year: number
  className?: string
}

export function CycleBadge({ cycle, year, className }: CycleBadgeProps) {
  return (
    <GlassBadge
      variant={cycle === 'spring' ? 'sage' : 'gold'}
      className={className}
    >
      {cycle === 'spring' ? 'Spring' : 'Fall'} {year}
    </GlassBadge>
  )
}
