'use client'

import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  Calendar,
  Building2,
  FileText,
  Settings,
  Database,
  Link as LinkIcon,
  ArrowRight,
  Shield,
  Clock,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AdminDashboardClientProps {
  stats: {
    reviewers: number
    cycles: number
    organizations: number
    applications: number
  }
  recentActivity: {
    id: string
    newStatus: string
    changedByName: string | null
    createdAt: string
    projectTitle: string | null
    organizationName: string
  }[]
}

const quickActions = [
  {
    title: 'Manage Grant Cycles',
    description: 'Create, edit, and activate grant cycles',
    href: '/reviewer/admin/cycles',
    icon: Calendar,
    color: 'bg-[var(--hff-teal)]',
  },
  {
    title: 'Manage Reviewers',
    description: 'Invite users and manage roles',
    href: '/reviewer/admin/users',
    icon: Users,
    color: 'bg-purple-600',
  },
  {
    title: 'Generate Invite Links',
    description: 'Create links for applicants to register',
    href: '/reviewer/admin/invitations',
    icon: LinkIcon,
    color: 'bg-blue-600',
  },
  {
    title: 'View Organizations',
    description: 'Browse all nonprofit profiles',
    href: '/reviewer/organizations',
    icon: Building2,
    color: 'bg-[var(--hff-sage)]',
  },
  {
    title: 'Foundation Settings',
    description: 'Configure system preferences',
    href: '/reviewer/admin/settings',
    icon: Settings,
    color: 'bg-[var(--hff-slate)]',
  },
  {
    title: 'Data Management',
    description: 'Reset sample data and manage database',
    href: '/reviewer/admin/reset',
    icon: Database,
    color: 'bg-red-600',
  },
]

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-500',
  UNDER_REVIEW: 'bg-purple-500',
  INFO_REQUESTED: 'bg-amber-500',
  APPROVED: 'bg-emerald-500',
  DECLINED: 'bg-red-500',
  WITHDRAWN: 'bg-gray-500',
}

export function AdminDashboardClient({ stats, recentActivity }: AdminDashboardClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                <Shield className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Manage grant cycles, users, and system settings</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats Grid */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <GlassCard className="p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Reviewers</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter value={stats.reviewers} />
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--hff-teal)]/10 rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-[var(--hff-teal)]/10">
                    <Calendar className="w-5 h-5 text-[var(--hff-teal)]" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Grant Cycles</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter value={stats.cycles} />
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--hff-sage)]/20 rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-[var(--hff-sage)]/20">
                    <Building2 className="w-5 h-5 text-[var(--hff-sage)]" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Organizations</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter value={stats.organizations} />
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-8 -mt-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Applications</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  <AnimatedCounter value={stats.applications} />
                </p>
              </div>
            </GlassCard>
          </div>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={0.15}>
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[var(--hff-teal)]" />
              Quick Actions
            </h2>
            <StaggerContainer staggerDelay={0.05}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <FadeIn key={action.href} delay={0.05 * index}>
                      <Link href={action.href}>
                        <GlassCard className="p-5 hover:shadow-lg transition-all group cursor-pointer h-full">
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-3 rounded-xl ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-[var(--hff-teal)] transition-colors flex items-center gap-1">
                                {action.title}
                                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    </FadeIn>
                  )
                })}
              </div>
            </StaggerContainer>
          </div>
        </FadeIn>

        {/* Recent Activity */}
        <FadeIn delay={0.25}>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--hff-teal)]" />
                Recent Activity
              </h2>
              <span className="text-sm text-gray-500">Latest status changes</span>
            </div>

            {recentActivity.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Activity className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
                <p className="text-gray-500">Status changes will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                  >
                    {/* Status Indicator */}
                    <div className="mt-1.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${statusColors[activity.newStatus] || 'bg-gray-400'}`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">
                          {activity.organizationName}
                        </span>
                        {activity.projectTitle && (
                          <>
                            {' - '}
                            <span className="text-gray-600">{activity.projectTitle}</span>
                          </>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Status changed to{' '}
                        <span className="font-medium">
                          {activity.newStatus.replace(/_/g, ' ')}
                        </span>
                        {activity.changedByName && (
                          <span className="text-gray-500"> by {activity.changedByName}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </FadeIn>
      </div>
    </div>
  )
}
