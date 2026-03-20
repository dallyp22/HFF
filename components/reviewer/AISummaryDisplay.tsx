'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { Tooltip, InfoTooltip } from '@/components/ui/tooltip'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Target,
  DollarSign,
  Zap,
} from 'lucide-react'
import { HighlightableText, type Highlight } from '@/components/reviewer/HighlightableText'

interface AISummaryDisplayProps {
  summary: string | null
  missionAlignment: number | null
  budgetAnalysis: any
  strengths: string[]
  concerns: string[]
  questions: string[]
  generatedAt: string | null
  applicationId: string
  isAdmin: boolean
  highlights?: Highlight[]
  onHighlightChange?: () => void
}

const SCORE_TOOLTIPS = {
  mission: {
    high: 'Strong alignment with HFF\'s mission to improve lives of children living in poverty. The project directly addresses key focus areas.',
    medium: 'Moderate alignment with HFF\'s mission. Some aspects could be strengthened to better serve children in poverty.',
    low: 'Limited alignment with HFF\'s mission. Consider whether this project effectively addresses children living in poverty.',
  },
  budget: {
    high: 'Budget is well-structured and reasonable for the proposed scope. Cost per child and allocations are appropriate.',
    medium: 'Budget has some areas that may need review. Consider requesting clarification on specific line items.',
    low: 'Budget raises concerns about feasibility or appropriateness. Further review recommended.',
  },
}

function getScoreInfo(score: number) {
  if (score >= 80) {
    return {
      label: 'Strong',
      color: 'emerald',
      textColor: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      stopStart: '#34d399',
      stopEnd: '#14b8a6',
    }
  }
  if (score >= 60) {
    return {
      label: 'Moderate',
      color: 'amber',
      textColor: 'text-amber-600',
      lightBg: 'bg-amber-50',
      stopStart: '#fbbf24',
      stopEnd: '#f59e0b',
    }
  }
  if (score >= 40) {
    return {
      label: 'Fair',
      color: 'orange',
      textColor: 'text-orange-600',
      lightBg: 'bg-orange-50',
      stopStart: '#fb923c',
      stopEnd: '#ea580c',
    }
  }
  return {
    label: 'Low',
    color: 'red',
    textColor: 'text-red-600',
    lightBg: 'bg-red-50',
    stopStart: '#f87171',
    stopEnd: '#ef4444',
  }
}

function getTooltipText(type: 'mission' | 'budget', score: number): string {
  const tooltips = SCORE_TOOLTIPS[type]
  if (score >= 80) return tooltips.high
  if (score >= 60) return tooltips.medium
  return tooltips.low
}

