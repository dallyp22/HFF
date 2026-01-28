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
import { Loader2, X } from 'lucide-react'
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
    },
  })

  useEffect(() => {
    if (settings) {
      setLocalFocusAreas(settings.focusAreas)
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="identity">Identity</TabsTrigger>
                <TabsTrigger value="mission">Mission</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
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
