import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/access'

const HFF_ORG_ID = 'org_382FE_JSV0UZW59'

export async function GET() {
  try {
    const user = await currentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const client = await clerkClient()
    const members = await client.organizations.getOrganizationMembershipList({
      organizationId: HFF_ORG_ID,
      limit: 100,
    })

    return NextResponse.json({ reviewers: members.data })
  } catch (error) {
    console.error('Error fetching reviewers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewers' },
      { status: 500 }
    )
  }
}
