import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// POST - Confirm organization profile is reviewed for a specific cycle
export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: 'No organization found for this user' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { cycleId } = body

    if (!cycleId) {
      return NextResponse.json(
        { error: 'cycleId is required' },
        { status: 400 }
      )
    }

    // Verify the cycle exists
    const cycle = await prisma.grantCycleConfig.findUnique({
      where: { id: cycleId },
    })

    if (!cycle) {
      return NextResponse.json(
        { error: 'Grant cycle not found' },
        { status: 404 }
      )
    }

    // Update organization with review timestamp and cycle
    const updatedOrg = await prisma.organization.update({
      where: { id: dbUser.organizationId },
      data: {
        profileLastReviewedAt: new Date(),
        profileLastReviewedForCycle: cycleId,
      },
    })

    return NextResponse.json({
      success: true,
      profileLastReviewedAt: updatedOrg.profileLastReviewedAt,
      profileLastReviewedForCycle: updatedOrg.profileLastReviewedForCycle,
    })
  } catch (error) {
    console.error('Error reviewing profile:', error)
    return NextResponse.json(
      { error: 'Failed to confirm profile review' },
      { status: 500 }
    )
  }
}
