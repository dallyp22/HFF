'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ErrorStateProps {
  title?: string
  description?: string
  error?: Error | string
  onRetry?: () => void
  showHomeLink?: boolean
  showBackLink?: boolean
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  showHomeLink = true,
  showBackLink = false,
  className,
}: ErrorStateProps) {
  const errorMessage = error instanceof Error ? error.message : error

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
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-6"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-red-500/10 rounded-full blur-2xl scale-150" />

        {/* Icon circle */}
        <div
          className={cn(
            'relative w-20 h-20 rounded-2xl flex items-center justify-center',
            'bg-gradient-to-br from-red-50 to-red-100',
            'border border-red-200'
          )}
        >
          <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
          {description}
        </p>

        {/* Error details (collapsible in production) */}
        {errorMessage && process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Technical details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-red-600 dark:text-red-400 overflow-auto">
              {errorMessage}
            </pre>
          </details>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center gap-3 mt-6"
      >
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {showBackLink && (
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        )}
        {showHomeLink && (
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}

// 404 Not Found state
export function NotFoundState({
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or has been moved.",
}: {
  title?: string
  description?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center py-20 px-6"
    >
      {/* Large 404 */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-6"
      >
        <span className="text-8xl font-bold text-gray-100 dark:text-gray-800">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-gradient-teal bg-clip-text text-transparent bg-gradient-to-r from-[var(--hff-teal)] to-[var(--hff-teal-600)]">
            404
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 mt-8"
      >
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        <Button asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}

// Access Denied state
export function AccessDeniedState() {
  return (
    <ErrorState
      title="Access Denied"
      description="You don't have permission to view this page. Please contact support if you believe this is an error."
      showHomeLink
      showBackLink
    />
  )
}
