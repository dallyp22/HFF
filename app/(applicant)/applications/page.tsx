import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { format } from 'date-fns'
import type { Application } from '@prisma/client'

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  INFO_REQUESTED: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
}

export default async function ApplicationsPage() {
  const clerkUser = await currentUser()

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser!.id },
    include: {
      organization: {
        include: {
          applications: {
            orderBy: { updatedAt: 'desc' },
          },
        },
      },
    },
  })

  const organization = user?.organization
  const applications: Application[] = organization?.applications || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Applications</h1>
            <p className="text-gray-600 mt-1">Manage your grant applications</p>
          </div>
          {organization?.profileComplete && (
            <Button asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-dark)]">
              <Link href="/applications/new">
                <Plus className="h-4 w-4 mr-2" />
                New Application
              </Link>
            </Button>
          )}
        </div>

        {!organization?.profileComplete && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <p className="font-medium text-orange-900 mb-2">Profile Incomplete</p>
              <p className="text-orange-800 mb-4">
                Complete your organization profile before creating applications.
              </p>
              <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Link href="/profile/edit">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Create your first grant application to get started with the HFF grant process.
              </p>
              {organization?.profileComplete && (
                <Button asChild>
                  <Link href="/applications/new">Create Application</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app: Application) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {app.projectTitle || 'Untitled Application'}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {app.grantCycle} {app.cycleYear} • 
                        {app.amountRequested && ` $${app.amountRequested.toLocaleString()} requested`}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[app.status]}>
                      {app.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {app.submittedAt ? (
                        <span>Submitted {format(new Date(app.submittedAt), 'MMM d, yyyy')}</span>
                      ) : (
                        <span>Last saved {app.lastSavedAt ? format(new Date(app.lastSavedAt), 'MMM d, yyyy h:mm a') : 'Never'}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/applications/${app.id}`}>
                          {app.status === 'DRAFT' ? 'Continue' : 'View'}
                        </Link>
                      </Button>
                      {app.status === 'DRAFT' && (
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
