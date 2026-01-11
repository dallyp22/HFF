import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { canAccessApplication } from '@/lib/auth/access'

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

    const hasAccess = await canAccessApplication(id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { communicationId, response } = body

    if (!response || !response.trim()) {
      return NextResponse.json(
        { error: 'Response is required' },
        { status: 400 }
      )
    }

    // Update communication with response
    await prisma.communication.update({
      where: { id: communicationId },
      data: {
        responseContent: response,
        responseReceivedAt: new Date(),
      },
    })

    // Change status back to UNDER_REVIEW
    await prisma.application.update({
      where: { id },
      data: { status: 'UNDER_REVIEW' },
    })

    // Create status history
    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        previousStatus: 'INFO_REQUESTED' as any,
        newStatus: 'UNDER_REVIEW' as any,
        changedById: user.id,
        changedByName: `${user.firstName} ${user.lastName}`.trim() || 'Applicant',
        reason: 'Applicant provided requested information',
      },
    })

    // TODO: Notify reviewers via email when email system is ready
    // await sendInfoResponseEmail(application)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting response:', error)
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    )
  }
}
