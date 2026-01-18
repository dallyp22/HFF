'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
  Users,
  Calendar,
  DollarSign,
  Target,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Building2,
} from 'lucide-react'

interface FormData {
  projectTitle: string
  projectDescription: string
  projectGoals: string
  targetPopulation: string
  childrenServed: string
  ageRangeStart: string
  ageRangeEnd: string
  povertyIndicators: string
  projectStartDate: string
  projectEndDate: string
  geographicArea: string
  amountRequested: string
  totalProjectBudget: string
  otherFundingSources: string
  previousHFFGrants: string
  expectedOutcomes: string
  measurementPlan: string
  sustainabilityPlan: string
}

const steps = [
  {
    id: 1,
    title: 'Project Overview',
    description: 'Tell us about your project',
    icon: FileText,
    fields: ['projectTitle', 'projectDescription', 'projectGoals'],
  },
  {
    id: 2,
    title: 'Target Population',
    description: 'Who will you serve?',
    icon: Users,
    fields: ['targetPopulation', 'childrenServed', 'ageRangeStart', 'ageRangeEnd', 'povertyIndicators'],
  },
  {
    id: 3,
    title: 'Timeline & Location',
    description: 'When and where?',
    icon: Calendar,
    fields: ['projectStartDate', 'projectEndDate', 'geographicArea'],
  },
  {
    id: 4,
    title: 'Funding Request',
    description: 'Your budget details',
    icon: DollarSign,
    fields: ['amountRequested', 'totalProjectBudget', 'otherFundingSources', 'previousHFFGrants'],
  },
  {
    id: 5,
    title: 'Outcomes & Impact',
    description: 'Expected results',
    icon: Target,
    fields: ['expectedOutcomes', 'measurementPlan', 'sustainabilityPlan'],
  },
]

