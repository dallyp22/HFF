import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendLOISubmittedToAdmin, getAdminEmails } from '@/lib/email'

// POST - Submit an LOI for review
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: {
        organizationId: true,
        firstName: true,
        lastName: true,
      },
    })

    const loi = await prisma.letterOfInterest.findUnique({
      where: { id },
      include: {
        cycleConfig: true,
      },
    })

    if (!loi) {
      return NextResponse.json({ error: 'Letter of Interest not found' }, { status: 404 })
    }

    // Check ownership
    if (loi.organizationId !== dbUser?.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if already submitted
    if (loi.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'This Letter of Interest has already been submitted' },
        { status: 400 }
      )
    }

    // Check deadline
    if (new Date() > new Date(loi.cycleConfig.loiDeadline)) {
      return NextResponse.json(
        { error: 'The LOI deadline for this cycle has passed' },
        { status: 400 }
      )
    }

    // Validate required fields
    const requiredFields = {
      expenditureType: 'Expenditure Type',
      projectTitle: 'Project Title',
      projectDescription: 'Project Description',
      totalProjectAmount: 'Total Project Amount',
      grantRequestAmount: 'Grant Request Amount',
      budgetOutline: 'Budget Outline',
    }

    const missingFields: string[] = []
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!loi[field as keyof typeof loi]) {
        missingFields.push(label)
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Please complete all required fields before submitting',
          missingFields,
        },
        { status: 400 }
      )
    }

    // Validate project description length (500 words max)
    if (loi.projectDescription) {
      const wordCount = loi.projectDescription.trim().split(/\s+/).length
      if (wordCount > 500) {
        return NextResponse.json(
          { error: `Project description exceeds 500 word limit (${wordCount} words)` },
          { status: 400 }
        )
      }
    }

    // Validate project goals length (500 words max)
    if (loi.projectGoals) {
      const wordCount = loi.projectGoals.trim().split(/\s+/).length
      if (wordCount > 500) {
        return NextResponse.json(
          { error: `Project goals exceeds 500 word limit (${wordCount} words)` },
          { status: 400 }
        )
      }
    }

    // Validate budget outline length (250 words max)
    if (loi.budgetOutline) {
      const wordCount = loi.budgetOutline.trim().split(/\s+/).length
      if (wordCount > 250) {
        return NextResponse.json(
          { error: `Budget outline exceeds 250 word limit (${wordCount} words)` },
          { status: 400 }
        )
      }
    }

    const submitterName = `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || 'Unknown'

    // Update LOI status and create history record
    const [updatedLoi] = await prisma.$transaction([
      prisma.letterOfInterest.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          submittedById: user.id,
          submittedByName: submitterName,
        },
        include: {
          organization: {
            select: { legalName: true },
          },
          cycleConfig: {
            select: {
              cycle: true,
              year: true,
            },
          },
        },
      }),
      prisma.lOIStatusHistory.create({
        data: {
          loiId: id,
          previousStatus: 'DRAFT',
          newStatus: 'SUBMITTED',
          changedById: user.id,
          changedByName: submitterName,
          reason: 'LOI submitted by applicant',
        },
      }),
    ])

    // Send email notification to admin
    const adminEmails = await getAdminEmails()
    sendLOISubmittedToAdmin({
      loiId: id,
      projectTitle: loi.projectTitle || 'Untitled Project',
      organizationName: updatedLoi.organization.legalName,
      contactEmail: loi.primaryContactEmail || user.emailAddresses?.[0]?.emailAddress || '',
      requestAmount: loi.grantRequestAmount
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(loi.grantRequestAmount))
        : 'Not specified',
      adminEmails,
    }).catch(err => console.error('Failed to send LOI submission email:', err))

    return NextResponse.json(updatedLoi)
  } catch (error) {
    console.error('Error submitting LOI:', error)
    return NextResponse.json(
      { error: 'Failed to submit Letter of Interest' },
      { status: 500 }
    )
  }
}
