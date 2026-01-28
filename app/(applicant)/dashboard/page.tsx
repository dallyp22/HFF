'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  User,
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  TrendingUp,
  Folder,
  ChevronRight,
} from 'lucide-react'

interface Organization {
  id: string
  legalName: string
  profileComplete: boolean
  applications: Application[]
  lois: LOI[]
}

interface Application {
  id: string
  projectTitle: string
  status: string
  grantCycle: string
  cycleYear: number
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

interface LOI {
  id: string
  status: string
  projectTitle: string | null
  createdAt: string
  updatedAt: string
  submittedAt: string | null
  cycleConfig: {
    cycle: string
    year: number
    loiDeadline: string
  }
  application: {
    id: string
    status: string
  } | null
}

interface ActiveCycle {
  id: string
  cycle: string
  year: number
  loiDeadline: string
  loiOpenDate: string | null
  fullAppDeadline: string | null
  fullAppOpenDate: string | null
  acceptingLOIs: boolean
  acceptingApplications: boolean
}

interface DashboardData {
  organization: Organization | null
  profileCompletion: number
  activeCycle: ActiveCycle | null
  lois: LOI[]
}

const statusConfig = {
  DRAFT: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText, label: 'Draft' },
  SUBMITTED: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Send, label: 'Submitted' },
  UNDER_REVIEW: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Clock, label: 'Under Review' },
  INFO_REQUESTED: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle, label: 'Info Requested' },
  APPROVED: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'Approved' },
  DECLINED: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, label: 'Declined' },
  WITHDRAWN: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: FileText, label: 'Withdrawn' },
}

const loiStatusConfig = {
  DRAFT: { color: 'bg-slate-100 text-slate-700', icon: FileText, label: 'Draft' },
  SUBMITTED: { color: 'bg-amber-100 text-amber-700', icon: Send, label: 'Submitted' },
  UNDER_REVIEW: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Under Review' },
  APPROVED: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Approved' },
  DECLINED: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Declined' },
  WITHDRAWN: { color: 'bg-gray-100 text-gray-500', icon: FileText, label: 'Withdrawn' },
}

