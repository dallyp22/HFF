import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { canAccessApplication, canModifyApplication } from '@/lib/auth/access'

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

    const hasAccess = await canAccessApplication(id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        organization: true,
        documents: true,
        notes: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        communications: {
          orderBy: { sentAt: 'desc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const canModify = await canModifyApplication(id)

    if (!canModify) {
      return NextResponse.json(
        { error: 'Cannot modify this application' },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Convert and clean data
    const updateData: any = {
      lastSavedAt: new Date(),
    }

    // String fields
    const stringFields = ['projectTitle', 'projectDescription', 'projectGoals', 'targetPopulation', 
      'geographicArea', 'povertyIndicators', 'schoolsServed', 'otherFundingSources', 
      'previousHFFGrants', 'expectedOutcomes', 'measurementPlan', 'sustainabilityPlan']
    
    stringFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== '') {
        updateData[field] = body[field]
      }
    })

    // Number fields
    if (body.childrenServed) updateData.childrenServed = parseInt(body.childrenServed)
    if (body.ageRangeStart) updateData.ageRangeStart = parseInt(body.ageRangeStart)
    if (body.ageRangeEnd) updateData.ageRangeEnd = parseInt(body.ageRangeEnd)
    if (body.beneficiariesCount) updateData.beneficiariesCount = parseInt(body.beneficiariesCount)
    
    // Decimal fields
    if (body.amountRequested) updateData.amountRequested = parseFloat(body.amountRequested)
    if (body.totalProjectBudget) updateData.totalProjectBudget = parseFloat(body.totalProjectBudget)
    
    // Calculate percentage
    if (updateData.amountRequested && updateData.totalProjectBudget) {
      updateData.percentageRequested = (updateData.amountRequested / updateData.totalProjectBudget) * 100
    }

    // Date fields
    if (body.projectStartDate) updateData.projectStartDate = new Date(body.projectStartDate)
    if (body.projectEndDate) updateData.projectEndDate = new Date(body.projectEndDate)

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating application:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to update application', details: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update application' },
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

    const canModify = await canModifyApplication(id)

    if (!canModify) {
      return NextResponse.json(
        { error: 'Cannot delete this application' },
        { status: 403 }
      )
    }

    await prisma.application.delete({
      where: { id },
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
