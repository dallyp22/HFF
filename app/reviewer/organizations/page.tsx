import { prisma } from '@/lib/prisma'
import { ReviewerOrganizationsClient } from '@/components/reviewer/ReviewerOrganizationsClient'

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search

  const organizations = await prisma.organization.findMany({
    where: {
      ...(searchQuery && {
        OR: [
          { legalName: { contains: searchQuery, mode: 'insensitive' } },
          { city: { contains: searchQuery, mode: 'insensitive' } },
          { state: { contains: searchQuery, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
      applications: {
        orderBy: { submittedAt: 'desc' },
        take: 1,
        select: {
          submittedAt: true,
        },
      },
    },
    orderBy: { legalName: 'asc' },
  })

  return (
    <ReviewerOrganizationsClient
      organizations={organizations.map((org: any) => ({
        id: org.id,
        legalName: org.legalName,
        city: org.city,
        state: org.state,
        annualBudget: org.annualBudget ? parseFloat(org.annualBudget.toString()) : null,
        profileComplete: org.profileComplete,
        applicationCount: org._count.applications,
        lastApplicationDate: org.applications[0]?.submittedAt?.toISOString() || null,
      }))}
      initialSearch={searchQuery}
    />
  )
}
