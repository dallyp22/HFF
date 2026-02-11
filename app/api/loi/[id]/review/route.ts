import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { sendLOIApproved, sendLOIDeclined } from '@/lib/email'
import { isReviewer as checkIsReviewer } from '@/lib/auth/access'

// POST - Admin reviews LOI (approve or decline)
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

    // Check if user is a reviewer/admin
    const reviewerAccess = await checkIsReviewer()
    if (!reviewerAccess) {
      return NextResponse.json({ error: 'Only reviewers can review LOIs' }, { status: 403 })
    }

    const body = await req.json()
    const { decision, reason, notes } = body

    if (!decision || !['APPROVED', 'DECLINED'].includes(decision)) {
      return NextResponse.json(
        { error: 'Decision must be APPROVED or DECLINED' },
        { status: 400 }
      )
    }

    const loi = await prisma.letterOfInterest.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            users: {
              select: { email: true },
              take: 1,
            },
          },
        },
        cycleConfig: true,
      },
    })

    if (!loi) {
      return NextResponse.json({ error: 'Letter of Interest not found' }, { status: 404 })
    }

    // Can only review SUBMITTED or UNDER_REVIEW LOIs
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(loi.status)) {
      return NextResponse.json(
        { error: 'This LOI is not available for review' },
        { status: 400 }
      )
    }

    const reviewerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Reviewer'

    if (decision === 'APPROVED') {
      // Create the full application from LOI data
      const [updatedLoi, application] = await prisma.$transaction([
        // Update LOI status
        prisma.letterOfInterest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedById: user.id,
            reviewedByName: reviewerName,
            reviewedAt: new Date(),
            reviewNotes: notes,
            decisionReason: reason,
          },
        }),
        // Create the application with data from LOI
        prisma.application.create({
          data: {
            organizationId: loi.organizationId,
            loiId: loi.id,
            grantCycle: loi.cycleConfig.cycle,
            cycleYear: loi.cycleConfig.year,
            status: 'DRAFT',
            // Pre-populate from LOI
            projectTitle: loi.projectTitle,
            projectDescription: loi.projectDescription,
            focusArea: loi.focusArea,
            projectCategory: loi.expenditureType,
            amountRequested: loi.grantRequestAmount,
            totalProjectBudget: loi.totalProjectAmount,
            percentageRequested: loi.percentOfProject,
            // Pre-populate from organization
            missionStatement: loi.organization.missionStatement,
            // Start at step 1
            currentStep: 1,
            completedSteps: [],
          },
        }),
        // Create status history
        prisma.lOIStatusHistory.create({
          data: {
            loiId: id,
            previousStatus: loi.status,
            newStatus: 'APPROVED',
            changedById: user.id,
            changedByName: reviewerName,
            reason: reason || 'LOI approved by reviewer',
          },
        }),
      ])

      // Send email notification to applicant about approval
      const applicantEmail = loi.primaryContactEmail || loi.organization.users[0]?.email
      if (applicantEmail) {
        sendLOIApproved({
          loiId: id,
          applicationId: application.id,
          projectTitle: loi.projectTitle || 'Your Project',
          organizationName: loi.organization.legalName,
          applicantEmail,
          fullAppDeadline: loi.cycleConfig.fullAppDeadline?.toISOString(),
        }).catch(err => console.error('Failed to send LOI approval email:', err))
      }

      return NextResponse.json({
        loi: updatedLoi,
        application,
        message: 'LOI approved. Full application created.',
      })
    } else {
      // DECLINED
      const [updatedLoi] = await prisma.$transaction([
        prisma.letterOfInterest.update({
          where: { id },
          data: {
            status: 'DECLINED',
            reviewedById: user.id,
            reviewedByName: reviewerName,
            reviewedAt: new Date(),
            reviewNotes: notes,
            decisionReason: reason,
          },
        }),
        prisma.lOIStatusHistory.create({
          data: {
            loiId: id,
            previousStatus: loi.status,
            newStatus: 'DECLINED',
            changedById: user.id,
            changedByName: reviewerName,
            reason: reason || 'LOI declined by reviewer',
          },
        }),
      ])

      // Send email notification to applicant about decline
      const applicantEmail = loi.primaryContactEmail || loi.organization.users[0]?.email
      if (applicantEmail) {
        sendLOIDeclined({
          projectTitle: loi.projectTitle || 'Your Project',
          organizationName: loi.organization.legalName,
          applicantEmail,
          reason,
        }).catch(err => console.error('Failed to send LOI decline email:', err))
      }

      return NextResponse.json({
        loi: updatedLoi,
        message: 'LOI declined.',
      })
    }
  } catch (error) {
    console.error('Error reviewing LOI:', error)
    return NextResponse.json(
      { error: 'Failed to review Letter of Interest' },
      { status: 500 }
    )
  }
}

// PATCH - Set LOI to UNDER_REVIEW status (when admin starts reviewing)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewerAccess = await checkIsReviewer()
    if (!reviewerAccess) {
      return NextResponse.json({ error: 'Only reviewers can review LOIs' }, { status: 403 })
    }

    const loi = await prisma.letterOfInterest.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!loi) {
      return NextResponse.json({ error: 'Letter of Interest not found' }, { status: 404 })
    }

    if (loi.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Only submitted LOIs can be marked for review' },
        { status: 400 }
      )
    }

    const reviewerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Reviewer'

    const [updatedLoi] = await prisma.$transaction([
      prisma.letterOfInterest.update({
        where: { id },
        data: { status: 'UNDER_REVIEW' },
      }),
      prisma.lOIStatusHistory.create({
        data: {
          loiId: id,
          previousStatus: 'SUBMITTED',
          newStatus: 'UNDER_REVIEW',
          changedById: user.id,
          changedByName: reviewerName,
          reason: 'LOI review started',
        },
      }),
    ])

    return NextResponse.json(updatedLoi)
  } catch (error) {
    console.error('Error updating LOI status:', error)
    return NextResponse.json(
      { error: 'Failed to update Letter of Interest status' },
      { status: 500 }
    )
  }
}
