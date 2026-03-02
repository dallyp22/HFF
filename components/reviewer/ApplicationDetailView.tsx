'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import { formatFileSize } from '@/lib/storage'
import { AISummaryDisplay } from '@/components/reviewer/AISummaryDisplay'
import { StatusChangeDialog } from '@/components/reviewer/StatusChangeDialog'
import { InfoRequestDialog } from '@/components/reviewer/InfoRequestDialog'
import { VotingPanel } from '@/components/reviewer/VotingPanel'
import { NotesPanel } from '@/components/reviewer/NotesPanel'
import { AdminSynopsisPanel } from '@/components/reviewer/AdminSynopsisPanel'
import { HighlightableText, type Highlight } from '@/components/reviewer/HighlightableText'
import { BudgetAssessmentPanel } from '@/components/reviewer/BudgetAssessmentPanel'

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
  { id: 'notes', label: 'Notes', icon: MessageCircle },
  { id: 'docs', label: 'Documents', icon: Folder },
  { id: 'history', label: 'History', icon: History },
  { id: 'voting', label: 'Voting', icon: ThumbsUp },
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
  const [highlights, setHighlights] = useState<Highlight[]>(application.highlights || [])
  const [analysisPanelOpen, setAnalysisPanelOpen] = useState(false)

  const fetchHighlights = useCallback(async () => {
    try {
      const res = await fetch(`/api/applications/${application.id}/highlights`)
      if (res.ok) {
        const data = await res.json()
        setHighlights(data)
      }
    } catch (error) {
      console.error('Error fetching highlights:', error)
    }
  }, [application.id])

  useEffect(() => {
    // If highlights weren't included in the initial data, fetch them
    if (!application.highlights || application.highlights.length === 0) {
      fetchHighlights()
    }
  }, [application.highlights, fetchHighlights])

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
        {/* Left Sidebar - Staff Notes & Analysis */}
        <FadeIn delay={0.1} className="w-80 lg:w-96 flex-shrink-0 hidden md:block">
          <div className="h-full overflow-y-auto bg-gradient-to-b from-[var(--hff-teal)]/[0.02] via-slate-50/80 to-white/60 backdrop-blur-sm border-r border-[var(--hff-teal)]/10 p-5">
            {/* Header with collapse toggle */}
            <div className="mb-5 pb-4 border-b border-gray-200/50">
              <button
                onClick={() => setAnalysisPanelOpen(!analysisPanelOpen)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gray-100 shadow-sm">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-bold text-gray-900">Staff Notes & Analysis</h2>
                    <p className="text-[10px] text-gray-500 font-medium">Supplementary analysis</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: analysisPanelOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </motion.div>
              </button>

              {/* Disclaimer */}
              <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">
                AI analysis is supplementary. Decisions should be based on thorough application review.
              </p>
            </div>

            <AnimatePresence initial={false}>
              {analysisPanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
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
                    highlights={highlights}
                    onHighlightChange={fetchHighlights}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!analysisPanelOpen && (
              <button
                onClick={() => setAnalysisPanelOpen(true)}
                className="w-full py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                Show Analysis
              </button>
            )}
          </div>
        </FadeIn>

        {/* Right Content - Tabbed Interface */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Admin Synopsis */}
          {userIsAdmin && (
            <FadeIn delay={0.12}>
              <div className="px-4 pt-4">
                <AdminSynopsisPanel
                  entityId={application.id}
                  entityType="application"
                  adminSynopsis={application.adminSynopsis}
                  adminSynopsisBy={application.adminSynopsisBy}
                  adminSynopsisAt={application.adminSynopsisAt}
                  userIsAdmin={userIsAdmin}
                />
              </div>
            </FadeIn>
          )}

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
                  <OverviewTab
                    application={application}
                    highlights={highlights}
                    isAdmin={userIsAdmin}
                    onHighlightChange={fetchHighlights}
                  />
                )}
                {activeTab === 'funding' && (
                  <FundingTab
                    application={application}
                    amountRequested={amountRequested}
                    totalBudget={totalBudget}
                    percentageRequested={percentageRequested}
                    applicationId={application.id}
                  />
                )}
                {activeTab === 'impact' && (
                  <ImpactTab
                    application={application}
                    highlights={highlights}
                    isAdmin={userIsAdmin}
                    onHighlightChange={fetchHighlights}
                  />
                )}
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
function OverviewTab({
  application,
  highlights,
  isAdmin,
  onHighlightChange,
}: {
  application: any
  highlights: Highlight[]
  isAdmin: boolean
  onHighlightChange: () => void
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Project Overview */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
          <FileText className="w-4 h-4 text-[var(--hff-teal)]" />
          Project Overview
        </h3>
        <div className="text-gray-700 mb-4">
          {application.projectDescription ? (
            <HighlightableText
              text={application.projectDescription}
              fieldName="projectDescription"
              applicationId={application.id}
              highlights={highlights}
              isAdmin={isAdmin}
              onHighlightChange={onHighlightChange}
            />
          ) : (
            <span className="text-gray-400 italic">No description provided</span>
          )}
        </div>
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-900 mb-1">Goals:</p>
          <div className="text-sm text-gray-600">
            {application.projectGoals ? (
              <HighlightableText
                text={application.projectGoals}
                fieldName="projectGoals"
                applicationId={application.id}
                highlights={highlights}
                isAdmin={isAdmin}
                onHighlightChange={onHighlightChange}
              />
            ) : (
              <span className="text-gray-400 italic">Not specified</span>
            )}
          </div>
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

        {/* Organization Description */}
        {application.organization.organizationDescription && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">Organization Description</p>
            <p className="text-gray-600 whitespace-pre-wrap">{application.organization.organizationDescription}</p>
          </div>
        )}

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

      {/* Form 990 Financial Breakdown */}
      {(application.organization.form990ProgramExpenses || application.organization.form990AdminExpenses || application.organization.form990FundraisingExpenses) && (() => {
        const programExpenses = application.organization.form990ProgramExpenses ? parseFloat(application.organization.form990ProgramExpenses.toString()) : 0
        const adminExpenses = application.organization.form990AdminExpenses ? parseFloat(application.organization.form990AdminExpenses.toString()) : 0
        const fundraisingExpenses = application.organization.form990FundraisingExpenses ? parseFloat(application.organization.form990FundraisingExpenses.toString()) : 0
        const totalExpenses = application.organization.form990TotalExpenses
          ? parseFloat(application.organization.form990TotalExpenses.toString())
          : (programExpenses + adminExpenses + fundraisingExpenses)
        const programPct = totalExpenses > 0 ? (programExpenses / totalExpenses) * 100 : 0
        const adminPct = totalExpenses > 0 ? (adminExpenses / totalExpenses) * 100 : 0
        const fundraisingPct = totalExpenses > 0 ? (fundraisingExpenses / totalExpenses) * 100 : 0

        const programColor = programPct >= 75 ? 'text-emerald-700' : programPct >= 50 ? 'text-amber-700' : 'text-red-700'
        const programBg = programPct >= 75 ? 'from-emerald-50 to-green-50 border-emerald-200' : programPct >= 50 ? 'from-amber-50 to-yellow-50 border-amber-200' : 'from-red-50 to-rose-50 border-red-200'
        const programBarColor = programPct >= 75 ? 'bg-emerald-500' : programPct >= 50 ? 'bg-amber-500' : 'bg-red-500'

        return (
          <GlassCard className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
              <DollarSign className="w-4 h-4 text-[var(--hff-teal)]" />
              Form 990 Financial Breakdown {application.organization.form990Year ? `(${application.organization.form990Year})` : ''}
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${programBg} border`}>
                <p className="text-xs text-gray-500 mb-1">Program Expenses</p>
                <p className={`text-2xl font-bold ${programColor}`}>
                  ${programExpenses.toLocaleString()}
                </p>
                <p className={`text-sm font-semibold mt-1 ${programColor}`}>
                  {programPct.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
                <p className="text-xs text-gray-500 mb-1">Admin Expenses</p>
                <p className="text-2xl font-bold text-slate-700">
                  ${adminExpenses.toLocaleString()}
                </p>
                <p className="text-sm font-semibold mt-1 text-slate-600">
                  {adminPct.toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200">
                <p className="text-xs text-gray-500 mb-1">Fundraising Expenses</p>
                <p className="text-2xl font-bold text-purple-700">
                  ${fundraisingExpenses.toLocaleString()}
                </p>
                <p className="text-sm font-semibold mt-1 text-purple-600">
                  {fundraisingPct.toFixed(1)}%
                </p>
              </div>
            </div>
            {/* Stacked bar chart */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Expense Distribution</span>
                <span>Total: ${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                {programPct > 0 && (
                  <div
                    className={`h-full ${programBarColor}`}
                    style={{ width: `${programPct}%` }}
                    title={`Program: ${programPct.toFixed(1)}%`}
                  />
                )}
                {adminPct > 0 && (
                  <div
                    className="h-full bg-slate-400"
                    style={{ width: `${adminPct}%` }}
                    title={`Admin: ${adminPct.toFixed(1)}%`}
                  />
                )}
                {fundraisingPct > 0 && (
                  <div
                    className="h-full bg-purple-400"
                    style={{ width: `${fundraisingPct}%` }}
                    title={`Fundraising: ${fundraisingPct.toFixed(1)}%`}
                  />
                )}
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${programBarColor}`} />
                  Program
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  Admin
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  Fundraising
                </span>
              </div>
            </div>
          </GlassCard>
        )
      })()}

      {/* Board Members */}
      {application.boardMembers && (() => {
        const members = typeof application.boardMembers === 'string'
          ? JSON.parse(application.boardMembers)
          : application.boardMembers
        if (!Array.isArray(members) || members.length === 0) return null
        return (
          <GlassCard className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
              <Users className="w-4 h-4 text-[var(--hff-teal)]" />
              Board of Directors
              <span className="ml-auto text-xs font-normal text-gray-500">{members.length} members</span>
            </h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Name</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Title / Role</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Affiliation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((member: any, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-gray-900 font-medium">{member.name || 'N/A'}</td>
                      <td className="px-3 py-2 text-gray-700">{member.title || 'N/A'}</td>
                      <td className="px-3 py-2 text-gray-700">{member.affiliation || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )
      })()}
    </div>
  )
}

// Funding Tab Component
function FundingTab({
  application,
  amountRequested,
  totalBudget,
  percentageRequested,
  applicationId,
}: {
  application: any
  amountRequested: number
  totalBudget: number
  percentageRequested: number
  applicationId: string
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

      {/* Structured Funding Sources */}
      <GlassCard className="p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <TrendingUp className="w-4 h-4 text-[var(--hff-teal)]" />
          Other Funding Sources
        </h3>
        <div className="space-y-4">
          {/* Confirmed Funding */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Confirmed Funding</p>
            {application.confirmedFundingSources && (application.confirmedFundingSources as any[]).length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Source</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(application.confirmedFundingSources as any[]).map((source: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-700">{source.name}</td>
                        <td className="px-3 py-2 text-right text-gray-900 font-medium">
                          ${Number(source.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-3 py-2 text-gray-700">Total Confirmed</td>
                      <td className="px-3 py-2 text-right text-[var(--hff-teal)]">
                        ${(application.confirmedFundingSources as any[]).reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">None specified</p>
            )}
          </div>

          {/* Pending Funding */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Pending Funding</p>
            {application.pendingFundingSources && (application.pendingFundingSources as any[]).length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Source</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(application.pendingFundingSources as any[]).map((source: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-700">{source.name}</td>
                        <td className="px-3 py-2 text-right text-gray-900 font-medium">
                          ${Number(source.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-3 py-2 text-gray-700">Total Pending</td>
                      <td className="px-3 py-2 text-right text-amber-600">
                        ${(application.pendingFundingSources as any[]).reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">None specified</p>
            )}
          </div>

          {/* Legacy fallback for older applications */}
          {!application.confirmedFundingSources && !application.pendingFundingSources && application.otherFundingSources && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Other Sources</p>
              <p className="text-gray-600">{application.otherFundingSources}</p>
            </div>
          )}

          {/* Previous HFF Grants */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Previous HFF Grants</p>
            {application.noGrantsReceived ? (
              <p className="text-gray-500 italic text-sm">No grants received to date</p>
            ) : application.previousHFFGrantsData && (application.previousHFFGrantsData as any[]).length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Date</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Project</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(application.previousHFFGrantsData as any[]).map((grant: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-700">{grant.date || 'N/A'}</td>
                        <td className="px-3 py-2 text-gray-700">{grant.projectTitle || 'N/A'}</td>
                        <td className="px-3 py-2 text-right text-gray-900 font-medium">
                          ${Number(grant.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : application.previousHFFGrants ? (
              <p className="text-gray-600">{application.previousHFFGrants}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">None</p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Budget Assessment Scoring Rubric */}
      <BudgetAssessmentPanel
        applicationId={applicationId}
        budgetBreakdown={application.budgetBreakdown}
        totalProjectBudget={totalBudget}
        amountRequested={amountRequested}
      />
    </div>
  )
}

// Impact Tab Component
function ImpactTab({
  application,
  highlights,
  isAdmin,
  onHighlightChange,
}: {
  application: any
  highlights: Highlight[]
  isAdmin: boolean
  onHighlightChange: () => void
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Demographics & Poverty Metrics */}
      {(application.clientDemographicDescription || application.childrenInPovertyImpacted || application.totalChildrenServedAnnually) && (
        <GlassCard className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
            <Users className="w-4 h-4 text-[var(--hff-teal)]" />
            Demographics & Poverty Metrics
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--hff-teal)]/5 to-[var(--hff-teal)]/10 border border-[var(--hff-teal)]/20">
              <p className="text-xs text-gray-500 mb-1">Children in Poverty Impacted</p>
              <p className="text-3xl font-bold text-[var(--hff-teal)]">
                {application.childrenInPovertyImpacted?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--hff-sage)]/5 to-[var(--hff-sage)]/10 border border-[var(--hff-sage)]/20">
              <p className="text-xs text-gray-500 mb-1">Total Children Served Annually</p>
              <p className="text-3xl font-bold text-[var(--hff-sage)]">
                {application.totalChildrenServedAnnually?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <p className="text-xs text-gray-500 mb-1">Poverty Percentage</p>
              <p className="text-3xl font-bold text-amber-700">
                {application.povertyPercentage ? `${parseFloat(application.povertyPercentage.toString()).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
          {application.clientDemographicDescription && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-1">Demographic Description</p>
              <p className="text-gray-600">{application.clientDemographicDescription}</p>
            </div>
          )}
        </GlassCard>
      )}

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
            <div className="text-gray-600">
              {application.targetPopulation ? (
                <HighlightableText
                  text={application.targetPopulation}
                  fieldName="targetPopulation"
                  applicationId={application.id}
                  highlights={highlights}
                  isAdmin={isAdmin}
                  onHighlightChange={onHighlightChange}
                />
              ) : (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">Poverty Indicators</p>
            <div className="text-gray-600">
              {application.povertyIndicators ? (
                <HighlightableText
                  text={application.povertyIndicators}
                  fieldName="povertyIndicators"
                  applicationId={application.id}
                  highlights={highlights}
                  isAdmin={isAdmin}
                  onHighlightChange={onHighlightChange}
                />
              ) : (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
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
            <div className="text-gray-600">
              {application.expectedOutcomes ? (
                <HighlightableText
                  text={application.expectedOutcomes}
                  fieldName="expectedOutcomes"
                  applicationId={application.id}
                  highlights={highlights}
                  isAdmin={isAdmin}
                  onHighlightChange={onHighlightChange}
                />
              ) : (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">Measurement Plan</p>
            <div className="text-gray-600">
              {application.measurementPlan ? (
                <HighlightableText
                  text={application.measurementPlan}
                  fieldName="measurementPlan"
                  applicationId={application.id}
                  highlights={highlights}
                  isAdmin={isAdmin}
                  onHighlightChange={onHighlightChange}
                />
              ) : (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-1">Sustainability Plan</p>
            <div className="text-gray-600">
              {application.sustainabilityPlan ? (
                <HighlightableText
                  text={application.sustainabilityPlan}
                  fieldName="sustainabilityPlan"
                  applicationId={application.id}
                  highlights={highlights}
                  isAdmin={isAdmin}
                  onHighlightChange={onHighlightChange}
                />
              ) : (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

// Documents Tab Component
function DocumentsTab({ documents }: { documents: any[] }) {
  const projectPhotos = (documents || []).filter((d: any) => d.type === 'PROJECT_PHOTO')
  const otherDocs = (documents || []).filter((d: any) => d.type !== 'PROJECT_PHOTO')

  if ((!documents || documents.length === 0)) {
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
    <div className="space-y-6 max-w-4xl">
      {/* Project Photos Gallery */}
      {projectPhotos.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-md font-semibold text-gray-900 mb-3">
            <ImageIcon className="w-5 h-5 text-[var(--hff-teal)]" />
            Project Photos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {projectPhotos.map((photo: any, index: number) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative"
              >
                <div className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={photo.storageUrl}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate flex-1">{photo.fileName}</p>
                  <a
                    href={photo.storageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--hff-teal)] hover:underline ml-2 shrink-0"
                  >
                    Full size
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Other Documents */}
      {otherDocs.length > 0 && (
        <div>
          {projectPhotos.length > 0 && (
            <h3 className="flex items-center gap-2 text-md font-semibold text-gray-900 mb-3">
              <Folder className="w-5 h-5 text-[var(--hff-teal)]" />
              Documents
            </h3>
          )}
          <div className="space-y-3">
            {otherDocs.map((doc: any, index: number) => (
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
        </div>
      )}
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
