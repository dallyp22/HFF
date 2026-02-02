import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Default values (match the DB defaults in settings route)
const DEFAULT_PRIORITIES = [
  'Direct impact on children in poverty (primary mission alignment)',
  'Geographic fit within service area',
  'Organizational capacity and track record',
  'Budget reasonableness and sustainability',
  'Measurable outcomes',
]

const DEFAULT_GEOGRAPHIC_FOCUS = 'Omaha/Council Bluffs metro area and Western Iowa, 100-mile radius'

export interface AIScoringConfig {
  priorities: string[]
  geographicFocus: string
  customGuidance: string
  temperature: number
  maxTokens: number
}

export function buildSystemPrompt(config?: Partial<AIScoringConfig>): string {
  const priorities = config?.priorities?.length ? config.priorities : DEFAULT_PRIORITIES
  const geographicFocus = config?.geographicFocus || DEFAULT_GEOGRAPHIC_FOCUS
  const customGuidance = config?.customGuidance || ''

  const prioritiesList = priorities
    .map((p, i) => `${i + 1}. ${p}`)
    .join('\n')

  let prompt = `You are an expert grant analyst for the Heistand Family Foundation, a charitable organization with the mission: "To encourage and multiply opportunities for children in poverty" in the ${geographicFocus}.

Analyze grant applications with these priorities:
${prioritiesList}

Be objective, thorough, and constructive. Provide scores on a 1-100 scale where:
- 80-100: Excellent alignment/capacity
- 60-79: Good, with some areas to strengthen
- 40-59: Moderate alignment, significant concerns
- <40: Poor fit for foundation priorities

Return analysis as valid JSON only, no additional text.`

  if (customGuidance) {
    prompt += `\n\nAdditional guidance:\n${customGuidance}`
  }

  return prompt
}

// Backward-compatible export using defaults
export const SYSTEM_PROMPT = buildSystemPrompt()

export async function getAIScoringConfig(): Promise<{
  config: AIScoringConfig
  temperature: number
  maxTokens: number
}> {
  const settings = await prisma.foundationSettings.findUnique({
    where: { id: 'default' },
    select: {
      aiScoringPriorities: true,
      aiGeographicFocus: true,
      aiCustomGuidance: true,
      aiTemperature: true,
      aiMaxTokens: true,
    },
  })

  const config: AIScoringConfig = {
    priorities: settings?.aiScoringPriorities?.length ? settings.aiScoringPriorities : DEFAULT_PRIORITIES,
    geographicFocus: settings?.aiGeographicFocus || DEFAULT_GEOGRAPHIC_FOCUS,
    customGuidance: settings?.aiCustomGuidance || '',
    temperature: settings?.aiTemperature ?? 0.3,
    maxTokens: settings?.aiMaxTokens ?? 2000,
  }

  return {
    config,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  }
}

export interface AISummaryResponse {
  overview: string
  missionAlignment: {
    score: number
    reasoning: string
    keyFactors: string[]
  }
  budgetAnalysis: {
    highlights: string[]
    concerns: string[]
    reasonableness: 'low' | 'moderate' | 'high'
    percentageOfOrgBudget: number
  }
  organizationStrength: {
    score: number
    reasoning: string
  }
  strengths: string[]
  concerns: string[]
  recommendedQuestions: string[]
}

