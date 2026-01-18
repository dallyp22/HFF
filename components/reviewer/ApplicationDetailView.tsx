'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import Link from 'next/link'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Target,
  Building2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  History,
  Folder,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { formatFileSize } from '@/lib/storage'
import { AISummaryDisplay } from '@/components/reviewer/AISummaryDisplay'
import { StatusChangeDialog } from '@/components/reviewer/StatusChangeDialog'
import { InfoRequestDialog } from '@/components/reviewer/InfoRequestDialog'
import { VotingPanel } from '@/components/reviewer/VotingPanel'
import { NotesPanel } from '@/components/reviewer/NotesPanel'

interface ApplicationDetailViewProps {
  application: any
  userIsAdmin: boolean
  userIsManager: boolean
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode }> = {
  DRAFT: {
    color: 'text-slate-600',
    bgColor: 'bg-slate-100 border-slate-200',
    icon: <FileText className="w-4 h-4" />,
  },
  SUBMITTED: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: <Clock className="w-4 h-4" />,
  },
  UNDER_REVIEW: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: <Target className="w-4 h-4" />,
  },
  INFO_REQUESTED: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: <MessageSquare className="w-4 h-4" />,
  },
  APPROVED: {
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  DECLINED: {
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: <XCircle className="w-4 h-4" />,
  },
  WITHDRAWN: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-100 border-gray-200',
    icon: <XCircle className="w-4 h-4" />,
  },
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'funding', label: 'Funding', icon: DollarSign },
  { id: 'impact', label: 'Impact', icon: Target },
  { id: 'voting', label: 'Voting', icon: ThumbsUp },
  { id: 'notes', label: 'Notes', icon: MessageCircle },
  { id: 'docs', label: 'Documents', icon: Folder },
  { id: 'history', label: 'History', icon: History },
]

