import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true },
    })

    if (!dbUser?.organization) {
      return NextResponse.json(
        { error: 'Please create your organization profile first' },
        { status: 400 }
      )
    }

    if (!dbUser.organization.profileComplete) {
      return NextResponse.json(
        { error: 'Please complete your organization profile before creating applications' },
        { status: 400 }
      )
    }

    // Get active grant cycle
    const activeCycle = await prisma.grantCycleConfig.findFirst({
      where: { isActive: true, acceptingApplications: true },
    })

    if (!activeCycle) {
      return NextResponse.json(
        { error: 'No active grant cycle available' },
        { status: 400 }
      )
    }

    // Check for existing application in same cycle (one per cycle enforcement)
    const existingApplication = await prisma.application.findFirst({
      where: {
        organizationId: dbUser.organization.id,
        grantCycle: activeCycle.cycle,
        cycleYear: activeCycle.year,
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: `Your organization already has an application for the ${activeCycle.cycle} ${activeCycle.year} cycle. Only one application per cycle is allowed.` },
        { status: 400 }
      )
    }

    // Create draft application
    const application = await prisma.application.create({
      data: {
        organizationId: dbUser.organization.id,
        grantCycle: activeCycle.cycle,
        cycleYear: activeCycle.year,
        status: 'DRAFT',
        currentStep: 1,
        completedSteps: [],
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const isReviewer = (user as any).organizationMemberships && (user as any).organizationMemberships.length > 0

    let where: any = {}

    if (!isReviewer) {
      // Applicants only see their own organization's applications
      if (!dbUser?.organizationId) {
        return NextResponse.json([])
      }
      where.organizationId = dbUser.organizationId
    }

    if (status) {
      where.status = status
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        organization: {
          select: {
            legalName: true,
            ein: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
