'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { Progress } from '@/components/ui/progress'
import {
  ClipboardList,
  FileText,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Clock,
  BarChart3,
  Calendar,
  ChevronDown,
} from 'lucide-react'

interface Cycle {
  id: string
  cycle: string
  year: number
  isActive: boolean
}

interface RecordItem {
  id: string
  status: string
  projectTitle: string | null
  organization: { legalName: string }
}

interface ReportStats {
  cycleId: string
  cycleName: string
  loi: {
    total: number
    byStatus: Record<string, number>
    records: RecordItem[]
  }
  applications: {
    total: number
    submitted: number
    byStatus: Record<string, number>
    records: RecordItem[]
  }
  dollars: {
    totalRequested: number
    totalApproved: number
  }
  uniqueOrganizations: number
  avgTimeToDecisionDays: number
  approvalRate: number
  avgGrantRequest: number
}

interface ReportsClientProps {
  cycles: Cycle[]
}

function formatDollars(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${Math.round(amount / 1_000)}k`
  }
  return `$${amount}`
}

function formatDollarsLong(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const LOI_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'DECLINED', 'WITHDRAWN'] as const
const APP_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'DECLINED', 'WITHDRAWN'] as const

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  INFO_REQUESTED: 'Info Requested',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  WITHDRAWN: 'Withdrawn',
}

const statusBadgeVariants: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error' | 'gold' | 'teal' | 'sage'> = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  INFO_REQUESTED: 'gold',
  APPROVED: 'success',
  DECLINED: 'error',
  WITHDRAWN: 'default',
}

const statusBarColors: Record<string, string> = {
  DRAFT: 'bg-gray-400',
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-purple-500',
  INFO_REQUESTED: 'bg-amber-500',
  APPROVED: 'bg-emerald-500',
  DECLINED: 'bg-red-500',
  WITHDRAWN: 'bg-gray-500',
}

export function ReportsClient({ cycles }: ReportsClientProps) {
  const defaultCycleId = cycles.find((c) => c.isActive)?.id ?? cycles[0]?.id ?? ''
  const [selectedCycleId, setSelectedCycleId] = useState(defaultCycleId)
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedStatuses, setExpandedStatuses] = useState<Set<string>>(new Set())

  const toggleStatus = (key: string) => {
    setExpandedStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const fetchStats = useCallback(async (cycleId: string) => {
    if (!cycleId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/reports?cycleId=${cycleId}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats(selectedCycleId)
  }, [selectedCycleId, fetchStats])

  const cycleName = stats?.cycleName ?? cycles.find((c) => c.id === selectedCycleId)
    ? `${cycles.find((c) => c.id === selectedCycleId)!.cycle === 'SPRING' ? 'Spring' : 'Fall'} ${cycles.find((c) => c.id === selectedCycleId)!.year}`
    : ''

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/10">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Grant Cycle Reports</h1>
                <p className="text-gray-600">Per-cycle statistics, pipelines, and outcomes</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Cycle Selector */}
        <FadeIn delay={0.05}>
          <div className="mb-8">
            <label htmlFor="cycle-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Grant Cycle
            </label>
            <div className="relative w-full max-w-xs">
              <select
                id="cycle-select"
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200/60 bg-white/80 backdrop-blur-sm px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 shadow-sm focus:border-[var(--hff-teal)] focus:ring-1 focus:ring-[var(--hff-teal)] focus:outline-none"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cycle === 'SPRING' ? 'Spring' : 'Fall'} {c.year}
                    {c.isActive ? ' (Active)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </FadeIn>

        {/* Loading Skeleton */}
        {loading && (
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200/60 bg-white/60 p-5 animate-pulse"
                >
                  <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Error */}
        {error && !loading && (
          <FadeIn>
            <GlassCard className="p-8 text-center">
              <p className="text-red-600">{error}</p>
            </GlassCard>
          </FadeIn>
        )}

        {/* Empty state */}
        {!loading && !error && stats && stats.loi.total === 0 && (
          <FadeIn>
            <GlassCard className="p-12 text-center" hover={false}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {cycleName} — No applications received yet.
              </h3>
              <p className="text-gray-500">
                Statistics will appear here once LOIs are submitted for this cycle.
              </p>
            </GlassCard>
          </FadeIn>
        )}

        {/* Stats Content */}
        {!loading && !error && stats && stats.loi.total > 0 && (
          <>
            {/* Summary Stat Cards */}
            <FadeIn delay={0.1}>
              <StaggerContainer staggerDelay={0.05}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  {/* LOIs Submitted */}
                  <StaggerItem>
                    <Link href="/reviewer/lois" className="block group/card">
                      <GlassCard
                        className="p-5 relative overflow-hidden group-hover/card:ring-1 group-hover/card:ring-[var(--hff-teal)]/30 transition-all"
                        aria-label={`LOIs submitted: ${stats.loi.total}`}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-8 -mt-8" />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                              <ClipboardList className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">LOIs Submitted</span>
                          </div>
                          <p className="text-3xl font-bold text-gray-900">
                            <AnimatedCounter value={stats.loi.total} />
                          </p>
                        </div>
                      </GlassCard>
                    </Link>
                  </StaggerItem>

                  {/* Apps Submitted */}
                  <StaggerItem>
                    <Link href={`/reviewer/applications?cycle=${cycles.find(c => c.id === selectedCycleId)?.cycle || ''}`} className="block group/card">
                      <GlassCard
                        className="p-5 relative overflow-hidden group-hover/card:ring-1 group-hover/card:ring-[var(--hff-teal)]/30 transition-all"
                        aria-label={`Applications submitted: ${stats.applications.submitted}`}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-8 -mt-8" />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Apps Submitted</span>
                          </div>
                          <p className="text-3xl font-bold text-gray-900">
                            <AnimatedCounter value={stats.applications.submitted} />
                          </p>
                        </div>
                      </GlassCard>
                    </Link>
                  </StaggerItem>

                  {/* Approved */}
                  <StaggerItem>
                    <Link href={`/reviewer/applications?status=APPROVED&cycle=${cycles.find(c => c.id === selectedCycleId)?.cycle || ''}`} className="block group/card">
                      <GlassCard
                        className="p-5 relative overflow-hidden group-hover/card:ring-1 group-hover/card:ring-[var(--hff-teal)]/30 transition-all"
                        aria-label={`Approved applications: ${stats.applications.byStatus['APPROVED'] ?? 0}`}
                      >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-8 -mt-8" />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-lg bg-emerald-100">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">Approved</span>
                          </div>
                          <p className="text-3xl font-bold text-gray-900">
                            <AnimatedCounter value={stats.applications.byStatus['APPROVED'] ?? 0} />
                          </p>
                        </div>
                      </GlassCard>
                    </Link>
                  </StaggerItem>

                  {/* Total Requested */}
                  <StaggerItem>
                    <GlassCard
                      className="p-5 relative overflow-hidden"
                      aria-label={`Total requested: ${formatDollarsLong(stats.dollars.totalRequested)}`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--hff-teal)]/10 rounded-full -mr-8 -mt-8" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-[var(--hff-teal)]/10">
                            <DollarSign className="w-5 h-5 text-[var(--hff-teal)]" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Total Requested</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatDollars(stats.dollars.totalRequested)}
                        </p>
                      </div>
                    </GlassCard>
                  </StaggerItem>

                  {/* Total Approved */}
                  <StaggerItem>
                    <GlassCard
                      className="p-5 relative overflow-hidden"
                      aria-label={`Total approved: ${formatDollarsLong(stats.dollars.totalApproved)}`}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--hff-gold)]/15 rounded-full -mr-8 -mt-8" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-[var(--hff-gold)]/15">
                            <TrendingUp className="w-5 h-5 text-[var(--hff-gold)]" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Total Approved</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                          {formatDollars(stats.dollars.totalApproved)}
                        </p>
                      </div>
                    </GlassCard>
                  </StaggerItem>
                </div>
              </StaggerContainer>
            </FadeIn>

            {/* Pipeline Section */}
            <FadeIn delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* LOI Pipeline */}
                <GlassCard className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-purple-600" />
                    LOI Pipeline
                  </h2>
                  <div className="space-y-1">
                    {LOI_STATUSES.map((status) => {
                      const count = stats.loi.byStatus[status] ?? 0
                      const pct = stats.loi.total > 0 ? Math.round((count / stats.loi.total) * 100) : 0
                      const expandKey = `loi-${status}`
                      const isExpanded = expandedStatuses.has(expandKey)
                      const records = stats.loi.records?.filter((r) => r.status === status) || []
                      return (
                        <div key={status}>
                          <button
                            type="button"
                            onClick={() => count > 0 && toggleStatus(expandKey)}
                            className={`w-full text-left -mx-2 px-2 py-1.5 rounded-lg transition-colors ${count > 0 ? 'cursor-pointer hover:bg-gray-50/50' : 'cursor-default'} ${isExpanded ? 'bg-gray-50/80' : ''}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                {count > 0 && (
                                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                )}
                                <GlassBadge variant={statusBadgeVariants[status]} size="sm">
                                  {statusLabels[status]}
                                </GlassBadge>
                              </div>
                              <span className={`text-sm font-medium ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{count}</span>
                            </div>
                            <div
                              role="progressbar"
                              aria-valuenow={count}
                              aria-valuemax={stats.loi.total}
                              className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100"
                            >
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${statusBarColors[status]}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </button>
                          {isExpanded && records.length > 0 && (
                            <div className="ml-5 mt-1 mb-2 space-y-0.5">
                              {records.map((r) => (
                                <Link
                                  key={r.id}
                                  href={`/reviewer/lois/${r.id}`}
                                  className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-[var(--hff-teal)]/5 transition-colors group"
                                >
                                  <span className="text-sm text-gray-700 group-hover:text-[var(--hff-teal)] truncate">{r.organization.legalName}</span>
                                  <span className="text-xs text-gray-400 truncate ml-2 max-w-[140px]">{r.projectTitle || 'Untitled'}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </GlassCard>

                {/* Application Pipeline */}
                <GlassCard className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Application Pipeline
                  </h2>
                  {stats.applications.total === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      No applications yet for this cycle.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {APP_STATUSES.map((status) => {
                        const count = stats.applications.byStatus[status] ?? 0
                        const pct = stats.applications.total > 0
                          ? Math.round((count / stats.applications.total) * 100)
                          : 0
                        const expandKey = `app-${status}`
                        const isExpanded = expandedStatuses.has(expandKey)
                        const records = stats.applications.records?.filter((r) => r.status === status) || []
                        return (
                          <div key={status}>
                            <button
                              type="button"
                              onClick={() => count > 0 && toggleStatus(expandKey)}
                              className={`w-full text-left -mx-2 px-2 py-1.5 rounded-lg transition-colors ${count > 0 ? 'cursor-pointer hover:bg-gray-50/50' : 'cursor-default'} ${isExpanded ? 'bg-gray-50/80' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  {count > 0 && (
                                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                  )}
                                  <GlassBadge variant={statusBadgeVariants[status]} size="sm">
                                    {statusLabels[status]}
                                  </GlassBadge>
                                </div>
                                <span className={`text-sm font-medium ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>{count}</span>
                              </div>
                              <div
                                role="progressbar"
                                aria-valuenow={count}
                                aria-valuemax={stats.applications.total}
                                className="relative h-2 w-full overflow-hidden rounded-full bg-gray-100"
                              >
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${statusBarColors[status]}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </button>
                            {isExpanded && records.length > 0 && (
                              <div className="ml-5 mt-1 mb-2 space-y-0.5">
                                {records.map((r) => (
                                  <Link
                                    key={r.id}
                                    href={`/reviewer/applications/${r.id}`}
                                    className="flex items-center justify-between px-3 py-1.5 rounded-md hover:bg-[var(--hff-teal)]/5 transition-colors group"
                                  >
                                    <span className="text-sm text-gray-700 group-hover:text-[var(--hff-teal)] truncate">{r.organization.legalName}</span>
                                    <span className="text-xs text-gray-400 truncate ml-2 max-w-[140px]">{r.projectTitle || 'Untitled'}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </GlassCard>
              </div>
            </FadeIn>

            {/* Key Metrics Row */}
            <FadeIn delay={0.3}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Approval Rate */}
                <GlassCard className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        <AnimatedCounter value={stats.approvalRate} suffix="%" />
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Avg Grant Request */}
                <GlassCard className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                      <DollarSign className="w-5 h-5 text-[var(--hff-teal)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Grant Request</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatDollarsLong(stats.avgGrantRequest)}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Avg Time to Decision */}
                <GlassCard className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Time to Decision</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.avgTimeToDecisionDays > 0 ? (
                          <AnimatedCounter value={stats.avgTimeToDecisionDays} suffix=" days" />
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </div>
  )
}
