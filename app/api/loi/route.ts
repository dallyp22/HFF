import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isReviewer as checkIsReviewer } from '@/lib/auth/access'

// GET - List LOIs (applicant sees their own, reviewers see all)
export async function GET(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const cycleId = searchParams.get('cycleId')

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    // Check if user is a reviewer (includes hardcoded admin check)
    const reviewerAccess = await checkIsReviewer()

    let where: any = {}

    if (!reviewerAccess) {
      // Applicants only see their own organization's LOIs
      if (!dbUser?.organizationId) {
        return NextResponse.json([])
      }
      where.organizationId = dbUser.organizationId
    }

    if (status) {
      where.status = status
    }

    if (cycleId) {
      where.cycleConfigId = cycleId
    }

    const lois = await prisma.letterOfInterest.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            legalName: true,
            ein: true,
          },
        },
        cycleConfig: {
          select: {
            id: true,
            cycle: true,
            year: true,
            loiDeadline: true,
            fullAppDeadline: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(lois)
  } catch (error) {
    console.error('Error fetching LOIs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch letters of interest' },
      { status: 500 }
    )
  }
}

// POST - Create a new LOI for a grant cycle
export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { cycleConfigId } = body

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        organization: {
          include: {
            users: {
              where: { clerkId: user.id },
              select: {
                firstName: true,
                lastName: true,
                title: true,
                phone: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!dbUser?.organization) {
      return NextResponse.json(
        { error: 'Please create your organization profile first' },
        { status: 400 }
      )
    }

    if (!dbUser.organization.profileComplete) {
      return NextResponse.json(
        { error: 'Please complete your organization profile before submitting an LOI' },
        { status: 400 }
      )
    }

    // Get the grant cycle
    let cycleConfig
    if (cycleConfigId) {
      cycleConfig = await prisma.grantCycleConfig.findUnique({
        where: { id: cycleConfigId },
      })
    } else {
      // Find active cycle accepting LOIs
      cycleConfig = await prisma.grantCycleConfig.findFirst({
        where: { isActive: true, acceptingLOIs: true },
      })
    }

    if (!cycleConfig) {
      return NextResponse.json(
        { error: 'No grant cycle is currently accepting Letters of Interest' },
        { status: 400 }
      )
    }

    // Check if profile has been reviewed for this cycle
    const orgProfile = await prisma.organization.findUnique({
      where: { id: dbUser.organization.id },
      select: { profileLastReviewedForCycle: true },
    })

    if (orgProfile?.profileLastReviewedForCycle !== cycleConfig.id) {
      return NextResponse.json(
        { error: 'PROFILE_REVIEW_REQUIRED', cycleId: cycleConfig.id },
        { status: 400 }
      )
    }

    // Check if LOI deadline has passed
    if (new Date() > new Date(cycleConfig.loiDeadline)) {
      return NextResponse.json(
        { error: 'The LOI deadline for this cycle has passed' },
        { status: 400 }
      )
    }

    // Check if org already has an LOI for this cycle
    const existingLoi = await prisma.letterOfInterest.findUnique({
      where: {
        organizationId_cycleConfigId: {
          organizationId: dbUser.organization.id,
          cycleConfigId: cycleConfig.id,
        },
      },
    })

    if (existingLoi) {
      return NextResponse.json(
        { error: 'Your organization already has a Letter of Interest for this cycle', existingId: existingLoi.id },
        { status: 400 }
      )
    }

    // Pre-populate contact info from user
    const currentUserInfo = dbUser.organization.users[0]

    // Create draft LOI
    const loi = await prisma.letterOfInterest.create({
      data: {
        organizationId: dbUser.organization.id,
        cycleConfigId: cycleConfig.id,
        status: 'DRAFT',
        currentStep: 1,
        completedSteps: [],
        // Pre-populate contact info
        primaryContactName: currentUserInfo
          ? `${currentUserInfo.firstName || ''} ${currentUserInfo.lastName || ''}`.trim()
          : null,
        primaryContactTitle: currentUserInfo?.title || null,
        primaryContactPhone: currentUserInfo?.phone || null,
        primaryContactEmail: currentUserInfo?.email || null,
        executiveDirector: dbUser.organization.executiveDirectorName || null,
      },
      include: {
        organization: {
          select: {
            legalName: true,
          },
        },
        cycleConfig: {
          select: {
            cycle: true,
            year: true,
            loiDeadline: true,
          },
        },
      },
    })

    return NextResponse.json(loi)
  } catch (error) {
    console.error('Error creating LOI:', error)
    return NextResponse.json(
      { error: 'Failed to create Letter of Interest' },
      { status: 500 }
    )
  }
}
