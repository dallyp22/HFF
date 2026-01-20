import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/access'

const HFF_ORG_ID = process.env.CLERK_ORGANIZATION_ID || 'org_382FE_JSV0UZW59'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await currentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params
    const body = await req.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['org:admin', 'org:manager', 'org:member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const client = await clerkClient()

    // Update membership role
    const membership = await client.organizations.updateOrganizationMembership({
      organizationId: HFF_ORG_ID,
      userId: userId,
      role: role,
    })

    return NextResponse.json({
      success: true,
      membership,
    })
  } catch (error: any) {
    console.error('Error updating role:', error)

    if (error.errors && error.errors[0]?.message) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}
