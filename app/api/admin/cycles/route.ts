import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await isAdmin()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cycles = await prisma.grantCycleConfig.findMany({
      orderBy: [{ year: 'desc' }, { cycle: 'asc' }],
    })

    return NextResponse.json(cycles)
  } catch (error) {
    console.error('Error fetching cycles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cycles' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await isAdmin()

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()

    if (!data.cycle || !data.year || !data.loiDeadline) {
      return NextResponse.json(
        { error: 'Missing required fields: cycle, year, and loiDeadline are required' },
        { status: 400 }
      )
    }

    // Check if cycle already exists
    const existing = await prisma.grantCycleConfig.findUnique({
      where: {
        cycle_year: {
          cycle: data.cycle,
          year: parseInt(data.year),
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: `${data.cycle} ${data.year} cycle already exists` },
        { status: 400 }
      )
    }

    // If setting as active, deactivate all others
    if (data.isActive) {
      await prisma.grantCycleConfig.updateMany({
        data: { isActive: false },
      })
    }

    const cycle = await prisma.grantCycleConfig.create({
      data: {
        cycle: data.cycle,
        year: parseInt(data.year),
        loiOpenDate: data.loiOpenDate ? new Date(data.loiOpenDate) : null,
        loiDeadline: new Date(data.loiDeadline),
        loiReviewDeadline: data.loiReviewDeadline ? new Date(data.loiReviewDeadline) : null,
        fullAppOpenDate: data.fullAppOpenDate ? new Date(data.fullAppOpenDate) : null,
        fullAppDeadline: data.fullAppDeadline ? new Date(data.fullAppDeadline) : null,
        reviewStartDate: data.reviewStartDate ? new Date(data.reviewStartDate) : null,
        decisionDate: data.decisionDate ? new Date(data.decisionDate) : null,
        maxRequestAmount: data.maxRequestAmount ? parseFloat(data.maxRequestAmount) : null,
        isActive: data.isActive || false,
        acceptingLOIs: data.acceptingLOIs || false,
        acceptingApplications: data.acceptingApplications || false,
      },
    })

    return NextResponse.json(cycle)
  } catch (error) {
    console.error('Error creating cycle:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to create cycle', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create cycle' },
      { status: 500 }
    )
  }
}
