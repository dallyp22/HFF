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
        { error: 'Only admins can delete organizations' },
        { status: 403 }
      )
    }

    // Verify the organization exists
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        lois: {
          include: {
            application: true,
          },
        },
        applications: true,
        documents: true,
        users: true,
      },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Delete all related records in the correct order to handle cascades
    // 1. Delete application-related records for all applications
    const applicationIds = org.applications.map((a) => a.id)
    if (applicationIds.length > 0) {
      await prisma.note.deleteMany({ where: { applicationId: { in: applicationIds } } })
      await prisma.statusHistory.deleteMany({ where: { applicationId: { in: applicationIds } } })
      await prisma.communication.deleteMany({ where: { applicationId: { in: applicationIds } } })
      await prisma.vote.deleteMany({ where: { applicationId: { in: applicationIds } } })
      await prisma.highlight.deleteMany({ where: { applicationId: { in: applicationIds } } })
      await prisma.budgetAssessment.deleteMany({ where: { applicationId: { in: applicationIds } } })
      await prisma.document.deleteMany({ where: { applicationId: { in: applicationIds } } })
    }

    // 2. Delete LOI-related records
    const loiIds = org.lois.map((l) => l.id)
    if (loiIds.length > 0) {
      await prisma.lOIStatusHistory.deleteMany({ where: { loiId: { in: loiIds } } })
      await prisma.document.deleteMany({ where: { loiId: { in: loiIds } } })
    }

    // 3. Delete applications (must come before LOIs due to loiId FK)
    await prisma.application.deleteMany({ where: { organizationId: id } })

    // 4. Delete LOIs
    await prisma.letterOfInterest.deleteMany({ where: { organizationId: id } })

    // 5. Delete org-level documents
    await prisma.document.deleteMany({ where: { organizationId: id } })

    // 6. Delete users associated with this organization
    await prisma.user.deleteMany({ where: { organizationId: id } })

    // 7. Delete the organization itself
    await prisma.organization.delete({ where: { id } })

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress,
        userType: 'admin',
        action: 'DELETE',
        entityType: 'Organization',
        entityId: id,
        details: { legalName: org.legalName, ein: org.ein },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}
