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
  TrendingUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  DollarSign,
  Zap,
  BarChart3,
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
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      ringColor: 'ring-emerald-200',
      gradient: 'from-emerald-400 via-emerald-500 to-teal-500',
      glowColor: 'rgba(16, 185, 129, 0.3)',
    }
  }
  if (score >= 60) {
    return {
      label: 'Moderate',
      color: 'amber',
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-600',
      lightBg: 'bg-amber-50',
      ringColor: 'ring-amber-200',
      gradient: 'from-amber-400 via-amber-500 to-orange-500',
      glowColor: 'rgba(245, 158, 11, 0.3)',
    }
  }
  if (score >= 40) {
    return {
      label: 'Fair',
      color: 'orange',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-600',
      lightBg: 'bg-orange-50',
      ringColor: 'ring-orange-200',
      gradient: 'from-orange-400 via-orange-500 to-red-500',
      glowColor: 'rgba(249, 115, 22, 0.3)',
    }
  }
  return {
    label: 'Low',
    color: 'red',
    bgColor: 'bg-red-500',
    textColor: 'text-red-600',
    lightBg: 'bg-red-50',
    ringColor: 'ring-red-200',
    gradient: 'from-red-400 via-red-500 to-rose-600',
    glowColor: 'rgba(239, 68, 68, 0.3)',
  }
}

function getTooltipText(type: 'mission' | 'budget', score: number): string {
  const tooltips = SCORE_TOOLTIPS[type]
  if (score >= 80) return tooltips.high
  if (score >= 60) return tooltips.medium
  return tooltips.low
}

interface ScoreItem {
  id: string
  score: number
  label: string
  icon: React.ElementType
  tooltipContent: string
  description: string
}

