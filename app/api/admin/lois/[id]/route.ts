import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'

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

    const hasPermission = await isAdmin()

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Only admins can delete LOIs' },
        { status: 403 }
      )
    }

    // Verify the LOI exists
    const loi = await prisma.letterOfInterest.findUnique({
      where: { id },
      include: {
        organization: {
          select: { legalName: true },
        },
        application: true,
      },
    })

    if (!loi) {
      return NextResponse.json({ error: 'LOI not found' }, { status: 404 })
    }

    // If the LOI has a linked application, delete it and its cascading records first
    if (loi.application) {
      const appId = loi.application.id
      await prisma.note.deleteMany({ where: { applicationId: appId } })
      await prisma.statusHistory.deleteMany({ where: { applicationId: appId } })
      await prisma.communication.deleteMany({ where: { applicationId: appId } })
      await prisma.vote.deleteMany({ where: { applicationId: appId } })
      await prisma.highlight.deleteMany({ where: { applicationId: appId } })
      await prisma.budgetAssessment.deleteMany({ where: { applicationId: appId } })
      await prisma.document.deleteMany({ where: { applicationId: appId } })
      await prisma.application.delete({ where: { id: appId } })
    }

    // Delete LOI-related records
    await prisma.lOIStatusHistory.deleteMany({ where: { loiId: id } })
    await prisma.document.deleteMany({ where: { loiId: id } })

    // Delete the LOI
    await prisma.letterOfInterest.delete({ where: { id } })

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress,
        userType: 'admin',
        action: 'DELETE',
        entityType: 'LetterOfInterest',
        entityId: id,
        details: {
          projectTitle: loi.projectTitle,
          organizationName: loi.organization.legalName,
          status: loi.status,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting LOI:', error)
    return NextResponse.json(
      { error: 'Failed to delete LOI' },
      { status: 500 }
    )
  }
}
