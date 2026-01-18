'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FadeIn } from '@/components/motion/FadeIn'
import { toast } from 'sonner'
import {
  Loader2,
  Save,
  Send,
  AlertCircle,
  FileText,
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Target,
  Clock,
} from 'lucide-react'
import Link from 'next/link'

export default function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [application, setApplication] = useState<any>(null)
  const [applicationId, setApplicationId] = useState<string>('')

  const form = useForm()

  useEffect(() => {
    async function init() {
      const resolvedParams = await params
      setApplicationId(resolvedParams.id)
    }
    init()
  }, [params])

  useEffect(() => {
    if (!applicationId) return

    async function loadApplication() {
      try {
        const response = await fetch(`/api/applications/${applicationId}`)
        if (response.ok) {
          const app = await response.json()

          if (app.status !== 'DRAFT') {
            toast.error('Can only edit draft applications')
            router.push(`/applications/${applicationId}`)
            return
          }

          setApplication(app)

          form.reset({
            projectTitle: app.projectTitle || '',
            projectDescription: app.projectDescription || '',
            projectGoals: app.projectGoals || '',
            targetPopulation: app.targetPopulation || '',
            childrenServed: app.childrenServed || '',
            ageRangeStart: app.ageRangeStart || '',
            ageRangeEnd: app.ageRangeEnd || '',
            povertyIndicators: app.povertyIndicators || '',
            schoolsServed: app.schoolsServed || '',
            projectStartDate: app.projectStartDate
              ? new Date(app.projectStartDate).toISOString().split('T')[0]
              : '',
            projectEndDate: app.projectEndDate
              ? new Date(app.projectEndDate).toISOString().split('T')[0]
              : '',
            geographicArea: app.geographicArea || '',
            amountRequested: app.amountRequested || '',
            totalProjectBudget: app.totalProjectBudget || '',
            otherFundingSources: app.otherFundingSources || '',
            previousHFFGrants: app.previousHFFGrants || '',
            expectedOutcomes: app.expectedOutcomes || '',
            measurementPlan: app.measurementPlan || '',
            sustainabilityPlan: app.sustainabilityPlan || '',
            beneficiariesCount: app.beneficiariesCount || '',
          })
        } else {
          toast.error('Application not found')
          router.push('/applications')
        }
      } catch (error) {
        console.error('Error loading application:', error)
        toast.error('Failed to load application')
      } finally {
        setLoading(false)
      }
    }

    loadApplication()
  }, [applicationId, form, router])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!application) return

    const interval = setInterval(async () => {
      const values = form.getValues()
      if (Object.keys(values).length > 0) {
        await saveProgress(values)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [application, form])

  async function saveProgress(data: any) {
    if (!applicationId) return

    try {
      await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  async function handleSaveDraft() {
    setSaving(true)
    try {
      await saveProgress(form.getValues())
      toast.success('Draft saved successfully')
      router.push('/applications')
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      await saveProgress(form.getValues())

      const response = await fetch(`/api/applications/${applicationId}/submit`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Application submitted successfully!')
        router.push('/applications')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting:', error)
      toast.error('Failed to submit application')
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

  if (!application) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn>
          <Link
            href="/applications"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--hff-teal)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                <FileText className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Application</h1>
                <p className="text-gray-600">
                  {application.organization?.legalName} • {application.grantCycle}{' '}
                  {application.cycleYear}
                </p>
              </div>
            </div>

            {lastSaved && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <p className="text-blue-800 text-sm">
                Changes are automatically saved every 30 seconds. Click "Save Draft" to save
                immediately.
              </p>
            </div>
          </div>
        </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Overview */}
          <FadeIn delay={0.1}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <FileText className="w-5 h-5 text-[var(--hff-teal)]" />
                Project Overview
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectTitle">Project Title *</Label>
                  <Input
                    id="projectTitle"
                    {...form.register('projectTitle')}
                    placeholder="Youth Literacy Program"
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Project Description *</Label>
                  <Textarea
                    id="projectDescription"
                    {...form.register('projectDescription')}
                    placeholder="Describe your project in detail..."
                    rows={5}
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectGoals">Project Goals *</Label>
                  <Textarea
                    id="projectGoals"
                    {...form.register('projectGoals')}
                    placeholder="What are the specific goals of this project?"
                    rows={4}
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Target Population */}
          <FadeIn delay={0.15}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Users className="w-5 h-5 text-[var(--hff-teal)]" />
                Target Population
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="targetPopulation">Target Population Description *</Label>
                  <Textarea
                    id="targetPopulation"
                    {...form.register('targetPopulation')}
                    placeholder="Describe the population you will serve..."
                    rows={3}
                    className="bg-white/50"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childrenServed">Children Served *</Label>
                    <Input
                      id="childrenServed"
                      type="number"
                      {...form.register('childrenServed')}
                      placeholder="100"
                      className="bg-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageRangeStart">Age Range Start</Label>
                    <Input
                      id="ageRangeStart"
                      type="number"
                      {...form.register('ageRangeStart')}
                      placeholder="5"
                      className="bg-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ageRangeEnd">Age Range End</Label>
                    <Input
                      id="ageRangeEnd"
                      type="number"
                      {...form.register('ageRangeEnd')}
                      placeholder="12"
                      className="bg-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="povertyIndicators">Poverty Indicators *</Label>
                  <Textarea
                    id="povertyIndicators"
                    {...form.register('povertyIndicators')}
                    placeholder="Describe how you identify children in poverty..."
                    rows={3}
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Project Timeline */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Calendar className="w-5 h-5 text-[var(--hff-teal)]" />
                Project Timeline
              </h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectStartDate">Start Date *</Label>
                    <Input
                      id="projectStartDate"
                      type="date"
                      {...form.register('projectStartDate')}
                      className="bg-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectEndDate">End Date *</Label>
                    <Input
                      id="projectEndDate"
                      type="date"
                      {...form.register('projectEndDate')}
                      className="bg-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geographicArea">Geographic Area Served *</Label>
                  <Input
                    id="geographicArea"
                    {...form.register('geographicArea')}
                    placeholder="Omaha, NE and surrounding communities"
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Funding Request */}
          <FadeIn delay={0.25}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <DollarSign className="w-5 h-5 text-[var(--hff-teal)]" />
                Funding Request
              </h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountRequested">Amount Requested *</Label>
                    <Input
                      id="amountRequested"
                      type="number"
                      {...form.register('amountRequested')}
                      placeholder="25000"
                      className="bg-white/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalProjectBudget">Total Project Budget *</Label>
                    <Input
                      id="totalProjectBudget"
                      type="number"
                      {...form.register('totalProjectBudget')}
                      placeholder="50000"
                      className="bg-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherFundingSources">Other Funding Sources</Label>
                  <Textarea
                    id="otherFundingSources"
                    {...form.register('otherFundingSources')}
                    placeholder="List other grants, donations, or funding sources..."
                    rows={3}
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousHFFGrants">Previous HFF Grants</Label>
                  <Textarea
                    id="previousHFFGrants"
                    {...form.register('previousHFFGrants')}
                    placeholder="Have you received grants from HFF before?"
                    rows={2}
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Outcomes & Impact */}
          <FadeIn delay={0.3}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Target className="w-5 h-5 text-[var(--hff-teal)]" />
                Outcomes & Impact
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedOutcomes">Expected Outcomes *</Label>
                  <Textarea
                    id="expectedOutcomes"
                    {...form.register('expectedOutcomes')}
                    placeholder="What outcomes do you expect from this project?"
                    rows={4}
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measurementPlan">Measurement Plan *</Label>
                  <Textarea
                    id="measurementPlan"
                    {...form.register('measurementPlan')}
                    placeholder="How will you measure and track success?"
                    rows={4}
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sustainabilityPlan">Sustainability Plan *</Label>
                  <Textarea
                    id="sustainabilityPlan"
                    {...form.register('sustainabilityPlan')}
                    placeholder="How will this project continue beyond the grant period?"
                    rows={4}
                    className="bg-white/50"
                  />
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Action Buttons */}
          <FadeIn delay={0.35}>
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => router.push('/applications')}>
                Cancel
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </div>
          </FadeIn>
        </form>
      </div>
    </div>
  )
}
