import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/access'

const HFF_ORG_ID = process.env.CLERK_ORGANIZATION_ID || 'org_382FE_JSV0UZW59'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await currentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = await params

    const client = await clerkClient()

    // Remove user from organization
    await client.organizations.deleteOrganizationMembership({
      organizationId: HFF_ORG_ID,
      userId: userId,
    })

    return NextResponse.json({
      success: true,
      message: 'User removed successfully',
    })
  } catch (error: any) {
    console.error('Error removing user:', error)

    if (error.errors && error.errors[0]?.message) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to remove user' },
      { status: 500 }
    )
  }
}