export default function DashboardPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded) {
      fetchData()
    }
  }, [isLoaded])

  const organization = data?.organization
  const profileCompletion = data?.profileCompletion ?? 0
  const applications = organization?.applications || []
  const lois = data?.lois || []
  const activeCycle = data?.activeCycle

  const stats = {
    draft: applications.filter((a) => a.status === 'DRAFT').length,
    submitted: applications.filter((a) => a.status === 'SUBMITTED').length,
    underReview: applications.filter((a) => a.status === 'UNDER_REVIEW').length,
    approved: applications.filter((a) => a.status === 'APPROVED').length,
    total: applications.length,
  }

  const loiStats = {
    draft: lois.filter((l) => l.status === 'DRAFT').length,
    submitted: lois.filter((l) => l.status === 'SUBMITTED' || l.status === 'UNDER_REVIEW').length,
    approved: lois.filter((l) => l.status === 'APPROVED').length,
    declined: lois.filter((l) => l.status === 'DECLINED').length,
    total: lois.length,
  }

  // Find current cycle LOI
  const currentCycleLOI = activeCycle
    ? lois.find((l) => l.cycleConfig.cycle === activeCycle.cycle && l.cycleConfig.year === activeCycle.year)
    : null

  // Check if user can start a new LOI for the current cycle
  const canStartNewLOI = activeCycle?.acceptingLOIs && !currentCycleLOI && organization && profileCompletion === 100

  // Check if user has an approved LOI that needs full application
  const approvedLOIsPendingApp = lois.filter((l) => l.status === 'APPROVED' && !l.application)

  if (loading || !isLoaded) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Skeleton loading */}
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3" />
            <div className="grid md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
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
        {/* Welcome Section */}
        <FadeIn>
          <div className="mb-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Applicant Portal</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Welcome back{clerkUser?.firstName ? ',' : ''}{' '}
              {clerkUser?.firstName && (
                <span className="bg-gradient-to-r from-[var(--hff-teal)] to-[var(--hff-sage)] bg-clip-text text-transparent">
                  {clerkUser.firstName}
                </span>
              )}
            </h1>
            <p className="text-lg text-gray-600">
              {organization ? organization.legalName : 'Complete your profile to start applying for grants'}
            </p>
          </div>
        </FadeIn>

        {/* Capital Requests Notice */}
        <FadeIn delay={0.05}>
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>Capital Requests:</strong> Capital Requests must go through the Foundation Director. Do not apply for a Capital Grant through this portal.
          </div>
        </FadeIn>

        {/* Profile Completion Alert */}
        <AnimatePresence>
          {!organization && (
            <FadeIn delay={0.1}>
              <GlassCard variant="elevated" className="mb-8 border-l-4 border-l-amber-500 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Get Started</h3>
                    <p className="text-gray-600">
                      Complete your organization profile to begin submitting grant applications to the
                      Heistand Family Foundation.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                  >
                    <Link href="/profile/edit">
                      Create Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            </FadeIn>
          )}

          {organization && profileCompletion < 100 && (
            <FadeIn delay={0.1}>
              <GlassCard variant="elevated" className="mb-8 border-l-4 border-l-orange-500 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {/* Progress ring */}
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200"
                      />
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-orange-500"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: '0 176' }}
                        animate={{ strokeDasharray: `${(profileCompletion / 100) * 176} 176` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-600">{profileCompletion}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Incomplete</h3>
                    <p className="text-gray-600">
                      Complete your organization profile to submit applications. You're {profileCompletion}%
                      there!
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                  >
                    <Link href="/profile/edit">
                      Complete Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            </FadeIn>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" staggerDelay={0.05}>
          <StaggerItem>
            <GlassCard hover className="p-5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <GlassBadge variant="default" size="sm">Draft</GlassBadge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <AnimatedCounter value={stats.draft} />
              </div>
              <p className="text-sm text-gray-500">In progress</p>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard hover className="p-5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <GlassBadge variant="info" size="sm">Submitted</GlassBadge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <AnimatedCounter value={stats.submitted} />
              </div>
              <p className="text-sm text-gray-500">Awaiting review</p>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard hover className="p-5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <GlassBadge variant="warning" size="sm">Review</GlassBadge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <AnimatedCounter value={stats.underReview} />
              </div>
              <p className="text-sm text-gray-500">Under review</p>
            </GlassCard>
          </StaggerItem>

          <StaggerItem>
            <GlassCard hover className="p-5 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <GlassBadge variant="success" size="sm">Approved</GlassBadge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                <AnimatedCounter value={stats.approved} />
              </div>
              <p className="text-sm text-gray-500">Grants awarded</p>
            </GlassCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Approved LOI Alert - Prompt to complete full application */}
        <AnimatePresence>
          {approvedLOIsPendingApp.length > 0 && (
            <FadeIn delay={0.15}>
              <GlassCard variant="elevated" className="mb-8 border-l-4 border-l-green-500 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">LOI Approved!</h3>
                    <p className="text-gray-600">
                      Your Letter of Interest has been approved. Complete your full grant application to continue.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                  >
                    <Link href={`/loi/${approvedLOIsPendingApp[0].id}`}>
                      Continue Application
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            </FadeIn>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {/* Grant Cycle Card */}
          <FadeIn delay={0.2} className="lg:col-span-2">
            <GlassCard variant="teal" className="p-6 h-full overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <Calendar className="w-full h-full" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[var(--hff-teal)]" />
                  <h3 className="text-lg font-semibold text-gray-900">Current Grant Cycle</h3>
                </div>

                {activeCycle ? (
                  <div className="flex flex-col md:flex-row md:items-end gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{activeCycle.cycle} {activeCycle.year} Cycle</p>
                      <p className="text-4xl font-bold text-[var(--hff-teal)]">
                        {new Date(activeCycle.loiDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-lg text-gray-600">LOI Deadline</p>
                      {activeCycle.acceptingLOIs && (
                        <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          Accepting LOIs
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      {currentCycleLOI ? (
                        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Your LOI Status</span>
                            <span className={cn(
                              'px-2.5 py-0.5 rounded-full text-xs font-medium',
                              loiStatusConfig[currentCycleLOI.status as keyof typeof loiStatusConfig]?.color || 'bg-gray-100 text-gray-700'
                            )}>
                              {loiStatusConfig[currentCycleLOI.status as keyof typeof loiStatusConfig]?.label || currentCycleLOI.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 truncate">
                            {currentCycleLOI.projectTitle || 'Untitled Letter of Interest'}
                          </p>
                          <Button size="sm" variant="outline" asChild className="w-full">
                            <Link href={currentCycleLOI.status === 'DRAFT' ? `/loi/${currentCycleLOI.id}/edit` : `/loi/${currentCycleLOI.id}`}>
                              {currentCycleLOI.status === 'DRAFT' ? 'Continue Editing' : 'View Details'}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      ) : canStartNewLOI ? (
                        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-sm text-gray-600 mb-3">
                            Submit a Letter of Interest to be considered for this grant cycle.
                          </p>
                          <Button asChild className="w-full bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]">
                            <Link href="/loi/new">
                              Start LOI
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
                          <p className="text-sm text-gray-500">
                            {!organization ? 'Complete your organization profile to submit an LOI.' :
                             profileCompletion < 100 ? 'Complete your profile to submit an LOI.' :
                             !activeCycle.acceptingLOIs ? 'LOI submissions are currently closed.' :
                             'You have already submitted an LOI for this cycle.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No active grant cycle at this time.</p>
                    <p className="text-sm text-gray-400 mt-1">Check back soon for upcoming cycles.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Quick Stats */}
          <FadeIn delay={0.3}>
            <GlassCard className="p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[var(--hff-teal)]" />
                <h3 className="text-lg font-semibold text-gray-900">Your Activity</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--hff-teal)]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[var(--hff-teal)]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Total Applications</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.total}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--hff-sage)]/20 flex items-center justify-center">
                      <Folder className="w-4 h-4 text-[var(--hff-sage)]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Documents</span>
                  </div>
                  <Link href="/documents" className="text-[var(--hff-teal)] hover:underline text-sm">
                    Manage →
                  </Link>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--hff-gold)]/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-[var(--hff-gold)]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Profile</span>
                  </div>
                  <GlassBadge variant={profileCompletion === 100 ? 'success' : 'warning'} size="sm">
                    {profileCompletion}%
                  </GlassBadge>
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        </div>

        {/* Quick Actions */}
        <FadeIn delay={0.25}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        </FadeIn>
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10" staggerDelay={0.05}>
          <StaggerItem>
            <Link href="/loi" className="block group">
              <GlassCard hover className="p-6 transition-all duration-300 group-hover:border-[var(--hff-teal)]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--hff-teal)] to-[var(--hff-teal-800)] flex items-center justify-center shadow-lg shadow-[var(--hff-teal)]/20 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[var(--hff-teal)] transition-colors">
                      Letters of Interest
                    </h3>
                    <p className="text-sm text-gray-500">View and manage LOIs</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-teal)] group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link href="/applications" className="block group">
              <GlassCard hover className="p-6 transition-all duration-300 group-hover:border-[var(--hff-sage)]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--hff-sage)] to-emerald-600 flex items-center justify-center shadow-lg shadow-[var(--hff-sage)]/20 group-hover:scale-110 transition-transform">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[var(--hff-sage)] transition-colors">
                      Applications
                    </h3>
                    <p className="text-sm text-gray-500">View full applications</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-sage)] group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link href="/documents" className="block group">
              <GlassCard hover className="p-6 transition-all duration-300 group-hover:border-purple-400/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      Documents
                    </h3>
                    <p className="text-sm text-gray-500">Manage your files</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link href="/profile" className="block group">
              <GlassCard hover className="p-6 transition-all duration-300 group-hover:border-[var(--hff-gold)]/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--hff-gold)] to-amber-600 flex items-center justify-center shadow-lg shadow-[var(--hff-gold)]/20 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[var(--hff-gold)] transition-colors">
                      Profile
                    </h3>
                    <p className="text-sm text-gray-500">Organization details</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-gold)] group-hover:translate-x-1 transition-all" />
                </div>
              </GlassCard>
            </Link>
          </StaggerItem>
        </StaggerContainer>

        {/* Recent Activity */}
        {applications.length > 0 && (
          <FadeIn delay={0.3}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
              <Link
                href="/applications"
                className="text-sm text-[var(--hff-teal)] hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <GlassCard className="overflow-hidden">
              <div className="divide-y divide-gray-100">
                {applications.slice(0, 5).map((app, index) => {
                  const config = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.DRAFT
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            config.color.split(' ')[0]
                          )}
                        >
                          <Icon className={cn('w-5 h-5', config.color.split(' ')[1])} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {app.projectTitle || 'Untitled Application'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {app.grantCycle} {app.cycleYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-medium border',
                            config.color
                          )}
                        >
                          {config.label}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={app.status === 'DRAFT' ? `/applications/${app.id}/edit` : `/applications/${app.id}`}>
                            {app.status === 'DRAFT' ? 'Continue' : 'View'}
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {/* Empty state for no applications */}
        {organization && applications.length === 0 && (
          <FadeIn delay={0.3}>
            <GlassCard className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--hff-teal)]/10 flex items-center justify-center">
                <FileText className="w-10 h-10 text-[var(--hff-teal)]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start your first grant application to begin the process of receiving funding from the
                Heistand Family Foundation.
              </p>
              <Button
                asChild
                className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] shadow-lg shadow-[var(--hff-teal)]/20"
              >
                <Link href="/applications/new">
                  <FileText className="w-4 h-4 mr-2" />
                  Create Your First Application
                </Link>
              </Button>
            </GlassCard>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
