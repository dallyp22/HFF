import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

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

Grant Amount: $\{\{amountApproved\}\}

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

  // Create test organizations and applications
  console.log('Creating sample organizations and applications...')

  const organizations = [
    {
      legalName: 'Omaha Youth Services',
      ein: '47-1234567',
      address: '123 Main Street',
      city: 'Omaha',
      state: 'NE',
      zipCode: '68102',
      phone: '(402) 555-0100',
      website: 'https://omahayouth.org',
      missionStatement: 'To empower youth through education and mentorship programs that break the cycle of poverty.',
      is501c3: true,
      executiveDirectorName: 'Jane Smith',
      executiveDirectorEmail: 'jane@omahayouth.org',
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
      form990ProgramExpenses: 1049600,
      form990AdminExpenses: 153600,
      form990FundraisingExpenses: 76800,
      profileComplete: true,
      profileCompletedAt: new Date(),
    },
    {
      legalName: 'Council Bluffs Community Center',
      ein: '47-2345678',
      address: '456 Oak Avenue',
      city: 'Council Bluffs',
      state: 'IA',
      zipCode: '51501',
      phone: '(712) 555-0200',
      missionStatement: 'Providing after-school programs and summer camps for children from low-income families.',
      is501c3: true,
      executiveDirectorName: 'Robert Johnson',
      executiveDirectorEmail: 'rjohnson@cbcc.org',
      yearFounded: 2015,
      fullTimeStaff: 8,
      partTimeStaff: 12,
      volunteers: 30,
      boardMembers: 7,
      annualBudget: 850000,
      form990Year: 2024,
      form990TotalRevenue: 920000,
      form990TotalExpenses: 880000,
      form990NetAssets: 180000,
      form990ProgramExpenses: 748000,
      profileComplete: true,
      profileCompletedAt: new Date(),
    },
    {
      legalName: 'Hope Center for Children',
      ein: '47-3456789',
      address: '789 Elm Street',
      city: 'Omaha',
      state: 'NE',
      zipCode: '68104',
      phone: '(402) 555-0300',
      missionStatement: 'Supporting children experiencing homelessness with educational resources and stable environments.',
      is501c3: true,
      executiveDirectorName: 'Maria Garcia',
      executiveDirectorEmail: 'mgarcia@hopecenter.org',
      yearFounded: 2010,
      fullTimeStaff: 15,
      partTimeStaff: 5,
      volunteers: 60,
      boardMembers: 11,
      annualBudget: 1800000,
      form990Year: 2024,
      form990TotalRevenue: 1950000,
      form990TotalExpenses: 1820000,
      form990NetAssets: 620000,
      form990ProgramExpenses: 1547000,
      profileComplete: true,
      profileCompletedAt: new Date(),
    },
  ]

  for (const orgData of organizations) {
    const org = await prisma.organization.upsert({
      where: { ein: orgData.ein },
      update: {},
      create: orgData,
    })

    // Create 2-3 applications for each org
    const applicationData = [
      {
        projectTitle: 'Youth Literacy Program',
        projectDescription: 'A comprehensive after-school literacy program serving 50 children in grades 3-5 from low-income families. Students receive one-on-one tutoring and take-home books.',
        projectGoals: 'Improve reading proficiency by 2 grade levels within one academic year.',
        targetPopulation: 'Children in grades 3-5 reading below grade level, primarily from families qualifying for free/reduced lunch.',
        childrenServed: 50,
        ageRangeStart: 8,
        ageRangeEnd: 11,
        povertyIndicators: '100% of participants qualify for free/reduced lunch programs. Average household income $28,000.',
        geographicArea: 'Omaha Public Schools District 3',
        projectStartDate: new Date('2026-09-01'),
        projectEndDate: new Date('2027-05-31'),
        amountRequested: 35000,
        totalProjectBudget: 52000,
        percentageRequested: 67.3,
        otherFundingSources: 'United Way grant ($10,000), Individual donations ($7,000)',
        expectedOutcomes: 'At least 80% of participants will improve reading levels by 1+ grade levels. 90% attendance rate. Increased confidence in reading.',
        measurementPlan: 'Pre/post reading assessments using Fountas & Pinnell. Monthly progress monitoring. Parent surveys.',
        sustainabilityPlan: 'Program will continue with school district partnership and ongoing fundraising.',
        beneficiariesCount: 50,
        status: 'SUBMITTED' as any,
        submittedAt: new Date('2026-01-05'),
        submittedById: 'seed_user_1',
        submittedByName: 'Program Director',
      },
      {
        projectTitle: 'Summer STEM Camp',
        projectDescription: 'Week-long STEM camp for 30 middle school students from underserved communities.',
        projectGoals: 'Increase STEM interest and skills among middle school students.',
        targetPopulation: 'Middle school students (grades 6-8) from Title I schools.',
        childrenServed: 30,
        ageRangeStart: 11,
        ageRangeEnd: 14,
        povertyIndicators: 'All participants from Title I schools with 85%+ free/reduced lunch rates.',
        geographicArea: 'Omaha metro area',
        projectStartDate: new Date('2026-06-15'),
        projectEndDate: new Date('2026-08-15'),
        amountRequested: 25000,
        totalProjectBudget: 35000,
        percentageRequested: 71.4,
        expectedOutcomes: 'Students will complete 3 STEM projects. 80% will report increased interest in STEM.',
        measurementPlan: 'Pre/post surveys, project completion rates, parent feedback.',
        sustainabilityPlan: 'Annual program with rotating corporate sponsorships.',
        beneficiariesCount: 30,
        status: 'UNDER_REVIEW' as any,
        submittedAt: new Date('2026-01-08'),
        submittedById: 'seed_user_2',
        submittedByName: 'Program Coordinator',
      },
    ]

    for (const appData of applicationData.slice(0, org.legalName === 'Omaha Youth Services' ? 2 : 1)) {
      await prisma.application.create({
        data: {
          ...appData,
          organizationId: org.id,
          grantCycle: 'SPRING',
          cycleYear: 2026,
        },
      })
    }
  }

  console.log('Created sample organizations and applications')

  // Create Foundation Settings
  const foundationSettings = await prisma.foundationSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      foundationName: 'Heistand Family Foundation',
      tagline: 'Encouraging opportunities for children in poverty',
      missionStatement: 'To encourage and multiply opportunities for children in poverty.',
      visionStatement: 'A community where every child has access to the resources and support they need to thrive.',
      primaryEmail: 'grants@heistandfamilyfoundation.org',
      phoneNumber: '(402) 555-0100',
      websiteUrl: 'https://heistandfamilyfoundation.org',
      streetAddress: '123 Foundation Way',
      city: 'Omaha',
      state: 'NE',
      zipCode: '68102',
      focusAreas: ['Children in Poverty', 'Education', 'Community Development'],
    },
  })

  console.log('Created foundation settings:', foundationSettings)

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
