'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  organizationProfileSchema, 
  type OrganizationProfileFormData,
  calculateProfileCompletion 
} from '@/lib/validation/profile'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function ProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  const form = useForm<OrganizationProfileFormData>({
    resolver: zodResolver(organizationProfileSchema),
    defaultValues: {
      is501c3: true,
    },
  })

  const formData = form.watch()
  const completion = calculateProfileCompletion(formData)

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/organizations')
        if (response.ok) {
          const org = await response.json()
          if (org && org.id) {
            setOrganizationId(org.id)
            // Convert dates and populate form
            const formattedData = {
              ...org,
              taxExemptSince: org.taxExemptSince ? new Date(org.taxExemptSince).toISOString().split('T')[0] : '',
              annualBudget: org.annualBudget ? parseFloat(org.annualBudget) : undefined,
              form990TotalRevenue: org.form990TotalRevenue ? parseFloat(org.form990TotalRevenue) : undefined,
              form990TotalExpenses: org.form990TotalExpenses ? parseFloat(org.form990TotalExpenses) : undefined,
              form990NetAssets: org.form990NetAssets ? parseFloat(org.form990NetAssets) : undefined,
              form990ProgramExpenses: org.form990ProgramExpenses ? parseFloat(org.form990ProgramExpenses) : undefined,
              form990AdminExpenses: org.form990AdminExpenses ? parseFloat(org.form990AdminExpenses) : undefined,
              form990FundraisingExpenses: org.form990FundraisingExpenses ? parseFloat(org.form990FundraisingExpenses) : undefined,
            }
            form.reset(formattedData)
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [form])

  async function onSubmit(data: OrganizationProfileFormData) {
    setSaving(true)
    try {
      const url = organizationId 
        ? `/api/organizations/${organizationId}`
        : '/api/organizations'
      
      const method = organizationId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const org = await response.json()
        toast.success('Profile saved successfully!')
        
        if (org.profileComplete) {
          toast.success('Profile complete! You can now submit applications.')
          router.push('/dashboard')
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--hff-teal)]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Organization Profile</h1>
          <p className="text-gray-600">Complete your organization profile to submit grant applications</p>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-medium">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" />
          </div>
        </div>

        {completion < 100 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              Complete all required fields to enable grant application submissions.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {form.watch('legalName') && form.watch('ein') ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                Basic Information
              </CardTitle>
              <CardDescription>Legal name and identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    id="legalName"
                    {...form.register('legalName')}
                    placeholder="Official legal name"
                  />
                  {form.formState.errors.legalName && (
                    <p className="text-sm text-red-600">{form.formState.errors.legalName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dbaName">DBA Name (if different)</Label>
                  <Input
                    id="dbaName"
                    {...form.register('dbaName')}
                    placeholder="Doing business as"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ein">EIN *</Label>
                  <Input
                    id="ein"
                    {...form.register('ein')}
                    placeholder="XX-XXXXXXX"
                  />
                  {form.formState.errors.ein && (
                    <p className="text-sm text-red-600">{form.formState.errors.ein.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearFounded">Year Founded</Label>
                  <Input
                    id="yearFounded"
                    type="number"
                    {...form.register('yearFounded')}
                    placeholder="2008"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {form.watch('address') && form.watch('city') && form.watch('state') && form.watch('zipCode') ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  {...form.register('address')}
                  placeholder="123 Main Street"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  {...form.register('addressLine2')}
                  placeholder="Suite 100"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register('city')}
                    placeholder="Omaha"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    {...form.register('state')}
                    placeholder="NE"
                    maxLength={2}
                  />
                  {form.formState.errors.state && (
                    <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    {...form.register('zipCode')}
                    placeholder="68102"
                  />
                  {form.formState.errors.zipCode && (
                    <p className="text-sm text-red-600">{form.formState.errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {form.watch('phone') ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="(402) 555-0100"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    {...form.register('website')}
                    placeholder="https://example.org"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {form.watch('missionStatement') && form.watch('missionStatement').length >= 20 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                Mission Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="missionStatement">Mission Statement *</Label>
                <Textarea
                  id="missionStatement"
                  {...form.register('missionStatement')}
                  placeholder="Describe your organization's mission and purpose..."
                  rows={4}
                />
                {form.formState.errors.missionStatement && (
                  <p className="text-sm text-red-600">{form.formState.errors.missionStatement.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tax Status */}
          <Card>
            <CardHeader>
              <CardTitle>Tax-Exempt Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is501c3"
                  {...form.register('is501c3')}
                  className="h-4 w-4"
                />
                <Label htmlFor="is501c3">Organization has 501(c)(3) tax-exempt status *</Label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxExemptSince">Tax Exempt Since</Label>
                  <Input
                    id="taxExemptSince"
                    type="date"
                    {...form.register('taxExemptSince')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="irsSubsection">IRS Subsection</Label>
                  <Input
                    id="irsSubsection"
                    {...form.register('irsSubsection')}
                    placeholder="501(c)(3)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leadership */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {form.watch('executiveDirectorName') && form.watch('executiveDirectorEmail') ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                Executive Leadership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="executiveDirectorName">Executive Director Name *</Label>
                  <Input
                    id="executiveDirectorName"
                    {...form.register('executiveDirectorName')}
                    placeholder="Jane Smith"
                  />
                  {form.formState.errors.executiveDirectorName && (
                    <p className="text-sm text-red-600">{form.formState.errors.executiveDirectorName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="executiveDirectorEmail">Email *</Label>
                  <Input
                    id="executiveDirectorEmail"
                    type="email"
                    {...form.register('executiveDirectorEmail')}
                    placeholder="jane@example.org"
                  />
                  {form.formState.errors.executiveDirectorEmail && (
                    <p className="text-sm text-red-600">{form.formState.errors.executiveDirectorEmail.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="executiveDirectorPhone">Phone</Label>
                  <Input
                    id="executiveDirectorPhone"
                    {...form.register('executiveDirectorPhone')}
                    placeholder="(402) 555-0101"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizational Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Organizational Capacity</CardTitle>
              <CardDescription>Staff and volunteer information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullTimeStaff">Full-Time Staff</Label>
                  <Input
                    id="fullTimeStaff"
                    type="number"
                    {...form.register('fullTimeStaff')}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partTimeStaff">Part-Time Staff</Label>
                  <Input
                    id="partTimeStaff"
                    type="number"
                    {...form.register('partTimeStaff')}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteers">Volunteers</Label>
                  <Input
                    id="volunteers"
                    type="number"
                    {...form.register('volunteers')}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="boardMembers">Board Members</Label>
                  <Input
                    id="boardMembers"
                    type="number"
                    {...form.register('boardMembers')}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Annual budget and fiscal year</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annualBudget">Annual Budget</Label>
                  <Input
                    id="annualBudget"
                    type="number"
                    {...form.register('annualBudget')}
                    placeholder="1250000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                  <Input
                    id="fiscalYearEnd"
                    {...form.register('fiscalYearEnd')}
                    placeholder="December 31"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form 990 Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Form 990 Summary</CardTitle>
              <CardDescription>Most recent Form 990 financial data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form990Year">Form 990 Year</Label>
                  <Input
                    id="form990Year"
                    type="number"
                    {...form.register('form990Year')}
                    placeholder="2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990TotalRevenue">Total Revenue</Label>
                  <Input
                    id="form990TotalRevenue"
                    type="number"
                    {...form.register('form990TotalRevenue')}
                    placeholder="1340000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990TotalExpenses">Total Expenses</Label>
                  <Input
                    id="form990TotalExpenses"
                    type="number"
                    {...form.register('form990TotalExpenses')}
                    placeholder="1280000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990NetAssets">Net Assets</Label>
                  <Input
                    id="form990NetAssets"
                    type="number"
                    {...form.register('form990NetAssets')}
                    placeholder="450000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990ProgramExpenses">Program Expenses</Label>
                  <Input
                    id="form990ProgramExpenses"
                    type="number"
                    {...form.register('form990ProgramExpenses')}
                    placeholder="1049600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990AdminExpenses">Admin Expenses</Label>
                  <Input
                    id="form990AdminExpenses"
                    type="number"
                    {...form.register('form990AdminExpenses')}
                    placeholder="153600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990FundraisingExpenses">Fundraising Expenses</Label>
                  <Input
                    id="form990FundraisingExpenses"
                    type="number"
                    {...form.register('form990FundraisingExpenses')}
                    placeholder="76800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-dark)]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
