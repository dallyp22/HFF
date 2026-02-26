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
        { error: 'Only admins can delete applications' },
        { status: 403 }
      )
    }

    // Verify the application exists
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        organization: {
          select: { legalName: true },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Delete all cascading records
    await prisma.note.deleteMany({ where: { applicationId: id } })
    await prisma.statusHistory.deleteMany({ where: { applicationId: id } })
    await prisma.communication.deleteMany({ where: { applicationId: id } })
    await prisma.vote.deleteMany({ where: { applicationId: id } })
    await prisma.highlight.deleteMany({ where: { applicationId: id } })
    await prisma.budgetAssessment.deleteMany({ where: { applicationId: id } })
    await prisma.document.deleteMany({ where: { applicationId: id } })

    // Delete the application
    await prisma.application.delete({ where: { id } })

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress,
        userType: 'admin',
        action: 'DELETE',
        entityType: 'Application',
        entityId: id,
        details: {
          projectTitle: application.projectTitle,
          organizationName: application.organization.legalName,
          status: application.status,
          grantCycle: application.grantCycle,
          cycleYear: application.cycleYear,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
