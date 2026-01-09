import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Application } from '@prisma/client'

export default async function ReviewerDashboardPage() {
  const user = await currentUser()

  // Get active grant cycle
  const activeCycle = await prisma.grantCycleConfig.findFirst({
    where: { isActive: true },
  })

  // Get applications for active cycle
  const applications = await prisma.application.findMany({
    where: activeCycle ? {
      grantCycle: activeCycle.cycle,
      cycleYear: activeCycle.year,
    } : undefined,
    include: {
      organization: {
        select: {
          legalName: true,
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
  })

  const stats = {
    total: applications.length,
    submitted: applications.filter((a: Application) => a.status === 'SUBMITTED').length,
    underReview: applications.filter((a: Application) => a.status === 'UNDER_REVIEW').length,
    infoRequested: applications.filter((a: Application) => a.status === 'INFO_REQUESTED').length,
    approved: applications.filter((a: Application) => a.status === 'APPROVED').length,
    declined: applications.filter((a: Application) => a.status === 'DECLINED').length,
  }

  const totalRequested = applications
    .filter((a: Application) => a.amountRequested)
    .reduce((sum: number, a: Application) => sum + parseFloat(a.amountRequested?.toString() || '0'), 0)

  const averageRequest = stats.total > 0 ? totalRequested / stats.total : 0

  const needsAttention = applications
    .filter((a: Application) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')
    .sort((a, b) => {
      const aDate = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const bDate = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return aDate - bDate
    })
    .slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reviewer Dashboard</h1>
          <p className="text-gray-600">
            {activeCycle ? `${activeCycle.cycle} ${activeCycle.year} Grant Cycle` : 'No active cycle'}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Review</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.submitted + stats.underReview}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Info Requested</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{stats.infoRequested}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Decided</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.approved + stats.declined}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Requested</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[var(--hff-teal)]">
                ${totalRequested.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[var(--hff-slate)]">
                ${Math.round(averageRequest).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Needs Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Needs Attention
            </CardTitle>
            <CardDescription>Applications waiting longest for review</CardDescription>
          </CardHeader>
          <CardContent>
            {needsAttention.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>All caught up! No applications pending review.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {needsAttention.map((app: any) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{app.organization.legalName}</p>
                      <p className="text-sm text-gray-600">
                        {app.projectTitle || 'Untitled'} • 
                        {app.submittedAt && ` ${formatDistanceToNow(new Date(app.submittedAt), { addSuffix: true })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{app.status.replace(/_/g, ' ')}</Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/reviewer/applications/${app.id}`}>Review</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/reviewer/applications">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-[var(--hff-teal)]" />
                  All Applications
                </CardTitle>
                <CardDescription>View and filter all applications</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/reviewer/organizations">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-[var(--hff-teal)]" />
                  Organizations
                </CardTitle>
                <CardDescription>View organization profiles</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/reviewer/admin">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-[var(--hff-teal)]" />
                  Admin
                </CardTitle>
                <CardDescription>Manage cycles and settings</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
