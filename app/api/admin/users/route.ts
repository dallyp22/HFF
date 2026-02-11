import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/access'

const HFF_ORG_ID = process.env.CLERK_ORGANIZATION_ID || 'org_382FEYv93CvGCm044yJSVOUZW59'

export async function GET() {
  try {
    const user = await currentUser()

    if (!user || !(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if org ID is configured
    if (!process.env.CLERK_ORGANIZATION_ID) {
      console.warn('CLERK_ORGANIZATION_ID not set, using fallback')
    }

    const client = await clerkClient()

    try {
      const members = await client.organizations.getOrganizationMembershipList({
        organizationId: HFF_ORG_ID,
        limit: 100,
      })
      return NextResponse.json({ reviewers: members.data })
    } catch (clerkError: any) {
      // Organization might not exist
      if (clerkError?.status === 404 || clerkError?.errors?.[0]?.code === 'resource_not_found') {
        console.error('Clerk organization not found. Please create an organization in Clerk and set CLERK_ORGANIZATION_ID')
        return NextResponse.json({
          error: 'Organization not configured. Please create a Clerk organization and set CLERK_ORGANIZATION_ID environment variable.',
          reviewers: []
        }, { status: 200 })
      }
      throw clerkError
    }
  } catch (error) {
    console.error('Error fetching reviewers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviewers' },
      { status: 500 }
    )
  }
}
