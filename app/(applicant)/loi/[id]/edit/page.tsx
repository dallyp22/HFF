'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  Save,
  Send,
  CheckCircle2,
  Building2,
  Target,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  User,
  HelpCircle,
  ImageIcon,
} from 'lucide-react'
import { useFormConfig } from '@/lib/hooks/useFormConfig'
import type { FormFieldConfig, FormStepConfig } from '@/lib/default-form-configs'

interface FormData {
  // Contact Info
  primaryContactName: string
  primaryContactTitle: string
  primaryContactPhone: string
  primaryContactEmail: string
  executiveDirector: string
  // Expenditure Type & Focus Area
  expenditureType: string
  focusArea: string
  // Project Questions
  isNewProject: string
  newProjectExplanation: string
  isCapacityIncrease: string
  capacityExplanation: string
  // Project Details
  projectTitle: string
  projectDescription: string
  projectGoals: string
  // Financial
  totalProjectAmount: string
  grantRequestAmount: string
  budgetOutline: string
}

const defaultSteps = [
  {
    id: 1,
    title: 'Contact Information',
    description: 'Verify your contact details',
    icon: User,
    fields: ['primaryContactName', 'primaryContactEmail', 'primaryContactPhone', 'primaryContactTitle', 'executiveDirector'],
  },
  {
    id: 2,
    title: 'Expenditure Type',
    description: 'Type of funding request',
    icon: Target,
    fields: ['expenditureType', 'focusArea'],
  },
  {
    id: 3,
    title: 'Project Context',
    description: 'Tell us about your project',
    icon: HelpCircle,
    fields: ['isNewProject', 'newProjectExplanation', 'isCapacityIncrease', 'capacityExplanation'],
  },
  {
    id: 4,
    title: 'Project Overview',
    description: 'Describe your project',
    icon: FileText,
    fields: ['projectTitle', 'projectDescription', 'projectGoals'],
  },
  {
    id: 5,
    title: 'Financial Information',
    description: 'Budget details',
    icon: DollarSign,
    fields: ['totalProjectAmount', 'grantRequestAmount', 'budgetOutline'],
  },
  {
    id: 6,
    title: 'Review & Submit',
    description: 'Final review',
    icon: Send,
    fields: [],
  },
]

const stepIcons = [User, Target, HelpCircle, FileText, DollarSign, Send]

const defaultExpenditureOptions = [
  { value: 'PROGRAMMING', label: 'Programming / Special Project' },
  { value: 'OPERATING', label: 'Operating Funding' },
  { value: 'CAPITAL', label: 'Capital Project', note: 'Requires pre-approval' },
]

const defaultFocusAreaOptions = [
  { value: 'HUMAN_HEALTH', label: 'Human Health & Wellbeing' },
  { value: 'EDUCATION', label: 'Education & Development' },
  { value: 'COMMUNITY_WELLBEING', label: 'Community Wellbeing' },
]

// Helper to get a field config from the loaded form config
function getField(formConfig: FormStepConfig[] | undefined, stepId: number, fieldKey: string): FormFieldConfig | undefined {
  if (!formConfig) return undefined
  const step = formConfig.find((s) => s.id === stepId)
  return step?.fields.find((f) => f.key === fieldKey)
}

