import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
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

export default async function ReviewerApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cycle?: string; search?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status
  const cycleFilter = params.cycle
  const searchQuery = params.search

  const applications = await prisma.application.findMany({
    where: {
      ...(statusFilter && { status: statusFilter as any }),
      ...(cycleFilter && { grantCycle: cycleFilter as any }),
      ...(searchQuery && {
        OR: [
          { projectTitle: { contains: searchQuery, mode: 'insensitive' } },
          { organization: { legalName: { contains: searchQuery, mode: 'insensitive' } } },
        ],
      }),
    },
    include: {
      organization: {
        select: {
          legalName: true,
          city: true,
          state: true,
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">All Applications</h1>
            <p className="text-gray-600 mt-1">{applications.length} applications</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Input placeholder="Search organizations..." />
              </div>
              <div>
                <select className="w-full h-10 px-3 rounded-md border">
                  <option value="">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="INFO_REQUESTED">Info Requested</option>
                  <option value="APPROVED">Approved</option>
                  <option value="DECLINED">Declined</option>
                </select>
              </div>
              <div>
                <select className="w-full h-10 px-3 rounded-md border">
                  <option value="">All Cycles</option>
                  <option value="SPRING">Spring</option>
                  <option value="FALL">Fall</option>
                </select>
              </div>
              <Button variant="outline">Clear Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{app.organization.legalName}</p>
                      <Badge className={statusColors[app.status as keyof typeof statusColors]}>
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      {app.projectTitle || 'Untitled Application'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{app.grantCycle} {app.cycleYear}</span>
                      {app.amountRequested && (
                        <span>${app.amountRequested.toLocaleString()} requested</span>
                      )}
                      {app.submittedAt && (
                        <span>Submitted {format(new Date(app.submittedAt), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.aiSummary && (
                      <Badge variant="outline" className="bg-purple-50">AI Summary</Badge>
                    )}
                    <Button size="sm" asChild>
                      <Link href={`/reviewer/applications/${app.id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              ))}

              {applications.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No applications found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
