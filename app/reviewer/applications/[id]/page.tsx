import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { ApplicationDetailView } from '@/components/reviewer/ApplicationDetailView'
import { isAdmin, isManager } from '@/lib/auth/access'

// Helper to serialize Prisma objects for client components
// Converts Decimals to numbers and Dates to ISO strings
function serializeForClient<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      // Prisma Decimals have a toNumber method or toString
      if (value !== null && typeof value === 'object' && 'toNumber' in value) {
        return value.toNumber()
      }
      return value
    })
  )
}

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

  // Serialize Decimals and Dates to plain values for client component
  const serializedApplication = serializeForClient(application)

  return (
    <ApplicationDetailView
      application={serializedApplication}
      userIsAdmin={userIsAdmin}
      userIsManager={userIsManager}
    />
  )
}
