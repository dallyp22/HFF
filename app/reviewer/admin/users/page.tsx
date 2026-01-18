'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  MoreVertical,
  UserPlus,
  Loader2,
  ArrowLeft,
  Shield,
  Crown,
  User,
  Search,
  Mail,
  Calendar,
} from 'lucide-react'
import { InviteReviewerDialog } from '@/components/admin/InviteReviewerDialog'
import { RemoveUserDialog } from '@/components/admin/RemoveUserDialog'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Reviewer {
  id: string
  userId: string
  role: string
  createdAt: string
  publicUserData: {
    firstName?: string
    lastName?: string
    identifier: string
  }
}

const ROLE_DISPLAY: Record<string, string> = {
  admin: 'Admin',
  'org:admin': 'Admin',
  'org:manager': 'Manager',
  'org:member': 'Member',
}

const ROLE_CONFIG: Record<string, { color: string; icon: React.ReactNode; bgColor: string }> = {
  Admin: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: <Crown className="w-3.5 h-3.5" />,
  },
  Manager: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  Member: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <User className="w-3.5 h-3.5" />,
  },
}

export default function ManageReviewersPage() {
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [filteredReviewers, setFilteredReviewers] = useState<Reviewer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Reviewer | null>(null)
  const [changingRole, setChangingRole] = useState<string | null>(null)

  const fetchReviewers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch reviewers')
      const data = await response.json()
      setReviewers(data.reviewers || [])
      setFilteredReviewers(data.reviewers || [])
    } catch (error) {
      console.error('Error fetching reviewers:', error)
      toast.error('Failed to load reviewers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviewers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReviewers(reviewers)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredReviewers(
        reviewers.filter((reviewer) => {
          const name =
            `${reviewer.publicUserData.firstName || ''} ${reviewer.publicUserData.lastName || ''}`.toLowerCase()
          const email = reviewer.publicUserData.identifier.toLowerCase()
          return name.includes(query) || email.includes(query)
        })
      )
    }
  }, [searchQuery, reviewers])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRole(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to change role')
      }

      toast.success('Role updated successfully')
      await fetchReviewers()
    } catch (error: any) {
      console.error('Error changing role:', error)
      toast.error(error.message || 'Failed to change role')
    } finally {
      setChangingRole(null)
    }
  }

  const handleRemoveUser = (reviewer: Reviewer) => {
    setSelectedUser(reviewer)
    setRemoveDialogOpen(true)
  }

  const onRemoveSuccess = () => {
    fetchReviewers()
    setRemoveDialogOpen(false)
    setSelectedUser(null)
  }

  const getDisplayName = (reviewer: Reviewer) => {
    const { firstName, lastName } = reviewer.publicUserData
    if (firstName || lastName) {
      return `${firstName || ''} ${lastName || ''}`.trim()
    }
    return reviewer.publicUserData.identifier.split('@')[0]
  }

  const getInitials = (reviewer: Reviewer) => {
    const { firstName, lastName } = reviewer.publicUserData
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) {
      return firstName.slice(0, 2).toUpperCase()
    }
    return reviewer.publicUserData.identifier.slice(0, 2).toUpperCase()
  }

  // Count by role
  const adminCount = reviewers.filter((r) => ROLE_DISPLAY[r.role] === 'Admin').length
  const managerCount = reviewers.filter((r) => ROLE_DISPLAY[r.role] === 'Manager').length
  const memberCount = reviewers.filter((r) => ROLE_DISPLAY[r.role] === 'Member').length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-64 bg-gray-100 rounded-xl" />
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

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Reviewers</h1>
                <p className="text-gray-600">
                  <AnimatedCounter value={reviewers.length} /> reviewer
                  {reviewers.length !== 1 ? 's' : ''} in system
                </p>
              </div>
            </div>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
            >
              <UserPlus className="w-4 h-4" />
              Invite Reviewer
            </Button>
          </div>
        </FadeIn>

        {/* Stats Row */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <GlassCard className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-100 flex items-center justify-center">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={adminCount} />
              </p>
              <p className="text-sm text-gray-500">Admins</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={managerCount} />
              </p>
              <p className="text-sm text-gray-500">Managers</p>
            </GlassCard>

            <GlassCard className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gray-100 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <AnimatedCounter value={memberCount} />
              </p>
              <p className="text-sm text-gray-500">Members</p>
            </GlassCard>
          </div>
        </FadeIn>

        {/* Search */}
        <FadeIn delay={0.15}>
          <GlassCard className="p-4 mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search reviewers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50"
              />
            </div>
          </GlassCard>
        </FadeIn>

        {/* Reviewers List */}
        <FadeIn delay={0.2}>
          <GlassCard className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Users className="w-5 h-5 text-[var(--hff-teal)]" />
              Team Members
            </h2>

            {filteredReviewers.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No Results Found' : 'No Reviewers Yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? 'No reviewers match your search'
                    : 'Invite your first reviewer to get started'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setInviteDialogOpen(true)}
                    className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
                  >
                    <UserPlus className="w-4 h-4" />
                    Invite Reviewer
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredReviewers.map((reviewer, index) => {
                    const roleDisplay = ROLE_DISPLAY[reviewer.role] || 'Member'
                    const roleConfig = ROLE_CONFIG[roleDisplay] || ROLE_CONFIG.Member
                    const isChanging = changingRole === reviewer.userId

                    return (
                      <motion.div
                        key={reviewer.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors group"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--hff-teal)] to-[var(--hff-slate)] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {getInitials(reviewer)}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {getDisplayName(reviewer)}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="w-3.5 h-3.5" />
                              {reviewer.publicUserData.identifier}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-400">
                              <Calendar className="w-3.5 h-3.5" />
                              Joined {new Date(reviewer.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Role Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${roleConfig.bgColor} ${roleConfig.color}`}
                        >
                          {roleConfig.icon}
                          {roleDisplay}
                        </span>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isChanging}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {isChanging ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(reviewer.userId, 'org:admin')}
                              disabled={roleDisplay === 'Admin'}
                              className="gap-2"
                            >
                              <Crown className="w-4 h-4 text-purple-600" />
                              Change to Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(reviewer.userId, 'org:manager')}
                              disabled={roleDisplay === 'Manager'}
                              className="gap-2"
                            >
                              <Shield className="w-4 h-4 text-blue-600" />
                              Change to Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(reviewer.userId, 'org:member')}
                              disabled={roleDisplay === 'Member'}
                              className="gap-2"
                            >
                              <User className="w-4 h-4 text-gray-600" />
                              Change to Member
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleRemoveUser(reviewer)}
                              className="text-red-600 focus:text-red-600 gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </GlassCard>
        </FadeIn>

        {/* Dialogs */}
        <InviteReviewerDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onSuccess={() => {
            fetchReviewers()
            setInviteDialogOpen(false)
          }}
        />

        {selectedUser && (
          <RemoveUserDialog
            open={removeDialogOpen}
            onOpenChange={setRemoveDialogOpen}
            user={selectedUser}
            onSuccess={onRemoveSuccess}
          />
        )}
      </div>
    </div>
  )
}
