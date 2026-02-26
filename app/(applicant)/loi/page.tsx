'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  ArrowRight,
  Loader2,
  Send,
  Eye,
} from 'lucide-react'

interface LOI {
  id: string
  status: string
  projectTitle: string | null
  grantRequestAmount: string | null
  focusArea: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  organization: {
    legalName: string
  }
  cycleConfig: {
    cycle: string
    year: number
    loiDeadline: string
    fullAppDeadline: string | null
  }
  application: {
    id: string
    status: string
  } | null
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'error'; icon: any }> = {
  DRAFT: { label: 'Draft', variant: 'default', icon: FileText },
  SUBMITTED: { label: 'Submitted', variant: 'warning', icon: Send },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning', icon: Eye },
  APPROVED: { label: 'Award Consideration', variant: 'success', icon: CheckCircle2 },
  DECLINED: { label: 'No Funding Consideration', variant: 'error', icon: XCircle },
  WITHDRAWN: { label: 'Withdrawn', variant: 'default', icon: AlertCircle },
}

const focusAreaLabels: Record<string, string> = {
  HUMAN_HEALTH: 'Human Health',
  EDUCATION: 'Education',
  COMMUNITY_WELLBEING: 'Community Well-Being',
}

export default function LOIListPage() {
  const [lois, setLois] = useState<LOI[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCycle, setActiveCycle] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [loisRes, cyclesRes] = await Promise.all([
          fetch('/api/loi'),
          fetch('/api/cycles'),
        ])

        if (loisRes.ok) {
          const data = await loisRes.json()
          setLois(data)
        }

        if (cyclesRes.ok) {
          const cycles = await cyclesRes.json()
          const active = cycles.find((c: any) => c.isActive && c.acceptingLOIs)
          setActiveCycle(active)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--hff-teal)]/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--hff-teal)]" />
          </div>
          <p className="text-gray-600">Loading your Letters of Interest...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Letters of Interest
              </h1>
              <p className="text-gray-600">
                Submit an LOI to begin the grant application process
              </p>
            </div>
            {activeCycle && (
              <Link href="/loi/new">
                <Button className="rounded-xl bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] shadow-lg shadow-[var(--hff-teal)]/20">
                  <Plus className="w-4 h-4 mr-2" />
                  New LOI
                </Button>
              </Link>
            )}
          </div>
        </FadeIn>

        {/* Active Cycle Info */}
        {activeCycle && (
          <FadeIn delay={0.1}>
            <GlassCard variant="teal" className="p-5 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-[var(--hff-teal)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--hff-teal)]/70">Active Grant Cycle</p>
                    <p className="text-lg font-semibold text-[var(--hff-teal)]">
                      {activeCycle.cycle} {activeCycle.year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <p className="text-[var(--hff-teal)]/70">LOI Deadline</p>
                    <p className="font-semibold text-[var(--hff-teal)]">
                      {formatDate(activeCycle.loiDeadline)}
                    </p>
                  </div>
                  {activeCycle.fullAppDeadline && (
                    <div>
                      <p className="text-[var(--hff-teal)]/70">Full App Deadline</p>
                      <p className="font-semibold text-[var(--hff-teal)]">
                        {formatDate(activeCycle.fullAppDeadline)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {/* No Active Cycle */}
        {!activeCycle && lois.length === 0 && (
          <FadeIn delay={0.1}>
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Active Grant Cycle
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                There is currently no grant cycle accepting Letters of Interest.
                Please check back later or contact the foundation for more information.
              </p>
            </GlassCard>
          </FadeIn>
        )}

        {/* LOI List */}
        {lois.length > 0 && (
          <StaggerContainer className="space-y-4">
            {lois.map((loi) => {
              const status = statusConfig[loi.status] || statusConfig.DRAFT
              const StatusIcon = status.icon

              return (
                <StaggerItem key={loi.id}>
                  <Link href={loi.status === 'DRAFT' ? `/loi/${loi.id}/edit` : `/loi/${loi.id}`}>
                    <GlassCard
                      variant="elevated"
                      className="p-5 cursor-pointer group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left side */}
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
                              loi.status === 'APPROVED'
                                ? 'bg-green-100 text-green-600'
                                : loi.status === 'DECLINED'
                                  ? 'bg-red-100 text-red-600'
                                  : loi.status === 'DRAFT'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-[var(--hff-teal)]/10 text-[var(--hff-teal)]'
                            )}
                          >
                            <StatusIcon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {loi.projectTitle || 'Untitled LOI'}
                              </h3>
                              <GlassBadge variant={status.variant} size="sm">
                                {status.label}
                              </GlassBadge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span>
                                {loi.cycleConfig.cycle} {loi.cycleConfig.year}
                              </span>
                              {loi.focusArea && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span>{focusAreaLabels[loi.focusArea]}</span>
                                </>
                              )}
                              {loi.grantRequestAmount && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {formatCurrency(loi.grantRequestAmount)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-4 md:flex-shrink-0">
                          {loi.status === 'APPROVED' && loi.application && (
                            <Link
                              href={`/applications/${loi.application.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="sm"
                                className="rounded-xl bg-green-600 hover:bg-green-700"
                              >
                                Continue to Full Application
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          )}
                          {loi.status === 'DRAFT' && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>
                                Due {formatDate(loi.cycleConfig.loiDeadline)}
                              </span>
                            </div>
                          )}
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-teal)] group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}

        {/* Empty State (has active cycle but no LOIs) */}
        {activeCycle && lois.length === 0 && (
          <FadeIn delay={0.2}>
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--hff-teal)]/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-[var(--hff-teal)]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Letters of Interest Yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Start your grant application journey by submitting a Letter of Interest
                for the {activeCycle.cycle} {activeCycle.year} cycle.
              </p>
              <Link href="/loi/new">
                <Button className="rounded-xl bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First LOI
                </Button>
              </Link>
            </GlassCard>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