export function ApplicationDetailView({
  application,
  userIsAdmin,
  userIsManager,
}: ApplicationDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const approveVotes = application.votes?.filter((v: any) => v.vote === 'APPROVE').length || 0
  const declineVotes = application.votes?.filter((v: any) => v.vote === 'DECLINE').length || 0
  const totalVotes = application.votes?.filter((v: any) => v.vote).length || 0

  const status = statusConfig[application.status] || statusConfig.DRAFT

  function handleApprove() {
    setSelectedStatus('APPROVED')
    setStatusDialogOpen(true)
  }

  function handleDecline() {
    setSelectedStatus('DECLINED')
    setStatusDialogOpen(true)
  }

  function handleRequestInfo() {
    setInfoDialogOpen(true)
  }

  const amountRequested = application.amountRequested
    ? Math.round(parseFloat(application.amountRequested.toString()))
    : 0

  const totalBudget = application.totalProjectBudget
    ? Math.round(parseFloat(application.totalProjectBudget.toString()))
    : 0

  const percentageRequested = application.percentageRequested
    ? parseFloat(application.percentageRequested.toString())
    : 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <FadeIn>
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            {/* Back Link */}
            <Link
              href="/reviewer/applications"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--hff-teal)] transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Applications
            </Link>

            {/* Title Row */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">
                    {application.projectTitle || 'Untitled Application'}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${status.bgColor} ${status.color}`}
                  >
                    {status.icon}
                    {application.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                  <Link
                    href={`/reviewer/organizations/${application.organizationId}`}
                    className="font-medium text-gray-900 hover:text-[var(--hff-teal)] transition-colors flex items-center gap-1"
                  >
                    <Building2 className="w-4 h-4" />
                    {application.organization.legalName}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {application.grantCycle} {application.cycleYear}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[var(--hff-teal)]">
                    <DollarSign className="w-4 h-4" />
                    {amountRequested.toLocaleString()} requested
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {userIsAdmin && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDecline}
                    className="bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Decline
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRequestInfo} className="gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    Request Info
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Main Content - Split Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - AI Analysis */}
        <FadeIn delay={0.1} className="w-80 lg:w-96 flex-shrink-0 hidden md:block">
          <div className="h-full overflow-y-auto bg-gradient-to-b from-[var(--hff-teal)]/[0.02] via-slate-50/80 to-white/60 backdrop-blur-sm border-r border-[var(--hff-teal)]/10 p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200/50">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 shadow-sm">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">AI Analysis</h2>
                <p className="text-[10px] text-gray-500 font-medium">Powered by GPT-4</p>
              </div>
            </div>

            <AISummaryDisplay
              summary={application.aiSummary}
              missionAlignment={application.aiMissionAlignment}
              budgetAnalysis={application.aiBudgetAnalysis}
              strengths={application.aiStrengths || []}
              concerns={application.aiConcerns || []}
              questions={application.aiQuestions || []}
              generatedAt={application.aiSummaryGeneratedAt?.toString() || null}
              applicationId={application.id}
              isAdmin={userIsAdmin}
            />
          </div>
        </FadeIn>

        {/* Right Content - Tabbed Interface */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Tab Navigation */}
          <FadeIn delay={0.15}>
            <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 px-4">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  let count = null

                  if (tab.id === 'voting') count = totalVotes
                  if (tab.id === 'notes') count = application.notes?.length || 0
                  if (tab.id === 'docs') count = application.documents?.length || 0

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap ${
                        isActive
                          ? 'text-[var(--hff-teal)] bg-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {count !== null && count > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-xs ${
                            isActive
                              ? 'bg-[var(--hff-teal)]/10 text-[var(--hff-teal)]'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--hff-teal)]"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </FadeIn>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab application={application} />
                )}
                {activeTab === 'funding' && (
                  <FundingTab
                    application={application}
                    amountRequested={amountRequested}
                    totalBudget={totalBudget}
                    percentageRequested={percentageRequested}
                  />
                )}
                {activeTab === 'impact' && <ImpactTab application={application} />}
                {activeTab === 'voting' && (
                  <VotingPanel
                    applicationId={application.id}
                    currentUserId={application.votes?.[0]?.reviewerId || 'unknown'}
                  />
                )}
                {activeTab === 'notes' && (
                  <NotesPanel
                    applicationId={application.id}
                    initialNotes={application.notes || []}
                  />
                )}
                {activeTab === 'docs' && <DocumentsTab documents={application.documents} />}
                {activeTab === 'history' && <HistoryTab statusHistory={application.statusHistory} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Info Bar */}
          <FadeIn delay={0.2}>
            <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    {application.notes?.length || 0} notes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4" />
                    {approveVotes} approve
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ThumbsDown className="w-4 h-4" />
                    {declineVotes} decline
                  </span>
                </div>
                {application.submittedAt && (
                  <span className="text-xs text-gray-400">
                    Submitted {format(new Date(application.submittedAt), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Dialogs */}
      <StatusChangeDialog
        applicationId={application.id}
        currentStatus={application.status}
        approveVotes={approveVotes}
        declineVotes={declineVotes}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />

      <InfoRequestDialog
        applicationId={application.id}
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
      />
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ application }: { application: any }) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Project Overview */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <FileText className="w-4 h-4 text-[var(--hff-teal)]" />
          Project Overview
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          {application.projectDescription || 'No description provided'}
        </p>
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm">
            <span className="font-medium text-gray-900">Goals:</span>{' '}
            <span className="text-gray-600">{application.projectGoals || 'Not specified'}</span>
          </p>
        </div>
      </GlassCard>

      {/* Timeline & Location */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Calendar className="w-4 h-4 text-[var(--hff-teal)]" />
          Timeline & Location
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Start Date</p>
            <p className="font-medium text-gray-900">
              {application.projectStartDate
                ? format(new Date(application.projectStartDate), 'MMMM d, yyyy')
                : 'TBD'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">End Date</p>
            <p className="font-medium text-gray-900">
              {application.projectEndDate
                ? format(new Date(application.projectEndDate), 'MMMM d, yyyy')
                : 'TBD'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Geographic Area</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {application.geographicArea || 'Not specified'}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Organization Summary */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Building2 className="w-4 h-4 text-[var(--hff-teal)]" />
          Organization Summary
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Annual Budget</p>
            <p className="font-semibold text-gray-900">
              ${application.organization.annualBudget?.toLocaleString() || 'N/A'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Staff</p>
            <p className="font-medium text-gray-900">
              {application.organization.fullTimeStaff || 0} FT,{' '}
              {application.organization.partTimeStaff || 0} PT
            </p>
          </div>
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Program Expense Ratio</p>
            <p className="font-semibold text-[var(--hff-teal)]">
              {application.organization.form990ProgramExpenses &&
              application.organization.form990TotalExpenses
                ? `${Math.round(
                    (parseFloat(application.organization.form990ProgramExpenses.toString()) /
                      parseFloat(application.organization.form990TotalExpenses.toString())) *
                      100
                  )}%`
                : 'N/A'}
            </p>
          </div>
        </div>
        <Link
          href={`/reviewer/organizations/${application.organizationId}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--hff-teal)] hover:text-[var(--hff-teal-dark)] transition-colors"
        >
          View Full Organization Profile
          <ChevronRight className="w-4 h-4" />
        </Link>
      </GlassCard>
    </div>
  )
}

