'use client'

import { useState, useMemo } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer } from '@/components/motion/StaggerContainer'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  SlidersHorizontal,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  MapPin,
  Eye,
  Trash2,
  Loader2,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'

interface Application {
  id: string
  projectTitle: string | null
  status: string
  grantCycle: string
  cycleYear: number
  amountRequested: number | null
  submittedAt: string | null
  aiSummary: string | null
  organizationName: string
  organizationCity: string | null
  organizationState: string | null
}

interface ReviewerApplicationsClientProps {
  applications: Application[]
  initialStatus?: string
  initialCycle?: string
  initialSearch?: string
  isAdmin?: boolean
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  DRAFT: {
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: <FileText className="w-3.5 h-3.5" />,
    label: 'Draft',
  },
  SUBMITTED: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Clock className="w-3.5 h-3.5" />,
    label: 'Submitted',
  },
  UNDER_REVIEW: {
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <Eye className="w-3.5 h-3.5" />,
    label: 'Under Review',
  },
  INFO_REQUESTED: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: 'Info Requested',
  },
  APPROVED: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: 'Approved',
  },
  DECLINED: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: 'Declined',
  },
  WITHDRAWN: {
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: 'Withdrawn',
  },
}

const statusFilters = [
  { value: '', label: 'All Applications' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'INFO_REQUESTED', label: 'Info Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DECLINED', label: 'Declined' },
]

const cycleFilters = [
  { value: '', label: 'All Cycles' },
  { value: 'SPRING', label: 'Spring' },
  { value: 'FALL', label: 'Fall' },
]

