import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient'

export default async function AdminDashboardPage() {
  // Get statistics
  const [cyclesCount, orgsCount, appsCount] = await Promise.all([
    prisma.grantCycleConfig.count(),
    prisma.organization.count(),
    prisma.application.count(),
  ])

  // Get reviewer count via Clerk
  const HFF_ORG_ID = process.env.CLERK_ORGANIZATION_ID || 'org_382FE_JSV0UZW59'
  let reviewerCount = 0
  try {
    const client = await clerkClient()
    const members = await client.organizations.getOrganizationMembershipList({
      organizationId: HFF_ORG_ID,
    })
    reviewerCount = members.data.length
  } catch (error) {
    console.error('Error fetching reviewers (org may not exist):', error)
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
    <AdminDashboardClient
      stats={{
        reviewers: reviewerCount,
        cycles: cyclesCount,
        organizations: orgsCount,
        applications: appsCount,
      }}
      recentActivity={recentActivity.map((activity) => ({
        id: activity.id,
        newStatus: activity.newStatus,
        changedByName: activity.changedByName,
        createdAt: activity.createdAt.toISOString(),
        projectTitle: activity.application.projectTitle,
        organizationName: activity.application.organization.legalName,
      }))}
    />
  )
}
