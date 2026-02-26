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
  Plus,
  Trash2,
  Building2,
  Info,
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  FileSpreadsheet,
  Download,
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

  // Board members state
  const [boardMembers, setBoardMembers] = useState<{ name: string; title: string; affiliation: string }[]>([
    { name: '', title: '', affiliation: '' },
    { name: '', title: '', affiliation: '' },
    { name: '', title: '', affiliation: '' },
  ])

  // Structured funding sources state
  const [confirmedFunding, setConfirmedFunding] = useState<{ name: string; amount: string }[]>([
    { name: '', amount: '' },
  ])
  const [pendingFunding, setPendingFunding] = useState<{ name: string; amount: string }[]>([
    { name: '', amount: '' },
  ])

  // Structured previous HFF grants state
  const [noGrantsReceived, setNoGrantsReceived] = useState(false)
  const [previousGrants, setPreviousGrants] = useState<
    { date: string; amount: string; projectTitle: string }[]
  >([
    { date: '', amount: '', projectTitle: '' },
    { date: '', amount: '', projectTitle: '' },
    { date: '', amount: '', projectTitle: '' },
  ])

  // Timeline details state
  const [timelineDetails, setTimelineDetails] = useState('')

  // Project photos state
  const [projectPhotos, setProjectPhotos] = useState<any[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoDragActive, setPhotoDragActive] = useState(false)

  // Project budget state
  const [projectBudget, setProjectBudget] = useState<any | null>(null)
  const [uploadingBudget, setUploadingBudget] = useState(false)

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
            timelineDetails: app.timelineDetails || '',
            expectedOutcomes: app.expectedOutcomes || '',
            measurementPlan: app.measurementPlan || '',
            sustainabilityPlan: app.sustainabilityPlan || '',
            beneficiariesCount: app.beneficiariesCount || '',
            clientDemographicDescription: app.clientDemographicDescription || '',
            childrenInPovertyImpacted: app.childrenInPovertyImpacted || '',
            totalChildrenServedAnnually: app.totalChildrenServedAnnually || '',
          })

          // Populate structured funding sources from saved JSON
          if (app.confirmedFundingSources) {
            try {
              const parsed = typeof app.confirmedFundingSources === 'string'
                ? JSON.parse(app.confirmedFundingSources)
                : app.confirmedFundingSources
              if (Array.isArray(parsed) && parsed.length > 0) {
                setConfirmedFunding(parsed)
              }
            } catch {}
          }
          if (app.pendingFundingSources) {
            try {
              const parsed = typeof app.pendingFundingSources === 'string'
                ? JSON.parse(app.pendingFundingSources)
                : app.pendingFundingSources
              if (Array.isArray(parsed) && parsed.length > 0) {
                setPendingFunding(parsed)
              }
            } catch {}
          }

          // Populate structured previous grants from saved JSON
          if (app.noGrantsReceived !== undefined) {
            setNoGrantsReceived(!!app.noGrantsReceived)
          }
          if (app.previousHFFGrantsData) {
            try {
              const parsed = typeof app.previousHFFGrantsData === 'string'
                ? JSON.parse(app.previousHFFGrantsData)
                : app.previousHFFGrantsData
              if (Array.isArray(parsed) && parsed.length > 0) {
                setPreviousGrants(parsed)
              }
            } catch {}
          }

          // Populate timeline details
          if (app.timelineDetails) {
            setTimelineDetails(app.timelineDetails)
          }

          // Populate board members from saved JSON
          if (app.boardMembers) {
            try {
              const parsed = typeof app.boardMembers === 'string'
                ? JSON.parse(app.boardMembers)
                : app.boardMembers
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBoardMembers(parsed)
              }
            } catch {}
          }

          // Fetch existing application documents (photos & budget)
          try {
            const docsResponse = await fetch(`/api/documents?applicationId=${applicationId}`)
            if (docsResponse.ok) {
              const docs = await docsResponse.json()
              setProjectPhotos(docs.filter((d: any) => d.type === 'PROJECT_PHOTO'))
              const budget = docs.find((d: any) => d.type === 'PROJECT_BUDGET')
              if (budget) setProjectBudget(budget)
            }
          } catch (err) {
            console.error('Error loading application documents:', err)
          }
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

  function getStructuredData() {
    return {
      confirmedFundingSources: JSON.stringify(
        confirmedFunding.filter((f) => f.name || f.amount)
      ),
      pendingFundingSources: JSON.stringify(
        pendingFunding.filter((f) => f.name || f.amount)
      ),
      noGrantsReceived,
      previousHFFGrantsData: JSON.stringify(
        noGrantsReceived
          ? []
          : previousGrants.filter((g) => g.date || g.amount || g.projectTitle)
      ),
      timelineDetails,
      boardMembers: JSON.stringify(
        boardMembers.filter((m) => m.name || m.title || m.affiliation)
      ),
    }
  }

  async function saveProgress(data: any) {
    if (!applicationId) return

    const response = await fetch(`/api/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ...getStructuredData() }),
    })

    if (!response.ok) {
      throw new Error('Save failed')
    }

    setLastSaved(new Date())
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

  // Photo upload handlers
  function handlePhotoDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setPhotoDragActive(true)
    } else if (e.type === 'dragleave') {
      setPhotoDragActive(false)
    }
  }

  function handlePhotoDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setPhotoDragActive(false)
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach((file) => uploadPhoto(file))
    }
  }

  async function uploadPhoto(file: File) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPEG and PNG images are accepted.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Each photo must be under 5MB.')
      return
    }
    if (projectPhotos.length >= 3) {
      toast.error('Maximum 3 photos allowed.')
      return
    }

    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'PROJECT_PHOTO')
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
      formData.append('scope', 'APPLICATION')
      formData.append('applicationId', applicationId)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const doc = await response.json()
        setProjectPhotos((prev) => [...prev, doc])
        toast.success('Photo uploaded successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast.error('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function deletePhoto(docId: string) {
    try {
      const response = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      if (response.ok) {
        setProjectPhotos((prev) => prev.filter((p) => p.id !== docId))
        toast.success('Photo deleted')
      } else {
        toast.error('Failed to delete photo')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast.error('Failed to delete photo')
    }
  }

  // Budget upload handler
  async function uploadBudget(file: File) {
    const allowedBudgetTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    if (!allowedBudgetTypes.includes(file.type)) {
      toast.error('Only PDF, XLS, and XLSX files are accepted for the budget.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB.')
      return
    }

    setUploadingBudget(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'PROJECT_BUDGET')
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''))
      formData.append('scope', 'APPLICATION')
      formData.append('applicationId', applicationId)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const doc = await response.json()
        setProjectBudget(doc)
        toast.success('Budget uploaded successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload budget')
      }
    } catch (error) {
      console.error('Error uploading budget:', error)
      toast.error('Failed to upload budget')
    } finally {
      setUploadingBudget(false)
    }
  }

  async function deleteBudget() {
    if (!projectBudget) return
    try {
      const response = await fetch(`/api/documents/${projectBudget.id}`, { method: 'DELETE' })
      if (response.ok) {
        setProjectBudget(null)
        toast.success('Budget deleted')
      } else {
        toast.error('Failed to delete budget')
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Failed to delete budget')
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
          {/* Organization Description (read-only) */}
          {application.organization?.organizationDescription && (
            <FadeIn delay={0.07}>
              <GlassCard className="p-6 bg-gradient-to-r from-gray-50/80 to-slate-50/80">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                  <Building2 className="w-5 h-5 text-[var(--hff-teal)]" />
                  Organization Description
                </h2>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  From your Organization Profile
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">{application.organization.organizationDescription}</p>
              </GlassCard>
            </FadeIn>
          )}

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

          {/* Demographics & Poverty Metrics */}
          <FadeIn delay={0.17}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Users className="w-5 h-5 text-[var(--hff-teal)]" />
                Demographics & Poverty Metrics
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientDemographicDescription">Client Demographic Description</Label>
                  <Textarea
                    id="clientDemographicDescription"
                    {...form.register('clientDemographicDescription')}
                    placeholder="Describe the demographics of the population your project serves..."
                    rows={3}
                    className="bg-white/50"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childrenInPovertyImpacted">Children in Poverty Impacted</Label>
                    <Input
                      id="childrenInPovertyImpacted"
                      type="number"
                      {...form.register('childrenInPovertyImpacted')}
                      placeholder="Number of children in poverty"
                      className="bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalChildrenServedAnnually">Total Children Served Annually</Label>
                    <Input
                      id="totalChildrenServedAnnually"
                      type="number"
                      {...form.register('totalChildrenServedAnnually')}
                      placeholder="Total children served per year"
                      className="bg-white/50"
                    />
                  </div>
                </div>
                {/* Auto-calculated poverty percentage */}
                {form.watch('childrenInPovertyImpacted') && form.watch('totalChildrenServedAnnually') && (
                  <div className="p-4 rounded-xl bg-[var(--hff-teal)]/5 border border-[var(--hff-teal)]/10">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Poverty Percentage:</span>{' '}
                      <span className="text-[var(--hff-teal)] font-bold">
                        {((parseInt(form.watch('childrenInPovertyImpacted')) / parseInt(form.watch('totalChildrenServedAnnually'))) * 100).toFixed(1)}%
                      </span>
                    </p>
                  </div>
                )}
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
                  <Label htmlFor="timelineDetails">Additional Timeline Details</Label>
                  <Textarea
                    id="timelineDetails"
                    value={timelineDetails}
                    onChange={(e) => setTimelineDetails(e.target.value)}
                    placeholder="Provide any additional details about your project timeline, key milestones, or phases..."
                    rows={3}
                    className="bg-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geographicArea">Geographic Area Served *</Label>
                  <Input
                    id="geographicArea"
                    {...form.register('geographicArea')}
                    placeholder="Area could be region, municipality, or neighborhood"
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

                {/* Confirmed Funding Sources */}
                <div className="space-y-3">
                  <Label>Confirmed Funding Sources</Label>
                  <div className="space-y-2">
                    {confirmedFunding.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Source name"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...confirmedFunding]
                            updated[index] = { ...updated[index], name: e.target.value }
                            setConfirmedFunding(updated)
                          }}
                          className="bg-white/50 flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => {
                            const updated = [...confirmedFunding]
                            updated[index] = { ...updated[index], amount: e.target.value }
                            setConfirmedFunding(updated)
                          }}
                          className="bg-white/50 w-36"
                        />
                        {confirmedFunding.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setConfirmedFunding(confirmedFunding.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      setConfirmedFunding([...confirmedFunding, { name: '', amount: '' }])
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Source
                  </Button>
                </div>

                {/* Pending Funding Sources */}
                <div className="space-y-3">
                  <Label>Pending Funding Sources</Label>
                  <div className="space-y-2">
                    {pendingFunding.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Source name"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...pendingFunding]
                            updated[index] = { ...updated[index], name: e.target.value }
                            setPendingFunding(updated)
                          }}
                          className="bg-white/50 flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => {
                            const updated = [...pendingFunding]
                            updated[index] = { ...updated[index], amount: e.target.value }
                            setPendingFunding(updated)
                          }}
                          className="bg-white/50 w-36"
                        />
                        {pendingFunding.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() =>
                              setPendingFunding(pendingFunding.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      setPendingFunding([...pendingFunding, { name: '', amount: '' }])
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Source
                  </Button>
                </div>

                {/* Previous HFF Grants */}
                <div className="space-y-3">
                  <Label>Previous HFF Grants</Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noGrantsReceived}
                      onChange={(e) => setNoGrantsReceived(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--hff-teal)] focus:ring-[var(--hff-teal)]"
                    />
                    <span className="text-sm text-gray-700">No Grants Received to Date</span>
                  </label>

                  {!noGrantsReceived && (
                    <div className="space-y-2">
                      {previousGrants.map((grant, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={grant.date}
                            onChange={(e) => {
                              const updated = [...previousGrants]
                              updated[index] = { ...updated[index], date: e.target.value }
                              setPreviousGrants(updated)
                            }}
                            className="bg-white/50 w-40"
                          />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={grant.amount}
                            onChange={(e) => {
                              const updated = [...previousGrants]
                              updated[index] = { ...updated[index], amount: e.target.value }
                              setPreviousGrants(updated)
                            }}
                            className="bg-white/50 w-32"
                          />
                          <Input
                            placeholder="Project title"
                            value={grant.projectTitle}
                            onChange={(e) => {
                              const updated = [...previousGrants]
                              updated[index] = { ...updated[index], projectTitle: e.target.value }
                              setPreviousGrants(updated)
                            }}
                            className="bg-white/50 flex-1"
                          />
                        </div>
                      ))}
                    </div>
                  )}
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

          {/* Board of Directors */}
          <FadeIn delay={0.33}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Users className="w-5 h-5 text-[var(--hff-teal)]" />
                Board of Directors
              </h2>
              <div className="space-y-3">
                {boardMembers.length < 3 && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-800">
                      Please provide at least 3 board members for your application.
                    </p>
                  </div>
                )}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Name</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Title / Role</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Affiliation</th>
                        <th className="w-10 px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {boardMembers.map((member, index) => (
                        <tr key={index}>
                          <td className="px-2 py-1.5">
                            <Input
                              placeholder="Full name"
                              value={member.name}
                              onChange={(e) => {
                                const updated = [...boardMembers]
                                updated[index] = { ...updated[index], name: e.target.value }
                                setBoardMembers(updated)
                              }}
                              className="bg-white/50 border-0 shadow-none focus-visible:ring-1 h-8 text-sm"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              placeholder="e.g., Chair, Treasurer"
                              value={member.title}
                              onChange={(e) => {
                                const updated = [...boardMembers]
                                updated[index] = { ...updated[index], title: e.target.value }
                                setBoardMembers(updated)
                              }}
                              className="bg-white/50 border-0 shadow-none focus-visible:ring-1 h-8 text-sm"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <Input
                              placeholder="Organization / Company"
                              value={member.affiliation}
                              onChange={(e) => {
                                const updated = [...boardMembers]
                                updated[index] = { ...updated[index], affiliation: e.target.value }
                                setBoardMembers(updated)
                              }}
                              className="bg-white/50 border-0 shadow-none focus-visible:ring-1 h-8 text-sm"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            {boardMembers.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() =>
                                  setBoardMembers(boardMembers.filter((_, i) => i !== index))
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    setBoardMembers([...boardMembers, { name: '', title: '', affiliation: '' }])
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Board Member
                </Button>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Project Budget */}
          <FadeIn delay={0.35}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-[var(--hff-teal)]" />
                Project Budget
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload your project budget (PDF, XLS, or XLSX).{' '}
                <a
                  href="/documents/hff-budget-template.xlsx"
                  download
                  className="inline-flex items-center gap-1 text-[var(--hff-teal)] hover:underline font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download HFF Template
                </a>
              </p>

              {!projectBudget ? (
                <div className="space-y-3">
                  <div
                    className="border-2 border-dashed rounded-xl p-8 text-center transition-all border-gray-300 hover:border-gray-400 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => document.getElementById('budget-upload')?.click()}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Click to upload project budget
                    </p>
                    <p className="text-xs text-gray-500">PDF, XLS, or XLSX up to 10MB</p>
                    <input
                      id="budget-upload"
                      type="file"
                      accept=".pdf,.xls,.xlsx"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadBudget(e.target.files[0])}
                    />
                  </div>
                  {uploadingBudget && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">
                      A project budget is recommended for application submission.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{projectBudget.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {(projectBudget.fileSize / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={projectBudget.storageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--hff-teal)] hover:underline"
                      >
                        View
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={deleteBudget}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </FadeIn>

          {/* Project Photos */}
          <FadeIn delay={0.37}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                <Camera className="w-5 h-5 text-[var(--hff-teal)]" />
                Project Photos
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload up to 3 photos of your project (JPEG or PNG, max 5MB each).
              </p>

              {/* Thumbnail grid of uploaded photos */}
              {projectPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {projectPhotos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
                      <img
                        src={photo.storageUrl}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-white hover:text-red-300 hover:bg-transparent"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-xs text-white truncate">{photo.fileName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload area (show only if under 3 photos) */}
              {projectPhotos.length < 3 && (
                <div
                  onDragEnter={handlePhotoDrag}
                  onDragLeave={handlePhotoDrag}
                  onDragOver={handlePhotoDrag}
                  onDrop={handlePhotoDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    photoDragActive
                      ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]/5 scale-[1.01]'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                  }`}
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Drop photos here or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG or PNG, max 5MB each ({3 - projectPhotos.length} remaining)
                  </p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach((file) => uploadPhoto(file))
                      }
                      e.target.value = ''
                    }}
                  />
                </div>
              )}

              {uploadingPhoto && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading photo...
                </div>
              )}
            </GlassCard>
          </FadeIn>

          {/* Action Buttons */}
          <FadeIn delay={0.4}>
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
