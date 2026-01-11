import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import type { Application } from '@prisma/client'

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { submittedAt: 'desc' },
      },
      documents: {
        where: { scope: 'ORGANIZATION' },
      },
    },
  })

  if (!organization) {
    notFound()
  }

  const programRatio = organization.form990TotalExpenses && organization.form990ProgramExpenses
    ? ((parseFloat(organization.form990ProgramExpenses.toString()) / parseFloat(organization.form990TotalExpenses.toString())) * 100).toFixed(1)
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{organization.legalName}</h1>
          <p className="text-gray-600">EIN: {organization.ein}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{organization.applications.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Annual Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${organization.annualBudget?.toLocaleString() || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Founded</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{organization.yearFounded || 'N/A'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Organization Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Mission</p>
              <p className="text-gray-700">{organization.missionStatement}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Executive Director</p>
                <p>{organization.executiveDirectorName}</p>
                {organization.executiveDirectorEmail && (
                  <p className="text-sm text-gray-600">{organization.executiveDirectorEmail}</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Location</p>
                <p>{organization.city}, {organization.state}</p>
              </div>
            </div>

            {(organization.fullTimeStaff || organization.partTimeStaff) && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Staffing</p>
                <div className="flex gap-4 text-sm">
                  {organization.fullTimeStaff && <span>{organization.fullTimeStaff} FT</span>}
                  {organization.partTimeStaff && <span>{organization.partTimeStaff} PT</span>}
                  {organization.volunteers && <span>{organization.volunteers} Volunteers</span>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form 990 Summary */}
        {organization.form990Year && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Form 990 Summary ({organization.form990Year})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-lg font-semibold">
                    ${organization.form990TotalRevenue?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expenses</p>
                  <p className="text-lg font-semibold">
                    ${organization.form990TotalExpenses?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Net Assets</p>
                  <p className="text-lg font-semibold">
                    ${organization.form990NetAssets?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </div>
              {programRatio && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">Program Expense Ratio</p>
                  <p className="text-2xl font-bold text-[var(--hff-teal)]">{programRatio}%</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grant History */}
        <Card>
          <CardHeader>
            <CardTitle>Grant History with HFF</CardTitle>
          </CardHeader>
          <CardContent>
            {organization.applications.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {organization.applications.map((app: Application) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{app.projectTitle || 'Untitled'}</p>
                      <p className="text-sm text-gray-600">
                        {app.grantCycle} {app.cycleYear} • 
                        {app.amountRequested && ` $${app.amountRequested.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{app.status.replace(/_/g, ' ')}</Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/reviewer/applications/${app.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
