'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, Save, Send, AlertCircle } from 'lucide-react'

export default function NewApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [organization, setOrganization] = useState<any>(null)

  const form = useForm()

  useEffect(() => {
    async function initialize() {
      try {
        // Load organization
        const orgResponse = await fetch('/api/organizations')
        const org = await orgResponse.json()

        if (!org || !org.id) {
          toast.error('Please create your organization profile first')
          router.push('/profile/edit')
          return
        }

        if (!org.profileComplete) {
          toast.error('Please complete your organization profile first')
          router.push('/profile/edit')
          return
        }

        setOrganization(org)

        // Create draft application
        const appResponse = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (appResponse.ok) {
          const app = await appResponse.json()
          setApplicationId(app.id)
        }
      } catch (error) {
        console.error('Error initializing:', error)
        toast.error('Failed to initialize application')
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [router])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!applicationId) return

    const interval = setInterval(async () => {
      const values = form.getValues()
      if (Object.keys(values).length > 0) {
        await saveProgress(values)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [applicationId, form])

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
      // Save final data
      await saveProgress(form.getValues())

      // Submit application
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">New Grant Application</h1>
          <p className="text-gray-600">{organization?.legalName} • Spring 2026 Cycle</p>
          
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-2">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This application will be saved as a draft. You can return to edit it before submitting.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Project Title *</Label>
                <Input
                  id="projectTitle"
                  {...form.register('projectTitle')}
                  placeholder="Youth Literacy Program"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectDescription">Project Description *</Label>
                <Textarea
                  id="projectDescription"
                  {...form.register('projectDescription')}
                  placeholder="Describe your project in detail..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectGoals">Project Goals *</Label>
                <Textarea
                  id="projectGoals"
                  {...form.register('projectGoals')}
                  placeholder="What are the specific goals of this project?"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Target Population */}
          <Card>
            <CardHeader>
              <CardTitle>Target Population</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="targetPopulation">Target Population Description *</Label>
                <Textarea
                  id="targetPopulation"
                  {...form.register('targetPopulation')}
                  placeholder="Describe the population you will serve..."
                  rows={3}
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageRangeStart">Age Range Start</Label>
                  <Input
                    id="ageRangeStart"
                    type="number"
                    {...form.register('ageRangeStart')}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageRangeEnd">Age Range End</Label>
                  <Input
                    id="ageRangeEnd"
                    type="number"
                    {...form.register('ageRangeEnd')}
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="povertyIndicators">Poverty Indicators *</Label>
                <Textarea
                  id="povertyIndicators"
                  {...form.register('povertyIndicators')}
                  placeholder="Describe how you identify children in poverty (free/reduced lunch, income levels, etc.)..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectStartDate">Start Date *</Label>
                  <Input
                    id="projectStartDate"
                    type="date"
                    {...form.register('projectStartDate')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectEndDate">End Date *</Label>
                  <Input
                    id="projectEndDate"
                    type="date"
                    {...form.register('projectEndDate')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geographicArea">Geographic Area Served *</Label>
                <Input
                  id="geographicArea"
                  {...form.register('geographicArea')}
                  placeholder="Omaha, NE and surrounding communities"
                />
              </div>
            </CardContent>
          </Card>

          {/* Funding Request */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amountRequested">Amount Requested *</Label>
                  <Input
                    id="amountRequested"
                    type="number"
                    {...form.register('amountRequested')}
                    placeholder="25000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalProjectBudget">Total Project Budget *</Label>
                  <Input
                    id="totalProjectBudget"
                    type="number"
                    {...form.register('totalProjectBudget')}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherFundingSources">Other Funding Sources</Label>
                <Textarea
                  id="otherFundingSources"
                  {...form.register('otherFundingSources')}
                  placeholder="List other grants, donations, or funding sources for this project..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousHFFGrants">Previous HFF Grants</Label>
                <Textarea
                  id="previousHFFGrants"
                  {...form.register('previousHFFGrants')}
                  placeholder="Have you received grants from HFF before? If so, describe..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Outcomes & Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Outcomes & Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expectedOutcomes">Expected Outcomes *</Label>
                <Textarea
                  id="expectedOutcomes"
                  {...form.register('expectedOutcomes')}
                  placeholder="What outcomes do you expect from this project?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurementPlan">Measurement Plan *</Label>
                <Textarea
                  id="measurementPlan"
                  {...form.register('measurementPlan')}
                  placeholder="How will you measure and track the success of this project?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sustainabilityPlan">Sustainability Plan *</Label>
                <Textarea
                  id="sustainabilityPlan"
                  {...form.register('sustainabilityPlan')}
                  placeholder="How will this project continue beyond the grant period?"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/applications')}
            >
              Cancel
            </Button>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              
              <Button
                type="submit"
                disabled={saving}
                className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-dark)]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