// Funding Tab Component
function FundingTab({
  application,
  amountRequested,
  totalBudget,
  percentageRequested,
}: {
  application: any
  amountRequested: number
  totalBudget: number
  percentageRequested: number
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Funding Request */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <DollarSign className="w-4 h-4 text-[var(--hff-teal)]" />
          Funding Request
        </h3>

        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Amount Requested</p>
            <p className="text-3xl font-bold text-[var(--hff-teal)]">
              ${amountRequested.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Project Budget</p>
            <p className="text-xl font-semibold text-gray-900">${totalBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Percentage of Budget</p>
            <p className="text-xl font-semibold text-gray-900">{percentageRequested.toFixed(1)}%</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>HFF Funding</span>
            <span>{percentageRequested.toFixed(1)}% of total</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentageRequested, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[var(--hff-teal)] to-[var(--hff-sage)] rounded-full"
            />
          </div>
        </div>
      </GlassCard>

      {/* Other Funding */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <TrendingUp className="w-4 h-4 text-[var(--hff-teal)]" />
          Other Funding Sources
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Other Sources</p>
            <p className="text-gray-600">{application.otherFundingSources || 'None specified'}</p>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">Previous HFF Grants</p>
            <p className="text-gray-600">{application.previousHFFGrants || 'None'}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// Impact Tab Component
function ImpactTab({ application }: { application: any }) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Target Population */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Users className="w-4 h-4 text-[var(--hff-teal)]" />
          Target Population
        </h3>

        <div className="grid sm:grid-cols-2 gap-6 mb-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--hff-teal)]/5 to-[var(--hff-teal)]/10 border border-[var(--hff-teal)]/20">
            <p className="text-xs text-gray-500 mb-1">Children Served</p>
            <p className="text-3xl font-bold text-[var(--hff-teal)]">
              {application.childrenServed || 'N/A'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">Age Range</p>
            <p className="text-xl font-semibold text-gray-900">
              {application.ageRangeStart && application.ageRangeEnd
                ? `${application.ageRangeStart} - ${application.ageRangeEnd} years`
                : 'Not specified'}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Population Description</p>
            <p className="text-gray-600">{application.targetPopulation || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Poverty Indicators</p>
            <p className="text-gray-600">{application.povertyIndicators || 'Not specified'}</p>
          </div>
        </div>
      </GlassCard>

      {/* Expected Outcomes */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Target className="w-4 h-4 text-[var(--hff-teal)]" />
          Expected Outcomes
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Expected Outcomes</p>
            <p className="text-gray-600">{application.expectedOutcomes || 'Not specified'}</p>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">Measurement Plan</p>
            <p className="text-gray-600">{application.measurementPlan || 'Not specified'}</p>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">Sustainability Plan</p>
            <p className="text-gray-600">{application.sustainabilityPlan || 'Not specified'}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// Documents Tab Component
function DocumentsTab({ documents }: { documents: any[] }) {
  if (!documents || documents.length === 0) {
    return (
      <GlassCard className="py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Folder className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents</h3>
        <p className="text-gray-500">No documents have been attached to this application.</p>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-3 max-w-4xl">
      {documents.map((doc: any, index: number) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <GlassCard className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--hff-teal)]/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[var(--hff-teal)]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{doc.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" asChild className="gap-1.5">
              <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4" />
                Download
              </a>
            </Button>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  )
}

// History Tab Component
function HistoryTab({ statusHistory }: { statusHistory: any[] }) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <GlassCard className="py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <History className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No History</h3>
        <p className="text-gray-500">No status changes have been recorded yet.</p>
      </GlassCard>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-4">
          {statusHistory.map((history: any, index: number) => {
            const status = statusConfig[history.newStatus] || statusConfig.DRAFT

            return (
              <motion.div
                key={history.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-10"
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute left-2 top-2 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${status.bgColor}`}
                >
                  <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`} />
                </div>

                <GlassCard className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bgColor} ${status.color}`}
                    >
                      {status.icon}
                      {history.newStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(history.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>

                  {history.reason && (
                    <p className="text-sm text-gray-600 mb-2">{history.reason}</p>
                  )}

                  {history.changedByName && (
                    <p className="text-xs text-gray-400">Changed by {history.changedByName}</p>
                  )}
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
