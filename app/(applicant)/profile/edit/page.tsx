'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  organizationProfileSchema,
  type OrganizationProfileFormData,
  calculateProfileCompletion,
} from '@/lib/validation/profile'
import {
  CheckCircle2,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Target,
  Shield,
  Users,
  DollarSign,
  FileText,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

export default function ProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(organizationProfileSchema) as any,
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
            const formattedData = {
              ...org,
              taxExemptSince: org.taxExemptSince
                ? new Date(org.taxExemptSince).toISOString().split('T')[0]
                : '',
              annualBudget: org.annualBudget ? parseFloat(org.annualBudget) : undefined,
              form990TotalRevenue: org.form990TotalRevenue
                ? parseFloat(org.form990TotalRevenue)
                : undefined,
              form990TotalExpenses: org.form990TotalExpenses
                ? parseFloat(org.form990TotalExpenses)
                : undefined,
              form990NetAssets: org.form990NetAssets
                ? parseFloat(org.form990NetAssets)
                : undefined,
              form990ProgramExpenses: org.form990ProgramExpenses
                ? parseFloat(org.form990ProgramExpenses)
                : undefined,
              form990AdminExpenses: org.form990AdminExpenses
                ? parseFloat(org.form990AdminExpenses)
                : undefined,
              form990FundraisingExpenses: org.form990FundraisingExpenses
                ? parseFloat(org.form990FundraisingExpenses)
                : undefined,
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

  async function onSubmit(data: any) {
    setSaving(true)
    try {
      const url = organizationId ? `/api/organizations/${organizationId}` : '/api/organizations'

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

  const SectionIcon = ({ complete }: { complete: boolean }) =>
    complete ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
    ) : (
      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--hff-teal)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                <Building2 className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Organization Profile</h1>
                <p className="text-gray-600">
                  Complete your organization profile to submit grant applications
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-[var(--hff-teal)]">{completion}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-[var(--hff-teal)] to-[var(--hff-sage)] rounded-full"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {completion < 100 && (
          <FadeIn delay={0.05}>
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <p className="text-amber-800 text-sm">
                Complete all required fields to enable grant application submissions.
              </p>
            </div>
          </FadeIn>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <FadeIn delay={0.1}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <SectionIcon complete={!!(form.watch('legalName') && form.watch('ein'))} />
                <Building2 className="w-5 h-5 text-[var(--hff-teal)]" />
                Basic Information
              </h2>
              <p className="text-sm text-gray-500 mb-4">Legal name and identification</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    id="legalName"
                    {...form.register('legalName')}
                    placeholder="Official legal name"
                    className="bg-white/50"
                  />
                  {form.formState.errors.legalName && (
                    <p className="text-sm text-red-600">
                      {String(form.formState.errors.legalName.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dbaName">DBA Name (if different)</Label>
                  <Input
                    id="dbaName"
                    {...form.register('dbaName')}
                    placeholder="Doing business as"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ein">EIN *</Label>
                  <Input
                    id="ein"
                    {...form.register('ein')}
                    placeholder="XX-XXXXXXX"
                    className="bg-white/50"
                  />
                  {form.formState.errors.ein && (
                    <p className="text-sm text-red-600">
                      {String(form.formState.errors.ein.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearFounded">Year Founded</Label>
                  <Input
                    id="yearFounded"
                    type="number"
                    {...form.register('yearFounded')}
                    placeholder="2008"
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Address */}
          <FadeIn delay={0.15}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <SectionIcon
                  complete={
                    !!(
                      form.watch('address') &&
                      form.watch('city') &&
                      form.watch('state') &&
                      form.watch('zipCode')
                    )
                  }
                />
                <MapPin className="w-5 h-5 text-[var(--hff-teal)]" />
                Address
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    {...form.register('address')}
                    placeholder="123 Main Street"
                    className="bg-white/50"
                  />
                  {form.formState.errors.address && (
                    <p className="text-sm text-red-600">
                      {String(form.formState.errors.address.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    {...form.register('addressLine2')}
                    placeholder="Suite 100"
                    className="bg-white/50"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...form.register('city')}
                      placeholder="Omaha"
                      className="bg-white/50"
                    />
                    {form.formState.errors.city && (
                      <p className="text-sm text-red-600">
                        {String(form.formState.errors.city.message)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      {...form.register('state')}
                      placeholder="NE"
                      maxLength={2}
                      className="bg-white/50"
                    />
                    {form.formState.errors.state && (
                      <p className="text-sm text-red-600">
                        {String(form.formState.errors.state.message)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      {...form.register('zipCode')}
                      placeholder="68102"
                      className="bg-white/50"
                    />
                    {form.formState.errors.zipCode && (
                      <p className="text-sm text-red-600">
                        {String(form.formState.errors.zipCode.message)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Contact */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <SectionIcon complete={!!form.watch('phone')} />
                <Phone className="w-5 h-5 text-[var(--hff-teal)]" />
                Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="(402) 555-0100"
                    className="bg-white/50"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600">
                      {String(form.formState.errors.phone.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    {...form.register('website')}
                    placeholder="https://example.org"
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Mission */}
          <FadeIn delay={0.25}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <SectionIcon
                  complete={
                    !!(form.watch('missionStatement') && form.watch('missionStatement').length >= 20)
                  }
                />
                <Target className="w-5 h-5 text-[var(--hff-teal)]" />
                Mission Statement
              </h2>

              <div className="space-y-2">
                <Label htmlFor="missionStatement">Mission Statement *</Label>
                <Textarea
                  id="missionStatement"
                  {...form.register('missionStatement')}
                  placeholder="Describe your organization's mission and purpose..."
                  rows={4}
                  className="bg-white/50"
                />
                {form.formState.errors.missionStatement && (
                  <p className="text-sm text-red-600">
                    {String(form.formState.errors.missionStatement.message)}
                  </p>
                )}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Tax Status */}
          <FadeIn delay={0.3}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Shield className="w-5 h-5 text-[var(--hff-teal)]" />
                Tax-Exempt Status
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is501c3"
                    {...form.register('is501c3')}
                    className="h-4 w-4 rounded border-gray-300 text-[var(--hff-teal)] focus:ring-[var(--hff-teal)]"
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
                      className="bg-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="irsSubsection">IRS Subsection</Label>
                    <Input
                      id="irsSubsection"
                      {...form.register('irsSubsection')}
                      placeholder="501(c)(3)"
                      className="bg-white/50"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Leadership */}
          <FadeIn delay={0.35}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <SectionIcon
                  complete={
                    !!(
                      form.watch('executiveDirectorName') && form.watch('executiveDirectorEmail')
                    )
                  }
                />
                <Users className="w-5 h-5 text-[var(--hff-teal)]" />
                Executive Leadership
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="executiveDirectorName">Executive Director Name *</Label>
                  <Input
                    id="executiveDirectorName"
                    {...form.register('executiveDirectorName')}
                    placeholder="Jane Smith"
                    className="bg-white/50"
                  />
                  {form.formState.errors.executiveDirectorName && (
                    <p className="text-sm text-red-600">
                      {String(form.formState.errors.executiveDirectorName.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="executiveDirectorEmail">Email *</Label>
                  <Input
                    id="executiveDirectorEmail"
                    type="email"
                    {...form.register('executiveDirectorEmail')}
                    placeholder="jane@example.org"
                    className="bg-white/50"
                  />
                  {form.formState.errors.executiveDirectorEmail && (
                    <p className="text-sm text-red-600">
                      {String(form.formState.errors.executiveDirectorEmail.message)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="executiveDirectorPhone">Phone</Label>
                  <Input
                    id="executiveDirectorPhone"
                    {...form.register('executiveDirectorPhone')}
                    placeholder="(402) 555-0101"
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Organizational Capacity */}
          <FadeIn delay={0.4}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Users className="w-5 h-5 text-[var(--hff-teal)]" />
                Organizational Capacity
              </h2>
              <p className="text-sm text-gray-500 mb-4">Staff and volunteer information</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullTimeStaff">Full-Time Staff</Label>
                  <Input
                    id="fullTimeStaff"
                    type="number"
                    {...form.register('fullTimeStaff')}
                    placeholder="0"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partTimeStaff">Part-Time Staff</Label>
                  <Input
                    id="partTimeStaff"
                    type="number"
                    {...form.register('partTimeStaff')}
                    placeholder="0"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volunteers">Volunteers</Label>
                  <Input
                    id="volunteers"
                    type="number"
                    {...form.register('volunteers')}
                    placeholder="0"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="boardMembers">Board Members</Label>
                  <Input
                    id="boardMembers"
                    type="number"
                    {...form.register('boardMembers')}
                    placeholder="0"
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Financial Information */}
          <FadeIn delay={0.45}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <DollarSign className="w-5 h-5 text-[var(--hff-teal)]" />
                Financial Information
              </h2>
              <p className="text-sm text-gray-500 mb-4">Annual budget and fiscal year</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annualBudget">Annual Budget</Label>
                  <Input
                    id="annualBudget"
                    type="number"
                    {...form.register('annualBudget')}
                    placeholder="1250000"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
                  <Input
                    id="fiscalYearEnd"
                    {...form.register('fiscalYearEnd')}
                    placeholder="December 31"
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Form 990 Summary */}
          <FadeIn delay={0.5}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <FileText className="w-5 h-5 text-[var(--hff-teal)]" />
                Form 990 Summary
              </h2>
              <p className="text-sm text-gray-500 mb-4">Most recent Form 990 financial data</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form990Year">Form 990 Year</Label>
                  <Input
                    id="form990Year"
                    type="number"
                    {...form.register('form990Year')}
                    placeholder="2024"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990TotalRevenue">Total Revenue</Label>
                  <Input
                    id="form990TotalRevenue"
                    type="number"
                    {...form.register('form990TotalRevenue')}
                    placeholder="1340000"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990TotalExpenses">Total Expenses</Label>
                  <Input
                    id="form990TotalExpenses"
                    type="number"
                    {...form.register('form990TotalExpenses')}
                    placeholder="1280000"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990NetAssets">Net Assets</Label>
                  <Input
                    id="form990NetAssets"
                    type="number"
                    {...form.register('form990NetAssets')}
                    placeholder="450000"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990ProgramExpenses">Program Expenses</Label>
                  <Input
                    id="form990ProgramExpenses"
                    type="number"
                    {...form.register('form990ProgramExpenses')}
                    placeholder="1049600"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form990AdminExpenses">Admin Expenses</Label>
                  <Input
                    id="form990AdminExpenses"
                    type="number"
                    {...form.register('form990AdminExpenses')}
                    placeholder="153600"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="form990FundraisingExpenses">Fundraising Expenses</Label>
                  <Input
                    id="form990FundraisingExpenses"
                    type="number"
                    {...form.register('form990FundraisingExpenses')}
                    placeholder="76800"
                    className="bg-white/50 md:max-w-[calc(50%-0.5rem)]"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Submit Button */}
          <FadeIn delay={0.55}>
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
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
          </FadeIn>
        </form>
      </div>
    </div>
  )
}
