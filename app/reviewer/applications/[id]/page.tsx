import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ApplicationDetailView } from '@/components/reviewer/ApplicationDetailView'
import { isAdmin, isManager } from '@/lib/auth/access'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await currentUser()

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      organization: true,
      documents: true,
      notes: {
        orderBy: { createdAt: 'desc' },
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
      communications: {
        orderBy: { sentAt: 'desc' },
      },
      votes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!application) {
    notFound()
  }

  const userIsAdmin = await isAdmin()
  const userIsManager = await isManager()

  return (
    <ApplicationDetailView
      application={application}
      userIsAdmin={userIsAdmin}
      userIsManager={userIsManager}
    />
  )
}