export default function EditLOIPage() {
  const router = useRouter()
  const params = useParams()
  const loiId = params.id as string
  const { config: formConfig } = useFormConfig('LOI')

  // Build steps from config, falling back to defaults
  const steps = useMemo(() => {
    if (!formConfig?.steps) return defaultSteps
    return formConfig.steps.map((cfgStep, i) => {
      const def = defaultSteps.find((d) => d.id === cfgStep.id) || defaultSteps[i]
      return {
        id: cfgStep.id,
        title: cfgStep.title || def?.title || `Step ${cfgStep.id}`,
        description: cfgStep.description || def?.description || '',
        icon: stepIcons[i] || FileText,
        fields: cfgStep.fields.filter((f) => f.visible).map((f) => f.key),
      }
    })
  }, [formConfig])

  // Config-driven options
  const expenditureOptions = useMemo(() => {
    const field = getField(formConfig?.steps, 2, 'expenditureType')
    return field?.options || defaultExpenditureOptions
  }, [formConfig])

  const focusAreaOptions = useMemo(() => {
    const field = getField(formConfig?.steps, 2, 'focusArea')
    return field?.options || defaultFocusAreaOptions
  }, [formConfig])

  // Helper to get field config with fallback
  const fc = useCallback((stepId: number, key: string) => {
    return getField(formConfig?.steps, stepId, key)
  }, [formConfig])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loi, setLoi] = useState<any>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({})

  const form = useForm<FormData>({
    defaultValues: {
      primaryContactName: '',
      primaryContactTitle: '',
      primaryContactPhone: '',
      primaryContactEmail: '',
      executiveDirector: '',
      expenditureType: '',
      focusArea: '',
      isNewProject: '',
      newProjectExplanation: '',
      isCapacityIncrease: '',
      capacityExplanation: '',
      projectTitle: '',
      projectDescription: '',
      projectGoals: '',
      totalProjectAmount: '',
      grantRequestAmount: '',
      budgetOutline: '',
    },
  })

  const { register, watch, setValue, getValues, reset } = form
  const watchedValues = watch()

  // Word count helpers
  const descriptionWordCount = watchedValues.projectDescription?.trim().split(/\s+/).filter(Boolean).length || 0
  const goalsWordCount = watchedValues.projectGoals?.trim().split(/\s+/).filter(Boolean).length || 0
  const budgetWordCount = watchedValues.budgetOutline?.trim().split(/\s+/).filter(Boolean).length || 0

  // Calculate step completion
  const getStepCompletion = useCallback(
    (stepId: number) => {
      const step = steps.find((s) => s.id === stepId)
      if (!step || step.fields.length === 0) return stepId === 6 ? 100 : 0

      const requiredFields: Record<number, string[]> = {
        1: ['primaryContactName', 'primaryContactEmail'],
        2: ['expenditureType', 'focusArea'],
        3: [], // Optional questions
        4: ['projectTitle', 'projectDescription'],
        5: ['totalProjectAmount', 'grantRequestAmount', 'budgetOutline'],
      }

      const required = requiredFields[stepId] || []
      if (required.length === 0) return 100

      const filledFields = required.filter((field) => {
        const value = watchedValues[field as keyof FormData]
        return value && value.toString().trim().length > 0
      })
      return Math.round((filledFields.length / required.length) * 100)
    },
    [watchedValues]
  )

  // Overall progress
  const overallProgress = Math.round(
    steps.slice(0, -1).reduce((acc, step) => acc + getStepCompletion(step.id), 0) / (steps.length - 1)
  )

  // Percent of project calculation
  const percentOfProject = watchedValues.totalProjectAmount && watchedValues.grantRequestAmount
    ? ((parseFloat(watchedValues.grantRequestAmount) / parseFloat(watchedValues.totalProjectAmount)) * 100).toFixed(1)
    : null

  useEffect(() => {
    async function fetchLOI() {
      try {
        const response = await fetch(`/api/loi/${loiId}`)
        if (!response.ok) {
          toast.error('Letter of Interest not found')
          router.push('/loi')
          return
        }

        const data = await response.json()

        if (data.status !== 'DRAFT') {
          toast.info('This LOI has already been submitted')
          router.push(`/loi/${loiId}`)
          return
        }

        setLoi(data)
        setCurrentStep(data.currentStep || 1)

        // Populate custom fields
        if (data.customFields && typeof data.customFields === 'object') {
          setCustomFieldValues(data.customFields as Record<string, string>)
        }

        // Populate form
        reset({
          primaryContactName: data.primaryContactName || '',
          primaryContactTitle: data.primaryContactTitle || '',
          primaryContactPhone: data.primaryContactPhone || '',
          primaryContactEmail: data.primaryContactEmail || '',
          executiveDirector: data.executiveDirector || '',
          expenditureType: data.expenditureType || '',
          focusArea: data.focusArea || '',
          isNewProject: data.isNewProject === true ? 'yes' : data.isNewProject === false ? 'no' : '',
          newProjectExplanation: data.newProjectExplanation || '',
          isCapacityIncrease: data.isCapacityIncrease === true ? 'yes' : data.isCapacityIncrease === false ? 'no' : '',
          capacityExplanation: data.capacityExplanation || '',
          projectTitle: data.projectTitle || '',
          projectDescription: data.projectDescription || '',
          projectGoals: data.projectGoals || '',
          totalProjectAmount: data.totalProjectAmount || '',
          grantRequestAmount: data.grantRequestAmount || '',
          budgetOutline: data.budgetOutline || '',
        })
      } catch (error) {
        console.error('Error fetching LOI:', error)
        toast.error('Failed to load Letter of Interest')
      } finally {
        setLoading(false)
      }
    }

    fetchLOI()
  }, [loiId, router, reset])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!loi) return

    const interval = setInterval(async () => {
      const values = getValues()
      if (Object.values(values).some((v) => v)) {
        await saveProgress(values, true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loi, getValues])

  async function saveProgress(data: FormData, isAutoSave = false) {
    try {
      setSaving(true)

      const payload: any = {
        ...data,
        isNewProject: data.isNewProject === 'yes' ? true : data.isNewProject === 'no' ? false : null,
        isCapacityIncrease: data.isCapacityIncrease === 'yes' ? true : data.isCapacityIncrease === 'no' ? false : null,
        currentStep,
        customFields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
      }

      const response = await fetch(`/api/loi/${loiId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Save failed')
      }

      setLastSaved(new Date())
      if (!isAutoSave) {
        toast.success('Progress saved')
      }
    } catch (error) {
      console.error('Save failed:', error)
      if (!isAutoSave) {
        toast.error('Failed to save')
      }
      throw error
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveDraft() {
    try {
      await saveProgress(getValues())
      router.push('/loi')
    } catch (error) {
      console.error('Save draft failed:', error)
      toast.error('Failed to save draft. Please try again.')
    }
  }

  async function handleSubmit(e?: React.MouseEvent | React.FormEvent) {
    e?.preventDefault()
    setSubmitting(true)

    try {
      await saveProgress(getValues())

      const response = await fetch(`/api/loi/${loiId}/submit`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Letter of Interest submitted successfully!')
        router.push('/loi')
      } else {
        const error = await response.json()
        if (error.missingFields) {
          toast.error(`Missing required fields: ${error.missingFields.join(', ')}`)
        } else {
          toast.error(error.error || 'Failed to submit')
        }
      }
    } catch (error) {
      console.error('Error submitting:', error)
      toast.error('Failed to submit Letter of Interest')
    } finally {
      setSubmitting(false)
    }
  }

  const goToStep = (step: number) => {
    saveProgress(getValues(), true)
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      saveProgress(getValues(), true)
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

  // Render custom fields for a given step
  const renderCustomFields = (stepId: number) => {
    if (!formConfig?.steps) return null
    const stepConfig = formConfig.steps.find((s) => s.id === stepId)
    if (!stepConfig) return null
    const customFields = stepConfig.fields.filter((f) => f.isCustom && f.visible)
    if (customFields.length === 0) return null

    return (
      <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
        {customFields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
            {(field.type === 'text' || field.type === 'currency') && (
              <Input
                id={field.key}
                type={field.type === 'currency' ? 'number' : 'text'}
                value={customFieldValues[field.key] || ''}
                onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder || ''}
                className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
              />
            )}
            {field.type === 'textarea' && (
              <Textarea
                id={field.key}
                value={customFieldValues[field.key] || ''}
                onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder || ''}
                rows={4}
                className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
              />
            )}
            {(field.type === 'number') && (
              <Input
                id={field.key}
                type="number"
                value={customFieldValues[field.key] || ''}
                onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder || ''}
                className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
              />
            )}
            {field.type === 'date' && (
              <Input
                id={field.key}
                type="date"
                value={customFieldValues[field.key] || ''}
                onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
              />
            )}
          </div>
        ))}
      </div>
    )
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
          <p className="text-gray-600">Loading your Letter of Interest...</p>
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
              <span className="text-sm font-medium">Letter of Interest</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {watchedValues.projectTitle || 'New Letter of Interest'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{loi?.organization?.legalName}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{loi?.cycleConfig?.cycle} {loi?.cycleConfig?.year} Cycle</span>
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
              {steps.map((step) => {
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
                  </button>
                )
              })}
            </div>
          </GlassCard>
        </FadeIn>

        {/* Form Content */}
        <form onSubmit={(e) => e.preventDefault()}>
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

                {/* Step 1: Contact Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {fc(1, 'primaryContactName')?.visible !== false && (
                        <div className="space-y-2">
                          <Label htmlFor="primaryContactName" className="text-sm font-medium text-gray-700">
                            {fc(1, 'primaryContactName')?.label || 'Primary Contact Name'} {(fc(1, 'primaryContactName')?.required ?? true) && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="primaryContactName"
                            {...register('primaryContactName')}
                            placeholder={fc(1, 'primaryContactName')?.placeholder || 'Full name'}
                            className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                          />
                          {fc(1, 'primaryContactName')?.helpText && <p className="text-xs text-gray-500">{fc(1, 'primaryContactName')?.helpText}</p>}
                        </div>
                      )}
                      {fc(1, 'primaryContactTitle')?.visible !== false && (
                        <div className="space-y-2">
                          <Label htmlFor="primaryContactTitle" className="text-sm font-medium text-gray-700">
                            {fc(1, 'primaryContactTitle')?.label || 'Title'} {fc(1, 'primaryContactTitle')?.required && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="primaryContactTitle"
                            {...register('primaryContactTitle')}
                            placeholder={fc(1, 'primaryContactTitle')?.placeholder || 'e.g., Executive Director'}
                            className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {fc(1, 'primaryContactEmail')?.visible !== false && (
                        <div className="space-y-2">
                          <Label htmlFor="primaryContactEmail" className="text-sm font-medium text-gray-700">
                            {fc(1, 'primaryContactEmail')?.label || 'Email'} {(fc(1, 'primaryContactEmail')?.required ?? true) && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="primaryContactEmail"
                            type="email"
                            {...register('primaryContactEmail')}
                            placeholder={fc(1, 'primaryContactEmail')?.placeholder || 'email@organization.org'}
                            className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                          />
                        </div>
                      )}
                      {fc(1, 'primaryContactPhone')?.visible !== false && (
                        <div className="space-y-2">
                          <Label htmlFor="primaryContactPhone" className="text-sm font-medium text-gray-700">
                            {fc(1, 'primaryContactPhone')?.label || 'Phone'} {fc(1, 'primaryContactPhone')?.required && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="primaryContactPhone"
                            {...register('primaryContactPhone')}
                            placeholder={fc(1, 'primaryContactPhone')?.placeholder || '(555) 123-4567'}
                            className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                          />
                        </div>
                      )}
                    </div>

                    {fc(1, 'executiveDirector')?.visible !== false && (
                      <div className="space-y-2">
                        <Label htmlFor="executiveDirector" className="text-sm font-medium text-gray-700">
                          {fc(1, 'executiveDirector')?.label || 'Executive Director'} {fc(1, 'executiveDirector')?.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id="executiveDirector"
                          {...register('executiveDirector')}
                          placeholder={fc(1, 'executiveDirector')?.placeholder || 'Executive Director name'}
                          className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      </div>
                    )}
                    {renderCustomFields(1)}
                  </div>
                )}

                {/* Step 2: Expenditure Type */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    {fc(2, 'expenditureType')?.visible !== false && <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        {fc(2, 'expenditureType')?.label || 'Expenditure Type'} {(fc(2, 'expenditureType')?.required ?? true) && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="grid gap-3">
                        {expenditureOptions.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              watchedValues.expenditureType === option.value
                                ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <input
                              type="radio"
                              {...register('expenditureType')}
                              value={option.value}
                              className="sr-only"
                            />
                            <div
                              className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                watchedValues.expenditureType === option.value
                                  ? 'border-[var(--hff-teal)]'
                                  : 'border-gray-300'
                              )}
                            >
                              {watchedValues.expenditureType === option.value && (
                                <div className="w-3 h-3 rounded-full bg-[var(--hff-teal)]" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{option.label}</span>
                              {option.note && (
                                <p className="text-xs text-amber-600 mt-0.5">{option.note}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>}

                    {fc(2, 'focusArea')?.visible !== false && <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        {fc(2, 'focusArea')?.label || 'Focus Area'} {(fc(2, 'focusArea')?.required ?? true) && <span className="text-red-500">*</span>}
                      </Label>
                      <div className="grid gap-3">
                        {focusAreaOptions.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              watchedValues.focusArea === option.value
                                ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <input
                              type="radio"
                              {...register('focusArea')}
                              value={option.value}
                              className="sr-only"
                            />
                            <div
                              className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                watchedValues.focusArea === option.value
                                  ? 'border-[var(--hff-teal)]'
                                  : 'border-gray-300'
                              )}
                            >
                              {watchedValues.focusArea === option.value && (
                                <div className="w-3 h-3 rounded-full bg-[var(--hff-teal)]" />
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{option.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>}
                    {renderCustomFields(2)}
                  </div>
                )}

                {/* Step 3: Project Context */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    {fc(3, 'isNewProject')?.visible !== false && <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        {fc(3, 'isNewProject')?.label || 'Is this request for a new project or emerging need?'}
                      </Label>
                      <div className="flex gap-4">
                        {['yes', 'no'].map((value) => (
                          <label
                            key={value}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              watchedValues.isNewProject === value
                                ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <input
                              type="radio"
                              {...register('isNewProject')}
                              value={value}
                              className="sr-only"
                            />
                            <span className="font-medium capitalize">{value}</span>
                          </label>
                        ))}
                      </div>
                      {watchedValues.isNewProject === 'yes' && fc(3, 'newProjectExplanation')?.visible !== false && (
                        <Textarea
                          {...register('newProjectExplanation')}
                          placeholder={fc(3, 'newProjectExplanation')?.placeholder || 'Please explain...'}
                          rows={3}
                          className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      )}
                    </div>}

                    {fc(3, 'isCapacityIncrease')?.visible !== false && <div className="space-y-4">
                      <Label className="text-sm font-medium text-gray-700">
                        {fc(3, 'isCapacityIncrease')?.label || 'Is this request for increasing capacity or rising operations costs?'}
                      </Label>
                      <div className="flex gap-4">
                        {['yes', 'no'].map((value) => (
                          <label
                            key={value}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
                              watchedValues.isCapacityIncrease === value
                                ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <input
                              type="radio"
                              {...register('isCapacityIncrease')}
                              value={value}
                              className="sr-only"
                            />
                            <span className="font-medium capitalize">{value}</span>
                          </label>
                        ))}
                      </div>
                      {watchedValues.isCapacityIncrease === 'yes' && fc(3, 'capacityExplanation')?.visible !== false && (
                        <Textarea
                          {...register('capacityExplanation')}
                          placeholder={fc(3, 'capacityExplanation')?.placeholder || 'Please explain...'}
                          rows={3}
                          className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      )}
                    </div>}
                    {renderCustomFields(3)}
                  </div>
                )}

                {/* Step 4: Project Overview */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {fc(4, 'projectTitle')?.visible !== false && (
                      <div className="space-y-2">
                        <Label htmlFor="projectTitle" className="text-sm font-medium text-gray-700">
                          {fc(4, 'projectTitle')?.label || 'Project Title'} {(fc(4, 'projectTitle')?.required ?? true) && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          id="projectTitle"
                          {...register('projectTitle')}
                          placeholder={fc(4, 'projectTitle')?.placeholder || 'e.g., Youth Literacy Initiative 2026'}
                          className="h-12 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                      </div>
                    )}

                    {fc(4, 'projectDescription')?.visible !== false && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="projectDescription" className="text-sm font-medium text-gray-700">
                            {fc(4, 'projectDescription')?.label || 'Proposed Project Description'} {(fc(4, 'projectDescription')?.required ?? true) && <span className="text-red-500">*</span>}
                          </Label>
                          {(fc(4, 'projectDescription')?.wordLimit ?? 500) > 0 && (
                            <span className={cn(
                              'text-xs',
                              descriptionWordCount > (fc(4, 'projectDescription')?.wordLimit ?? 500) ? 'text-red-600 font-medium' : 'text-gray-500'
                            )}>
                              {descriptionWordCount}/{fc(4, 'projectDescription')?.wordLimit ?? 500} words
                            </span>
                          )}
                        </div>
                        {(fc(4, 'projectDescription')?.helpText) && (
                          <p className="text-xs text-gray-500 mb-1">{fc(4, 'projectDescription')?.helpText}</p>
                        )}
                        <Textarea
                          id="projectDescription"
                          {...register('projectDescription')}
                          placeholder={fc(4, 'projectDescription')?.placeholder || "Describe your proposed project..."}
                          rows={8}
                          className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                        {descriptionWordCount > (fc(4, 'projectDescription')?.wordLimit ?? 500) && (
                          <p className="text-xs text-red-600">
                            Please reduce your description to {fc(4, 'projectDescription')?.wordLimit ?? 500} words or fewer
                          </p>
                        )}
                      </div>
                    )}

                    {/* Project Goals */}
                    {fc(4, 'projectGoals')?.visible !== false && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="projectGoals" className="text-sm font-medium text-gray-700">
                            {fc(4, 'projectGoals')?.label || 'Project Goals'} {fc(4, 'projectGoals')?.required && <span className="text-red-500">*</span>}
                          </Label>
                          {(fc(4, 'projectGoals')?.wordLimit ?? 500) > 0 && (
                            <span className={cn(
                              'text-xs',
                              goalsWordCount > (fc(4, 'projectGoals')?.wordLimit ?? 500) ? 'text-red-600 font-medium' : 'text-gray-500'
                            )}>
                              {goalsWordCount}/{fc(4, 'projectGoals')?.wordLimit ?? 500} words
                            </span>
                          )}
                        </div>
                        {fc(4, 'projectGoals')?.helpText && (
                          <p className="text-xs text-gray-500 mb-1">{fc(4, 'projectGoals')?.helpText}</p>
                        )}
                        <Textarea
                          id="projectGoals"
                          {...register('projectGoals')}
                          placeholder={fc(4, 'projectGoals')?.placeholder || 'Describe the goals and objectives of your project...'}
                          rows={6}
                          className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                        {goalsWordCount > (fc(4, 'projectGoals')?.wordLimit ?? 500) && (
                          <p className="text-xs text-red-600">
                            Please reduce your project goals to {fc(4, 'projectGoals')?.wordLimit ?? 500} words or fewer
                          </p>
                        )}
                      </div>
                    )}

                    {/* Photo upload hint */}
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <ImageIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium text-gray-700 mb-1">Optional: Add Photos</p>
                          <p>
                            You can upload 1-3 photos that help illustrate your project.
                            Photo upload will be available after saving your LOI draft.
                          </p>
                        </div>
                      </div>
                    </div>
                    {renderCustomFields(4)}
                  </div>
                )}

                {/* Step 5: Financial Information */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {fc(5, 'totalProjectAmount')?.visible !== false && (
                        <div className="space-y-2">
                          <Label htmlFor="totalProjectAmount" className="text-sm font-medium text-gray-700">
                            {fc(5, 'totalProjectAmount')?.label || 'Total Dollar Amount of Project'} {(fc(5, 'totalProjectAmount')?.required ?? true) && <span className="text-red-500">*</span>}
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="totalProjectAmount"
                              type="number"
                              {...register('totalProjectAmount')}
                              placeholder={fc(5, 'totalProjectAmount')?.placeholder || '100000'}
                              className="h-12 pl-10 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                            />
                          </div>
                        </div>
                      )}

                      {fc(5, 'grantRequestAmount')?.visible !== false && (
                        <div className="space-y-2">
                          <Label htmlFor="grantRequestAmount" className="text-sm font-medium text-gray-700">
                            {fc(5, 'grantRequestAmount')?.label || 'Grant Request Amount'} {(fc(5, 'grantRequestAmount')?.required ?? true) && <span className="text-red-500">*</span>}
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="grantRequestAmount"
                              type="number"
                              {...register('grantRequestAmount')}
                              placeholder={fc(5, 'grantRequestAmount')?.placeholder || '25000'}
                              className="h-12 pl-10 rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {percentOfProject && (
                      <div className="p-4 rounded-xl bg-[var(--hff-teal)]/5 border border-[var(--hff-teal)]/10">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Percent of Total Project:</span>{' '}
                          <span className="text-[var(--hff-teal)] font-bold">{percentOfProject}%</span>
                        </p>
                      </div>
                    )}

                    {fc(5, 'budgetOutline')?.visible !== false && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="budgetOutline" className="text-sm font-medium text-gray-700">
                            {fc(5, 'budgetOutline')?.label || 'Proposed Project Budget Outline'} {(fc(5, 'budgetOutline')?.required ?? true) && <span className="text-red-500">*</span>}
                          </Label>
                          {(fc(5, 'budgetOutline')?.wordLimit ?? 250) > 0 && (
                            <span className={cn(
                              'text-xs',
                              budgetWordCount > (fc(5, 'budgetOutline')?.wordLimit ?? 250) ? 'text-red-600 font-medium' : 'text-gray-500'
                            )}>
                              {budgetWordCount}/{fc(5, 'budgetOutline')?.wordLimit ?? 250} words
                            </span>
                          )}
                        </div>
                        {fc(5, 'budgetOutline')?.helpText && (
                          <p className="text-xs text-gray-500 mb-1">{fc(5, 'budgetOutline')?.helpText}</p>
                        )}
                        <Textarea
                          id="budgetOutline"
                          {...register('budgetOutline')}
                          placeholder={fc(5, 'budgetOutline')?.placeholder || 'e.g., Staff salaries ($15,000), Program supplies ($5,000)...'}
                          rows={5}
                          className="rounded-xl border-gray-200 focus:border-[var(--hff-teal)] focus:ring-[var(--hff-teal)]/20"
                        />
                        {budgetWordCount > (fc(5, 'budgetOutline')?.wordLimit ?? 250) && (
                          <p className="text-xs text-red-600">
                            Please reduce your budget outline to {fc(5, 'budgetOutline')?.wordLimit ?? 250} words or fewer
                          </p>
                        )}
                      </div>
                    )}
                    {renderCustomFields(5)}
                  </div>
                )}

                {/* Step 6: Review & Submit */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-[var(--hff-teal)]/5 border border-[var(--hff-teal)]/10">
                      <h3 className="font-medium text-gray-900 mb-2">Ready to Submit?</h3>
                      <p className="text-sm text-gray-600">
                        Please review your Letter of Interest carefully before submitting. Once submitted,
                        you will not be able to make changes.
                      </p>
                    </div>

                    {/* Comprehensive Review Summary */}
                    <div className="space-y-4">
                      {/* Contact Information */}
                      <div className="p-4 rounded-xl bg-gray-50 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact Information</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Primary Contact Name</p>
                            <p className="text-sm font-medium">{watchedValues.primaryContactName || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Title</p>
                            <p className="text-sm font-medium">{watchedValues.primaryContactTitle || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium">{watchedValues.primaryContactEmail || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm font-medium">{watchedValues.primaryContactPhone || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Executive Director</p>
                            <p className="text-sm font-medium">{watchedValues.executiveDirector || '—'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Focus Area & Expenditure Type */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-gray-50">
                          <p className="text-xs text-gray-500 mb-1">Focus Area</p>
                          <p className="font-medium">
                            {focusAreaOptions.find(o => o.value === watchedValues.focusArea)?.label || '—'}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gray-50">
                          <p className="text-xs text-gray-500 mb-1">Expenditure Type</p>
                          <p className="font-medium">
                            {expenditureOptions.find(o => o.value === watchedValues.expenditureType)?.label || '—'}
                          </p>
                        </div>
                      </div>

                      {/* Project Context */}
                      <div className="p-4 rounded-xl bg-gray-50 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Project Context</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">New Project or Emerging Need?</p>
                            <p className="text-sm font-medium capitalize">{watchedValues.isNewProject || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Increasing Capacity / Rising Costs?</p>
                            <p className="text-sm font-medium capitalize">{watchedValues.isCapacityIncrease || '—'}</p>
                          </div>
                        </div>
                        {watchedValues.isNewProject === 'yes' && watchedValues.newProjectExplanation && (
                          <div>
                            <p className="text-xs text-gray-500">New Project Explanation</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{watchedValues.newProjectExplanation}</p>
                          </div>
                        )}
                        {watchedValues.isCapacityIncrease === 'yes' && watchedValues.capacityExplanation && (
                          <div>
                            <p className="text-xs text-gray-500">Capacity Explanation</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{watchedValues.capacityExplanation}</p>
                          </div>
                        )}
                      </div>

                      {/* Project Overview */}
                      <div className="p-4 rounded-xl bg-gray-50 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Project Overview</h4>
                        <div>
                          <p className="text-xs text-gray-500">Project Title</p>
                          <p className="text-sm font-medium">{watchedValues.projectTitle || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Project Description</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {watchedValues.projectDescription || '—'}
                          </p>
                        </div>
                        {watchedValues.projectGoals && (
                          <div>
                            <p className="text-xs text-gray-500">Project Goals</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {watchedValues.projectGoals}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Financial Information */}
                      <div className="p-4 rounded-xl bg-gray-50 space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Financial Information</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Total Project Budget</p>
                            <p className="text-sm font-medium">
                              {watchedValues.totalProjectAmount
                                ? `$${parseInt(watchedValues.totalProjectAmount).toLocaleString()}`
                                : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Grant Request Amount</p>
                            <p className="text-sm font-medium">
                              {watchedValues.grantRequestAmount
                                ? `$${parseInt(watchedValues.grantRequestAmount).toLocaleString()}`
                                : '—'}
                            </p>
                          </div>
                        </div>
                        {percentOfProject && (
                          <div>
                            <p className="text-xs text-gray-500">Percent of Total Project</p>
                            <p className="text-sm font-medium text-[var(--hff-teal)]">{percentOfProject}%</p>
                          </div>
                        )}
                        {watchedValues.budgetOutline && (
                          <div>
                            <p className="text-xs text-gray-500">Budget Outline</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{watchedValues.budgetOutline}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Deadline reminder */}
                    {loi?.cycleConfig?.loiDeadline && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                          <span className="font-medium">LOI Deadline:</span>{' '}
                          {new Date(loi.cycleConfig.loiDeadline).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}

                    {/* Confirmation Checkbox */}
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-200">
                      <Checkbox
                        id="confirmSubmit"
                        checked={confirmSubmit}
                        onCheckedChange={(checked) => setConfirmSubmit(checked === true)}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor="confirmSubmit"
                        className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                      >
                        I confirm all information is accurate and complete
                      </Label>
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
                onClick={() => router.push('/loi')}
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      disabled={submitting || !confirmSubmit || overallProgress < 60 || descriptionWordCount > 500 || goalsWordCount > 500 || budgetWordCount > 250}
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
                          Submit LOI
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit Letter of Interest</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit this Letter of Interest? Once submitted, you will not be able to make any further changes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]"
                      >
                        Yes, Submit
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
