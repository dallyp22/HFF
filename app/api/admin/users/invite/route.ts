import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/access'

const HFF_ORG_ID = process.env.CLERK_ORGANIZATION_ID || 'org_382FEYv93CvGCm044yJSVOUZW59'

const ROLE_VALUES: Record<string, string> = {
  'Admin': 'org:admin',
  'Manager': 'org:manager',
  'Member': 'org:member',
}

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { email, role, message } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Map display role to Clerk role
    const clerkRole = ROLE_VALUES[role] || role

    // Validate role
    if (!['org:admin', 'org:manager', 'org:member'].includes(clerkRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const client = await clerkClient()
    
    // Create invitation
    const invitation = await client.organizations.createOrganizationInvitation({
      organizationId: HFF_ORG_ID,
      emailAddress: email,
      role: clerkRole,
    })

    return NextResponse.json({
      success: true,
      invitation,
    })
  } catch (error: any) {
    console.error('Error inviting user:', error)
    
    // Handle specific Clerk errors
    if (error.errors && error.errors[0]?.message) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
