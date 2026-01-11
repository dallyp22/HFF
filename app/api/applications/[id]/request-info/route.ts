import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isManager } from '@/lib/auth/access'

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

    const hasPermission = await isManager()

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Only managers and admins can request information' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { message, responseDeadline } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Change status to INFO_REQUESTED
    await prisma.application.update({
      where: { id },
      data: { status: 'INFO_REQUESTED' },
    })

    // Create status history
    await prisma.statusHistory.create({
      data: {
        applicationId: id,
        previousStatus: 'UNDER_REVIEW' as any,
        newStatus: 'INFO_REQUESTED' as any,
        changedById: user.id,
        changedByName: `${user.firstName} ${user.lastName}`.trim() || 'Unknown',
        reason: 'Information requested from applicant',
      },
    })

    // Create communication record
    const communication = await prisma.communication.create({
      data: {
        applicationId: id,
        direction: 'outbound',
        type: 'portal_message',
        subject: 'Additional Information Requested',
        content: message,
        sentById: user.id,
        sentByName: `${user.firstName} ${user.lastName}`.trim() || 'Unknown',
        responseRequired: true,
        responseDeadline: responseDeadline ? new Date(responseDeadline) : null,
      },
    })

    // TODO: Send email notification when email system is ready
    // await sendInfoRequestEmail(application, message)

    return NextResponse.json(communication)
  } catch (error) {
    console.error('Error requesting information:', error)
    return NextResponse.json(
      { error: 'Failed to request information' },
      { status: 500 }
    )
  }
}
