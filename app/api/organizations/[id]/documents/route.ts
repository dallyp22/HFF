import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isReviewer as checkIsReviewer } from '@/lib/auth/access'

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

    // Verify the user is a reviewer or belongs to the organization
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const reviewerAccess = await checkIsReviewer()

    if (!reviewerAccess && dbUser?.organizationId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Fetch all organization-scope documents
    const documents = await prisma.document.findMany({
      where: {
        organizationId: id,
        scope: 'ORGANIZATION',
      },
      orderBy: [
        { type: 'asc' },
        { documentYear: 'desc' },
        { uploadedAt: 'desc' },
      ],
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching organization documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization documents' },
      { status: 500 }
    )
  }
}
