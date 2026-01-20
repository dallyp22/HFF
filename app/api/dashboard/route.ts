import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { calculateProfileCompletion } from '@/lib/validation/profile'

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        organization: {
          include: {
            applications: {
              orderBy: { updatedAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    })

    // Auto-create user if doesn't exist (webhook fallback)
    if (!dbUser) {
      await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          emailNotifications: true,
        },
      })

      return NextResponse.json({
        organization: null,
        profileCompletion: 0,
      })
    }

    if (!dbUser.organization) {
      return NextResponse.json({
        organization: null,
        profileCompletion: 0,
      })
    }

    const profileCompletion = calculateProfileCompletion(dbUser.organization as any)

    return NextResponse.json({
      organization: dbUser.organization,
      profileCompletion,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch dashboard data', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
