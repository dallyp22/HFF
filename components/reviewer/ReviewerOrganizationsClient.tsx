'use client'

import { useState, useMemo } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer } from '@/components/motion/StaggerContainer'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Building2,
  MapPin,
  DollarSign,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  LayoutGrid,
  LayoutList,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface Organization {
  id: string
  legalName: string
  city: string | null
  state: string | null
  annualBudget: number | null
  profileComplete: boolean
  applicationCount: number
  lastApplicationDate: string | null
}

interface ReviewerOrganizationsClientProps {
  organizations: Organization[]
  initialSearch?: string
}

export function ReviewerOrganizationsClient({
  organizations,
  initialSearch = '',
}: ReviewerOrganizationsClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'applications' | 'budget'>('name')
  const [showFilters, setShowFilters] = useState(false)
  const [filterComplete, setFilterComplete] = useState<'all' | 'complete' | 'incomplete'>('all')

  const filteredOrganizations = useMemo(() => {
    let filtered = organizations.filter((org) => {
      const matchesSearch =
        !searchQuery ||
        org.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.state?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesComplete =
        filterComplete === 'all' ||
        (filterComplete === 'complete' && org.profileComplete) ||
        (filterComplete === 'incomplete' && !org.profileComplete)

      return matchesSearch && matchesComplete
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.legalName.localeCompare(b.legalName)
        case 'recent':
          if (!a.lastApplicationDate && !b.lastApplicationDate) return 0
          if (!a.lastApplicationDate) return 1
          if (!b.lastApplicationDate) return -1
          return new Date(b.lastApplicationDate).getTime() - new Date(a.lastApplicationDate).getTime()
        case 'applications':
          return b.applicationCount - a.applicationCount
        case 'budget':
          return (b.annualBudget || 0) - (a.annualBudget || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [organizations, searchQuery, sortBy, filterComplete])

  const stats = useMemo(() => {
    const complete = organizations.filter((o) => o.profileComplete).length
    const totalApplications = organizations.reduce((sum, o) => sum + o.applicationCount, 0)
    const withBudget = organizations.filter((o) => o.annualBudget)
    const avgBudget =
      withBudget.length > 0
        ? withBudget.reduce((sum, o) => sum + (o.annualBudget || 0), 0) / withBudget.length
        : 0

    return {
      total: organizations.length,
      complete,
      incomplete: organizations.length - complete,
      totalApplications,
      avgBudget,
    }
  }, [organizations])

  const clearFilters = () => {
    setSearchQuery('')
    setFilterComplete('all')
    setSortBy('name')
  }

  const hasActiveFilters = searchQuery || filterComplete !== 'all' || sortBy !== 'name'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                <Building2 className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
                <p className="text-gray-600">Manage registered nonprofit organizations</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats Row */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--hff-slate)]/10">
                  <Building2 className="w-5 h-5 text-[var(--hff-slate)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter value={stats.total} />
                  </p>
                  <p className="text-xs text-gray-500">Total Organizations</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter value={stats.complete} />
                  </p>
                  <p className="text-xs text-gray-500">Profiles Complete</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter value={stats.totalApplications} />
                  </p>
                  <p className="text-xs text-gray-500">Total Applications</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--hff-gold)]/20">
                  <DollarSign className="w-5 h-5 text-[var(--hff-gold)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    $<AnimatedCounter value={Math.round(stats.avgBudget / 1000)} />K
                  </p>
                  <p className="text-xs text-gray-500">Avg Budget</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </FadeIn>

        {/* Search and Filters Bar */}
        <FadeIn delay={0.15}>
          <GlassCard className="mb-6 p-4" hover={false}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/20 focus:border-[var(--hff-teal)] transition-all"
                />
              </div>

              {/* Controls */}
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
                      {/* Profile Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Profile Status
                        </label>
                        <select
                          value={filterComplete}
                          onChange={(e) => setFilterComplete(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/20 focus:border-[var(--hff-teal)]"
                        >
                          <option value="all">All Organizations</option>
                          <option value="complete">Profile Complete</option>
                          <option value="incomplete">Profile Incomplete</option>
                        </select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Sort By
                        </label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/20 focus:border-[var(--hff-teal)]"
                        >
                          <option value="name">Name (A-Z)</option>
                          <option value="recent">Most Recent Activity</option>
                          <option value="applications">Most Applications</option>
                          <option value="budget">Largest Budget</option>
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

        {/* Results Count */}
        <FadeIn delay={0.2}>
          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredOrganizations.length} of {organizations.length} organizations
          </p>
        </FadeIn>

        {/* Organizations List/Grid */}
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
                  {filteredOrganizations.map((org, index) => (
                    <FadeIn key={org.id} delay={0.05 * Math.min(index, 10)}>
                      <OrganizationListItem organization={org} />
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
                  {filteredOrganizations.map((org, index) => (
                    <FadeIn key={org.id} delay={0.05 * Math.min(index, 10)}>
                      <OrganizationGridItem organization={org} />
                    </FadeIn>
                  ))}
                </div>
              </StaggerContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredOrganizations.length === 0 && (
          <FadeIn>
            <GlassCard className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'No organizations have registered yet.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </GlassCard>
          </FadeIn>
        )}
      </div>
    </div>
  )
}

// Generate initials from organization name
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()
}

