'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import {
  Loader2,
  Save,
  FileText,
  ClipboardList,
  GripVertical,
  Eye,
  EyeOff,
  Asterisk,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import type { FormConfigData, FormStepConfig, FormFieldConfig } from '@/lib/default-form-configs'

export function FormEditorClient() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<'LOI' | 'APPLICATION'>('LOI')
  const [loiConfig, setLoiConfig] = useState<FormConfigData | null>(null)
  const [appConfig, setAppConfig] = useState<FormConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({})
  const [lastSaved, setLastSaved] = useState<{ LOI?: string; APPLICATION?: string }>({})

  useEffect(() => {
    async function loadConfigs() {
      try {
        const [loiRes, appRes] = await Promise.all([
          fetch('/api/admin/form-config?formType=LOI'),
          fetch('/api/admin/form-config?formType=APPLICATION'),
        ])

        if (loiRes.ok && appRes.ok) {
          const loiData = await loiRes.json()
          const appData = await appRes.json()

          // config might be nested if it was saved to DB, or flat if default
          const loiCfg = loiData.config?.steps ? loiData.config : loiData
          const appCfg = appData.config?.steps ? appData.config : appData

          setLoiConfig(loiCfg as FormConfigData)
          setAppConfig(appCfg as FormConfigData)

          if (loiData.updatedByName && loiData.updatedAt) {
            setLastSaved((prev) => ({ ...prev, LOI: `${loiData.updatedByName} on ${new Date(loiData.updatedAt).toLocaleDateString()}` }))
          }
          if (appData.updatedByName && appData.updatedAt) {
            setLastSaved((prev) => ({ ...prev, APPLICATION: `${appData.updatedByName} on ${new Date(appData.updatedAt).toLocaleDateString()}` }))
          }
        }
      } catch (error) {
        console.error('Error loading form configs:', error)
        toast.error('Failed to load form configurations')
      } finally {
        setLoading(false)
      }
    }
    loadConfigs()
  }, [])

  const currentConfig = activeTab === 'LOI' ? loiConfig : appConfig
  const setCurrentConfig = activeTab === 'LOI' ? setLoiConfig : setAppConfig

  function updateStep(stepId: number, updates: Partial<FormStepConfig>) {
    if (!currentConfig) return
    const newConfig = {
      ...currentConfig,
      steps: currentConfig.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
    }
    setCurrentConfig(newConfig)
  }

  function updateField(stepId: number, fieldKey: string, updates: Partial<FormFieldConfig>) {
    if (!currentConfig) return
    const newConfig = {
      ...currentConfig,
      steps: currentConfig.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              fields: s.fields.map((f) => (f.key === fieldKey ? { ...f, ...updates } : f)),
            }
          : s
      ),
    }
    setCurrentConfig(newConfig)
  }

  function updateOption(stepId: number, fieldKey: string, optionIndex: number, updates: Partial<{ value: string; label: string; note: string }>) {
    if (!currentConfig) return
    const newConfig = {
      ...currentConfig,
      steps: currentConfig.steps.map((s) =>
        s.id === stepId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.key === fieldKey && f.options
                  ? {
                      ...f,
                      options: f.options.map((o, i) => (i === optionIndex ? { ...o, ...updates } : o)),
                    }
                  : f
              ),
            }
          : s
      ),
    }
    setCurrentConfig(newConfig)
  }

  function addField(stepId: number, fieldType: FormFieldConfig['type'] = 'text') {
    if (!currentConfig) return
    const key = `custom_${Date.now()}`
    const newField: FormFieldConfig = {
      key,
      label: 'New Question',
      type: fieldType,
      placeholder: '',
      helpText: '',
      required: false,
      visible: true,
      isCustom: true,
    }
    const newConfig = {
      ...currentConfig,
      steps: currentConfig.steps.map((s) =>
        s.id === stepId ? { ...s, fields: [...s.fields, newField] } : s
      ),
    }
    setCurrentConfig(newConfig)
  }

  function removeField(stepId: number, fieldKey: string) {
    if (!currentConfig) return
    const newConfig = {
      ...currentConfig,
      steps: currentConfig.steps.map((s) =>
        s.id === stepId
          ? { ...s, fields: s.fields.filter((f) => f.key !== fieldKey) }
          : s
      ),
    }
    setCurrentConfig(newConfig)
  }

  async function handleSave() {
    if (!currentConfig) return
    setSaving(true)

    try {
      const response = await fetch('/api/admin/form-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: activeTab,
          config: currentConfig,
          updatedByName: user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Admin',
        }),
      })

      if (response.ok) {
        toast.success(`${activeTab === 'LOI' ? 'LOI' : 'Full Application'} form saved. Changes will apply to all future applications.`)
        setLastSaved((prev) => ({
          ...prev,
          [activeTab]: `${user?.fullName || 'Admin'} on ${new Date().toLocaleDateString()}`,
        }))
      } else {
        toast.error('Failed to save form configuration')
      }
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Failed to save form configuration')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    const { defaultLOIConfig, defaultApplicationConfig } = await import('@/lib/default-form-configs')
    if (activeTab === 'LOI') {
      setLoiConfig(defaultLOIConfig)
    } else {
      setAppConfig(defaultApplicationConfig)
    }
    toast.info('Reset to defaults. Click "Save Changes" to apply.')
  }

  function toggleStep(stepKey: string) {
    setExpandedSteps((prev) => ({ ...prev, [stepKey]: !prev[stepKey] }))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--hff-teal)]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                <Pencil className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Form Editor</h1>
                <p className="text-gray-500 text-sm">
                  Edit the LOI and Full Application forms. Changes affect all future applications.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'LOI' | 'APPLICATION')}>
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-white/80 border">
                <TabsTrigger value="LOI" className="gap-2 data-[state=active]:bg-[var(--hff-teal)] data-[state=active]:text-white">
                  <ClipboardList className="w-4 h-4" />
                  Letter of Interest
                </TabsTrigger>
                <TabsTrigger value="APPLICATION" className="gap-2 data-[state=active]:bg-[var(--hff-teal)] data-[state=active]:text-white">
                  <FileText className="w-4 h-4" />
                  Full Application
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 text-gray-600">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Defaults
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="sm"
                  className="gap-1.5 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </Button>
              </div>
            </div>

            {lastSaved[activeTab] && (
              <p className="text-xs text-gray-500 mb-4">
                Last updated by {lastSaved[activeTab]}
              </p>
            )}

            <TabsContent value="LOI" className="space-y-4">
              {loiConfig && <StepEditor config={loiConfig} expandedSteps={expandedSteps} toggleStep={toggleStep} updateStep={updateStep} updateField={updateField} updateOption={updateOption} addField={addField} removeField={removeField} formType="LOI" />}
            </TabsContent>

            <TabsContent value="APPLICATION" className="space-y-4">
              {appConfig && <StepEditor config={appConfig} expandedSteps={expandedSteps} toggleStep={toggleStep} updateStep={updateStep} updateField={updateField} updateOption={updateOption} addField={addField} removeField={removeField} formType="APPLICATION" />}
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </div>
  )
}

