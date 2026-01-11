'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StatusChangeDialogProps {
  applicationId: string
  currentStatus: string
  approveVotes: number
  declineVotes: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_OPTIONS = [
  { value: 'UNDER_REVIEW', label: 'Under Review', from: ['SUBMITTED', 'INFO_REQUESTED'] },
  { value: 'INFO_REQUESTED', label: 'Request Information', from: ['UNDER_REVIEW'] },
  { value: 'APPROVED', label: 'Approve Application', from: ['UNDER_REVIEW'] },
  { value: 'DECLINED', label: 'Decline Application', from: ['UNDER_REVIEW'] },
]

export function StatusChangeDialog({
  applicationId,
  currentStatus,
  approveVotes,
  declineVotes,
  open,
  onOpenChange,
}: StatusChangeDialogProps) {
  const router = useRouter()
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const availableStatuses = STATUS_OPTIONS.filter(option =>
    option.from.includes(currentStatus)
  )

  async function handleConfirm() {
    if (!newStatus) {
      toast.error('Please select a status')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          reason: reason.trim() || null,
        }),
      })

      if (response.ok) {
        toast.success('Application status updated successfully')
        onOpenChange(false)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change Application Status</DialogTitle>
          <DialogDescription>
            Update the status of this grant application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Status */}
          <div>
            <Label>Current Status</Label>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-700">
                {currentStatus.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* Voting Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reviewer Votes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{approveVotes}</p>
                    <p className="text-xs text-gray-600">Approve</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold text-red-600">{declineVotes}</p>
                    <p className="text-xs text-gray-600">Decline</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Status Selection */}
          <div className="space-y-2">
            <Label>New Status *</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              placeholder="Reason for this status change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Warning for final decisions */}
          {(newStatus === 'APPROVED' || newStatus === 'DECLINED') && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a final decision. The applicant will be notified via email (when configured).
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!newStatus || submitting}
            >
              {submitting ? 'Updating...' : 'Confirm Change'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
