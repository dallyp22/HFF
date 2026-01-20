import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isReviewer as checkIsReviewer } from '@/lib/auth/access'

// GET - Fetch a single LOI
export async function GET(
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
      select: { organizationId: true },
    })

    const reviewerAccess = await checkIsReviewer()

    const loi = await prisma.letterOfInterest.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            legalName: true,
            dbaName: true,
            ein: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            website: true,
            missionStatement: true,
            is501c3: true,
            executiveDirectorName: true,
            executiveDirectorEmail: true,
          },
        },
        cycleConfig: {
          select: {
            id: true,
            cycle: true,
            year: true,
            loiDeadline: true,
            loiReviewDeadline: true,
            fullAppOpenDate: true,
            fullAppDeadline: true,
            maxRequestAmount: true,
          },
        },
        documents: {
          select: {
            id: true,
            name: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            storageUrl: true,
            uploadedAt: true,
          },
        },
        application: {
          select: {
            id: true,
            status: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!loi) {
      return NextResponse.json({ error: 'Letter of Interest not found' }, { status: 404 })
    }

    // Check access: reviewers can see all, applicants only their org's
    if (!reviewerAccess && loi.organizationId !== dbUser?.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(loi)
  } catch (error) {
    console.error('Error fetching LOI:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Letter of Interest' },
      { status: 500 }
    )
  }
}

// PATCH - Update an LOI (draft mode only for applicants)
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

    const body = await req.json()

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const reviewerAccess = await checkIsReviewer()

    const loi = await prisma.letterOfInterest.findUnique({
      where: { id },
      select: {
        organizationId: true,
        status: true,
      },
    })

    if (!loi) {
      return NextResponse.json({ error: 'Letter of Interest not found' }, { status: 404 })
    }

    // Applicants can only edit their own org's LOI
    if (!reviewerAccess && loi.organizationId !== dbUser?.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Applicants can only edit DRAFT LOIs
    if (!reviewerAccess && loi.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot edit a submitted Letter of Interest' },
        { status: 400 }
      )
    }

    // Calculate percent of project if amounts provided
    let percentOfProject = body.percentOfProject
    if (body.grantRequestAmount && body.totalProjectAmount) {
      const grantAmount = parseFloat(body.grantRequestAmount)
      const totalAmount = parseFloat(body.totalProjectAmount)
      if (totalAmount > 0) {
        percentOfProject = (grantAmount / totalAmount) * 100
      }
    }

    // Build update data, removing undefined values
    const updateData: any = {
      lastSavedAt: new Date(),
    }

    // Contact info
    if (body.primaryContactName !== undefined) updateData.primaryContactName = body.primaryContactName
    if (body.primaryContactTitle !== undefined) updateData.primaryContactTitle = body.primaryContactTitle
    if (body.primaryContactPhone !== undefined) updateData.primaryContactPhone = body.primaryContactPhone
    if (body.primaryContactEmail !== undefined) updateData.primaryContactEmail = body.primaryContactEmail
    if (body.executiveDirector !== undefined) updateData.executiveDirector = body.executiveDirector

    // Focus area
    if (body.focusArea !== undefined) updateData.focusArea = body.focusArea
    if (body.expenditureType !== undefined) updateData.expenditureType = body.expenditureType

    // Project questions
    if (body.isNewProject !== undefined) updateData.isNewProject = body.isNewProject
    if (body.newProjectExplanation !== undefined) updateData.newProjectExplanation = body.newProjectExplanation
    if (body.isCapacityIncrease !== undefined) updateData.isCapacityIncrease = body.isCapacityIncrease
    if (body.capacityExplanation !== undefined) updateData.capacityExplanation = body.capacityExplanation

    // Project details
    if (body.projectTitle !== undefined) updateData.projectTitle = body.projectTitle
    if (body.projectDescription !== undefined) updateData.projectDescription = body.projectDescription

    // Financial
    if (body.totalProjectAmount !== undefined) updateData.totalProjectAmount = body.totalProjectAmount
    if (body.grantRequestAmount !== undefined) updateData.grantRequestAmount = body.grantRequestAmount
    if (percentOfProject !== undefined) updateData.percentOfProject = percentOfProject
    if (body.budgetOutline !== undefined) updateData.budgetOutline = body.budgetOutline

    // Form progress
    if (body.currentStep !== undefined) updateData.currentStep = body.currentStep
    if (body.completedSteps !== undefined) updateData.completedSteps = body.completedSteps

    const updatedLoi = await prisma.letterOfInterest.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: { legalName: true },
        },
        cycleConfig: {
          select: {
            cycle: true,
            year: true,
            loiDeadline: true,
          },
        },
      },
    })

    return NextResponse.json(updatedLoi)
  } catch (error) {
    console.error('Error updating LOI:', error)
    return NextResponse.json(
      { error: 'Failed to update Letter of Interest' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a draft LOI
export async function DELETE(
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
      select: { organizationId: true },
    })

    const loi = await prisma.letterOfInterest.findUnique({
      where: { id },
      select: {
        organizationId: true,
        status: true,
      },
    })

    if (!loi) {
      return NextResponse.json({ error: 'Letter of Interest not found' }, { status: 404 })
    }

    // Only the org's users can delete their own LOI
    if (loi.organizationId !== dbUser?.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Can only delete DRAFT LOIs
    if (loi.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Cannot delete a submitted Letter of Interest' },
        { status: 400 }
      )
    }

    await prisma.letterOfInterest.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting LOI:', error)
    return NextResponse.json(
      { error: 'Failed to delete Letter of Interest' },
      { status: 500 }
    )
  }
}