function StepEditor({
  config,
  expandedSteps,
  toggleStep,
  updateStep,
  updateField,
  updateOption,
  addField,
  removeField,
  formType,
}: {
  config: FormConfigData
  expandedSteps: Record<string, boolean>
  toggleStep: (key: string) => void
  updateStep: (stepId: number, updates: Partial<FormStepConfig>) => void
  updateField: (stepId: number, fieldKey: string, updates: Partial<FormFieldConfig>) => void
  updateOption: (stepId: number, fieldKey: string, optionIndex: number, updates: Partial<{ value: string; label: string; note: string }>) => void
  addField: (stepId: number, fieldType?: FormFieldConfig['type']) => void
  removeField: (stepId: number, fieldKey: string) => void
  formType: string
}) {
  return (
    <div className="space-y-3">
      {config.steps.map((step) => {
        const stepKey = `${formType}-${step.id}`
        const isExpanded = expandedSteps[stepKey] ?? false

        return (
          <GlassCard key={step.id} className="overflow-hidden">
            {/* Step Header - Collapsible */}
            <button
              type="button"
              onClick={() => toggleStep(stepKey)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50/50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--hff-teal)]/10 flex items-center justify-center text-sm font-bold text-[var(--hff-teal)]">
                {step.id}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-xs text-gray-500">
                  {step.fields.length} field{step.fields.length !== 1 ? 's' : ''} &middot; {step.fields.filter((f) => f.visible).length} visible &middot; {step.fields.filter((f) => f.required).length} required
                </p>
              </div>
              {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 space-y-6">
                {/* Step Title & Description */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500">Step Title</Label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-500">Step Description</Label>
                    <Input
                      value={step.description}
                      onChange={(e) => updateStep(step.id, { description: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Fields */}
                {step.fields.length === 0 && step.id === config.steps[config.steps.length - 1]?.id ? (
                  <p className="text-sm text-gray-400 italic">This is the review/submit step — no editable fields.</p>
                ) : (
                  <div className="space-y-4">
                    {step.fields.map((field) => (
                      <FieldEditor
                        key={field.key}
                        field={field}
                        stepId={step.id}
                        updateField={updateField}
                        updateOption={updateOption}
                        removeField={field.isCustom ? removeField : undefined}
                      />
                    ))}
                  </div>
                )}

                {/* Add Field Button */}
                {step.id !== config.steps[config.steps.length - 1]?.id && (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addField(step.id, 'text')}
                        className="gap-1.5 text-[var(--hff-teal)] border-[var(--hff-teal)]/30 hover:bg-[var(--hff-teal)]/5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Text Field
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addField(step.id, 'textarea')}
                        className="gap-1.5 text-gray-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Text Area
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addField(step.id, 'number')}
                        className="gap-1.5 text-gray-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Number
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        )
      })}
    </div>
  )
}

function FieldEditor({
  field,
  stepId,
  updateField,
  updateOption,
  removeField,
}: {
  field: FormFieldConfig
  stepId: number
  updateField: (stepId: number, fieldKey: string, updates: Partial<FormFieldConfig>) => void
  updateOption: (stepId: number, fieldKey: string, optionIndex: number, updates: Partial<{ value: string; label: string; note: string }>) => void
  removeField?: (stepId: number, fieldKey: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`rounded-lg border ${field.visible ? 'border-gray-200 bg-white' : 'border-dashed border-gray-300 bg-gray-50/50'} overflow-hidden`}>
      {/* Field Summary Row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center gap-2 text-left min-w-0"
        >
          <span className="font-medium text-sm text-gray-900 truncate">{field.label}</span>
          <span className="text-xs text-gray-400 shrink-0">({field.type})</span>
        </button>

        <div className="flex items-center gap-3 shrink-0">
          {field.wordLimit && (
            <span className="text-xs text-gray-400">{field.wordLimit}w</span>
          )}

          <button
            type="button"
            onClick={() => updateField(stepId, field.key, { required: !field.required })}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
              field.required
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={field.required ? 'Required — click to make optional' : 'Optional — click to make required'}
          >
            <Asterisk className="w-3 h-3" />
            {field.required ? 'Required' : 'Optional'}
          </button>

          <button
            type="button"
            onClick={() => updateField(stepId, field.key, { visible: !field.visible })}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
              field.visible
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            title={field.visible ? 'Visible — click to hide' : 'Hidden — click to show'}
          >
            {field.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {field.visible ? 'Visible' : 'Hidden'}
          </button>

          {removeField && (
            <button
              type="button"
              onClick={() => removeField(stepId, field.key)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700"
              title="Delete this custom field"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Field Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50/30">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(stepId, field.key, { label: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(stepId, field.key, { placeholder: e.target.value })}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-500">Help Text</Label>
            <Input
              value={field.helpText || ''}
              onChange={(e) => updateField(stepId, field.key, { helpText: e.target.value })}
              placeholder="Additional guidance shown below the field"
              className="h-9 text-sm"
            />
          </div>

          {(field.type === 'textarea') && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Word Limit</Label>
              <Input
                type="number"
                value={field.wordLimit || ''}
                onChange={(e) =>
                  updateField(stepId, field.key, {
                    wordLimit: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="No limit"
                className="h-9 text-sm w-32"
              />
            </div>
          )}

          {/* Radio/Select Options */}
          {field.options && field.options.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500">Options</Label>
              <div className="space-y-2">
                {field.options.map((option, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(stepId, field.key, i, { label: e.target.value })}
                      className="h-8 text-sm flex-1"
                      placeholder="Option label"
                    />
                    <Input
                      value={option.note || ''}
                      onChange={(e) => updateOption(stepId, field.key, i, { note: e.target.value })}
                      className="h-8 text-sm w-48"
                      placeholder="Note (optional)"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {field.isCustom && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500">Field Type</Label>
              <select
                value={field.type}
                onChange={(e) => updateField(stepId, field.key, { type: e.target.value as FormFieldConfig['type'] })}
                className="h-9 text-sm rounded-md border border-gray-200 px-2 w-40"
              >
                <option value="text">Short Text</option>
                <option value="textarea">Long Text</option>
                <option value="number">Number</option>
                <option value="currency">Currency</option>
                <option value="date">Date</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-gray-400">
              {field.isCustom ? (
                <span className="inline-flex items-center gap-1"><span className="px-1.5 py-0.5 bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] rounded text-xs font-medium">Custom</span> Stored in customFields JSON</span>
              ) : (
                <>Database field: <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{field.key}</code></>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
