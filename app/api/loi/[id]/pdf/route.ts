import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isReviewer as checkIsReviewer } from '@/lib/auth/access'
import { PDFBuilder } from '@/lib/pdf/builder'

const focusAreaLabels: Record<string, string> = {
  HUMAN_HEALTH: 'Human Health & Wellbeing',
  EDUCATION: 'Education & Development',
  COMMUNITY_WELLBEING: 'Community Well-Being',
}

const expenditureLabels: Record<string, string> = {
  PROGRAMMING: 'Programming / Special Project',
  OPERATING: 'Operating Funding',
  CAPITAL: 'Capital Project',
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Selected for Award Consideration',
  DECLINED: 'No Funding Consideration',
  WITHDRAWN: 'Withdrawn',
}

function formatCurrency(amount: any): string {
  if (!amount) return '—'
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount)
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num)
}

function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

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
            legalName: true,
            dbaName: true,
            ein: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            website: true,
            missionStatement: true,
          },
        },
        cycleConfig: {
          select: {
            cycle: true,
            year: true,
          },
        },
      },
    })

    if (!loi) {
      return NextResponse.json({ error: 'LOI not found' }, { status: 404 })
    }

    if (!reviewerAccess && loi.organizationId !== dbUser?.organizationId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Build the PDF
    const pdf = new PDFBuilder(
      'Letter of Interest',
      `${loi.organization.legalName} — ${loi.cycleConfig.cycle} ${loi.cycleConfig.year}`
    )
    await pdf.init()

    // Status & Submission Info
    pdf.statusBadge('Status', statusLabels[loi.status] || loi.status)
    if (loi.submittedAt) {
      pdf.field('Submitted', formatDate(loi.submittedAt))
    }

    // Organization Info
    pdf.sectionHeading('Organization Information')
    pdf.fieldRow(
      { label: 'Organization', value: loi.organization.legalName },
      { label: 'DBA Name', value: loi.organization.dbaName }
    )
    pdf.fieldRow(
      { label: 'EIN', value: loi.organization.ein },
      { label: 'Website', value: loi.organization.website }
    )
    const address = [
      loi.organization.address,
      loi.organization.city,
      loi.organization.state,
      loi.organization.zipCode,
    ]
      .filter(Boolean)
      .join(', ')
    pdf.field('Address', address || null)

    // Contact Information
    pdf.sectionHeading('Contact Information')
    pdf.fieldRow(
      { label: 'Primary Contact', value: loi.primaryContactName },
      { label: 'Title', value: loi.primaryContactTitle }
    )
    pdf.fieldRow(
      { label: 'Email', value: loi.primaryContactEmail },
      { label: 'Phone', value: loi.primaryContactPhone }
    )
    pdf.field('Executive Director', loi.executiveDirector)

    // Focus Area & Expenditure Type
    pdf.sectionHeading('Focus Area & Expenditure Type')
    pdf.fieldRow(
      { label: 'Focus Area', value: loi.focusArea ? focusAreaLabels[loi.focusArea] : null },
      { label: 'Expenditure Type', value: loi.expenditureType ? expenditureLabels[loi.expenditureType] : null }
    )

    // Project Context
    pdf.sectionHeading('Project Context')
    pdf.fieldRow(
      { label: 'New Project or Emerging Need?', value: loi.isNewProject === true ? 'Yes' : loi.isNewProject === false ? 'No' : null },
      { label: 'Increasing Capacity?', value: loi.isCapacityIncrease === true ? 'Yes' : loi.isCapacityIncrease === false ? 'No' : null }
    )
    if (loi.isNewProject && loi.newProjectExplanation) {
      pdf.textBlock('New Project Explanation', loi.newProjectExplanation)
    }
    if (loi.isCapacityIncrease && loi.capacityExplanation) {
      pdf.textBlock('Capacity Increase Explanation', loi.capacityExplanation)
    }

    // Project Overview
    pdf.sectionHeading('Project Overview')
    pdf.field('Project Title', loi.projectTitle)
    pdf.textBlock('Project Description', loi.projectDescription)
    pdf.textBlock('Project Goals', loi.projectGoals)

    // Financial Information
    pdf.sectionHeading('Financial Information')
    pdf.fieldRow(
      { label: 'Grant Request Amount', value: formatCurrency(loi.grantRequestAmount) },
      { label: 'Total Project Amount', value: formatCurrency(loi.totalProjectAmount) }
    )
    if (loi.percentOfProject) {
      pdf.field('Percent of Total Project', `${Number(loi.percentOfProject).toFixed(1)}%`)
    }
    pdf.textBlock('Budget Outline', loi.budgetOutline)

    // Decision info (if reviewed)
    if (loi.decisionReason) {
      pdf.sectionHeading('Review Decision')
      pdf.textBlock('Reviewer Feedback', loi.decisionReason)
    }

    const pdfBytes = await pdf.save()
    const buffer = Buffer.from(pdfBytes)

    const filename = `LOI-${(loi.projectTitle || 'Letter-of-Interest').replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')}.pdf`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating LOI PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
