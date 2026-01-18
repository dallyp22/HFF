import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { InfoResponseForm } from '@/components/applicant/InfoResponseForm'
import { ApplicationStatusClient } from '@/components/applicant/ApplicationStatusClient'

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
    (c) => c.responseRequired && !c.responseReceivedAt
  )

  return (
    <ApplicationStatusClient
      application={{
        id: application.id,
        projectTitle: application.projectTitle,
        grantCycle: application.grantCycle,
        cycleYear: application.cycleYear,
        status: application.status,
        submittedAt: application.submittedAt?.toISOString() || null,
      }}
      statusHistory={application.statusHistory.map((h) => ({
        id: h.id,
        newStatus: h.newStatus,
        reason: h.reason,
        createdAt: h.createdAt.toISOString(),
      }))}
      pendingInfoRequest={
        pendingInfoRequest
          ? {
              id: pendingInfoRequest.id,
              content: pendingInfoRequest.content,
              responseDeadline: pendingInfoRequest.responseDeadline?.toISOString() || null,
            }
          : null
      }
    />
  )
}
