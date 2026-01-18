'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { FileText, FolderOpen, Search, Inbox, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type EmptyStateVariant = 'applications' | 'documents' | 'search' | 'inbox' | 'generic'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  icon?: ReactNode
}

const variantConfig: Record<
  EmptyStateVariant,
  { icon: typeof FileText; defaultTitle: string; defaultDescription: string }
> = {
  applications: {
    icon: FileText,
    defaultTitle: 'No applications yet',
    defaultDescription: 'Start your first grant application to begin the process.',
  },
  documents: {
    icon: FolderOpen,
    defaultTitle: 'No documents uploaded',
    defaultDescription: 'Upload your organization documents to include them in applications.',
  },
  search: {
    icon: Search,
    defaultTitle: 'No results found',
    defaultDescription: 'Try adjusting your search or filter criteria.',
  },
  inbox: {
    icon: Inbox,
    defaultTitle: 'All caught up',
    defaultDescription: 'You have no pending notifications or tasks.',
  },
  generic: {
    icon: FolderOpen,
    defaultTitle: 'Nothing here yet',
    defaultDescription: 'This section is empty.',
  },
}

export function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  secondaryAction,
  className,
  icon: customIcon,
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-6"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-[var(--hff-teal)]/10 rounded-full blur-2xl scale-150" />

        {/* Icon circle */}
        <div
          className={cn(
            'relative w-20 h-20 rounded-2xl flex items-center justify-center',
            'bg-gradient-to-br from-[var(--hff-teal-50)] to-[var(--hff-teal-100)]',
            'border border-[var(--hff-teal)]/10'
          )}
        >
          {customIcon || (
            <Icon className="w-10 h-10 text-[var(--hff-teal)]" strokeWidth={1.5} />
          )}
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-sm"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title || config.defaultTitle}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          {description || config.defaultDescription}
        </p>
      </motion.div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-3 mt-6"
        >
          {action && (
            action.href ? (
              <Button asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]">
                <Link href={action.href}>
                  <Plus className="w-4 h-4 mr-1" />
                  {action.label}
                </Link>
              </Button>
            ) : (
              <Button
                onClick={action.onClick}
                className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]"
              >
                <Plus className="w-4 h-4 mr-1" />
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

// Specific empty states for common scenarios
export function EmptyApplications() {
  return (
    <EmptyState
      variant="applications"
      action={{ label: 'New Application', href: '/applications/new' }}
      secondaryAction={{ label: 'View Eligibility', href: '/eligibility' }}
    />
  )
}

export function EmptyDocuments() {
  return (
    <EmptyState
      variant="documents"
      action={{ label: 'Upload Documents', href: '/documents/upload' }}
      icon={<Upload className="w-10 h-10 text-[var(--hff-teal)]" strokeWidth={1.5} />}
    />
  )
}

export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={
        query
          ? `No results match "${query}". Try different keywords or remove filters.`
          : 'Try adjusting your search or filter criteria.'
      }
    />
  )
}