function ScoreCarousel({ scores }: { scores: ScoreItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const activeScore = scores[activeIndex]
  const scoreInfo = getScoreInfo(activeScore.score)
  const circumference = 2 * Math.PI * 44

  const goToNext = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev + 1) % scores.length)
  }

  const goToPrev = () => {
    setDirection(-1)
    setActiveIndex((prev) => (prev - 1 + scores.length) % scores.length)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
  }

  const hasMultipleScores = scores.length > 1

  return (
    <div className="relative py-4">
      {/* Header with counter */}
      <div className="flex items-center justify-between px-4 mb-3">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Score Analysis
        </span>
        {hasMultipleScores && (
          <span className="text-xs font-medium text-gray-500">
            {activeIndex + 1} / {scores.length}
          </span>
        )}
      </div>

      {/* Navigation Arrows - Always visible for multiple scores */}
      {hasMultipleScores && (
        <div className="absolute left-2 right-2 top-1/2 flex justify-between pointer-events-none z-20">
          <button
            onClick={goToPrev}
            className="pointer-events-auto p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hover:shadow-xl active:scale-95 transition-all"
            aria-label="Previous score"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={goToNext}
            className="pointer-events-auto p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hover:shadow-xl active:scale-95 transition-all"
            aria-label="Next score"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      )}

      {/* Score Display */}
      <div className={`${hasMultipleScores ? 'px-12' : 'px-6'} py-2 overflow-hidden`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeScore.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Circular Score */}
            <Tooltip content={activeScore.tooltipContent} side="bottom">
              <div className="cursor-help group">
                <div
                  className="relative w-28 h-28"
                  style={{
                    filter: `drop-shadow(0 0 16px ${scoreInfo.glowColor})`,
                  }}
                >
                  {/* Background glow */}
                  <div
                    className="absolute inset-2 rounded-full opacity-25 blur-lg transition-opacity group-hover:opacity-40"
                    style={{ backgroundColor: scoreInfo.glowColor }}
                  />

                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background track */}
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200/40"
                    />

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id={`carouselGradient-${activeScore.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={scoreInfo.color === 'emerald' ? '#34d399' : scoreInfo.color === 'amber' ? '#fbbf24' : scoreInfo.color === 'orange' ? '#fb923c' : '#f87171'} />
                        <stop offset="100%" stopColor={scoreInfo.color === 'emerald' ? '#14b8a6' : scoreInfo.color === 'amber' ? '#f59e0b' : scoreInfo.color === 'orange' ? '#ea580c' : '#ef4444'} />
                      </linearGradient>
                    </defs>

                    {/* Progress arc */}
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="44"
                      stroke={`url(#carouselGradient-${activeScore.id})`}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference - (activeScore.score / 100) * circumference }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      style={{ strokeDasharray: circumference }}
                    />
                  </svg>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      key={`score-${activeScore.id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-3xl font-bold ${scoreInfo.textColor}`}
                    >
                      {activeScore.score}
                    </motion.span>
                  </div>
                </div>
              </div>
            </Tooltip>

            {/* Label and Badge */}
            <div className="flex items-center gap-2 mt-3">
              <div className={`p-1.5 rounded-lg ${scoreInfo.lightBg}`}>
                <activeScore.icon className={`w-4 h-4 ${scoreInfo.textColor}`} />
              </div>
              <span className="text-sm font-semibold text-gray-900">{activeScore.label}</span>
            </div>

            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${scoreInfo.lightBg} ${scoreInfo.textColor}`}
            >
              {scoreInfo.label}
            </motion.span>

            {/* Description */}
            <p className="mt-3 text-xs text-gray-500 text-center max-w-[200px] leading-relaxed">
              {activeScore.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot Indicators */}
      {scores.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {scores.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > activeIndex ? 1 : -1)
                setActiveIndex(index)
              }}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? `w-6 h-2 ${scoreInfo.bgColor}`
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AssessmentBadge({
  value,
  label,
  icon: Icon,
  variant = 'default',
  tooltipContent,
}: {
  value: string | number
  label: string
  icon: React.ElementType
  variant?: 'default' | 'success' | 'warning' | 'info'
  tooltipContent?: string
}) {
  const variantStyles = {
    default: 'bg-white/60 border-gray-200/60 text-gray-700',
    success: 'bg-emerald-50/80 border-emerald-200/60 text-emerald-700',
    warning: 'bg-amber-50/80 border-amber-200/60 text-amber-700',
    info: 'bg-blue-50/80 border-blue-200/60 text-blue-700',
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`flex-1 p-3 rounded-xl border backdrop-blur-sm ${variantStyles[variant]}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`p-1 rounded-md ${variant === 'success' ? 'bg-emerald-100' : variant === 'warning' ? 'bg-amber-100' : variant === 'info' ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Icon className="w-3 h-3" />
        </div>
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-sm font-bold">{value}</p>
    </motion.div>
  )

  if (tooltipContent) {
    return (
      <Tooltip content={tooltipContent} side="bottom">
        <div className="cursor-help">{content}</div>
      </Tooltip>
    )
  }

  return content
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

  if (!summary) {
    return (
      <GlassCard variant="subtle" hover={false} className="text-center py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">No AI Analysis Yet</h3>
          <p className="text-xs text-gray-500 mb-5 max-w-[200px] mx-auto">
            Generate an AI-powered analysis to get insights about this application
          </p>
          {isAdmin && (
            <Button
              onClick={handleRegenerate}
              disabled={regenerating}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white gap-2 shadow-lg shadow-purple-500/25"
            >
              <Sparkles className={`w-4 h-4 ${regenerating ? 'animate-pulse' : ''}`} />
              {regenerating ? 'Generating...' : 'Generate Analysis'}
            </Button>
          )}
        </motion.div>
      </GlassCard>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      {/* Score Carousel */}
      {(() => {
        const scores: ScoreItem[] = []

        if (missionAlignment !== null) {
          scores.push({
            id: 'mission',
            score: missionAlignment,
            label: 'Mission Alignment',
            icon: Target,
            tooltipContent: getTooltipText('mission', missionAlignment),
            description: 'How well the project aligns with HFF\'s mission to serve children in poverty',
          })
        }

        // Add budget score - derive from numeric score or reasonableness text
        if (budgetAnalysis) {
          let budgetScore = budgetAnalysis.score

          // If no numeric score, derive from reasonableness text
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
              budgetScore = 50 // Default moderate
            }
          }

          if (budgetScore) {
            scores.push({
              id: 'budget',
              score: budgetScore,
              label: 'Budget Assessment',
              icon: DollarSign,
              tooltipContent: getTooltipText('budget', budgetScore),
              description: budgetAnalysis.reasonableness || 'Assessment of budget structure and cost efficiency',
            })
          }
        }

        // Add cost efficiency score if available
        if (budgetAnalysis?.costPerChild) {
          const costScore = budgetAnalysis.costPerChildScore || 70
          scores.push({
            id: 'cost-efficiency',
            score: costScore,
            label: 'Cost Efficiency',
            icon: BarChart3,
            tooltipContent: `Cost per child: $${budgetAnalysis.costPerChild}. ${costScore >= 80 ? 'Excellent cost efficiency for the proposed impact.' : costScore >= 60 ? 'Reasonable cost per beneficiary.' : 'Higher than typical cost per child.'}`,
            description: `$${budgetAnalysis.costPerChild} per child served`,
          })
        }

        if (scores.length === 0) return null

        return (
          <GlassCard variant="subtle" hover={false} padding="none">
            <ScoreCarousel scores={scores} />
          </GlassCard>
        )
      })()}

      {/* Executive Summary */}
      <GlassCard variant="subtle" hover={false} padding="sm">
        <div className="flex items-start gap-2 mb-3">
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
      </GlassCard>

      {/* Strengths Section */}
      {strengths && strengths.length > 0 && (
        <CollapsibleSection
          title="Strengths"
          count={strengths.length}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          headerBgColor="bg-gradient-to-r from-emerald-50/80 to-teal-50/80"
          defaultOpen={true}
          delay={0.4}
        >
          <div className="space-y-2">
            {strengths.map((strength, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/50 border border-emerald-100/50"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-700 leading-relaxed">{strength}</span>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Concerns Section */}
      {concerns && concerns.length > 0 && (
        <CollapsibleSection
          title="Areas of Concern"
          count={concerns.length}
          icon={AlertTriangle}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          headerBgColor="bg-gradient-to-r from-amber-50/80 to-orange-50/80"
          defaultOpen={true}
          delay={0.5}
        >
          <div className="space-y-2">
            {concerns.map((concern, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/50 border border-amber-100/50"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-700 leading-relaxed">{concern}</span>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Questions Section */}
      {questions && questions.length > 0 && (
        <CollapsibleSection
          title="Questions to Ask"
          count={questions.length}
          icon={HelpCircle}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          headerBgColor="bg-gradient-to-r from-blue-50/80 to-indigo-50/80"
          defaultOpen={false}
          delay={0.6}
        >
          <div className="space-y-2">
            {questions.map((question, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
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
          transition={{ delay: 0.8 }}
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
