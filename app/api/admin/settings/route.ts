import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'
import { foundationSettingsSchema } from '@/lib/validation/settings'

export async function GET() {
  try {
    const user = await currentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch the single settings record
    let settings = await prisma.foundationSettings.findUnique({
      where: { id: 'default' },
    })

    // If no settings exist, create default
    if (!settings) {
      settings = await prisma.foundationSettings.create({
        data: {
          id: 'default',
          foundationName: 'Heistand Family Foundation',
          tagline: 'Encouraging opportunities for children in poverty',
          missionStatement: 'To encourage and multiply opportunities for children in poverty in the Omaha/Council Bluffs metro area and Western Iowa.',
          visionStatement: 'A community where every child has access to the resources and support they need to thrive.',
          primaryEmail: 'grants@heistandfamilyfoundation.org',
          phoneNumber: '(402) 555-0100',
          websiteUrl: 'https://heistandfamilyfoundation.org',
          streetAddress: '123 Foundation Way',
          city: 'Omaha',
          state: 'NE',
          zipCode: '68102',
          focusAreas: ['Children in Poverty', 'Education', 'Community Development'],
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Validate request body
    const validatedData = foundationSettingsSchema.parse(body)

    // Update settings
    const settings = await prisma.foundationSettings.upsert({
      where: { id: 'default' },
      update: {
        ...validatedData,
        updatedById: user.id,
        updatedByName: `${user.firstName} ${user.lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
      },
      create: {
        id: 'default',
        ...validatedData,
        updatedById: user.id,
        updatedByName: `${user.firstName} ${user.lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
      },
    })

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error updating settings:', error)

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
