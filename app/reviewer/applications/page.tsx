import { prisma } from '@/lib/prisma'
import { ReviewerApplicationsClient } from '@/components/reviewer/ReviewerApplicationsClient'

export const dynamic = 'force-dynamic'

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
    <ReviewerApplicationsClient
      applications={applications.map((app: any) => ({
        id: app.id,
        projectTitle: app.projectTitle,
        status: app.status,
        grantCycle: app.grantCycle,
        cycleYear: app.cycleYear,
        amountRequested: app.amountRequested ? parseFloat(app.amountRequested.toString()) : null,
        submittedAt: app.submittedAt?.toISOString() || null,
        aiSummary: app.aiSummary,
        organizationName: app.organization.legalName,
        organizationCity: app.organization.city,
        organizationState: app.organization.state,
      }))}
      initialStatus={statusFilter}
      initialCycle={cycleFilter}
      initialSearch={searchQuery}
    />
  )
}
