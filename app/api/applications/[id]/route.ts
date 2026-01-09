import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { canAccessApplication, canModifyApplication } from '@/lib/auth/access'

export async function GET(
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

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        organization: true,
        documents: true,
        notes: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        communications: {
          orderBy: { sentAt: 'desc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
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

    const canModify = await canModifyApplication(id)

    if (!canModify) {
      return NextResponse.json(
        { error: 'Cannot modify this application' },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Calculate percentage requested if amounts are provided
    let percentageRequested = body.percentageRequested
    if (body.amountRequested && body.totalProjectBudget) {
      percentageRequested = (body.amountRequested / body.totalProjectBudget) * 100
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        ...body,
        percentageRequested,
        projectStartDate: body.projectStartDate ? new Date(body.projectStartDate) : undefined,
        projectEndDate: body.projectEndDate ? new Date(body.projectEndDate) : undefined,
        lastSavedAt: new Date(),
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
        { error: 'Cannot delete this application' },
        { status: 403 }
      )
    }

    await prisma.application.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
