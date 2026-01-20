'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Target,
  FileText,
  User,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; variant: 'default' | 'warning' | 'success' | 'error'; icon: any }> = {
  DRAFT: { label: 'Draft', variant: 'default', icon: FileText },
  SUBMITTED: { label: 'Submitted', variant: 'warning', icon: Send },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning', icon: Eye },
  APPROVED: { label: 'Approved', variant: 'success', icon: CheckCircle2 },
  DECLINED: { label: 'Declined', variant: 'error', icon: XCircle },
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

export default function ReviewerLOIDetailPage() {
  const router = useRouter()
  const params = useParams()
  const loiId = params.id as string

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [loi, setLoi] = useState<any>(null)
  const [showDecisionPanel, setShowDecisionPanel] = useState(false)
  const [decision, setDecision] = useState<'APPROVED' | 'DECLINED' | null>(null)
  const [decisionReason, setDecisionReason] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')

  useEffect(() => {
    async function fetchLOI() {
      try {
        const response = await fetch(`/api/loi/${loiId}`)
        if (!response.ok) {
          toast.error('Letter of Interest not found')
          router.push('/reviewer/lois')
          return
        }

        const data = await response.json()
        setLoi(data)

        // If status is SUBMITTED, mark as UNDER_REVIEW
        if (data.status === 'SUBMITTED') {
          await fetch(`/api/loi/${loiId}/review`, { method: 'PATCH' })
          setLoi({ ...data, status: 'UNDER_REVIEW' })
        }
      } catch (error) {
        console.error('Error fetching LOI:', error)
        toast.error('Failed to load Letter of Interest')
      } finally {
        setLoading(false)
      }
    }

    fetchLOI()
  }, [loiId, router])

  const handleDecision = async () => {
    if (!decision) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/loi/${loiId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          reason: decisionReason,
          notes: reviewNotes,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(
          decision === 'APPROVED'
            ? 'LOI approved! Full application created.'
            : 'LOI declined.'
        )
        router.push('/reviewer/lois')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to process decision')
      }
    } catch (error) {
      console.error('Error processing decision:', error)
      toast.error('Failed to process decision')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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

  const status = statusConfig[loi.status] || statusConfig.SUBMITTED
  const StatusIcon = status.icon
  const canMakeDecision = ['SUBMITTED', 'UNDER_REVIEW'].includes(loi.status)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <FadeIn>
          <Link href="/reviewer/lois" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to LOIs</span>
          </Link>
        </FadeIn>

        {/* Header */}
        <FadeIn delay={0.05}>
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <GlassBadge variant={status.variant} size="lg">
                    <StatusIcon className="w-4 h-4 mr-1.5" />
                    {status.label}
                  </GlassBadge>
                  <span className="text-sm text-gray-500">
                    {loi.cycleConfig?.cycle} {loi.cycleConfig?.year} Cycle
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {loi.projectTitle || 'Untitled LOI'}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-gray-600">
                  <Link
                    href={`/reviewer/organizations/${loi.organization?.id}`}
                    className="flex items-center gap-2 hover:text-[var(--hff-teal)]"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{loi.organization?.legalName}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Action buttons */}
              {canMakeDecision && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDecision('DECLINED')
                      setShowDecisionPanel(true)
                    }}
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={() => {
                      setDecision('APPROVED')
                      setShowDecisionPanel(true)
                    }}
                    className="rounded-xl bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Decision Panel */}
        <AnimatePresence>
          {showDecisionPanel && (
            <FadeIn>
              <GlassCard
                variant={decision === 'APPROVED' ? 'teal' : 'default'}
                className={cn(
                  'p-6 mb-6',
                  decision === 'DECLINED' && 'border-red-200 bg-red-50/50'
                )}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      decision === 'APPROVED'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    )}
                  >
                    {decision === 'APPROVED' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {decision === 'APPROVED' ? 'Approve LOI' : 'Decline LOI'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {decision === 'APPROVED'
                        ? 'This will create a full application for the organization to complete.'
                        : 'The applicant will be notified of this decision.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {decision === 'APPROVED' ? 'Notes (optional)' : 'Reason for decline'}
                      {decision === 'DECLINED' && <span className="text-red-500"> *</span>}
                    </Label>
                    <Textarea
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      placeholder={
                        decision === 'APPROVED'
                          ? 'Add any notes about this approval...'
                          : 'Provide feedback for the applicant about why their LOI was not selected...'
                      }
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>

                  {decision === 'APPROVED' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Internal Review Notes (optional)
                      </Label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add any internal notes for reviewers..."
                        rows={2}
                        className="rounded-xl"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDecisionPanel(false)
                        setDecision(null)
                        setDecisionReason('')
                        setReviewNotes('')
                      }}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDecision}
                      disabled={processing || (decision === 'DECLINED' && !decisionReason.trim())}
                      className={cn(
                        'rounded-xl',
                        decision === 'APPROVED'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      )}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {decision === 'APPROVED' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Confirm Approval
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Confirm Decline
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          )}
        </AnimatePresence>

        {/* Already Decided */}
        {loi.status === 'APPROVED' && (
          <FadeIn delay={0.1}>
            <GlassCard variant="teal" className="p-5 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">LOI Approved</p>
                  <p className="text-sm text-gray-600">
                    Approved on {loi.reviewedAt ? formatDate(loi.reviewedAt) : 'N/A'}
                    {loi.reviewedByName && ` by ${loi.reviewedByName}`}
                  </p>
                </div>
                {loi.application && (
                  <Link href={`/reviewer/applications/${loi.application.id}`}>
                    <Button className="rounded-xl bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]">
                      View Application
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </GlassCard>
          </FadeIn>
        )}

        {loi.status === 'DECLINED' && (
          <FadeIn delay={0.1}>
            <GlassCard className="p-5 mb-6 border-red-200 bg-red-50/50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">LOI Declined</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Declined on {loi.reviewedAt ? formatDate(loi.reviewedAt) : 'N/A'}
                    {loi.reviewedByName && ` by ${loi.reviewedByName}`}
                  </p>
                  {loi.decisionReason && (
                    <div className="mt-2 p-3 rounded-lg bg-white border border-red-100">
                      <p className="text-xs text-gray-500 mb-1">Decline Reason:</p>
                      <p className="text-sm text-gray-700">{loi.decisionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </FadeIn>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Info */}
            <FadeIn delay={0.15}>
              <GlassCard variant="elevated" className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[var(--hff-teal)]" />
                      <p className="text-xs text-gray-500">Focus Area</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {focusAreaLabels[loi.focusArea] || '—'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-[var(--hff-teal)]" />
                      <p className="text-xs text-gray-500">Expenditure Type</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {expenditureLabels[loi.expenditureType] || '—'}
                    </p>
                  </div>
                </div>

                {/* Project Questions */}
                {(loi.isNewProject !== null || loi.isCapacityIncrease !== null) && (
                  <div className="space-y-3 mb-6 p-4 rounded-xl bg-gray-50">
                    {loi.isNewProject !== null && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">New project or emerging need?</p>
                        <p className="text-sm font-medium text-gray-900">
                          {loi.isNewProject ? 'Yes' : 'No'}
                        </p>
                        {loi.newProjectExplanation && (
                          <p className="text-sm text-gray-600 mt-1">{loi.newProjectExplanation}</p>
                        )}
                      </div>
                    )}
                    {loi.isCapacityIncrease !== null && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Increasing capacity or rising costs?</p>
                        <p className="text-sm font-medium text-gray-900">
                          {loi.isCapacityIncrease ? 'Yes' : 'No'}
                        </p>
                        {loi.capacityExplanation && (
                          <p className="text-sm text-gray-600 mt-1">{loi.capacityExplanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Project Description */}
                <div className="mb-6">
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
              </GlassCard>
            </FadeIn>

            {/* Status History */}
            {loi.statusHistory && loi.statusHistory.length > 0 && (
              <FadeIn delay={0.25}>
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">History</h2>
                  <div className="space-y-3">
                    {loi.statusHistory.map((history: any, index: number) => (
                      <div key={history.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[var(--hff-teal)] mt-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-900">
                            Status changed to <span className="font-medium">{history.newStatus}</span>
                            {history.changedByName && ` by ${history.changedByName}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(history.createdAt).toLocaleString()}
                          </p>
                          {history.reason && (
                            <p className="text-sm text-gray-600 mt-1">{history.reason}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Financials */}
            <FadeIn delay={0.2}>
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[var(--hff-teal)]/5 border border-[var(--hff-teal)]/10">
                    <p className="text-xs text-gray-500 mb-1">Grant Request</p>
                    <p className="text-2xl font-bold text-[var(--hff-teal)]">
                      {formatCurrency(loi.grantRequestAmount)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Total Project Budget</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(loi.totalProjectAmount)}
                    </p>
                  </div>
                  {loi.percentOfProject && (
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p className="text-xs text-gray-500 mb-1">% of Total Project</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {parseFloat(loi.percentOfProject).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Organization Info */}
            <FadeIn delay={0.25}>
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{loi.organization?.legalName}</p>
                    {loi.organization?.dbaName && (
                      <p className="text-xs text-gray-500">DBA: {loi.organization.dbaName}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>EIN: {loi.organization?.ein}</p>
                    {loi.organization?.website && (
                      <a
                        href={loi.organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[var(--hff-teal)] hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {loi.organization.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                  <Link href={`/reviewer/organizations/${loi.organization?.id}`}>
                    <Button variant="outline" size="sm" className="w-full rounded-xl">
                      View Full Profile
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Contact */}
            <FadeIn delay={0.3}>
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
                <div className="space-y-3 text-sm">
                  {loi.primaryContactName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{loi.primaryContactName}</p>
                        {loi.primaryContactTitle && (
                          <p className="text-xs text-gray-500">{loi.primaryContactTitle}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {loi.primaryContactEmail && (
                    <a
                      href={`mailto:${loi.primaryContactEmail}`}
                      className="flex items-center gap-2 text-[var(--hff-teal)] hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {loi.primaryContactEmail}
                    </a>
                  )}
                  {loi.primaryContactPhone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {loi.primaryContactPhone}
                    </div>
                  )}
                </div>
              </GlassCard>
            </FadeIn>

            {/* Submission Info */}
            <FadeIn delay={0.35}>
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                <div className="space-y-3 text-sm">
                  {loi.submittedAt && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Submitted</p>
                        <p className="text-gray-600">{formatDate(loi.submittedAt)}</p>
                        {loi.submittedByName && (
                          <p className="text-xs text-gray-500">by {loi.submittedByName}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {loi.cycleConfig?.loiDeadline && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">LOI Deadline</p>
                        <p className="text-gray-600">{formatDate(loi.cycleConfig.loiDeadline)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}