export function ReviewerApplicationsClient({
  applications: initialApplications,
  initialStatus = '',
  initialCycle = '',
  initialSearch = '',
  isAdmin = false,
}: ReviewerApplicationsClientProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [cycleFilter, setCycleFilter] = useState(initialCycle)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !searchQuery ||
        app.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || app.status === statusFilter
      const matchesCycle = !cycleFilter || app.grantCycle === cycleFilter
      return matchesSearch && matchesStatus && matchesCycle
    })
  }, [applications, searchQuery, statusFilter, cycleFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { '': applications.length }
    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1
    })
    return counts
  }, [applications])

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setCycleFilter('')
  }

  const hasActiveFilters = searchQuery || statusFilter || cycleFilter

  const handleDeleteApplication = async () => {
    if (!deleteTarget || deleteConfirmText !== 'DELETE') return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/applications/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete application')
      }
      setApplications((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      toast.success(`Application "${deleteTarget.projectTitle || 'Untitled'}" has been deleted`)
      setDeleteTarget(null)
      setDeleteConfirmText('')
    } catch (error: any) {
      console.error('Error deleting application:', error)
      toast.error(error.message || 'Failed to delete application')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[var(--hff-slate)]/10">
                <FileText className="w-6 h-6 text-[var(--hff-slate)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                <p className="text-gray-600">Review and manage grant applications</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Search and Filters Bar */}
        <FadeIn delay={0.1}>
          <GlassCard className="mb-6 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by organization or project..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/20 focus:border-[var(--hff-teal)] transition-all"
                />
              </div>

              {/* Filter Toggles */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`gap-2 ${showFilters ? 'bg-[var(--hff-teal)]/10 border-[var(--hff-teal)]' : ''}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[var(--hff-teal)]" />
                  )}
                </Button>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border border-gray-200 p-1 bg-white/50">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[var(--hff-teal)] text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[var(--hff-teal)] text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-gray-200/50">
                    <div className="grid sm:grid-cols-3 gap-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Status
                        </label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/20 focus:border-[var(--hff-teal)]"
                        >
                          {statusFilters.map((filter) => (
                            <option key={filter.value} value={filter.value}>
                              {filter.label} {statusCounts[filter.value] !== undefined && `(${statusCounts[filter.value]})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Cycle Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Grant Cycle
                        </label>
                        <select
                          value={cycleFilter}
                          onChange={(e) => setCycleFilter(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/20 focus:border-[var(--hff-teal)]"
                        >
                          {cycleFilters.map((filter) => (
                            <option key={filter.value} value={filter.value}>
                              {filter.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Clear Button */}
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          disabled={!hasActiveFilters}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Clear all filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </FadeIn>

        {/* Status Tabs */}
        <FadeIn delay={0.15}>
          <div className="flex flex-wrap gap-2 mb-6">
            {statusFilters.map((filter) => {
              const isActive = statusFilter === filter.value
              const count = statusCounts[filter.value] || 0
              return (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--hff-slate)] text-white shadow-md'
                      : 'bg-white/60 text-gray-600 hover:bg-white hover:shadow-sm border border-gray-200/50'
                  }`}
                >
                  {filter.label}
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-white/20' : 'bg-gray-100'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </FadeIn>

        {/* Results Count */}
        <FadeIn delay={0.2}>
          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredApplications.length} of {applications.length} applications
          </p>
        </FadeIn>

        {/* Applications List/Grid */}
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StaggerContainer staggerDelay={0.05}>
                <div className="space-y-3">
                  {filteredApplications.map((app, index) => (
                    <FadeIn key={app.id} delay={0.05 * Math.min(index, 10)}>
                      <ApplicationListItem application={app} isAdmin={isAdmin} onDelete={setDeleteTarget} />
                    </FadeIn>
                  ))}
                </div>
              </StaggerContainer>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <StaggerContainer staggerDelay={0.05}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredApplications.map((app, index) => (
                    <FadeIn key={app.id} delay={0.05 * Math.min(index, 10)}>
                      <ApplicationGridItem application={app} isAdmin={isAdmin} onDelete={setDeleteTarget} />
                    </FadeIn>
                  ))}
                </div>
              </StaggerContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredApplications.length === 0 && (
          <FadeIn>
            <GlassCard className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'No applications have been submitted yet.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </GlassCard>
          </FadeIn>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirmText('') } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Delete Application</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    You are about to permanently delete the application <strong>&quot;{deleteTarget?.projectTitle || 'Untitled'}&quot;</strong> from <strong>{deleteTarget?.organizationName}</strong>.
                  </p>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h4 className="font-semibold text-red-900 mb-2">This action cannot be undone. It will delete:</h4>
                    <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                      <li>All reviewer notes and votes</li>
                      <li>All status history records</li>
                      <li>All communications</li>
                      <li>All uploaded documents</li>
                      <li>All highlights and budget assessments</li>
                    </ul>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Type <strong>DELETE</strong> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={handleDeleteApplication}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Application
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function ApplicationListItem({ application, isAdmin, onDelete }: { application: Application; isAdmin?: boolean; onDelete?: (app: Application) => void }) {
  const status = statusConfig[application.status] || statusConfig.DRAFT

  return (
    <GlassCard className="p-4 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Organization Name and Status */}
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/reviewer/applications/${application.id}`}
              className="font-semibold text-gray-900 hover:text-[var(--hff-teal)] transition-colors truncate"
            >
              {application.organizationName}
            </Link>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
            >
              {status.icon}
              {status.label}
            </span>
            {application.aiSummary && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3" />
                AI Summary
              </span>
            )}
          </div>

          {/* Project Title */}
          <p className="text-gray-700 mb-2 line-clamp-1">
            {application.projectTitle || 'Untitled Application'}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {application.organizationCity && application.organizationState && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {application.organizationCity}, {application.organizationState}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {application.grantCycle} {application.cycleYear}
            </span>
            {application.amountRequested && (
              <span className="flex items-center gap-1 font-medium text-gray-700">
                <DollarSign className="w-3.5 h-3.5" />
                {application.amountRequested.toLocaleString()}
              </span>
            )}
            {application.submittedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(application.submittedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(application) }}
              className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <Button
            size="sm"
            asChild
            className="bg-[var(--hff-slate)] hover:bg-[var(--hff-slate)]/90 text-white gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <Link href={`/reviewer/applications/${application.id}`}>
              Review
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}

function ApplicationGridItem({ application, isAdmin, onDelete }: { application: Application; isAdmin?: boolean; onDelete?: (app: Application) => void }) {
  const status = statusConfig[application.status] || statusConfig.DRAFT

  return (
    <GlassCard className="p-5 hover:shadow-lg transition-all group flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}
        >
          {status.icon}
          {status.label}
        </span>
        {application.aiSummary && (
          <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Sparkles className="w-4 h-4" />
          </span>
        )}
      </div>

      {/* Organization */}
      <Link
        href={`/reviewer/applications/${application.id}`}
        className="font-semibold text-gray-900 hover:text-[var(--hff-teal)] transition-colors mb-1 line-clamp-1"
      >
        {application.organizationName}
      </Link>

      {/* Project Title */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
        {application.projectTitle || 'Untitled Application'}
      </p>

      {/* Meta Info */}
      <div className="space-y-2 text-sm text-gray-500 mb-4">
        {application.organizationCity && application.organizationState && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {application.organizationCity}, {application.organizationState}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {application.grantCycle} {application.cycleYear}
          </span>
          {application.amountRequested && (
            <span className="font-semibold text-gray-900">
              ${application.amountRequested.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        {application.submittedAt && (
          <span className="text-xs text-gray-500">
            {format(new Date(application.submittedAt), 'MMM d, yyyy')}
          </span>
        )}
        <div className="flex items-center gap-1">
          {isAdmin && onDelete && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(application) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete application"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <Button
            size="sm"
            variant="ghost"
            asChild
            className="gap-1 text-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/10"
          >
            <Link href={`/reviewer/applications/${application.id}`}>
              Review
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
