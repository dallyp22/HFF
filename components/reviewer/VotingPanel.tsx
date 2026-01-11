'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'
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

interface VotingPanelProps {
  applicationId: string
  currentUserId: string
}

export function VotingPanel({ applicationId, currentUserId }: VotingPanelProps) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedVote, setSelectedVote] = useState<'APPROVE' | 'DECLINE' | ''>('')
  const [reasoning, setReasoning] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const userVote = votes.find(v => v.reviewerId === currentUserId)
  const approveCount = votes.filter(v => v.vote === 'APPROVE').length
  const declineCount = votes.filter(v => v.vote === 'DECLINE').length
  const abstainCount = votes.filter(v => v.vote === 'ABSTAIN').length

  useEffect(() => {
    loadVotes()
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
        setVotes(prevVotes => {
          const filtered = prevVotes.filter(v => v.reviewerId !== currentUserId)
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
    <div className="space-y-6">
      {/* Vote Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Voting Summary</CardTitle>
          <CardDescription>{votes.length} reviewer(s) have voted</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-600">{approveCount}</p>
              <p className="text-sm text-gray-600">Approve</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <ThumbsDown className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-3xl font-bold text-red-600">{declineCount}</p>
              <p className="text-sm text-gray-600">Decline</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-3xl font-bold text-gray-600">{abstainCount}</p>
              <p className="text-sm text-gray-600">Abstain</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                {userVote ? 'Change Your Vote' : 'Cast Your Vote'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cast Your Vote</DialogTitle>
                <DialogDescription>
                  Your vote will be visible to all reviewers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button
                    variant={selectedVote === 'APPROVE' ? 'default' : 'outline'}
                    onClick={() => setSelectedVote('APPROVE')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={selectedVote === 'DECLINE' ? 'default' : 'outline'}
                    onClick={() => setSelectedVote('DECLINE')}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reasoning (Optional)</label>
                  <Textarea
                    placeholder="Explain your vote..."
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitVote}
                    disabled={!selectedVote || submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Vote'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Individual Votes */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Votes</CardTitle>
        </CardHeader>
        <CardContent>
          {votes.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No votes cast yet</p>
          ) : (
            <div className="space-y-3">
              {votes.map(vote => (
                <div
                  key={vote.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                    vote.reviewerId === currentUserId
                      ? 'border-[var(--hff-teal)] bg-[var(--hff-teal-50)]'
                      : 'border-gray-200'
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>{vote.reviewerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium">{vote.reviewerName}</p>
                      {vote.reviewerId === currentUserId && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                      <Badge
                        className={
                          vote.vote === 'APPROVE'
                            ? 'bg-green-100 text-green-700'
                            : vote.vote === 'DECLINE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {vote.vote}
                      </Badge>
                    </div>
                    {vote.reasoning && (
                      <p className="text-sm text-gray-700 mb-2">{vote.reasoning}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(vote.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
