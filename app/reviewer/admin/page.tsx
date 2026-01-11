import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Users, Link as LinkIcon, Building2, Settings, Database } from 'lucide-react'

export default async function AdminDashboardPage() {
  // Get statistics
  const [cyclesCount, orgsCount, appsCount] = await Promise.all([
    prisma.grantCycleConfig.count(),
    prisma.organization.count(),
    prisma.application.count(),
  ])

  // Get reviewer count via Clerk
  const HFF_ORG_ID = 'org_382FE_JSV0UZW59'
  let reviewerCount = 0
  try {
    const client = await clerkClient()
    const members = await client.organizations.getOrganizationMembershipList({
      organizationId: HFF_ORG_ID,
    })
    reviewerCount = members.data.length
  } catch (error) {
    console.error('Error fetching reviewers:', error)
  }

  // Recent activity (last 10 status changes)
  const recentActivity = await prisma.statusHistory.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      application: {
        select: {
          projectTitle: true,
          organization: {
            select: { legalName: true },
          },
        },
      },
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage grant cycles, users, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Reviewers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{reviewerCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Grant Cycles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cyclesCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organizations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{orgsCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{appsCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/reviewer/admin/cycles">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-[var(--hff-teal)]" />
                    Manage Grant Cycles
                  </CardTitle>
                  <CardDescription>Create, edit, and activate grant cycles</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/reviewer/admin/users">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-[var(--hff-teal)]" />
                    Manage Reviewers
                  </CardTitle>
                  <CardDescription>Invite users and manage roles</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/reviewer/admin/invitations">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LinkIcon className="h-5 w-5 text-[var(--hff-teal)]" />
                    Generate Invite Links
                  </CardTitle>
                  <CardDescription>Create links for applicants to register</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/reviewer/organizations">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-[var(--hff-teal)]" />
                    View Organizations
                  </CardTitle>
                  <CardDescription>Browse all nonprofit profiles</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/reviewer/admin/settings">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="h-5 w-5 text-[var(--hff-teal)]" />
                    Settings
                  </CardTitle>
                  <CardDescription>Configure system preferences</CardDescription>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/reviewer/admin/reset">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Database className="h-5 w-5 text-[var(--hff-teal)]" />
                    Data Management
                  </CardTitle>
                  <CardDescription>Reset sample data and manage database</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest status changes and system events</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-[var(--hff-teal)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.application.organization.legalName}</span>
                        {' - '}
                        <span>{activity.application.projectTitle}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Status changed to <span className="font-medium">{activity.newStatus.replace(/_/g, ' ')}</span>
                        {activity.changedByName && ` by ${activity.changedByName}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
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
