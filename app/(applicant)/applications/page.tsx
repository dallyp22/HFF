'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  Plus,
  FileText,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List,
  Trash2,
} from 'lucide-react'

interface Application {
  id: string
  projectTitle: string
  status: string
  grantCycle: string
  cycleYear: number
  amountRequested: number | null
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  lastSavedAt: string | null
}

interface Organization {
  id: string
  legalName: string
  profileComplete: boolean
  applications: Application[]
}

const statusConfig = {
  DRAFT: {
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: FileText,
    label: 'Draft',
    description: 'In progress',
  },
  SUBMITTED: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Send,
    label: 'Submitted',
    description: 'Awaiting review',
  },
  UNDER_REVIEW: {
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Clock,
    label: 'Under Review',
    description: 'Being evaluated',
  },
  INFO_REQUESTED: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: AlertCircle,
    label: 'Info Requested',
    description: 'Action needed',
  },
  APPROVED: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle2,
    label: 'Approved',
    description: 'Grant awarded',
  },
  DECLINED: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Declined',
    description: 'Not selected',
  },
  WITHDRAWN: {
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: FileText,
    label: 'Withdrawn',
    description: 'Application withdrawn',
  },
}

type ViewMode = 'grid' | 'list'
type FilterStatus = 'all' | 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'INFO_REQUESTED' | 'APPROVED' | 'DECLINED'

