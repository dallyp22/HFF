import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { OrganizationDetailClient } from '@/components/reviewer/OrganizationDetailClient'

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { submittedAt: 'desc' },
      },
      documents: {
        where: { scope: 'ORGANIZATION' },
      },
    },
  })

  if (!organization) {
    notFound()
  }

  const programRatio =
    organization.form990TotalExpenses && organization.form990ProgramExpenses
      ? (
          (parseFloat(organization.form990ProgramExpenses.toString()) /
            parseFloat(organization.form990TotalExpenses.toString())) *
          100
        ).toFixed(1)
      : null

  return (
    <OrganizationDetailClient
      organization={{
        id: organization.id,
        legalName: organization.legalName,
        ein: organization.ein,
        missionStatement: organization.missionStatement,
        executiveDirectorName: organization.executiveDirectorName,
        executiveDirectorEmail: organization.executiveDirectorEmail,
        city: organization.city,
        state: organization.state,
        yearFounded: organization.yearFounded,
        annualBudget: organization.annualBudget
          ? parseFloat(organization.annualBudget.toString())
          : null,
        fullTimeStaff: organization.fullTimeStaff,
        partTimeStaff: organization.partTimeStaff,
        volunteers: organization.volunteers,
        form990Year: organization.form990Year,
        form990TotalRevenue: organization.form990TotalRevenue
          ? parseFloat(organization.form990TotalRevenue.toString())
          : null,
        form990TotalExpenses: organization.form990TotalExpenses
          ? parseFloat(organization.form990TotalExpenses.toString())
          : null,
        form990NetAssets: organization.form990NetAssets
          ? parseFloat(organization.form990NetAssets.toString())
          : null,
        programRatio: programRatio ? parseFloat(programRatio) : null,
      }}
      applications={organization.applications.map((app: any) => ({
        id: app.id,
        projectTitle: app.projectTitle,
        status: app.status,
        grantCycle: app.grantCycle,
        cycleYear: app.cycleYear,
        amountRequested: app.amountRequested ? parseFloat(app.amountRequested.toString()) : null,
      }))}
      documents={organization.documents.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        storageUrl: doc.storageUrl,
        documentYear: doc.documentYear,
        uploadedAt: doc.uploadedAt.toISOString(),
        uploadedByName: doc.uploadedByName,
      }))}
    />
  )
}
