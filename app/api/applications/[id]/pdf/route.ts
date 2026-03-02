import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { canAccessApplication } from '@/lib/auth/access'
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
  INFO_REQUESTED: 'Info Requested',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  WITHDRAWN: 'Withdrawn',
}

const geographyLabels: Record<string, string> = {
  OMAHA_COUNCIL_BLUFFS: 'Omaha / Council Bluffs',
  WESTERN_IOWA_100_MILES: 'Western Iowa (within 100 miles)',
  OTHER: 'Other',
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

function parseJsonField(value: any): any[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }
  return []
}

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
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Build the PDF
    const pdf = new PDFBuilder(
      'Grant Application',
      `${application.organization.legalName} — ${application.grantCycle} ${application.cycleYear}`
    )
    await pdf.init()

    // Status & Submission Info
    pdf.statusBadge('Status', statusLabels[application.status] || application.status)
    if (application.submittedAt) {
      pdf.field('Submitted', formatDate(application.submittedAt))
    }

    // Organization Info
    pdf.sectionHeading('Organization Information')
    pdf.fieldRow(
      { label: 'Organization', value: application.organization.legalName },
      { label: 'DBA Name', value: application.organization.dbaName }
    )
    pdf.fieldRow(
      { label: 'EIN', value: application.organization.ein },
      { label: 'Website', value: application.organization.website }
    )
    const address = [
      application.organization.address,
      application.organization.city,
      application.organization.state,
      application.organization.zipCode,
    ]
      .filter(Boolean)
      .join(', ')
    pdf.field('Address', address || null)
    if (application.organization.missionStatement) {
      pdf.textBlock('Mission Statement', application.organization.missionStatement)
    }

    // Project Overview
    pdf.sectionHeading('Project Overview')
    pdf.field('Project Title', application.projectTitle)
    pdf.fieldRow(
      { label: 'Focus Area', value: application.focusArea ? focusAreaLabels[application.focusArea] : null },
      { label: 'Project Category', value: application.projectCategory ? expenditureLabels[application.projectCategory] : null }
    )
    pdf.textBlock('Project Description', application.projectDescription)
    pdf.textBlock('Project Goals', application.projectGoals)

    // Proposed Project Details
    if (application.proposedProject || application.statementOfNeed || application.proposedExpenditures) {
      pdf.sectionHeading('Proposed Project Details')
      if (application.proposedProject) {
        pdf.textBlock('Proposed Project', application.proposedProject)
      }
      if (application.statementOfNeed) {
        pdf.textBlock('Statement of Need', application.statementOfNeed)
      }
      if (application.proposedExpenditures) {
        pdf.textBlock('Proposed Expenditures', application.proposedExpenditures)
      }
    }

    // Target Population
    pdf.sectionHeading('Target Population')
    pdf.textBlock('Target Population Description', application.targetPopulation)
    pdf.fieldRow(
      { label: 'Children Served', value: application.childrenServed?.toString() },
      { label: 'Age Range', value: application.ageRangeStart && application.ageRangeEnd ? `${application.ageRangeStart} – ${application.ageRangeEnd}` : null }
    )
    pdf.textBlock('Poverty Indicators', application.povertyIndicators)

    // Demographics
    if (application.clientDemographic || application.childrenInPovertyImpacted || application.totalChildrenServedAnnually) {
      pdf.sectionHeading('Demographics & Poverty Metrics')
      if (application.clientDemographic) {
        pdf.textBlock('Client Demographics', application.clientDemographic)
      }
      pdf.fieldRow(
        { label: 'Children in Poverty Impacted', value: application.childrenInPovertyImpacted?.toString() },
        { label: 'Total Children Served Annually', value: application.totalChildrenServedAnnually?.toString() }
      )
      if (application.povertyPercentage) {
        pdf.field('Poverty Percentage', `${Number(application.povertyPercentage).toFixed(1)}%`)
      }
    }

    // Timeline
    pdf.sectionHeading('Project Timeline')
    pdf.fieldRow(
      { label: 'Start Date', value: formatDate(application.projectStartDate) },
      { label: 'End Date', value: formatDate(application.projectEndDate) }
    )
    pdf.field('Geographic Area', application.geographicArea)
    if (application.geographyServed && application.geographyServed.length > 0) {
      pdf.field(
        'Geography Served',
        application.geographyServed.map((g: string) => geographyLabels[g] || g).join(', ')
      )
    }
    if (application.timelineDetails) {
      pdf.textBlock('Timeline Details', application.timelineDetails)
    }

    // Funding
    pdf.sectionHeading('Funding Request')
    pdf.fieldRow(
      { label: 'Amount Requested', value: formatCurrency(application.amountRequested) },
      { label: 'Total Project Budget', value: formatCurrency(application.totalProjectBudget) }
    )
    if (application.percentageRequested) {
      pdf.field('Percentage of Budget', `${Number(application.percentageRequested).toFixed(1)}%`)
    }

    // Confirmed Funding Sources
    const confirmedSources = parseJsonField(application.confirmedFundingSources)
    if (confirmedSources.length > 0) {
      pdf.table(
        'Confirmed Funding Sources',
        ['Source', 'Amount'],
        confirmedSources.map((s: any) => [s.name || s.source || '—', formatCurrency(s.amount)])
      )
    }

    // Pending Funding Sources
    const pendingSources = parseJsonField(application.pendingFundingSources)
    if (pendingSources.length > 0) {
      pdf.table(
        'Pending Funding Sources',
        ['Source', 'Amount'],
        pendingSources.map((s: any) => [s.name || s.source || '—', formatCurrency(s.amount)])
      )
    }

    if (application.otherFundingSources) {
      pdf.textBlock('Other Funding Sources', application.otherFundingSources)
    }

    // Previous HFF Grants
    const previousGrants = parseJsonField(application.previousHFFGrantsData)
    if (previousGrants.length > 0) {
      pdf.table(
        'Previous HFF Grants',
        ['Date', 'Amount', 'Project Title'],
        previousGrants.map((g: any) => [g.date || '—', formatCurrency(g.amount), g.projectTitle || '—'])
      )
    }

    // Outcomes & Impact
    pdf.sectionHeading('Outcomes & Impact')
    pdf.textBlock('Expected Outcomes', application.expectedOutcomes)
    pdf.textBlock('Measurement Plan', application.measurementPlan)
    pdf.textBlock('Sustainability Plan', application.sustainabilityPlan)

    // Board of Directors
    const boardMembers = parseJsonField(application.boardMembers)
    if (boardMembers.length > 0) {
      pdf.sectionHeading('Board of Directors')
      pdf.table(
        'Board Members',
        ['Name', 'Title', 'Affiliation'],
        boardMembers.map((m: any) => [m.name || '—', m.title || '—', m.affiliation || '—'])
      )
    }

    // Signature
    if (application.signatureName) {
      pdf.sectionHeading('Certification')
      pdf.fieldRow(
        { label: 'Signed By', value: application.signatureName },
        { label: 'Title', value: application.signatureTitle }
      )
      if (application.signatureDate) {
        pdf.field('Signature Date', formatDate(application.signatureDate))
      }
    }

    const pdfBytes = await pdf.save()
    const buffer = Buffer.from(pdfBytes)

    const filename = `Application-${(application.projectTitle || 'Grant-Application').replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')}.pdf`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating Application PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
