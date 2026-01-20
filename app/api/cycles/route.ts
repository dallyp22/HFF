import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Public endpoint to get active cycles accepting LOIs (for applicants)
export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return only active cycles that are accepting LOIs
    // This is safe for applicants to see
    const cycles = await prisma.grantCycleConfig.findMany({
      where: {
        isActive: true,
        acceptingLOIs: true,
      },
      select: {
        id: true,
        cycle: true,
        year: true,
        loiOpenDate: true,
        loiDeadline: true,
        fullAppOpenDate: true,
        fullAppDeadline: true,
        maxRequestAmount: true,
        isActive: true,
        acceptingLOIs: true,
        acceptingApplications: true,
      },
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
