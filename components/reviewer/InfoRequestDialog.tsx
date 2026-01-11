'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InfoRequestDialogProps {
  applicationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InfoRequestDialog({
  applicationId,
  open,
  onOpenChange,
}: InfoRequestDialogProps) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [deadline, setDeadline] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit() {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setSending(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/request-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          responseDeadline: deadline || null,
        }),
      })

      if (response.ok) {
        toast.success('Information request sent to applicant')
        setMessage('')
        setDeadline('')
        onOpenChange(false)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send request')
      }
    } catch (error) {
      console.error('Error sending info request:', error)
      toast.error('Failed to send request')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Additional Information</DialogTitle>
          <DialogDescription>
            Ask the applicant for clarifications or additional materials
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message to Applicant *</Label>
            <Textarea
              id="message"
              placeholder="Please provide more detail about your measurement methodology for tracking literacy improvements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
            <p className="text-sm text-gray-600">
              This message will be visible to the applicant in their portal
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Response Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will change the application status to "Info Requested" and notify the applicant to respond.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || sending}
            >
              {sending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
