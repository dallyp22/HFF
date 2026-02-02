import { z } from 'zod'

export const foundationSettingsSchema = z.object({
  foundationName: z.string().min(1, 'Foundation name is required'),
  tagline: z.string().optional(),
  missionStatement: z.string().min(10, 'Mission statement is required'),
  visionStatement: z.string().optional(),
  focusAreas: z.array(z.string()).default([]),
  primaryEmail: z.string().email('Valid email required'),
  phoneNumber: z.string().min(10, 'Phone number required'),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  streetAddress: z.string().min(1, 'Street address required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City required'),
  state: z.string().length(2, 'State code required (e.g., NE)'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code required (e.g., 68102)'),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  aiScoringPriorities: z.array(z.string().min(1)).max(10).default([]),
  aiGeographicFocus: z.string().max(500).optional().or(z.literal('')),
  aiCustomGuidance: z.string().max(2000).optional().or(z.literal('')),
  aiTemperature: z.number().min(0).max(1).default(0.3),
  aiMaxTokens: z.number().int().min(500).max(4000).default(2000),
})

export type FoundationSettingsFormData = z.infer<typeof foundationSettingsSchema>