export default function NewApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)

  const form = useForm<FormData>({
    defaultValues: {
      projectTitle: '',
      projectDescription: '',
      projectGoals: '',
      targetPopulation: '',
      childrenServed: '',
      ageRangeStart: '',
      ageRangeEnd: '',
      povertyIndicators: '',
      projectStartDate: '',
      projectEndDate: '',
      geographicArea: '',
      amountRequested: '',
      totalProjectBudget: '',
      otherFundingSources: '',
      previousHFFGrants: '',
      expectedOutcomes: '',
      measurementPlan: '',
      sustainabilityPlan: '',
    },
  })

  const { register, watch, getValues } = form
  const watchedValues = watch()

  // Calculate step completion
  const getStepCompletion = useCallback(
    (stepId: number) => {
      const step = steps.find((s) => s.id === stepId)
      if (!step) return 0
      const filledFields = step.fields.filter((field) => {
        const value = watchedValues[field as keyof FormData]
        return value && value.toString().trim().length > 0
      })
      return Math.round((filledFields.length / step.fields.length) * 100)
    },
    [watchedValues]
  )

  // Overall progress
  const overallProgress = Math.round(
    steps.reduce((acc, step) => acc + getStepCompletion(step.id), 0) / steps.length
  )

  useEffect(() => {
    async function initialize() {
      try {
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
      const values = getValues()
      if (Object.values(values).some((v) => v)) {
        await saveProgress(values, true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [applicationId, getValues])

  async function saveProgress(data: FormData, isAutoSave = false) {
    if (!applicationId) return

    try {
      setSaving(true)
      await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setLastSaved(new Date())
      if (!isAutoSave) {
        toast.success('Progress saved')
      }
    } catch (error) {
      console.error('Save failed:', error)
      if (!isAutoSave) {
        toast.error('Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveDraft() {
    await saveProgress(getValues())
    router.push('/applications')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await saveProgress(getValues())

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
      setSubmitting(false)
    }
  }

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setDirection(1)
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--hff-teal)]/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--hff-teal)]" />
          </div>
          <p className="text-gray-600">Preparing your application...</p>
        </motion.div>
      </div>
    )
  }

  const currentStepData = steps.find((s) => s.id === currentStep)!
  const StepIcon = currentStepData.icon

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] mb-3"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">New Application</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Grant Application</h1>
            <div className="flex flex-wrap items-center gap-3 text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{organization?.legalName}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Spring 2026 Cycle</span>
              </div>
              {lastSaved && (
                <>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm">Saved {lastSaved.toLocaleTimeString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Progress Bar */}
        <FadeIn delay={0.1}>
          <GlassCard className="p-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-[var(--hff-teal)]">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--hff-teal)] to-[var(--hff-sage)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => {
                const Icon = step.icon
                const completion = getStepCompletion(step.id)
                const isActive = step.id === currentStep
                const isCompleted = completion === 100

                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 transition-all',
                      isActive ? 'scale-105' : 'opacity-60 hover:opacity-100'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                        isActive
                          ? 'bg-[var(--hff-teal)] text-white shadow-lg shadow-[var(--hff-teal)]/30'
                          : isCompleted
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium hidden md:block',
                        isActive ? 'text-[var(--hff-teal)]' : 'text-gray-500'
                      )}
                    >
                      {step.title}
                    </span>
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          'absolute h-0.5 w-[calc(100%/5-2rem)] top-5 left-[calc(50%+1.25rem)]',
                          completion === 100 ? 'bg-green-300' : 'bg-gray-200'
                        )}
                        style={{ display: 'none' }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </GlassCard>
        </FadeIn>

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <GlassCard variant="elevated" className="p-6 md:p-8 mb-6">
                {/* Step Header */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--hff-teal)] to-[var(--hff-teal-800)] flex items-center justify-center shadow-lg shadow-[var(--hff-teal)]/20">
                    <StepIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
                    <p className="text-gray-500">{currentStepData.description}</p>
                  </div>
                  <div className="ml-auto">
                    <GlassBadge
                      variant={getStepCompletion(currentStep) === 100 ? 'success' : 'default'}
                      size="sm"
                    >
                      {getStepCompletion(currentStep)}% complete
                    </GlassBadge>
                  </div>
                </div>

                {/* Step 1: Project Overview */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="projectTitle" className="text-sm font-medium text-gray-700">
                        Project Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="projectTitle"
                        {...register('projectTitle')}
                        placeholder="e.g., Youth Literacy Program"
                        className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectDescription" className="text-sm font-medium text-gray-700">
                        Project Description <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        Provide a detailed description of what your project will accomplish
                      </p>
                      <Textarea
                        id="projectDescription"
                        {...register('projectDescription')}
                        placeholder="Describe your project in detail..."
                        rows={5}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="projectGoals" className="text-sm font-medium text-gray-700">
                        Project Goals <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        What specific goals do you aim to achieve?
                      </p>
                      <Textarea
                        id="projectGoals"
                        {...register('projectGoals')}
                        placeholder="List your project's specific goals..."
                        rows={4}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Target Population */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetPopulation" className="text-sm font-medium text-gray-700">
                        Target Population Description <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="targetPopulation"
                        {...register('targetPopulation')}
                        placeholder="Describe the children and families you will serve..."
                        rows={4}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="childrenServed" className="text-sm font-medium text-gray-700">
                          Children to be Served <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="childrenServed"
                          type="number"
                          {...register('childrenServed')}
                          placeholder="e.g., 100"
                          className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ageRangeStart" className="text-sm font-medium text-gray-700">
                          Age Range Start
                        </Label>
                        <Input
                          id="ageRangeStart"
                          type="number"
                          {...register('ageRangeStart')}
                          placeholder="e.g., 5"
                          className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ageRangeEnd" className="text-sm font-medium text-gray-700">
                          Age Range End
                        </Label>
                        <Input
                          id="ageRangeEnd"
                          type="number"
                          {...register('ageRangeEnd')}
                          placeholder="e.g., 12"
                          className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="povertyIndicators" className="text-sm font-medium text-gray-700">
                        Poverty Indicators <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        How do you identify children in poverty? (e.g., free/reduced lunch, income levels)
                      </p>
                      <Textarea
                        id="povertyIndicators"
                        {...register('povertyIndicators')}
                        placeholder="Describe how you identify and verify need..."
                        rows={3}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Timeline & Location */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectStartDate" className="text-sm font-medium text-gray-700">
                          Project Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="projectStartDate"
                          type="date"
                          {...register('projectStartDate')}
                          className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="projectEndDate" className="text-sm font-medium text-gray-700">
                          Project End Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="projectEndDate"
                          type="date"
                          {...register('projectEndDate')}
                          className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="geographicArea" className="text-sm font-medium text-gray-700">
                        Geographic Area Served <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        HFF focuses on Nebraska and Western Iowa communities
                      </p>
                      <Input
                        id="geographicArea"
                        {...register('geographicArea')}
                        placeholder="e.g., Omaha, NE and surrounding communities"
                        className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--hff-teal)]/5 border border-[var(--hff-teal)]/10">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[var(--hff-teal)] flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-700 mb-1">Geographic Focus</p>
                          <p>
                            The Heistand Family Foundation primarily supports programs serving
                            children in Nebraska and Western Iowa. Please ensure your project serves
                            these areas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Funding Request */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amountRequested" className="text-sm font-medium text-gray-700">
                          Amount Requested ($) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="amountRequested"
                            type="number"
                            {...register('amountRequested')}
                            placeholder="25000"
                            className="h-12 pl-10 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalProjectBudget" className="text-sm font-medium text-gray-700">
                          Total Project Budget ($) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="totalProjectBudget"
                            type="number"
                            {...register('totalProjectBudget')}
                            placeholder="50000"
                            className="h-12 pl-10 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otherFundingSources" className="text-sm font-medium text-gray-700">
                        Other Funding Sources
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        List other grants, donations, or funding for this project
                      </p>
                      <Textarea
                        id="otherFundingSources"
                        {...register('otherFundingSources')}
                        placeholder="e.g., United Way grant ($10,000), Individual donors ($5,000)..."
                        rows={3}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousHFFGrants" className="text-sm font-medium text-gray-700">
                        Previous HFF Grants
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        Have you received grants from HFF before?
                      </p>
                      <Textarea
                        id="previousHFFGrants"
                        {...register('previousHFFGrants')}
                        placeholder="If yes, describe the grant(s) and outcomes..."
                        rows={2}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Outcomes & Impact */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="expectedOutcomes" className="text-sm font-medium text-gray-700">
                        Expected Outcomes <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        What specific, measurable outcomes do you expect?
                      </p>
                      <Textarea
                        id="expectedOutcomes"
                        {...register('expectedOutcomes')}
                        placeholder="e.g., 80% of participants will improve reading scores by one grade level..."
                        rows={4}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="measurementPlan" className="text-sm font-medium text-gray-700">
                        Measurement Plan <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        How will you track and measure success?
                      </p>
                      <Textarea
                        id="measurementPlan"
                        {...register('measurementPlan')}
                        placeholder="Describe your evaluation methods, data collection, and reporting..."
                        rows={4}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sustainabilityPlan" className="text-sm font-medium text-gray-700">
                        Sustainability Plan <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-1">
                        How will this project continue beyond the grant period?
                      </p>
                      <Textarea
                        id="sustainabilityPlan"
                        {...register('sustainabilityPlan')}
                        placeholder="Describe your plans for long-term funding and sustainability..."
                        rows={4}
                        className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                      />
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/applications')}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
                className="rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}

              {currentStep < steps.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="rounded-xl bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting || overallProgress < 50}
                  className="rounded-xl bg-gradient-to-r from-[var(--hff-teal)] to-[var(--hff-sage)] hover:opacity-90 shadow-lg shadow-[var(--hff-teal)]/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
