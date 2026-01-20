'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  ArrowRight,
  Building2,
  Calendar,
  DollarSign,
  Target,
  FileText,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'error'; icon: any; color: string }> = {
  DRAFT: { label: 'Draft', variant: 'default', icon: FileText, color: 'gray' },
  SUBMITTED: { label: 'Submitted', variant: 'warning', icon: Send, color: 'amber' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning', icon: Eye, color: 'blue' },
  APPROVED: { label: 'Approved', variant: 'success', icon: CheckCircle2, color: 'green' },
  DECLINED: { label: 'Declined', variant: 'error', icon: XCircle, color: 'red' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'default', icon: AlertCircle, color: 'gray' },
}

const focusAreaLabels: Record<string, string> = {
  HUMAN_HEALTH: 'Human Health',
  EDUCATION: 'Education',
  COMMUNITY_WELLBEING: 'Community Well-Being',
}

const expenditureLabels: Record<string, string> = {
  PROGRAMMING: 'Programming / Special Project',
  OPERATING: 'Operating Funding',
  CAPITAL: 'Capital Project',
}

export default function LOIDetailPage() {
  const router = useRouter()
  const params = useParams()
  const loiId = params.id as string

  const [loading, setLoading] = useState(true)
  const [loi, setLoi] = useState<any>(null)

  useEffect(() => {
    async function fetchLOI() {
      try {
        const response = await fetch(`/api/loi/${loiId}`)
        if (!response.ok) {
          toast.error('Letter of Interest not found')
          router.push('/loi')
          return
        }

        const data = await response.json()

        // Redirect to edit if still draft
        if (data.status === 'DRAFT') {
          router.push(`/loi/${loiId}/edit`)
          return
        }

        setLoi(data)
      } catch (error) {
        console.error('Error fetching LOI:', error)
        toast.error('Failed to load Letter of Interest')
      } finally {
        setLoading(false)
      }
    }

    fetchLOI()
  }, [loiId, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--hff-teal)]/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--hff-teal)]" />
          </div>
          <p className="text-gray-600">Loading Letter of Interest...</p>
        </motion.div>
      </div>
    )
  }

  if (!loi) return null

  const status = statusConfig[loi.status] || statusConfig.DRAFT
  const StatusIcon = status.icon

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <FadeIn>
          <Link href="/loi" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to LOIs</span>
          </Link>
        </FadeIn>

        {/* Header */}
        <FadeIn delay={0.05}>
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {loi.projectTitle || 'Untitled LOI'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{loi.organization?.legalName}</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{loi.cycleConfig?.cycle} {loi.cycleConfig?.year}</span>
                  </div>
                </div>
              </div>
              <GlassBadge variant={status.variant} size="lg" className="flex-shrink-0">
                <StatusIcon className="w-4 h-4 mr-1.5" />
                {status.label}
              </GlassBadge>
            </div>
          </div>
        </FadeIn>

        {/* Approved CTA */}
        {loi.status === 'APPROVED' && loi.application && (
          <FadeIn delay={0.1}>
            <GlassCard variant="teal" className="p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Congratulations!</p>
                    <p className="text-sm text-gray-600">
                      Your LOI has been approved. You can now complete your full grant application.
                    </p>
                  </div>
                </div>
                <Link href={`/applications/${loi.application.id}/edit`}>
                  <Button className="rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20">
                    Continue to Full Application
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {/* Declined Message */}
        {loi.status === 'DECLINED' && (
          <FadeIn delay={0.1}>
            <GlassCard className="p-5 mb-6 border-red-200 bg-red-50/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">LOI Not Approved</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Unfortunately, your Letter of Interest was not selected for this cycle.
                  </p>
                  {loi.decisionReason && (
                    <div className="mt-3 p-3 rounded-lg bg-white border border-red-100">
                      <p className="text-xs text-gray-500 mb-1">Feedback from reviewer:</p>
                      <p className="text-sm text-gray-700">{loi.decisionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {/* Under Review Status */}
        {(loi.status === 'SUBMITTED' || loi.status === 'UNDER_REVIEW') && (
          <FadeIn delay={0.1}>
            <GlassCard className="p-5 mb-6 border-amber-200 bg-amber-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {loi.status === 'UNDER_REVIEW' ? 'Under Review' : 'Submitted'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Your Letter of Interest is being reviewed. We'll notify you once a decision is made.
                  </p>
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {/* LOI Details */}
        <FadeIn delay={0.15}>
          <GlassCard variant="elevated" className="p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Letter of Interest Details
            </h2>

            <div className="space-y-6">
              {/* Key Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[var(--hff-teal)]" />
                    <p className="text-xs text-gray-500">Focus Area</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {focusAreaLabels[loi.focusArea] || '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[var(--hff-teal)]" />
                    <p className="text-xs text-gray-500">Expenditure Type</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {expenditureLabels[loi.expenditureType] || '—'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[var(--hff-teal)]" />
                    <p className="text-xs text-gray-500">Grant Request</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(loi.grantRequestAmount)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-[var(--hff-teal)]" />
                    <p className="text-xs text-gray-500">Total Project Budget</p>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(loi.totalProjectAmount)}
                  </p>
                </div>
              </div>

              {/* Project Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Project Description</h3>
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {loi.projectDescription || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Budget Outline */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Budget Outline</h3>
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {loi.budgetOutline || 'No budget outline provided'}
                  </p>
                </div>
              </div>

              {/* Submission Info */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {loi.submittedAt && (
                    <div>
                      <span className="font-medium">Submitted:</span>{' '}
                      {formatDate(loi.submittedAt)}
                      {loi.submittedByName && ` by ${loi.submittedByName}`}
                    </div>
                  )}
                  {loi.reviewedAt && (
                    <div>
                      <span className="font-medium">Reviewed:</span>{' '}
                      {formatDate(loi.reviewedAt)}
                      {loi.reviewedByName && ` by ${loi.reviewedByName}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Contact Information */}
        <FadeIn delay={0.2}>
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Primary Contact</p>
                <p className="font-medium text-gray-900">{loi.primaryContactName || '—'}</p>
                {loi.primaryContactTitle && (
                  <p className="text-gray-600">{loi.primaryContactTitle}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{loi.primaryContactEmail || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900">{loi.primaryContactPhone || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Executive Director</p>
                <p className="font-medium text-gray-900">{loi.executiveDirector || '—'}</p>
              </div>
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </div>
  )
}
