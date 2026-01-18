import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200/80 dark:bg-gray-700/50',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent',
        'before:animate-[shimmer_2s_infinite]',
        className
      )}
    />
  )
}

interface SkeletonCardProps {
  className?: string
  lines?: number
  showAvatar?: boolean
  showImage?: boolean
}

export function SkeletonCard({
  className,
  lines = 3,
  showAvatar = false,
  showImage = false,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white/70 dark:bg-gray-800/50 p-6',
        'backdrop-blur-[20px] border-white/25',
        className
      )}
    >
      {showImage && (
        <Skeleton className="h-40 w-full rounded-xl mb-4" />
      )}

      <div className="flex items-start gap-4">
        {showAvatar && (
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        )}

        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />

          <div className="space-y-2 pt-2">
            {Array.from({ length: lines }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-3"
                style={{ width: `${100 - i * 15}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for stat cards
export function SkeletonStatCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white/70 dark:bg-gray-800/50 p-6',
        'backdrop-blur-[20px] border-white/25',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  )
}

// Skeleton for table rows
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-100 dark:border-gray-800">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 flex-1"
          style={{ maxWidth: i === 0 ? '200px' : '150px' }}
        />
      ))}
    </div>
  )
}

// Skeleton for list items
export function SkeletonListItem({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl',
        'bg-white/50 dark:bg-gray-800/30',
        className
      )}
    >
      <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  )
}

// Skeleton for application cards
export function SkeletonApplicationCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-white/70 dark:bg-gray-800/50 p-6',
        'backdrop-blur-[20px] border-white/25',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="space-y-2 mb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  )
}

// Full page loading skeleton
export function SkeletonPage() {
  return (
    <div className="space-y-8 p-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard lines={5} showImage />
        </div>
        <div className="space-y-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={2} showAvatar />
        </div>
      </div>
    </div>
  )
}