export default function ApplicationsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/organizations')
        if (response.ok) {
          const org = await response.json()
          if (org && org.id) {
            // Fetch applications
            const appsResponse = await fetch('/api/applications')
            if (appsResponse.ok) {
              const apps = await appsResponse.json()
              setOrganization({ ...org, applications: apps })
            } else {
              setOrganization({ ...org, applications: [] })
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const applications = organization?.applications || []

  // Filter applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch =
      !searchQuery ||
      app.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${app.grantCycle} ${app.cycleYear}`.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Count by status
  const statusCounts = {
    all: applications.length,
    DRAFT: applications.filter((a) => a.status === 'DRAFT').length,
    SUBMITTED: applications.filter((a) => a.status === 'SUBMITTED').length,
    UNDER_REVIEW: applications.filter((a) => a.status === 'UNDER_REVIEW').length,
    INFO_REQUESTED: applications.filter((a) => a.status === 'INFO_REQUESTED').length,
    APPROVED: applications.filter((a) => a.status === 'APPROVED').length,
    DECLINED: applications.filter((a) => a.status === 'DECLINED').length,
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-1/4" />
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] mb-3"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Applications</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">Manage and track your grant applications</p>
            </div>
            {organization?.profileComplete && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  asChild
                  className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] shadow-lg shadow-[var(--hff-teal)]/20"
                >
                  <Link href="/applications/new">
                    <Plus className="w-4 h-4 mr-2" />
                    New Application
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        </FadeIn>

        {/* Profile Incomplete Warning */}
        <AnimatePresence>
          {organization && !organization.profileComplete && (
            <FadeIn>
              <GlassCard
                variant="elevated"
                className="mb-6 border-l-4 border-l-orange-500 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Profile Incomplete</h3>
                    <p className="text-gray-600 text-sm">
                      Complete your organization profile before creating applications.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                  >
                    <Link href="/profile/edit">Complete Profile</Link>
                  </Button>
                </div>
              </GlassCard>
            </FadeIn>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <FadeIn delay={0.1}>
          <GlassCard className="p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/20 focus:border-[var(--hff-teal)] transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {(['all', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                        filterStatus === status
                          ? 'bg-[var(--hff-teal)] text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
                      <span className="ml-1.5 opacity-70">({statusCounts[status]})</span>
                    </button>
                  )
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Applications List/Grid */}
        <AnimatePresence mode="wait">
          {filteredApplications.length === 0 ? (
            <FadeIn key="empty">
              <GlassCard className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery || filterStatus !== 'all'
                    ? 'No matching applications'
                    : 'No Applications Yet'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first grant application to get started with the HFF grant process.'}
                </p>
                {organization?.profileComplete && filterStatus === 'all' && !searchQuery && (
                  <Button
                    asChild
                    className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] shadow-lg shadow-[var(--hff-teal)]/20"
                  >
                    <Link href="/applications/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Application
                    </Link>
                  </Button>
                )}
              </GlassCard>
            </FadeIn>
          ) : viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredApplications.map((app, index) => {
                const config =
                  statusConfig[app.status as keyof typeof statusConfig] || statusConfig.DRAFT
                const Icon = config.icon

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard
                      hover
                      className="p-5 transition-all duration-300 hover:border-[var(--hff-teal)]/20"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Icon and Title */}
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                              config.color.split(' ')[0]
                            )}
                          >
                            <Icon className={cn('w-6 h-6', config.color.split(' ')[1])} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {app.projectTitle || 'Untitled Application'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {app.grantCycle} {app.cycleYear}
                              </span>
                              {app.amountRequested && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5" />$
                                  {app.amountRequested.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status and Meta */}
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="text-right hidden md:block">
                            <p className="text-xs text-gray-500">
                              {app.submittedAt
                                ? `Submitted ${format(new Date(app.submittedAt), 'MMM d, yyyy')}`
                                : app.lastSavedAt
                                  ? `Last saved ${format(new Date(app.lastSavedAt), 'MMM d, h:mm a')}`
                                  : 'Not saved'}
                            </p>
                          </div>

                          <span
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap',
                              config.color
                            )}
                          >
                            {config.label}
                          </span>

                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                href={
                                  app.status === 'DRAFT'
                                    ? `/applications/${app.id}/edit`
                                    : `/applications/${app.id}`
                                }
                              >
                                {app.status === 'DRAFT' ? 'Continue' : 'View'}
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Link>
                            </Button>
                            {app.status === 'DRAFT' && (
                              <Button variant="ghost" size="sm" className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.map((app) => {
                  const config =
                    statusConfig[app.status as keyof typeof statusConfig] || statusConfig.DRAFT
                  const Icon = config.icon

                  return (
                    <StaggerItem key={app.id}>
                      <Link
                        href={
                          app.status === 'DRAFT'
                            ? `/applications/${app.id}/edit`
                            : `/applications/${app.id}`
                        }
                        className="block group"
                      >
                        <GlassCard
                          hover
                          className="p-5 h-full transition-all duration-300 group-hover:border-[var(--hff-teal)]/30"
                        >
                          {/* Status Badge */}
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center',
                                config.color.split(' ')[0]
                              )}
                            >
                              <Icon className={cn('w-5 h-5', config.color.split(' ')[1])} />
                            </div>
                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-full text-xs font-medium border',
                                config.color
                              )}
                            >
                              {config.label}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[var(--hff-teal)] transition-colors line-clamp-2">
                            {app.projectTitle || 'Untitled Application'}
                          </h3>

                          {/* Meta */}
                          <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {app.grantCycle} {app.cycleYear}
                              </span>
                            </div>
                            {app.amountRequested && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>${app.amountRequested.toLocaleString()} requested</span>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {app.submittedAt
                                ? format(new Date(app.submittedAt), 'MMM d, yyyy')
                                : 'Draft'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--hff-teal)] group-hover:translate-x-1 transition-all" />
                          </div>
                        </GlassCard>
                      </Link>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        {applications.length > 0 && (
          <FadeIn delay={0.3}>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total',
                  value: statusCounts.all,
                  color: 'bg-gray-100 text-gray-700',
                },
                {
                  label: 'In Progress',
                  value: statusCounts.DRAFT,
                  color: 'bg-slate-100 text-slate-700',
                },
                {
                  label: 'Submitted',
                  value: statusCounts.SUBMITTED + statusCounts.UNDER_REVIEW,
                  color: 'bg-blue-100 text-blue-700',
                },
                {
                  label: 'Approved',
                  value: statusCounts.APPROVED,
                  color: 'bg-green-100 text-green-700',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={cn('rounded-xl p-4 text-center', stat.color)}
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
