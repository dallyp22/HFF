'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface InfoResponseFormProps {
  applicationId: string
  communicationId: string
  message: string
  responseDeadline: string | null
}

export function InfoResponseForm({
  applicationId,
  communicationId,
  message,
  responseDeadline,
}: InfoResponseFormProps) {
  const router = useRouter()
  const [response, setResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!response.trim()) {
      toast.error('Please enter a response')
      return
    }

    setSubmitting(true)
    try {
      const result = await fetch(`/api/applications/${applicationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationId,
          response: response.trim(),
        }),
      })

      if (result.ok) {
        toast.success('Response submitted successfully')
        router.refresh()
      } else {
        const error = await result.json()
        toast.error(error.error || 'Failed to submit response')
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      toast.error('Failed to submit response')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription>
        <p className="font-medium text-amber-900 mb-2">Action Required</p>
        <p className="text-amber-800 mb-4">
          The foundation has requested additional information:
        </p>
        <Card className="bg-white">
          <CardContent className="pt-4">
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{message}</p>
            {responseDeadline && (
              <p className="text-sm text-gray-600">
                Response due: {format(new Date(responseDeadline), 'MMMM d, yyyy')}
              </p>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="response">Your Response</Label>
            <Textarea
              id="response"
              placeholder="Enter your response here..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={5}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || !response.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </form>
      </AlertDescription>
    </Alert>
  )
}
