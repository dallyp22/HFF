import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { canModifyApplication } from '@/lib/auth/access'
import { sendApplicationSubmittedToAdmin, getAdminEmails } from '@/lib/email'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canModify = await canModifyApplication(id)

    if (!canModify) {
      return NextResponse.json(
        { error: 'Cannot submit this application' },
        { status: 403 }
      )
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            users: {
              select: { email: true },
              take: 1,
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Application has already been submitted' },
        { status: 400 }
      )
    }

    // Update to SUBMITTED status
    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submittedById: user.id,
        submittedByName: `${user.firstName} ${user.lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
      },
    })

    // Create status history
    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        previousStatus: 'DRAFT',
        newStatus: 'SUBMITTED',
        changedById: user.id,
        changedByName: `${user.firstName} ${user.lastName}`.trim() || 'User',
      },
    })

    // Send email notification to admin
    const adminEmails = await getAdminEmails()
    const contactEmail = application.organization.users[0]?.email || user.emailAddresses?.[0]?.emailAddress || ''
    sendApplicationSubmittedToAdmin({
      applicationId: id,
      projectTitle: application.projectTitle || 'Untitled Project',
      organizationName: application.organization.legalName,
      contactEmail,
      requestAmount: application.amountRequested
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(application.amountRequested))
        : 'Not specified',
      adminEmails,
    }).catch(err => console.error('Failed to send application submission email:', err))

    // TODO: Generate AI summary (when AI system is set up)
    // await fetch(`/api/applications/${id}/summary`, { method: 'POST' })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error submitting application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
