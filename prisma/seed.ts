import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Grant Cycle Configurations
  const spring2026 = await prisma.grantCycleConfig.upsert({
    where: {
      cycle_year: {
        cycle: 'SPRING',
        year: 2026,
      },
    },
    update: {},
    create: {
      cycle: 'SPRING',
      year: 2026,
      loiOpenDate: new Date('2026-01-01'),
      loiDeadline: new Date('2026-02-15'),
      fullAppDeadline: new Date('2026-03-15'),
      reviewStartDate: new Date('2026-03-20'),
      decisionDate: new Date('2026-04-30'),
      isActive: true,
      acceptingApplications: true,
      maxRequestAmount: 50000,
    },
  })

  const fall2026 = await prisma.grantCycleConfig.upsert({
    where: {
      cycle_year: {
        cycle: 'FALL',
        year: 2026,
      },
    },
    update: {},
    create: {
      cycle: 'FALL',
      year: 2026,
      loiOpenDate: new Date('2026-06-01'),
      loiDeadline: new Date('2026-07-15'),
      fullAppDeadline: new Date('2026-08-15'),
      reviewStartDate: new Date('2026-08-20'),
      decisionDate: new Date('2026-09-30'),
      isActive: false,
      acceptingApplications: false,
      maxRequestAmount: 50000,
    },
  })

  console.log('Created grant cycles:', { spring2026, fall2026 })

  // Create Email Templates
  const templates = [
    {
      name: 'welcome',
      subject: 'Welcome to Heistand Family Foundation Grant Portal',
      body: `Dear {{firstName}},

Welcome to the Heistand Family Foundation Grant Portal! We're glad you've created an account.

To get started, please complete your organization profile. This information will be used to auto-fill future grant applications.

Complete your profile: {{profileUrl}}

If you have any questions, please don't hesitate to contact us.

Best regards,
Heistand Family Foundation`,
      variables: ['firstName', 'lastName', 'email', 'profileUrl'],
    },
    {
      name: 'application_received',
      subject: 'Application Received - {{projectTitle}}',
      body: `Dear {{firstName}},

Thank you for submitting your grant application for "{{projectTitle}}".

We have successfully received your application for the {{cycle}} {{year}} grant cycle. Your application ID is: {{applicationId}}

Our review team will begin evaluating applications after the deadline on {{deadline}}. You can track your application status at any time by logging into the portal.

View your application: {{applicationUrl}}

Thank you for your dedication to serving children in poverty in our community.

Best regards,
Heistand Family Foundation`,
      variables: ['firstName', 'projectTitle', 'cycle', 'year', 'applicationId', 'deadline', 'applicationUrl'],
    },
    {
      name: 'info_requested',
      subject: 'Information Requested - {{projectTitle}}',
      body: `Dear {{firstName}},

We are reviewing your grant application for "{{projectTitle}}" and need some additional information.

{{requestMessage}}

Please respond by {{responseDeadline}}.

Respond to this request: {{responseUrl}}

Thank you for your prompt attention to this matter.

Best regards,
Heistand Family Foundation`,
      variables: ['firstName', 'projectTitle', 'requestMessage', 'responseDeadline', 'responseUrl'],
    },
    {
      name: 'application_approved',
      subject: 'Grant Application Approved - {{projectTitle}}',
      body: `Dear {{firstName}},

Congratulations! We are pleased to inform you that your grant application for "{{projectTitle}}" has been approved.

Grant Amount: ${{amountApproved}}

We will be in touch shortly with next steps regarding the grant agreement and disbursement process.

View your application: {{applicationUrl}}

Thank you for your commitment to serving children in poverty in our community.

Best regards,
Heistand Family Foundation`,
      variables: ['firstName', 'projectTitle', 'amountApproved', 'applicationUrl'],
    },
    {
      name: 'application_declined',
      subject: 'Grant Application Decision - {{projectTitle}}',
      body: `Dear {{firstName}},

Thank you for submitting your grant application for "{{projectTitle}}" to the Heistand Family Foundation.

After careful consideration, we regret to inform you that we are unable to fund your proposal at this time. This decision in no way reflects on the quality of your work or the importance of your mission.

We receive many more worthy applications than we can fund, and we must make difficult choices to align with our strategic priorities.

We encourage you to apply again in future grant cycles. You may view eligibility criteria and deadlines at: {{eligibilityUrl}}

Thank you for your dedication to serving our community.

Best regards,
Heistand Family Foundation`,
      variables: ['firstName', 'projectTitle', 'eligibilityUrl'],
    },
    {
      name: 'deadline_reminder',
      subject: 'Grant Application Deadline Approaching',
      body: `Dear {{firstName}},

This is a friendly reminder that the application deadline for the {{cycle}} {{year}} grant cycle is approaching.

Deadline: {{deadline}}
Days Remaining: {{daysRemaining}}

You have {{draftCount}} draft application(s) that have not been submitted.

Complete your applications: {{dashboardUrl}}

If you have any questions or need assistance, please contact us.

Best regards,
Heistand Family Foundation`,
      variables: ['firstName', 'cycle', 'year', 'deadline', 'daysRemaining', 'draftCount', 'dashboardUrl'],
    },
  ]

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template,
    })
  }

  console.log('Created email templates:', templates.length)

  // Create a test organization for development
  if (process.env.NODE_ENV === 'development') {
    const testOrg = await prisma.organization.upsert({
      where: { ein: '47-1234567' },
      update: {},
      create: {
        legalName: 'Omaha Youth Services',
        ein: '47-1234567',
        address: '123 Main Street',
        city: 'Omaha',
        state: 'NE',
        zipCode: '68102',
        phone: '(402) 555-0100',
        website: 'https://example.org',
        missionStatement: 'To empower youth through education and mentorship programs that break the cycle of poverty.',
        is501c3: true,
        executiveDirectorName: 'Jane Smith',
        executiveDirectorEmail: 'jane@example.org',
        executiveDirectorPhone: '(402) 555-0101',
        yearFounded: 2008,
        fullTimeStaff: 12,
        partTimeStaff: 8,
        volunteers: 45,
        boardMembers: 9,
        annualBudget: 1250000,
        fiscalYearEnd: 'December 31',
        form990Year: 2024,
        form990TotalRevenue: 1340000,
        form990TotalExpenses: 1280000,
        form990NetAssets: 450000,
        form990ProgramExpenses: 1049600, // 82%
        form990AdminExpenses: 153600, // 12%
        form990FundraisingExpenses: 76800, // 6%
        profileComplete: true,
        profileCompletedAt: new Date(),
      },
    })

    console.log('Created test organization:', testOrg.legalName)
  }

  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