function ScoreCircle({
  score,
  label,
  icon: Icon,
  tooltipContent,
  isNull,
}: {
  score: number | null
  label: string
  icon: React.ElementType
  tooltipContent: string
  isNull?: boolean
}) {
  const circumference = 2 * Math.PI * 36
  const scoreInfo = score !== null ? getScoreInfo(score) : null
  const gradientId = `scoreGradient-${label.replace(/\s/g, '')}`

  return (
    <Tooltip content={isNull ? 'Budget has not been analyzed yet' : tooltipContent} side="bottom">
      <div className="flex flex-col items-center cursor-help">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
            {/* Background track */}
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              className={isNull ? 'text-gray-200' : 'text-gray-200/40'}
            />

            {!isNull && score !== null && (
              <>
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={scoreInfo!.stopStart} />
                    <stop offset="100%" stopColor={scoreInfo!.stopEnd} />
                  </linearGradient>
                </defs>

                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ strokeDasharray: circumference }}
                />
              </>
            )}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isNull ? (
              <span className="text-xl font-bold text-gray-300">--</span>
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-xl font-bold ${scoreInfo!.textColor}`}
              >
                {score}
              </motion.span>
            )}
          </div>
        </div>

        {/* Label */}
        <div className="flex items-center gap-1.5 mt-2">
          <Icon className={`w-3.5 h-3.5 ${isNull ? 'text-gray-400' : scoreInfo!.textColor}`} />
          <span className="text-xs font-medium text-gray-700">{label}</span>
        </div>

        {/* Sublabel */}
        {isNull ? (
          <span className="text-[10px] text-gray-400 mt-0.5">Not analyzed</span>
        ) : (
          <span className={`text-[10px] font-medium mt-0.5 ${scoreInfo!.textColor}`}>
            {scoreInfo!.label}
          </span>
        )}
      </div>
    </Tooltip>
  )
}

function CollapsibleSection({
  title,
  count,
  icon: Icon,
  iconBgColor,
  iconColor,
  headerBgColor,
  children,
  defaultOpen = false,
  delay = 0,
}: {
  title: string
  count: number
  icon: React.ElementType
  iconBgColor: string
  iconColor: string
  headerBgColor: string
  children: React.ReactNode
  defaultOpen?: boolean
  delay?: number
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded-xl ${headerBgColor} backdrop-blur-sm border border-white/20 transition-all hover:shadow-sm`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${iconBgColor}`}>
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {title}
          </span>
          <span className={`px-1.5 py-0.5 rounded-md text-xs font-medium ${iconBgColor} ${iconColor}`}>
            {count}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={`w-4 h-4 ${iconColor}`} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function AISummaryDisplay({
  summary,
  missionAlignment,
  budgetAnalysis,
  strengths,
  concerns,
  questions,
  generatedAt,
  applicationId,
  isAdmin,
  highlights = [],
  onHighlightChange,
}: AISummaryDisplayProps) {
  const [regenerating, setRegenerating] = useState(false)

  async function handleRegenerate() {
    if (!confirm('Regenerate AI summary? This will replace the current analysis.')) {
      return
    }

    setRegenerating(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/summary`, {
        method: 'POST',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to regenerate summary')
      }
    } catch (error) {
      alert('Failed to regenerate summary')
    } finally {
      setRegenerating(false)
    }
  }

  // No summary at all — calm pending state
  if (!summary) {
    return (
      <div className="rounded-xl bg-[var(--hff-teal)]/5 border border-[var(--hff-teal)]/10 p-6 text-center">
        <Sparkles className="w-8 h-8 text-[var(--hff-teal)]/40 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Analysis Pending</h3>
        <p className="text-xs text-gray-500 max-w-[220px] mx-auto leading-relaxed">
          AI analysis will be generated when the application is submitted.
        </p>
        {isAdmin && (
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            size="sm"
            variant="outline"
            className="mt-4 gap-2"
          >
            <Sparkles className={`w-4 h-4 ${regenerating ? 'animate-pulse' : ''}`} />
            {regenerating ? 'Generating...' : 'Generate Analysis'}
          </Button>
        )}
      </div>
    )
  }

  // Derive budget score
  let budgetScore: number | null = null
  if (budgetAnalysis) {
    budgetScore = budgetAnalysis.score

    if (!budgetScore && budgetAnalysis.reasonableness) {
      const reasonText = budgetAnalysis.reasonableness.toLowerCase()
      if (reasonText.includes('excellent') || reasonText.includes('strong')) {
        budgetScore = 85
      } else if (reasonText.includes('reasonable') || reasonText.includes('good')) {
        budgetScore = 75
      } else if (reasonText.includes('moderate') || reasonText.includes('adequate')) {
        budgetScore = 60
      } else if (reasonText.includes('concern') || reasonText.includes('high')) {
        budgetScore = 45
      } else {
        budgetScore = 50
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* 2-up Score Display */}
      <div className="grid grid-cols-2 gap-3 py-3">
        <ScoreCircle
          score={missionAlignment}
          label="Mission"
          icon={Target}
          tooltipContent={missionAlignment !== null ? getTooltipText('mission', missionAlignment) : ''}
          isNull={missionAlignment === null}
        />
        <ScoreCircle
          score={budgetScore}
          label="Budget"
          icon={DollarSign}
          tooltipContent={budgetScore !== null ? getTooltipText('budget', budgetScore) : ''}
          isNull={budgetScore === null}
        />
      </div>

      {/* Executive Summary */}
      <div className="px-1">
        <div className="flex items-start gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-[var(--hff-teal)]/10">
            <Zap className="w-3.5 h-3.5 text-[var(--hff-teal)]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-gray-900">Executive Summary</h3>
              <InfoTooltip
                content="AI-generated summary highlighting key aspects of this application"
                side="right"
              />
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed">
          <HighlightableText
            text={summary}
            fieldName="aiSummary"
            applicationId={applicationId}
            highlights={highlights}
            isAdmin={isAdmin}
            onHighlightChange={onHighlightChange || (() => {})}
          />
        </div>
        {generatedAt && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-gray-400 font-medium">
              Generated {new Date(generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>

      {/* Strengths Section — collapsed by default */}
      {strengths && strengths.length > 0 && (
        <CollapsibleSection
          title="Strengths"
          count={strengths.length}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          headerBgColor="bg-gradient-to-r from-emerald-50/80 to-teal-50/80"
          defaultOpen={false}
          delay={0.2}
        >
          <div className="space-y-2">
            {strengths.map((strength, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/50 border border-emerald-100/50"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-700 leading-relaxed">{strength}</span>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Concerns Section — collapsed by default */}
      {concerns && concerns.length > 0 && (
        <CollapsibleSection
          title="Areas of Concern"
          count={concerns.length}
          icon={AlertTriangle}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          headerBgColor="bg-gradient-to-r from-amber-50/80 to-orange-50/80"
          defaultOpen={false}
          delay={0.3}
        >
          <div className="space-y-2">
            {concerns.map((concern, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/50 border border-amber-100/50"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-700 leading-relaxed">{concern}</span>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Questions Section — collapsed by default */}
      {questions && questions.length > 0 && (
        <CollapsibleSection
          title="Questions to Ask"
          count={questions.length}
          icon={HelpCircle}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          headerBgColor="bg-gradient-to-r from-blue-50/80 to-indigo-50/80"
          defaultOpen={false}
          delay={0.4}
        >
          <div className="space-y-2">
            {questions.map((question, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                className="flex gap-2.5 p-2.5 rounded-lg bg-white/50 border border-blue-100/50"
              >
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-semibold flex items-center justify-center flex-shrink-0 text-[10px]">
                  {i + 1}
                </span>
                <span className="text-xs text-gray-700 leading-relaxed">{question}</span>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Regenerate Button */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            size="sm"
            variant="outline"
            className="w-full text-xs gap-2 h-10 bg-white/50 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Regenerating Analysis...' : 'Regenerate Analysis'}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
