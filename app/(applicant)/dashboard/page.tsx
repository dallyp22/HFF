import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { AlertCircle, FileText, Upload, User } from 'lucide-react'
import { calculateProfileCompletion } from '@/lib/validation/profile'
import type { Application } from '@prisma/client'

export default async function DashboardPage() {
  const clerkUser = await currentUser()

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser!.id },
    include: {
      organization: {
        include: {
          applications: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      },
    },
  })

  const organization = user?.organization
  const profileCompletion = organization ? calculateProfileCompletion(organization as any) : 0
  const applications: Application[] = organization?.applications || []

  const stats = {
    draft: applications.filter((a: Application) => a.status === 'DRAFT').length,
    submitted: applications.filter((a: Application) => a.status === 'SUBMITTED').length,
    underReview: applications.filter((a: Application) => a.status === 'UNDER_REVIEW').length,
    approved: applications.filter((a: Application) => a.status === 'APPROVED').length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Welcome, {clerkUser?.firstName || 'there'}!</h1>
        <p className="text-gray-600 mb-8">Manage your grant applications</p>

        {!organization && (
          <Alert className="mb-8 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <p className="font-medium mb-2">Get Started</p>
              <p className="mb-3">Complete your organization profile to begin submitting grant applications.</p>
              <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                <Link href="/profile/edit">Create Profile</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {organization && profileCompletion < 100 && (
          <Alert className="mb-8 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <p className="font-medium mb-2">Profile Incomplete ({profileCompletion}%)</p>
              <p className="mb-3">Complete your organization profile to submit applications.</p>
              <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                <Link href="/profile/edit">Complete Profile</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Grant Cycle</CardTitle>
              <CardDescription>Spring 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-[var(--hff-teal)] mb-2">February 15, 2026</p>
              <p className="text-sm text-gray-600">LOI Deadline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Applications</CardTitle>
              <CardDescription>Application summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-2xl font-bold">{stats.draft}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold">{stats.submitted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold">{stats.underReview}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/applications/new">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--hff-teal)]" />
                  New Application
                </CardTitle>
                <CardDescription>Start a new grant application</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/documents">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-[var(--hff-teal)]" />
                  Upload Documents
                </CardTitle>
                <CardDescription>Manage your document library</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/profile">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--hff-teal)]" />
                  Edit Profile
                </CardTitle>
                <CardDescription>Update organization details</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {applications.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.slice(0, 5).map((app: Application) => (
                  <div key={app.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{app.projectTitle || 'Untitled Application'}</p>
                      <p className="text-sm text-gray-600">
                        {app.grantCycle} {app.cycleYear} • {app.status}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/applications/${app.id}`}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
