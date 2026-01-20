import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'

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
        { error: 'Only admins can modify grant cycles' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { isActive, acceptingApplications } = body

    // If setting this cycle as active, deactivate all others
    if (isActive === true) {
      await prisma.grantCycleConfig.updateMany({
        where: { NOT: { id } },
        data: { isActive: false },
      })
    }

    const cycle = await prisma.grantCycleConfig.update({
      where: { id },
      data: {
        isActive,
        acceptingApplications,
      },
    })

    return NextResponse.json(cycle)
  } catch (error) {
    console.error('Error updating cycle:', error)
    return NextResponse.json(
      { error: 'Failed to update cycle' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()

    // If setting as active, deactivate all others
    if (data.isActive) {
      await prisma.grantCycleConfig.updateMany({
        where: { NOT: { id } },
        data: { isActive: false },
      })
    }

    const cycle = await prisma.grantCycleConfig.update({
      where: { id },
      data: {
        loiOpenDate: data.loiOpenDate ? new Date(data.loiOpenDate) : null,
        loiDeadline: data.loiDeadline ? new Date(data.loiDeadline) : undefined,
        loiReviewDeadline: data.loiReviewDeadline ? new Date(data.loiReviewDeadline) : null,
        fullAppOpenDate: data.fullAppOpenDate ? new Date(data.fullAppOpenDate) : null,
        fullAppDeadline: data.fullAppDeadline ? new Date(data.fullAppDeadline) : null,
        reviewStartDate: data.reviewStartDate ? new Date(data.reviewStartDate) : null,
        decisionDate: data.decisionDate ? new Date(data.decisionDate) : null,
        maxRequestAmount: data.maxRequestAmount ? parseFloat(data.maxRequestAmount) : null,
        isActive: data.isActive,
        acceptingLOIs: data.acceptingLOIs ?? false,
        acceptingApplications: data.acceptingApplications ?? false,
      },
    })

    return NextResponse.json(cycle)
  } catch (error) {
    console.error('Error updating cycle:', error)
    return NextResponse.json(
      { error: 'Failed to update cycle' },
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

    const hasPermission = await isAdmin()

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get cycle info
    const cycle = await prisma.grantCycleConfig.findUnique({
      where: { id },
    })

    if (!cycle) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 })
    }

    // Check if cycle has applications or LOIs
    const appCount = await prisma.application.count({
      where: {
        grantCycle: cycle.cycle,
        cycleYear: cycle.year,
      },
    })

    const loiCount = await prisma.letterOfInterest.count({
      where: {
        cycleConfigId: id,
      },
    })

    if (appCount > 0 || loiCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete cycle with existing data. This cycle has ${loiCount} LOI(s) and ${appCount} application(s).`,
        },
        { status: 400 }
      )
    }

    await prisma.grantCycleConfig.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cycle:', error)
    return NextResponse.json(
      { error: 'Failed to delete cycle' },
      { status: 500 }
    )
  }
}

