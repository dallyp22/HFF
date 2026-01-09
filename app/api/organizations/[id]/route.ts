import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { organizationProfileSchema, isProfileComplete } from '@/lib/validation/profile'

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

    const organization = await prisma.organization.findUnique({
      where: { id },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check if user has access to this organization
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const isReviewer = (user as any).organizationMemberships && (user as any).organizationMemberships.length > 0

    if (!isReviewer && dbUser?.organizationId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
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

    // Check if user has access to this organization
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const isReviewer = (user as any).organizationMemberships && (user as any).organizationMemberships.length > 0

    if (!isReviewer && dbUser?.organizationId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const validatedData = organizationProfileSchema.parse(body)

    // Check if EIN is being changed and already exists
    if (validatedData.ein) {
      const existingOrg = await prisma.organization.findFirst({
        where: {
          ein: validatedData.ein,
          NOT: { id },
        },
      })

      if (existingOrg) {
        return NextResponse.json(
          { error: 'An organization with this EIN already exists' },
          { status: 400 }
        )
      }
    }

    const profileIsComplete = isProfileComplete(validatedData)

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...validatedData,
        taxExemptSince: validatedData.taxExemptSince ? new Date(validatedData.taxExemptSince) : null,
        profileComplete: profileIsComplete,
        profileCompletedAt: profileIsComplete ? new Date() : null,
      },
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error updating organization:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid form data', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    )
  }
}
