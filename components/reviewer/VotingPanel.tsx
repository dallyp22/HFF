'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ThumbsUp,
  ThumbsDown,
  Circle,
  CheckCircle2,
  XCircle,
  Minus,
  Users,
  Clock,
  User,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Vote {
  id: string
  reviewerId: string
  reviewerName: string
  vote: 'APPROVE' | 'DECLINE' | 'ABSTAIN'
  reasoning: string | null
  createdAt: string
  updatedAt: string
}

interface Reviewer {
  id: string
  name: string
  email: string
}

interface VotingPanelProps {
  applicationId: string
  currentUserId: string
}

export function VotingPanel({ applicationId, currentUserId }: VotingPanelProps) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedVote, setSelectedVote] = useState<'APPROVE' | 'DECLINE' | 'ABSTAIN' | ''>('')
  const [reasoning, setReasoning] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const userVote = votes.find((v) => v.reviewerId === currentUserId)
  const approveCount = votes.filter((v) => v.vote === 'APPROVE').length
  const declineCount = votes.filter((v) => v.vote === 'DECLINE').length
  const abstainCount = votes.filter((v) => v.vote === 'ABSTAIN').length

  // Create combined reviewer list with vote status
  const reviewerVoteStatus = reviewers.map((reviewer) => {
    const vote = votes.find((v) => v.reviewerId === reviewer.id)
    return {
      ...reviewer,
      vote: vote?.vote || null,
      reasoning: vote?.reasoning || null,
      votedAt: vote?.createdAt || null,
    }
  })

  const votedCount = reviewerVoteStatus.filter((r) => r.vote).length
  const totalVotes = approveCount + declineCount + abstainCount

  useEffect(() => {
    Promise.all([loadVotes(), loadReviewers()])
  }, [applicationId])

  async function loadVotes() {
    try {
      const response = await fetch(`/api/applications/${applicationId}/votes`)
      if (response.ok) {
        const data = await response.json()
        setVotes(data)
      }
    } catch (error) {
      console.error('Error loading votes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadReviewers() {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        const reviewerList = data.map((member: any) => ({
          id: member.publicUserData?.userId || member.id,
          name:
            `${member.publicUserData?.firstName || ''} ${member.publicUserData?.lastName || ''}`.trim() ||
            member.publicUserData?.identifier ||
            'Unknown',
          email: member.publicUserData?.identifier || '',
        }))
        setReviewers(reviewerList)
      }
    } catch (error) {
      console.error('Error loading reviewers:', error)
      const uniqueReviewers = votes.map((v) => ({
        id: v.reviewerId,
        name: v.reviewerName,
        email: '',
      }))
      setReviewers(uniqueReviewers)
    }
  }

  async function handleSubmitVote() {
    if (!selectedVote) {
      toast.error('Please select a vote')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vote: selectedVote,
          reasoning: reasoning.trim() || null,
        }),
      })

      if (response.ok) {
        const newVote = await response.json()
        setVotes((prevVotes) => {
          const filtered = prevVotes.filter((v) => v.reviewerId !== currentUserId)
          return [newVote, ...filtered]
        })
        toast.success('Vote submitted successfully')
        setDialogOpen(false)
        setSelectedVote('')
        setReasoning('')
      } else {
        toast.error('Failed to submit vote')
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      toast.error('Failed to submit vote')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Vote Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-4"
      >
        {/* Approve Card */}
        <GlassCard className="p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10" />
          <div className="relative">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-emerald-600" />
            </div>
            <motion.p
              key={approveCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-emerald-600"
            >
              {approveCount}
            </motion.p>
            <p className="text-sm text-gray-600 mt-1">Approve</p>
          </div>
        </GlassCard>

        {/* Decline Card */}
        <GlassCard className="p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-500/10" />
          <div className="relative">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-red-100 flex items-center justify-center">
              <ThumbsDown className="w-6 h-6 text-red-600" />
            </div>
            <motion.p
              key={declineCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-red-600"
            >
              {declineCount}
            </motion.p>
            <p className="text-sm text-gray-600 mt-1">Decline</p>
          </div>
        </GlassCard>

        {/* Abstain Card */}
        <GlassCard className="p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-500/10" />
          <div className="relative">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
              <Minus className="w-6 h-6 text-gray-600" />
            </div>
            <motion.p
              key={abstainCount}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-gray-600"
            >
              {abstainCount}
            </motion.p>
            <p className="text-sm text-gray-600 mt-1">Abstain</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Cast Vote Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className={`w-full gap-2 ${
                userVote
                  ? 'bg-[var(--hff-slate)] hover:bg-[var(--hff-slate)]/90'
                  : 'bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90'
              }`}
              size="lg"
            >
              {userVote ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Change Your Vote
                </>
              ) : (
                <>
                  <ThumbsUp className="w-5 h-5" />
                  Cast Your Vote
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--hff-teal)]" />
                Cast Your Vote
              </DialogTitle>
              <DialogDescription>
                Your vote will be visible to all board members
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 pt-2">
              {/* Vote Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedVote('APPROVE')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedVote === 'APPROVE'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <ThumbsUp
                    className={`w-6 h-6 ${
                      selectedVote === 'APPROVE' ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="font-medium">Approve</span>
                </button>
                <button
                  onClick={() => setSelectedVote('DECLINE')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedVote === 'DECLINE'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  <ThumbsDown
                    className={`w-6 h-6 ${
                      selectedVote === 'DECLINE' ? 'text-red-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="font-medium">Decline</span>
                </button>
                <button
                  onClick={() => setSelectedVote('ABSTAIN')}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedVote === 'ABSTAIN'
                      ? 'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
                  }`}
                >
                  <Minus
                    className={`w-6 h-6 ${
                      selectedVote === 'ABSTAIN' ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  />
                  <span className="font-medium">Abstain</span>
                </button>
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Reasoning <span className="text-gray-400">(Optional)</span>
                </label>
                <Textarea
                  placeholder="Share your thoughts on this application..."
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitVote}
                  disabled={!selectedVote || submitting}
                  className={
                    selectedVote === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : selectedVote === 'DECLINE'
                        ? 'bg-red-600 hover:bg-red-700'
                        : selectedVote === 'ABSTAIN'
                          ? 'bg-gray-600 hover:bg-gray-700'
                          : ''
                  }
                >
                  {submitting ? 'Submitting...' : 'Submit Vote'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Board Votes List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Users className="w-5 h-5 text-[var(--hff-teal)]" />
              Board Votes
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {votedCount} of {reviewers.length} cast
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-500">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="w-24 h-4 bg-gray-200 rounded" />
              </div>
            </div>
          ) : reviewerVoteStatus.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No reviewers found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {reviewerVoteStatus.map((reviewer, index) => (
                  <motion.div
                    key={reviewer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                      reviewer.id === currentUserId
                        ? 'bg-[var(--hff-teal)]/5 border border-[var(--hff-teal)]/20'
                        : 'bg-gray-50 hover:bg-gray-100/80'
                    }`}
                  >
                    {/* Vote Status Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        reviewer.vote === 'APPROVE'
                          ? 'bg-emerald-100'
                          : reviewer.vote === 'DECLINE'
                            ? 'bg-red-100'
                            : reviewer.vote === 'ABSTAIN'
                              ? 'bg-gray-200'
                              : 'bg-gray-100'
                      }`}
                    >
                      {reviewer.vote === 'APPROVE' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                      {reviewer.vote === 'DECLINE' && <XCircle className="w-5 h-5 text-red-600" />}
                      {reviewer.vote === 'ABSTAIN' && <Minus className="w-5 h-5 text-gray-500" />}
                      {!reviewer.vote && <Circle className="w-5 h-5 text-gray-300" />}
                    </div>

                    {/* Reviewer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">{reviewer.name}</span>
                        {reviewer.id === currentUserId && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--hff-teal)]/10 text-[var(--hff-teal)]">
                            You
                          </span>
                        )}
                      </div>
                      {reviewer.reasoning && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {reviewer.reasoning}
                        </p>
                      )}
                      {reviewer.votedAt && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(reviewer.votedAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>

                    {/* Vote Badge */}
                    <div className="flex-shrink-0">
                      {reviewer.vote ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reviewer.vote === 'APPROVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : reviewer.vote === 'DECLINE'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {reviewer.vote}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Pending</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Summary Footer */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              {approveCount} approve
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              {declineCount} decline
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              {abstainCount} abstain
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              {reviewers.length - votedCount} pending
            </span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
