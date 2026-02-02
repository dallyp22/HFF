'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, X, Plus, ChevronUp, ChevronDown, Trash2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { foundationSettingsSchema, type FoundationSettingsFormData } from '@/lib/validation/settings'
import { Badge } from '@/components/ui/badge'

interface FoundationSettings {
  id: string
  foundationName: string
  tagline?: string
  missionStatement: string
  visionStatement?: string
  focusAreas: string[]
  primaryEmail: string
  phoneNumber: string
  websiteUrl?: string
  streetAddress: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  facebookUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  aiScoringPriorities?: string[]
  aiGeographicFocus?: string
  aiCustomGuidance?: string
  aiTemperature?: number
  aiMaxTokens?: number
}

interface EditSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: FoundationSettings
  onSuccess: () => void
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]

export function EditSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSuccess,
}: EditSettingsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusAreaInput, setFocusAreaInput] = useState('')
  const [localFocusAreas, setLocalFocusAreas] = useState<string[]>([])
  const [localPriorities, setLocalPriorities] = useState<string[]>([])
  const [priorityInput, setPriorityInput] = useState('')

  const form = useForm<FoundationSettingsFormData>({
    resolver: zodResolver(foundationSettingsSchema) as any,
    defaultValues: {
      foundationName: settings.foundationName,
      tagline: settings.tagline || '',
      missionStatement: settings.missionStatement,
      visionStatement: settings.visionStatement || '',
      focusAreas: settings.focusAreas,
      primaryEmail: settings.primaryEmail,
      phoneNumber: settings.phoneNumber,
      websiteUrl: settings.websiteUrl || '',
      streetAddress: settings.streetAddress,
      addressLine2: settings.addressLine2 || '',
      city: settings.city,
      state: settings.state,
      zipCode: settings.zipCode,
      facebookUrl: settings.facebookUrl || '',
      twitterUrl: settings.twitterUrl || '',
      linkedinUrl: settings.linkedinUrl || '',
      aiScoringPriorities: settings.aiScoringPriorities || [],
      aiGeographicFocus: settings.aiGeographicFocus || '',
      aiCustomGuidance: settings.aiCustomGuidance || '',
      aiTemperature: settings.aiTemperature ?? 0.3,
      aiMaxTokens: settings.aiMaxTokens ?? 2000,
    },
  })

  useEffect(() => {
    if (settings) {
      setLocalFocusAreas(settings.focusAreas)
      setLocalPriorities(settings.aiScoringPriorities || [])
      form.reset({
        foundationName: settings.foundationName,
        tagline: settings.tagline || '',
        missionStatement: settings.missionStatement,
        visionStatement: settings.visionStatement || '',
        focusAreas: settings.focusAreas,
        primaryEmail: settings.primaryEmail,
        phoneNumber: settings.phoneNumber,
        websiteUrl: settings.websiteUrl || '',
        streetAddress: settings.streetAddress,
        addressLine2: settings.addressLine2 || '',
        city: settings.city,
        state: settings.state,
        zipCode: settings.zipCode,
        facebookUrl: settings.facebookUrl || '',
        twitterUrl: settings.twitterUrl || '',
        linkedinUrl: settings.linkedinUrl || '',
        aiScoringPriorities: settings.aiScoringPriorities || [],
        aiGeographicFocus: settings.aiGeographicFocus || '',
        aiCustomGuidance: settings.aiCustomGuidance || '',
        aiTemperature: settings.aiTemperature ?? 0.3,
        aiMaxTokens: settings.aiMaxTokens ?? 2000,
      })
    }
  }, [settings, form])

  const addFocusArea = () => {
    if (focusAreaInput.trim() && !localFocusAreas.includes(focusAreaInput.trim())) {
      const newAreas = [...localFocusAreas, focusAreaInput.trim()]
      setLocalFocusAreas(newAreas)
      form.setValue('focusAreas', newAreas)
      setFocusAreaInput('')
    }
  }

  const removeFocusArea = (area: string) => {
    const newAreas = localFocusAreas.filter(a => a !== area)
    setLocalFocusAreas(newAreas)
    form.setValue('focusAreas', newAreas)
  }

  const addPriority = () => {
    if (priorityInput.trim() && localPriorities.length < 10) {
      const newPriorities = [...localPriorities, priorityInput.trim()]
      setLocalPriorities(newPriorities)
      form.setValue('aiScoringPriorities', newPriorities)
      setPriorityInput('')
    }
  }

  const removePriority = (index: number) => {
    const newPriorities = localPriorities.filter((_, i) => i !== index)
    setLocalPriorities(newPriorities)
    form.setValue('aiScoringPriorities', newPriorities)
  }

  const movePriority = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= localPriorities.length) return
    const newPriorities = [...localPriorities]
    const [moved] = newPriorities.splice(index, 1)
    newPriorities.splice(newIndex, 0, moved)
    setLocalPriorities(newPriorities)
    form.setValue('aiScoringPriorities', newPriorities)
  }

  const onSubmit = async (values: FoundationSettingsFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings')
      }

      toast.success('Settings updated successfully')
      onSuccess()
    } catch (error: any) {
      console.error('Error updating settings:', error)
      toast.error(error.message || 'Failed to update settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Foundation Settings</DialogTitle>
          <DialogDescription>
            Update foundation information and contact details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="mission">Mission</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="ai-scoring">AI Scoring</TabsTrigger>
              </TabsList>

              {/* Identity Tab */}
              <TabsContent value="identity" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="foundationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foundation Name *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Encouraging opportunities for children in poverty"
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormDescription>Optional short description</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Mission Tab */}
              <TabsContent value="mission" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="missionStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission Statement *</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[100px]"
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visionStatement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vision Statement</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[100px]"
                          placeholder="Optional vision for the future..."
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Focus Areas removed from UI per client request */}
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="primaryEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(402) 555-0100"
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://example.org"
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">Mailing Address</h4>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="streetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="addressLine2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Suite, unit, building, floor, etc."
                              {...field} 
                              disabled={isSubmitting} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isSubmitting}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[200px]">
                                {US_STATES.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="68102"
                                {...field} 
                                disabled={isSubmitting} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Social Media Tab */}
              <TabsContent value="social" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="facebookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://facebook.com/yourpage"
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter/X URL</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://twitter.com/yourhandle"
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://linkedin.com/company/yourcompany"
                          {...field} 
                          disabled={isSubmitting} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p className="text-sm text-gray-500">
                  All social media links are optional
                </p>
              </TabsContent>

              {/* AI Scoring Tab */}
              <TabsContent value="ai-scoring" className="space-y-4 mt-4">
                {/* Scoring Priorities */}
                <div>
                  <label className="text-sm font-medium leading-none">Scoring Priorities</label>
                  <p className="text-sm text-gray-500 mt-1 mb-3">
                    Ordered list of priorities for AI grant analysis (max 10)
                  </p>

                  <div className="space-y-2 mb-3">
                    {localPriorities.map((priority, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] text-xs font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-sm">{priority}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => movePriority(index, 'up')}
                            disabled={index === 0 || isSubmitting}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePriority(index, 'down')}
                            disabled={index === localPriorities.length - 1 || isSubmitting}
                            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removePriority(index)}
                            disabled={isSubmitting}
                            className="p-1 rounded hover:bg-red-100 text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {localPriorities.length < 10 && (
                    <div className="flex gap-2">
                      <Input
                        value={priorityInput}
                        onChange={(e) => setPriorityInput(e.target.value)}
                        placeholder="Add a scoring priority..."
                        disabled={isSubmitting}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addPriority()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPriority}
                        disabled={!priorityInput.trim() || isSubmitting}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  )}
                </div>

                {/* Geographic Focus */}
                <FormField
                  control={form.control}
                  name="aiGeographicFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geographic Focus</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Omaha/Council Bluffs metro area and Western Iowa, 100-mile radius"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        The geographic area the AI should prioritize when scoring
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Guidance */}
                <FormField
                  control={form.control}
                  name="aiCustomGuidance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Scoring Guidance</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="Additional instructions for the AI when analyzing applications..."
                          maxLength={2000}
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        {(field.value?.length || 0).toLocaleString()}/2,000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Temperature Slider */}
                <FormField
                  control={form.control}
                  name="aiTemperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Temperature</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={field.value}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            disabled={isSubmitting}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--hff-teal)]"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Consistent (0.0)</span>
                            <span className="font-medium text-gray-700">{field.value?.toFixed(1)}</span>
                            <span>Creative (1.0)</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Lower values produce more consistent, focused analyses. Higher values allow more creative interpretation.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Info box */}
                <div className="flex gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">About AI Scoring Settings</p>
                    <p>
                      Changing these settings affects future analyses only. Existing scores are not retroactively updated.
                      If all priorities are removed, the system will fall back to built-in defaults.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
