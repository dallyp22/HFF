import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'
import { sendApplicationStatusChange } from '@/lib/email'

const validTransitions: Record<string, string[]> = {
  'DRAFT': ['SUBMITTED'],
  'SUBMITTED': ['UNDER_REVIEW'],
  'UNDER_REVIEW': ['INFO_REQUESTED', 'APPROVED', 'DECLINED'],
  'INFO_REQUESTED': ['UNDER_REVIEW'],
  'APPROVED': [],
  'DECLINED': [],
  'WITHDRAWN': [],
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await isAdmin()

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Only admins can change application status' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { newStatus, reason } = body

    const application = await prisma.application.findUnique({
      where: { id },
      select: {
        status: true,
        projectTitle: true,
        organization: {
          select: {
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

    // Validate status transition
    const allowedStatuses = validTransitions[application.status] || []
    
    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${application.status} to ${newStatus}`,
          allowedStatuses,
        },
        { status: 400 }
      )
    }

    // Update application status
    const updated = await prisma.application.update({
      where: { id },
      data: { status: newStatus },
    })

    // Create status history
    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        previousStatus: application.status as any,
        newStatus: newStatus as any,
        changedById: user.id,
        changedByName: `${user.firstName} ${user.lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
        reason: reason || null,
      },
    })

    // Send email notification for significant status changes
    const applicantEmail = application.organization.users[0]?.email
    if (applicantEmail && ['APPROVED', 'DECLINED', 'INFO_REQUESTED', 'UNDER_REVIEW'].includes(newStatus)) {
      sendApplicationStatusChange({
        applicationId: id,
        projectTitle: application.projectTitle || 'Your Application',
        newStatus,
        reason,
        applicantEmail,
      }).catch(err => console.error('Failed to send status change email:', err))
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
