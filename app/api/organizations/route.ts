import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { organizationProfileSchema, isProfileComplete } from '@/lib/validation/profile'

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists in database, create if not (webhook fallback)
    let existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true },
    })

    if (!existingUser) {
      // Auto-create user if webhook hasn't synced yet
      await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          emailNotifications: true,
        },
      })
      
      // Fetch with organization relation
      existingUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        include: { organization: true },
      })
    }

    if (existingUser?.organizationId) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const validatedData = organizationProfileSchema.parse(body)

    // Check if EIN already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { ein: validatedData.ein },
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'An organization with this EIN already exists' },
        { status: 400 }
      )
    }

    const profileIsComplete = isProfileComplete(validatedData)

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        ...validatedData,
        taxExemptSince: validatedData.taxExemptSince ? new Date(validatedData.taxExemptSince) : null,
        profileComplete: profileIsComplete,
        profileCompletedAt: profileIsComplete ? new Date() : null,
      },
    })

    // Link user to organization
    await prisma.user.update({
      where: { clerkId: user.id },
      data: { organizationId: organization.id },
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error creating organization:', error)
    
    if (error instanceof Error) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Invalid form data', details: error.message },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create organization', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true },
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
      
      // Fetch with organization relation
      dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
        include: { organization: true },
      })
    }

    if (!dbUser?.organization) {
      return NextResponse.json({ organization: null })
    }

    return NextResponse.json(dbUser.organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch organization', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}
