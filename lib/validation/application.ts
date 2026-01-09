import { z } from 'zod'

export const applicationSchema = z.object({
  // Step 1: Organization Verification (read-only, just confirmation)
  organizationConfirmed: z.boolean(),

  // Step 2: Project Overview
  projectTitle: z.string().min(5, 'Project title must be at least 5 characters'),
  projectDescription: z.string().min(50, 'Project description must be at least 50 characters'),
  projectGoals: z.string().min(50, 'Project goals must be at least 50 characters'),

  // Step 3: Target Population
  targetPopulation: z.string().min(20, 'Target population description required'),
  childrenServed: z.coerce.number().int().min(1, 'Number of children served is required'),
  ageRangeStart: z.coerce.number().int().min(0).max(18).optional(),
  ageRangeEnd: z.coerce.number().int().min(0).max(18).optional(),
  povertyIndicators: z.string().min(20, 'Poverty indicators description required'),
  schoolsServed: z.string().optional(),

  // Step 4: Project Timeline
  projectStartDate: z.string().min(1, 'Start date is required'),
  projectEndDate: z.string().min(1, 'End date is required'),
  geographicArea: z.string().min(5, 'Geographic area is required'),

  // Step 5: Funding Request
  amountRequested: z.coerce.number().min(1, 'Funding amount is required'),
  totalProjectBudget: z.coerce.number().min(1, 'Total project budget is required'),
  otherFundingSources: z.string().optional(),
  previousHFFGrants: z.string().optional(),

  // Step 6: Budget Details (simplified for now)
  budgetBreakdown: z.string().optional(),

  // Step 7: Outcomes & Impact
  expectedOutcomes: z.string().min(50, 'Expected outcomes description required'),
  measurementPlan: z.string().min(50, 'Measurement plan required'),
  sustainabilityPlan: z.string().min(50, 'Sustainability plan required'),
  beneficiariesCount: z.coerce.number().int().min(1).optional(),

  // Step 8: Documents (handled separately)
  // Step 9: Review & Submit (certification checkboxes)
})

export type ApplicationFormData = z.infer<typeof applicationSchema>

export const TOTAL_STEPS = 9
export const STEP_TITLES = [
  'Organization Verification',
  'Project Overview',
  'Target Population',
  'Project Timeline',
  'Funding Request',
  'Budget Details',
  'Outcomes & Impact',
  'Documents',
  'Review & Submit',
]
