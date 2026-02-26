'use client'

import { useEffect, useState, useMemo } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Bell,
  Building2,
  Calendar,
  AlertTriangle,
  Mail,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type FilterTab = 'all' | 'approved' | 'declined'

interface PendingLOI {
  id: string
  projectTitle: string | null
  status: string
  reviewedAt: string | null
  reviewedByName: string | null
  primaryContactEmail: string | null
  decisionReason: string | null
  organization: {
    legalName: string
    ein: string
  }
  cycleConfig: {
    cycle: string
    year: number
    fullAppDeadline: string | null
  }
  application: {
    id: string
  } | null
}

export default function ReleasesPage() {
  const [lois, setLois] = useState<PendingLOI[]>([])
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [releaseMode, setReleaseMode] = useState<'selected' | 'all'>('selected')

  useEffect(() => {
    loadPendingReleases()
  }, [])

  async function loadPendingReleases() {
    try {
      const response = await fetch('/api/admin/releases')
      if (response.ok) {
        const data = await response.json()
        setLois(data)
      } else {
        toast.error('Failed to load pending releases')
      }
    } catch (error) {
      console.error('Error loading releases:', error)
      toast.error('Failed to load pending releases')
    } finally {
      setLoading(false)
    }
  }

  const filteredLois = useMemo(() => {
    if (activeTab === 'all') return lois
    if (activeTab === 'approved') return lois.filter((l) => l.status === 'APPROVED')
    return lois.filter((l) => l.status === 'DECLINED')
  }, [lois, activeTab])

  const approvedCount = lois.filter((l) => l.status === 'APPROVED').length
  const declinedCount = lois.filter((l) => l.status === 'DECLINED').length

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    const filteredIds = filteredLois.map((l) => l.id)
    const allSelected = filteredIds.every((id) => selectedIds.has(id))

    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredIds.forEach((id) => next.delete(id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredIds.forEach((id) => next.add(id))
        return next
      })
    }
  }

  const handleReleaseSelected = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one LOI to release')
      return
    }
    setReleaseMode('selected')
    setConfirmDialogOpen(true)
  }

  const handleReleaseAll = () => {
    setReleaseMode('all')
    setConfirmDialogOpen(true)
  }

  const confirmRelease = async () => {
    setReleasing(true)
    setConfirmDialogOpen(false)

    try {
      const body =
        releaseMode === 'all'
          ? { releaseAll: true }
          : { loiIds: Array.from(selectedIds) }

      const response = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
        setSelectedIds(new Set())
        await loadPendingReleases()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to release decisions')
      }
    } catch (error) {
      console.error('Error releasing decisions:', error)
      toast.error('Failed to release decisions')
    } finally {
      setReleasing(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All Pending', count: lois.length },
    { key: 'approved', label: 'Award Consideration', count: approvedCount },
    { key: 'declined', label: 'No Funding Consideration', count: declinedCount },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-100 rounded-xl" />
            <div className="h-32 bg-gray-100 rounded-xl" />
            <div className="h-32 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <Link
            href="/reviewer/admin"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--hff-teal)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                <Bell className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Release Decisions</h1>
                <p className="text-gray-600">
                  Notify applicants of LOI decisions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleReleaseSelected}
                disabled={selectedIds.size === 0 || releasing}
                className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
              >
                {releasing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Release Selected ({selectedIds.size})
              </Button>
              <Button
                onClick={handleReleaseAll}
                disabled={lois.length === 0 || releasing}
                variant="outline"
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Release All ({lois.length})
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Filter Tabs */}
        <FadeIn delay={0.05}>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-[var(--hff-teal)] text-white shadow-lg shadow-[var(--hff-teal)]/20'
                    : 'bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tab.label}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </FadeIn>

        {/* LOI List */}
        {filteredLois.length === 0 ? (
          <FadeIn delay={0.1}>
            <GlassCard className="py-16 text-center" hover={false}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Pending Decisions
              </h3>
              <p className="text-gray-500">
                {activeTab === 'all'
                  ? 'All LOI decisions have been released to applicants.'
                  : `No pending ${activeTab === 'approved' ? 'approval' : 'decline'} decisions to release.`}
              </p>
            </GlassCard>
          </FadeIn>
        ) : (
          <FadeIn delay={0.1}>
            {/* Select All Header */}
            <div className="flex items-center gap-3 mb-3 px-2">
              <Checkbox
                checked={
                  filteredLois.length > 0 &&
                  filteredLois.every((l) => selectedIds.has(l.id))
                }
                onCheckedChange={toggleSelectAll}
              />
              <span className="text-sm text-gray-500">
                Select all ({filteredLois.length})
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {filteredLois.map((loi, index) => {
                  const isSelected = selectedIds.has(loi.id)
                  const isApproved = loi.status === 'APPROVED'

                  return (
                    <motion.div
                      key={loi.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <GlassCard
                        hover={false}
                        className={`p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-[var(--hff-teal)] ring-offset-1'
                            : ''
                        }`}
                        onClick={() => toggleSelect(loi.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(loi.id)}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="font-semibold text-gray-900 truncate">
                                  {loi.organization.legalName}
                                </span>
                              </div>
                              <GlassBadge
                                variant={isApproved ? 'success' : 'error'}
                                size="sm"
                                icon={
                                  isApproved ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )
                                }
                              >
                                {isApproved ? 'Award Consideration' : 'No Funding Consideration'}
                              </GlassBadge>
                            </div>

                            <p className="text-sm text-gray-600 mb-2 truncate">
                              {loi.projectTitle || 'Untitled Project'}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Reviewed: {formatDate(loi.reviewedAt)}
                              </span>
                              {loi.reviewedByName && (
                                <span>By: {loi.reviewedByName}</span>
                              )}
                              <span>
                                {loi.cycleConfig.cycle} {loi.cycleConfig.year}
                              </span>
                              {loi.primaryContactEmail && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3.5 h-3.5" />
                                  {loi.primaryContactEmail}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </FadeIn>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Confirm Release
              </DialogTitle>
              <DialogDescription>
                {releaseMode === 'all'
                  ? `This will release all ${lois.length} pending decision(s) and send email notifications to applicants. Decisions will become visible on applicant dashboards immediately.`
                  : `This will release ${selectedIds.size} selected decision(s) and send email notifications to applicants. Decisions will become visible on applicant dashboards immediately.`}
              </DialogDescription>
            </DialogHeader>

            {releaseMode !== 'all' && selectedIds.size > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1 py-2">
                {filteredLois
                  .filter((l) => selectedIds.has(l.id))
                  .map((loi) => (
                    <div
                      key={loi.id}
                      className="flex items-center justify-between text-sm px-3 py-1.5 bg-gray-50 rounded-lg"
                    >
                      <span className="truncate text-gray-700">
                        {loi.organization.legalName}
                      </span>
                      <GlassBadge
                        variant={loi.status === 'APPROVED' ? 'success' : 'error'}
                        size="sm"
                      >
                        {loi.status === 'APPROVED' ? 'Approved' : 'Declined'}
                      </GlassBadge>
                    </div>
                  ))}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRelease}
                disabled={releasing}
                className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
              >
                {releasing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Release & Notify
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
