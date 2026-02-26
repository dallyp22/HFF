'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  FileText,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ArrowRight,
  Loader2,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Building2,
  Target,
  Clock,
  Trash2,
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
    id: string
    legalName: string
    ein: string
  }
  cycleConfig: {
    id: string
    cycle: string
    year: number
    loiDeadline: string
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
}

const focusAreaLabels: Record<string, string> = {
  HUMAN_HEALTH: 'Human Health',
  EDUCATION: 'Education',
  COMMUNITY_WELLBEING: 'Community Well-Being',
}

const statusFilters = [
  { value: '', label: 'All Status' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Award Consideration' },
  { value: 'DECLINED', label: 'No Funding Consideration' },
]

export default function ReviewerLOIListPage() {
  const [lois, setLois] = useState<LOI[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<LOI | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch('/api/admin/check')
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    async function fetchLOIs() {
      try {
        const params = new URLSearchParams()
        if (statusFilter) params.set('status', statusFilter)

        const response = await fetch(`/api/loi?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setLois(data)
        }
      } catch (error) {
        console.error('Error fetching LOIs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLOIs()
  }, [statusFilter])

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

  // Filter LOIs based on search
  const filteredLois = lois.filter((loi) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      loi.projectTitle?.toLowerCase().includes(search) ||
      loi.organization.legalName.toLowerCase().includes(search) ||
      loi.organization.ein.includes(search)
    )
  })

  // Group by status for quick stats
  const stats = {
    submitted: lois.filter((l) => l.status === 'SUBMITTED').length,
    underReview: lois.filter((l) => l.status === 'UNDER_REVIEW').length,
    approved: lois.filter((l) => l.status === 'APPROVED').length,
    declined: lois.filter((l) => l.status === 'DECLINED').length,
  }

  const handleDeleteLOI = async () => {
    if (!deleteTarget || deleteConfirmText !== 'DELETE') return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/lois/${deleteTarget.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete LOI')
      }
      setLois((prev) => prev.filter((l) => l.id !== deleteTarget.id))
      toast.success(`LOI "${deleteTarget.projectTitle || 'Untitled'}" has been deleted`)
      setDeleteTarget(null)
      setDeleteConfirmText('')
    } catch (error: any) {
      console.error('Error deleting LOI:', error)
      toast.error(error.message || 'Failed to delete LOI')
    } finally {
      setIsDeleting(false)
    }
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
          <p className="text-gray-600">Loading Letters of Interest...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Letters of Interest
            </h1>
            <p className="text-gray-600">
              Review and manage submitted LOIs
            </p>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Send className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
                  <p className="text-xs text-gray-500">Pending Review</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
                  <p className="text-xs text-gray-500">Under Review</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  <p className="text-xs text-gray-500">Award Consideration</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.declined}</p>
                  <p className="text-xs text-gray-500">No Funding Consideration</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeIn>

        {/* Filters */}
        <FadeIn delay={0.15}>
          <GlassCard className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by organization or project title..."
                  className="pl-10 h-11 rounded-xl border-gray-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <div className="flex gap-2">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={cn(
                        'px-3 py-2 text-sm rounded-lg transition-colors',
                        statusFilter === filter.value
                          ? 'bg-[var(--hff-teal)] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* LOI List */}
        {filteredLois.length > 0 ? (
          <StaggerContainer className="space-y-4">
            {filteredLois.map((loi) => {
              const status = statusConfig[loi.status] || statusConfig.SUBMITTED
              const StatusIcon = status.icon
              const needsReview = ['SUBMITTED', 'UNDER_REVIEW'].includes(loi.status)

              return (
                <StaggerItem key={loi.id}>
                  <div className="relative group/delete">
                  <Link href={`/reviewer/lois/${loi.id}`}>
                    <GlassCard
                      variant={needsReview ? 'elevated' : 'default'}
                      className={cn(
                        'p-5 cursor-pointer group',
                        needsReview && 'ring-1 ring-amber-200'
                      )}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left side */}
                        <div className="flex items-start gap-4 min-w-0">
                          <div
                            className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
                              loi.status === 'APPROVED'
                                ? 'bg-green-100 text-green-600'
                                : loi.status === 'DECLINED'
                                  ? 'bg-red-100 text-red-600'
                                  : loi.status === 'SUBMITTED'
                                    ? 'bg-amber-100 text-amber-600'
                                    : loi.status === 'UNDER_REVIEW'
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            <StatusIcon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {loi.projectTitle || 'Untitled LOI'}
                              </h3>
                              <GlassBadge variant={status.variant} size="sm">
                                {status.label}
                              </GlassBadge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{loi.organization.legalName}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {loi.cycleConfig.cycle} {loi.cycleConfig.year}
                              </span>
                              {loi.focusArea && (
                                <span className="flex items-center gap-1">
                                  <Target className="w-3.5 h-3.5" />
                                  {focusAreaLabels[loi.focusArea]}
                                </span>
                              )}
                              {loi.grantRequestAmount && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  {formatCurrency(loi.grantRequestAmount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-4 lg:flex-shrink-0">
                          {loi.submittedAt && (
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Submitted {formatDate(loi.submittedAt)}</span>
                              </div>
                            </div>
                          )}
                          {needsReview && (
                            <Button
                              size="sm"
                              className="rounded-xl bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Review
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          )}
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-teal)] group-hover:translate-x-1 transition-all hidden lg:block" />
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(loi) }}
                      className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/80 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 opacity-0 group-hover/delete:opacity-100 transition-all shadow-sm"
                      title="Delete LOI"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        ) : (
          <FadeIn delay={0.2}>
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Letters of Interest Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'No LOIs have been submitted yet'}
              </p>
            </GlassCard>
          </FadeIn>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteConfirmText('') } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Delete Letter of Interest</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    You are about to permanently delete the LOI <strong>&quot;{deleteTarget?.projectTitle || 'Untitled'}&quot;</strong> from <strong>{deleteTarget?.organization.legalName}</strong>.
                  </p>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h4 className="font-semibold text-red-900 mb-2">This action cannot be undone. It will delete:</h4>
                    <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                      <li>The Letter of Interest and all status history</li>
                      <li>All uploaded documents</li>
                      {deleteTarget?.application && (
                        <li>The linked application and all its data (notes, votes, communications)</li>
                      )}
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
                onClick={handleDeleteLOI}
                disabled={deleteConfirmText !== 'DELETE' || isDeleting}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete LOI
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
