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
})

export type FoundationSettingsFormData = z.infer<typeof foundationSettingsSchema>
