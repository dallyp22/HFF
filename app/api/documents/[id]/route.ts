import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/storage'

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

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user has access
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const isReviewer = (user as any).organizationMemberships && (user as any).organizationMemberships.length > 0

    if (!isReviewer && document.organizationId !== dbUser?.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: { id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user has access
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const isReviewer = (user as any).organizationMemberships && (user as any).organizationMemberships.length > 0

    if (!isReviewer && document.organizationId !== dbUser?.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Don't allow deletion of documents attached to submitted applications
    if (document.applicationId) {
      const application = await prisma.application.findUnique({
        where: { id: document.applicationId },
        select: { status: true },
      })

      if (application && application.status !== 'DRAFT') {
        return NextResponse.json(
          { error: 'Cannot delete documents from submitted applications' },
          { status: 400 }
        )
      }
    }

    // Delete from blob storage
    try {
      await deleteFile(document.storageUrl)
    } catch (error) {
      console.error('Error deleting from blob storage:', error)
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
