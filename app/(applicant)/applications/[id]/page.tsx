import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { AlertCircle, FileText } from 'lucide-react'

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await currentUser()

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user!.id },
    select: { organizationId: true },
  })

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      organization: true,
      communications: {
        where: { responseRequired: true },
        orderBy: { sentAt: 'desc' },
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!application) {
    notFound()
  }

  if (application.organizationId !== dbUser?.organizationId) {
    notFound()
  }

  const pendingInfoRequest = application.communications.find(
    c => c.responseRequired && !c.responseReceivedAt
  )

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700',
    INFO_REQUESTED: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
    WITHDRAWN: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {application.projectTitle || 'Application'}
          </h1>
          <p className="text-gray-600">
            {application.grantCycle} {application.cycleYear} Grant Cycle
          </p>
        </div>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Badge className={statusColors[application.status]}>
                {application.status.replace(/_/g, ' ')}
              </Badge>
              {application.submittedAt && (
                <span className="text-sm text-gray-600">
                  Submitted {format(new Date(application.submittedAt), 'MMMM d, yyyy')}
                </span>
              )}
            </div>

            {/* Status Progress */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-4 h-4 rounded-full ${
                ['SUBMITTED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'DECLINED'].includes(application.status)
                  ? 'bg-[var(--hff-teal)]'
                  : 'bg-gray-300'
              }`} />
              <div className={`flex-1 h-1 ${
                ['UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'DECLINED'].includes(application.status)
                  ? 'bg-[var(--hff-teal)]'
                  : 'bg-gray-300'
              }`} />
              <div className={`w-4 h-4 rounded-full ${
                ['UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'DECLINED'].includes(application.status)
                  ? 'bg-[var(--hff-teal)]'
                  : 'bg-gray-300'
              }`} />
              <div className={`flex-1 h-1 ${
                ['APPROVED', 'DECLINED'].includes(application.status)
                  ? 'bg-[var(--hff-teal)]'
                  : 'bg-gray-300'
              }`} />
              <div className={`w-4 h-4 rounded-full ${
                ['APPROVED', 'DECLINED'].includes(application.status)
                  ? application.status === 'APPROVED' ? 'bg-green-600' : 'bg-red-600'
                  : 'bg-gray-300'
              }`} />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Submitted</span>
              <span>Under Review</span>
              <span>Decision</span>
            </div>
          </CardContent>
        </Card>

        {/* Information Request */}
        {pendingInfoRequest && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <p className="font-medium text-amber-900 mb-2">Action Required</p>
              <p className="text-amber-800 mb-4">
                The foundation has requested additional information:
              </p>
              <Card className="bg-white">
                <CardContent className="pt-4">
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">
                    {pendingInfoRequest.content}
                  </p>
                  {pendingInfoRequest.responseDeadline && (
                    <p className="text-sm text-gray-600">
                      Response due: {format(new Date(pendingInfoRequest.responseDeadline), 'MMMM d, yyyy')}
                    </p>
                  )}
                </CardContent>
              </Card>

              <form
                action={async (formData: FormData) => {
                  'use server'
                  const response = formData.get('response') as string
                  
                  if (!response) return
                  
                  const result = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL}/api/applications/${id}/respond`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        communicationId: pendingInfoRequest.id,
                        response,
                      }),
                    }
                  )
                  
                  if (result.ok) {
                    // Redirect will happen automatically
                  }
                }}
                className="mt-4 space-y-3"
              >
                <Label htmlFor="response">Your Response</Label>
                <Textarea
                  id="response"
                  name="response"
                  placeholder="Enter your response here..."
                  rows={5}
                  required
                />
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  Submit Response
                </Button>
              </form>
            </AlertDescription>
          </Alert>
        )}

        {/* Status History */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.statusHistory.map(history => (
                <div key={history.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="mt-1">
                    <div className="w-3 h-3 rounded-full bg-[var(--hff-teal)]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      Status changed to {history.newStatus.replace(/_/g, ' ')}
                    </p>
                    {history.reason && (
                      <p className="text-sm text-gray-600 mt-1">{history.reason}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(history.createdAt), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/applications">Back to Applications</Link>
          </Button>
          {application.status === 'DRAFT' && (
            <Button asChild>
              <Link href={`/applications/${id}/edit`}>Continue Editing</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