export function buildAnalysisPrompt(application: any): string {
  const org = application.organization

  // Calculate program expense ratio
  const programRatio = org.form990TotalExpenses && org.form990ProgramExpenses
    ? ((org.form990ProgramExpenses / org.form990TotalExpenses) * 100).toFixed(1)
    : 'N/A'

  const percentOfOrgBudget = org.annualBudget && application.amountRequested
    ? ((application.amountRequested / org.annualBudget) * 100).toFixed(1)
    : 'N/A'

  return `
# ORGANIZATION PROFILE

**Name:** ${org.legalName}
**EIN:** ${org.ein}
**Founded:** ${org.yearFounded || 'Unknown'}
**Location:** ${org.city}, ${org.state}

**Mission Statement:**
${org.missionStatement}

**Executive Director:** ${org.executiveDirectorName} (${org.executiveDirectorEmail})

## Organizational Capacity

- Full-Time Staff: ${org.fullTimeStaff || 'Not specified'}
- Part-Time Staff: ${org.partTimeStaff || 'Not specified'}
- Volunteers: ${org.volunteers || 'Not specified'}
- Board Members: ${org.boardMembers || 'Not specified'}

## Financial Health

**Annual Budget:** $${org.annualBudget?.toLocaleString() || 'Not specified'}
**Fiscal Year End:** ${org.fiscalYearEnd || 'Not specified'}

### Form 990 Summary (${org.form990Year || 'Year not specified'})

- **Total Revenue:** $${org.form990TotalRevenue?.toLocaleString() || 'Not specified'}
- **Total Expenses:** $${org.form990TotalExpenses?.toLocaleString() || 'Not specified'}
- **Net Assets:** $${org.form990NetAssets?.toLocaleString() || 'Not specified'}
- **Program Expenses:** $${org.form990ProgramExpenses?.toLocaleString() || 'Not specified'} (${programRatio}% of total)
- **Admin Expenses:** $${org.form990AdminExpenses?.toLocaleString() || 'Not specified'}
- **Fundraising Expenses:** $${org.form990FundraisingExpenses?.toLocaleString() || 'Not specified'}

---

# GRANT APPLICATION

## Project Details

**Title:** ${application.projectTitle || 'Not specified'}
**Cycle:** ${application.grantCycle} ${application.cycleYear}

**Description:**
${application.projectDescription || 'Not specified'}

**Goals:**
${application.projectGoals || 'Not specified'}

**Geographic Area:** ${application.geographicArea || 'Not specified'}
**Timeline:** ${application.projectStartDate ? format(new Date(application.projectStartDate), 'MMM d, yyyy') : 'TBD'} to ${application.projectEndDate ? format(new Date(application.projectEndDate), 'MMM d, yyyy') : 'TBD'}

## Target Population

**Total Beneficiaries:** ${application.beneficiariesCount || 'Not specified'}
**Children Served:** ${application.childrenServed || 'Not specified'}
**Age Range:** ${application.ageRangeStart && application.ageRangeEnd ? `${application.ageRangeStart}-${application.ageRangeEnd} years` : 'Not specified'}

**Target Population Description:**
${application.targetPopulation || 'Not specified'}

**Poverty Indicators:**
${application.povertyIndicators || 'Not specified'}

**Schools Served:** ${application.schoolsServed || 'Not specified'}

## Funding Request

**Amount Requested:** $${application.amountRequested?.toLocaleString() || '0'}
**Total Project Budget:** $${application.totalProjectBudget?.toLocaleString() || '0'}
**Percentage of Project:** ${application.percentageRequested?.toFixed(1) || '0'}%
**Percentage of Org Budget:** ${percentOfOrgBudget}%

**Other Funding Sources:**
${application.otherFundingSources || 'None specified'}

**Previous HFF Grants:**
${application.previousHFFGrants || 'None'}

## Expected Outcomes & Impact

**Expected Outcomes:**
${application.expectedOutcomes || 'Not specified'}

**Measurement Plan:**
${application.measurementPlan || 'Not specified'}

**Sustainability Plan:**
${application.sustainabilityPlan || 'Not specified'}

---

Analyze this grant application and provide a comprehensive assessment. Return ONLY valid JSON matching this exact structure:

{
  "overview": "2-3 sentence executive summary of the application",
  "missionAlignment": {
    "score": 1-100,
    "reasoning": "detailed explanation of mission alignment score",
    "keyFactors": ["array", "of", "key", "alignment", "factors"]
  },
  "budgetAnalysis": {
    "highlights": ["positive budget aspects"],
    "concerns": ["budget concerns if any"],
    "reasonableness": "low" | "moderate" | "high",
    "percentageOfOrgBudget": ${percentOfOrgBudget}
  },
  "organizationStrength": {
    "score": 1-100,
    "reasoning": "assessment of organizational capacity"
  },
  "strengths": ["key strengths of this application"],
  "concerns": ["areas of concern or risk"],
  "recommendedQuestions": ["questions to ask the applicant"]
}
`
}

function format(date: Date, formatStr: string): string {
  // Simple date formatting - you could use date-fns format here
  const month = date.toLocaleString('default', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}
