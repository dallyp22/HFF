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

    // Check if user already has an organization
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true },
    })

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
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid form data', details: error },
        { status: 400 }
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

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: { organization: true },
    })

    if (!dbUser?.organization) {
      return NextResponse.json({ organization: null })
    }

    return NextResponse.json(dbUser.organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}