// Get a consistent color based on organization name
function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-[var(--hff-teal)]/10', text: 'text-[var(--hff-teal)]' },
    { bg: 'bg-[var(--hff-sage)]/20', text: 'text-[var(--hff-sage)]' },
    { bg: 'bg-[var(--hff-gold)]/20', text: 'text-[var(--hff-gold)]' },
    { bg: 'bg-blue-100', text: 'text-blue-600' },
    { bg: 'bg-purple-100', text: 'text-purple-600' },
    { bg: 'bg-rose-100', text: 'text-rose-600' },
  ]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

function OrganizationListItem({ organization }: { organization: Organization }) {
  const avatarColor = getAvatarColor(organization.legalName)

  return (
    <Link href={`/reviewer/organizations/${organization.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group relative"
      >
        <GlassCard className="p-0 overflow-hidden" hover={false}>
          {/* Status Accent Bar */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-1 ${
              organization.profileComplete
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-500'
                : 'bg-gradient-to-b from-amber-400 to-amber-500'
            }`}
          />

          <div className="pl-5 pr-4 py-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-xl ${avatarColor.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform mt-0.5`}>
                <span className={`text-sm font-bold ${avatarColor.text}`}>
                  {getInitials(organization.legalName)}
                </span>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Name Row - Full name visible */}
                <div className="flex flex-wrap items-start gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[var(--hff-teal)] transition-colors">
                    {organization.legalName}
                  </h3>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                    organization.profileComplete
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                      : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                  }`}>
                    {organization.profileComplete ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Pending
                      </>
                    )}
                  </div>
                </div>

                {/* Location */}
                {organization.city && organization.state && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {organization.city}, {organization.state}
                  </p>
                )}
              </div>

              {/* Metrics */}
              <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
                {/* Budget */}
                <div className="text-right min-w-[90px]">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Budget</p>
                  <p className="text-lg font-bold text-gray-900">
                    {organization.annualBudget
                      ? `$${(organization.annualBudget / 1000).toFixed(0)}K`
                      : '—'
                    }
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-gray-200" />

                {/* Applications */}
                <div className="text-right min-w-[90px]">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Applications</p>
                  <p className="text-lg font-bold text-gray-900 flex items-center justify-end gap-1">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {organization.applicationCount}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px h-10 bg-gray-200" />

                {/* Last Submitted */}
                <div className="text-right min-w-[100px]">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Last Submitted</p>
                  <p className="text-sm font-medium text-gray-600">
                    {organization.lastApplicationDate
                      ? format(new Date(organization.lastApplicationDate), 'MMM d, yyyy')
                      : '—'
                    }
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[var(--hff-teal)]/10 transition-colors flex-shrink-0">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[var(--hff-teal)] transition-colors" />
              </div>
            </div>

            {/* Mobile/Tablet Metrics */}
            <div className="lg:hidden mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  {organization.annualBudget
                    ? `$${(organization.annualBudget / 1000).toFixed(0)}K`
                    : '—'
                  }
                </span>
                <span className="flex items-center gap-1.5 text-gray-600">
                  <FileText className="w-4 h-4 text-gray-400" />
                  {organization.applicationCount} apps
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {organization.lastApplicationDate
                  ? format(new Date(organization.lastApplicationDate), 'MMM d, yyyy')
                  : 'No submissions'
                }
              </span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </Link>
  )
}

function OrganizationGridItem({ organization }: { organization: Organization }) {
  const avatarColor = getAvatarColor(organization.legalName)

  return (
    <Link href={`/reviewer/organizations/${organization.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <GlassCard className="p-0 overflow-hidden h-full flex flex-col" hover={false}>
          {/* Header with gradient based on status */}
          <div className={`p-4 ${
            organization.profileComplete
              ? 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50'
              : 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-14 h-14 rounded-xl ${avatarColor.bg} flex items-center justify-center shadow-sm`}>
                <span className={`text-lg font-bold ${avatarColor.text}`}>
                  {getInitials(organization.legalName)}
                </span>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${
                organization.profileComplete
                  ? 'bg-white/80 text-emerald-600 border border-emerald-200/50'
                  : 'bg-white/80 text-amber-600 border border-amber-200/50'
              }`}>
                {organization.profileComplete ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Complete
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    Pending
                  </>
                )}
              </div>
            </div>

            {/* Organization Name */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[48px] mb-1">
              {organization.legalName}
            </h3>

            {/* Location */}
            {organization.city && organization.state && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {organization.city}, {organization.state}
              </p>
            )}
          </div>

          {/* Stats Section */}
          <div className="p-4 flex-1 flex flex-col justify-end">
            {/* Budget Display */}
            {organization.annualBudget && (
              <div className="mb-4 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Annual Budget</span>
                  <TrendingUp className="w-4 h-4 text-[var(--hff-sage)]" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${organization.annualBudget.toLocaleString()}
                </p>
              </div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-lg font-bold text-gray-900">{organization.applicationCount}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Applications</p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-50/50 border border-purple-100/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {organization.lastApplicationDate
                        ? format(new Date(organization.lastApplicationDate), 'MMM d')
                        : '—'
                      }
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Submitted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <span className="text-xs text-gray-500">View Details</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </GlassCard>
      </motion.div>
    </Link>
  )
}
