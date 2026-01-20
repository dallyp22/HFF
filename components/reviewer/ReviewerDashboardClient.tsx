'use client'

import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  ArrowRight,
  Calendar,
  BarChart3,
  Shield,
  ChevronRight,
  Sparkles,
  Eye,
  XCircle,
} from 'lucide-react'

interface ReviewerDashboardClientProps {
  user: {
    firstName: string
  }
  activeCycle: {
    cycle: string
    year: number
    loiDeadline?: Date | null
    applicationDeadline?: Date | null
  } | null
  stats: {
    total: number
    submitted: number
    underReview: number
    infoRequested: number
    approved: number
    declined: number
  }
  totalRequested: number
  totalApproved: number
  organizationCount: number
  needsAttention: Array<{
    id: string
    projectTitle: string | null
    status: string
    submittedAt: string | null
    organizationName: string
    amountRequested: number | null
  }>
}

const statusConfig = {
  SUBMITTED: { color: 'bg-blue-100 text-blue-700', icon: FileText, label: 'Submitted' },
  UNDER_REVIEW: { color: 'bg-purple-100 text-purple-700', icon: Eye, label: 'Under Review' },
  INFO_REQUESTED: { color: 'bg-amber-100 text-amber-700', icon: AlertCircle, label: 'Info Requested' },
  APPROVED: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Approved' },
  DECLINED: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Declined' },
}

export function ReviewerDashboardClient({
  user,
  activeCycle,
  stats,
  totalRequested,
  totalApproved,
  organizationCount,
  needsAttention,
}: ReviewerDashboardClientProps) {
  const pendingReview = stats.submitted + stats.underReview

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--hff-slate)]/10 text-[var(--hff-slate)] mb-4"
            >
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Reviewer Portal</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-[var(--hff-teal)] to-[var(--hff-slate)] bg-clip-text text-transparent">
                {user.firstName}
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              {activeCycle
                ? `${activeCycle.cycle} ${activeCycle.year} Grant Cycle`
                : 'No active grant cycle'}
            </p>
          </div>
        </FadeIn>

        {/* Quick Stats Row */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" staggerDelay={0.05}>
          <StaggerItem>
            <GlassCard hover className="p-5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <GlassBadge variant="info" size="sm">Total</GlassBadge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <AnimatedCounter value={stats.total} />
              </div>
              <p className="text-sm text-gray-500">Applications</p>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard hover className="p-5 h-full border-l-4 border-l-purple-500">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <GlassBadge variant="warning" size="sm">Pending</GlassBadge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <AnimatedCounter value={pendingReview} />
              </div>
              <p className="text-sm text-gray-500">Need Review</p>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard hover className="p-5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <GlassBadge variant="warning" size="sm">Action</GlassBadge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <AnimatedCounter value={stats.infoRequested} />
              </div>
              <p className="text-sm text-gray-500">Info Requested</p>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard hover className="p-5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <GlassBadge variant="success" size="sm">Done</GlassBadge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <AnimatedCounter value={stats.approved + stats.declined} />
              </div>
              <p className="text-sm text-gray-500">Decided</p>
            </GlassCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Financial Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <FadeIn delay={0.15} className="md:col-span-2">
            <GlassCard variant="teal" className="p-6 h-full overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                <DollarSign className="w-full h-full" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-[var(--hff-teal)]" />
                  <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Requested</p>
                    <p className="text-3xl font-bold text-[var(--hff-teal)]">
                      ${totalRequested.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      from {stats.total} applications
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Approved</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${totalApproved.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.approved} grants awarded
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Approval Progress</span>
                    <span className="font-medium text-[var(--hff-teal)]">
                      {stats.total > 0
                        ? Math.round(((stats.approved + stats.declined) / stats.total) * 100)
                        : 0}
                      % Complete
                    </span>
                  </div>
                  <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(to right, var(--hff-teal), var(--hff-sage))',
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${stats.total > 0 ? ((stats.approved + stats.declined) / stats.total) * 100 : 0}%`,
                      }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          <FadeIn delay={0.2}>
            <GlassCard className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-[var(--hff-slate)]" />
                <h3 className="text-lg font-semibold text-gray-900">Organizations</h3>
              </div>

              <div className="text-center py-4">
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  <AnimatedCounter value={organizationCount} />
                </p>
                <p className="text-sm text-gray-500">Registered Organizations</p>
              </div>

              <Button variant="outline" asChild className="w-full mt-4">
                <Link href="/reviewer/organizations">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </GlassCard>
          </FadeIn>
        </div>

        {/* Needs Attention */}
        <FadeIn delay={0.25}>
          <GlassCard variant="elevated" className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Needs Attention</h3>
                  <p className="text-sm text-gray-500">Applications waiting longest for review</p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/reviewer/applications?status=SUBMITTED">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {needsAttention.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600 font-medium">All caught up!</p>
                <p className="text-sm text-gray-500">No applications pending review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {needsAttention.map((app, index) => {
                  const config = statusConfig[app.status as keyof typeof statusConfig]
                  const Icon = config?.icon || FileText

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Link
                        href={`/reviewer/applications/${app.id}`}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[var(--hff-teal)]/20 hover:bg-gray-50/50 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              config?.color.split(' ')[0] || 'bg-gray-100'
                            )}
                          >
                            <Icon
                              className={cn(
                                'w-5 h-5',
                                config?.color.split(' ')[1] || 'text-gray-600'
                              )}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 group-hover:text-[var(--hff-teal)] transition-colors">
                              {app.organizationName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {app.projectTitle || 'Untitled'} •{' '}
                              {app.submittedAt &&
                                formatDistanceToNow(new Date(app.submittedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {app.amountRequested && (
                            <span className="text-sm font-medium text-gray-700">
                              ${app.amountRequested.toLocaleString()}
                            </span>
                          )}
                          <span
                            className={cn(
                              'px-3 py-1 rounded-full text-xs font-medium',
                              config?.color || 'bg-gray-100 text-gray-700'
                            )}
                          >
                            {config?.label || app.status.replace(/_/g, ' ')}
                          </span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-teal)] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={0.3}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        </FadeIn>
        <StaggerContainer className="grid md:grid-cols-3 gap-4" staggerDelay={0.05}>
          <StaggerItem>
            <Link href="/reviewer/applications" className="block group">
              <GlassCard hover className="p-6 transition-all duration-300 group-hover:border-[var(--hff-teal)]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--hff-teal)] to-[var(--hff-teal-800)] flex items-center justify-center shadow-lg shadow-[var(--hff-teal)]/20 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[var(--hff-teal)] transition-colors">
                      All Applications
                    </h3>
                    <p className="text-sm text-gray-500">Review and manage applications</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-teal)] group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link href="/reviewer/organizations" className="block group">
              <GlassCard hover className="p-6 transition-all duration-300 group-hover:border-[var(--hff-slate)]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--hff-slate)] to-gray-700 flex items-center justify-center shadow-lg shadow-[var(--hff-slate)]/20 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[var(--hff-slate)] transition-colors">
                      Organizations
                    </h3>
                    <p className="text-sm text-gray-500">View organization profiles</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-slate)] group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link href="/reviewer/admin" className="block group">
              <GlassCard hover className="p-6 transition-all duration-300 group-hover:border-[var(--hff-gold)]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--hff-gold)] to-amber-600 flex items-center justify-center shadow-lg shadow-[var(--hff-gold)]/20 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[var(--hff-gold)] transition-colors">
                      Admin Settings
                    </h3>
                    <p className="text-sm text-gray-500">Manage cycles and users</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-gold)] group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </div>
  )
}
