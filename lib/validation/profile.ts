import { z } from 'zod'

export const organizationProfileSchema = z.object({
  // Basic Information
  legalName: z.string().min(1, 'Legal name is required'),
  dbaName: z.string().optional(),
  ein: z.string().regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX'),
  yearFounded: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),

  // Address
  address: z.string().min(1, 'Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2-letter code'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),

  // Contact
  phone: z.string().min(10, 'Phone number is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),

  // Mission
  missionStatement: z.string().min(20, 'Mission statement must be at least 20 characters'),

  // Tax Status
  is501c3: z.boolean(),
  taxExemptSince: z.string().optional(),
  irsSubsection: z.string().optional(),

  // Leadership
  executiveDirectorName: z.string().min(1, 'Executive Director name is required'),
  executiveDirectorEmail: z.string().email('Invalid email address'),
  executiveDirectorPhone: z.string().min(10, 'Phone number is required'),

  // Organizational Capacity
  fullTimeStaff: z.coerce.number().int().min(0).optional(),
  partTimeStaff: z.coerce.number().int().min(0).optional(),
  volunteers: z.coerce.number().int().min(0).optional(),
  boardMembers: z.coerce.number().int().min(0).optional(),

  // Financial
  annualBudget: z.coerce.number().min(0).optional(),
  fiscalYearEnd: z.string().optional(),

  // Form 990 Summary
  form990Year: z.coerce.number().int().min(2000).max(new Date().getFullYear()).optional(),
  form990TotalRevenue: z.coerce.number().min(0).optional(),
  form990TotalExpenses: z.coerce.number().min(0).optional(),
  form990NetAssets: z.coerce.number().optional(),
  form990ProgramExpenses: z.coerce.number().min(0).optional(),
  form990AdminExpenses: z.coerce.number().min(0).optional(),
  form990FundraisingExpenses: z.coerce.number().min(0).optional(),
})

export type OrganizationProfileFormData = z.infer<typeof organizationProfileSchema>

export const requiredProfileFields: (keyof OrganizationProfileFormData)[] = [
  'legalName',
  'ein',
  'address',
  'city',
  'state',
  'zipCode',
  'phone',
  'missionStatement',
  'is501c3',
  'executiveDirectorName',
  'executiveDirectorEmail',
]

export function calculateProfileCompletion(data: Partial<OrganizationProfileFormData>): number {
  const completedFields = requiredProfileFields.filter(field => {
    const value = data[field]
    return value !== undefined && value !== null && value !== ''
  })
  
  return Math.round((completedFields.length / requiredProfileFields.length) * 100)
}

export function isProfileComplete(data: Partial<OrganizationProfileFormData>): boolean {
  return calculateProfileCompletion(data) === 100
}
