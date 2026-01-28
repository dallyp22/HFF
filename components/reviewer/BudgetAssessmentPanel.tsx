'use client'

import { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Scale,
  TrendingDown,
  FileSearch,
  Leaf,
  Star,
  Send,
  Loader2,
  BarChart3,
  User,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface BudgetAssessment {
  id: string
  applicationId: string
  reviewerId: string
  reviewerName: string
  budgetReasonableness: number | null
  costEfficiency: number | null
  budgetDetail: number | null
  sustainability: number | null
  compositeScore: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface BudgetAssessmentPanelProps {
  applicationId: string
  budgetBreakdown?: any
  totalProjectBudget?: number
  amountRequested?: number
}

const CATEGORIES = [
  {
    key: 'budgetReasonableness' as const,
    label: 'Budget Reasonableness',
    weight: 30,
    icon: Scale,
    description: 'Are the proposed costs realistic and appropriate for the project scope?',
    levels: [
      'Costs are unreasonable or unjustified',
      'Some costs appear inflated or unclear',
      'Most costs are reasonable with minor concerns',
      'Costs are well-justified and appropriate',
      'All costs are clearly justified and highly reasonable',
    ],
  },
  {
    key: 'costEfficiency' as const,
    label: 'Cost Efficiency',
    weight: 25,
    icon: TrendingDown,
    description: 'Does the budget demonstrate good use of funds relative to expected outcomes?',
    levels: [
      'Poor cost-to-outcome ratio',
      'Below average efficiency',
      'Acceptable efficiency for project type',
      'Good efficiency with clear value',
      'Exceptional efficiency and value for investment',
    ],
  },
  {
    key: 'budgetDetail' as const,
    label: 'Budget Detail & Clarity',
    weight: 25,
    icon: FileSearch,
    description: 'Is the budget well-organized with clear line items and explanations?',
    levels: [
      'Budget is vague or missing key details',
      'Limited detail with significant gaps',
      'Adequate detail for most categories',
      'Well-detailed with clear breakdowns',
      'Exceptionally detailed and transparent',
    ],
  },
  {
    key: 'sustainability' as const,
    label: 'Sustainability',
    weight: 20,
    icon: Leaf,
    description: 'Does the budget plan account for long-term sustainability beyond grant funding?',
    levels: [
      'No sustainability plan evident',
      'Minimal sustainability considerations',
      'Some sustainability planning included',
      'Strong sustainability plan with diverse funding',
      'Comprehensive sustainability with proven revenue model',
    ],
  },
]

type ScoreKey = 'budgetReasonableness' | 'costEfficiency' | 'budgetDetail' | 'sustainability'

export function BudgetAssessmentPanel({
  applicationId,
  budgetBreakdown,
  totalProjectBudget,
  amountRequested,
}: BudgetAssessmentPanelProps) {
  const [assessments, setAssessments] = useState<BudgetAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [scores, setScores] = useState<Record<ScoreKey, number | null>>({
    budgetReasonableness: null,
    costEfficiency: null,
    budgetDetail: null,
    sustainability: null,
  })
  const [notes, setNotes] = useState('')
  const [hasExistingAssessment, setHasExistingAssessment] = useState(false)

  const loadAssessments = useCallback(async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/budget-assessment`)
      if (response.ok) {
        const data: BudgetAssessment[] = await response.json()
        setAssessments(data)
      }
    } catch (error) {
      console.error('Error loading budget assessments:', error)
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  // Load current user's assessment if one exists
  const loadCurrentUserAssessment = useCallback(async () => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/budget-assessment`)
      if (response.ok) {
        const data: BudgetAssessment[] = await response.json()
        setAssessments(data)

        // Check if current user has an existing assessment
        // We don't know the user ID client-side, but the API will handle upsert
        // Instead, we look for the most recent one with matching data
        // The server handles the upsert, so we just pre-fill if we detect one
        if (data.length > 0) {
          // Try to detect the current user's assessment by checking
          // if any assessment was recently updated (within the session)
          // For now, we'll let the user see all assessments and submit fresh
        }
      }
    } catch (error) {
      console.error('Error loading assessments:', error)
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    loadCurrentUserAssessment()
  }, [loadCurrentUserAssessment])

  const compositeScore = calculateComposite(scores)

  function calculateComposite(s: Record<ScoreKey, number | null>): number | null {
    if (
      s.budgetReasonableness === null ||
      s.costEfficiency === null ||
      s.budgetDetail === null ||
      s.sustainability === null
    ) {
      return null
    }
    return (
      s.budgetReasonableness * 0.3 +
      s.costEfficiency * 0.25 +
      s.budgetDetail * 0.25 +
      s.sustainability * 0.2
    )
  }

  function getScoreColor(score: number): string {
    if (score >= 4.5) return 'text-emerald-600'
    if (score >= 3.5) return 'text-[var(--hff-teal)]'
    if (score >= 2.5) return 'text-amber-600'
    if (score >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  function getScoreBgColor(score: number): string {
    if (score >= 4.5) return 'bg-emerald-50 border-emerald-200'
    if (score >= 3.5) return 'bg-teal-50 border-teal-200'
    if (score >= 2.5) return 'bg-amber-50 border-amber-200'
    if (score >= 1.5) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  function getScoreLabel(score: number): string {
    if (score >= 4.5) return 'Excellent'
    if (score >= 3.5) return 'Good'
    if (score >= 2.5) return 'Adequate'
    if (score >= 1.5) return 'Below Average'
    return 'Poor'
  }

  async function handleSubmit() {
    // Validate all scores are filled
    const allScored = CATEGORIES.every((cat) => scores[cat.key] !== null)
    if (!allScored) {
      toast.error('Please score all categories before submitting')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/budget-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budgetReasonableness: scores.budgetReasonableness,
          costEfficiency: scores.costEfficiency,
          budgetDetail: scores.budgetDetail,
          sustainability: scores.sustainability,
          notes: notes.trim() || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        // Update the list of assessments
        setAssessments((prev) => {
          const filtered = prev.filter((a) => a.reviewerId !== result.reviewerId)
          return [result, ...filtered]
        })
        setHasExistingAssessment(true)
        toast.success('Budget assessment submitted successfully')
      } else {
        const errData = await response.json()
        toast.error(errData.error || 'Failed to submit assessment')
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      toast.error('Failed to submit assessment')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate average scores across all assessments
  const averages = calculateAverages(assessments)

  function calculateAverages(data: BudgetAssessment[]) {
    if (data.length === 0) return null

    const completedAssessments = data.filter(
      (a) =>
        a.budgetReasonableness !== null &&
        a.costEfficiency !== null &&
        a.budgetDetail !== null &&
        a.sustainability !== null
    )

    if (completedAssessments.length === 0) return null

    const count = completedAssessments.length
    const avg = {
      budgetReasonableness:
        completedAssessments.reduce((sum, a) => sum + (a.budgetReasonableness || 0), 0) / count,
      costEfficiency:
        completedAssessments.reduce((sum, a) => sum + (a.costEfficiency || 0), 0) / count,
      budgetDetail:
        completedAssessments.reduce((sum, a) => sum + (a.budgetDetail || 0), 0) / count,
      sustainability:
        completedAssessments.reduce((sum, a) => sum + (a.sustainability || 0), 0) / count,
      composite:
        completedAssessments.reduce((sum, a) => sum + (a.compositeScore || 0), 0) / count,
      count,
    }

    return avg
  }

  return (
    <div className="space-y-6">
      {/* Scoring Rubric Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <BarChart3 className="w-4 h-4 text-[var(--hff-teal)]" />
              Budget Assessment Scoring Rubric
            </h3>
            {compositeScore !== null && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${getScoreBgColor(compositeScore)} ${getScoreColor(compositeScore)}`}
              >
                <Star className="w-4 h-4" />
                {compositeScore.toFixed(2)} / 5.00
                <span className="text-xs font-normal opacity-75">
                  ({getScoreLabel(compositeScore)})
                </span>
              </div>
            )}
          </div>

          {/* Scoring Categories */}
          <div className="space-y-5">
            {CATEGORIES.map((category) => {
              const Icon = category.icon
              const currentScore = scores[category.key]

              return (
                <div key={category.key} className="space-y-2">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[var(--hff-teal)]/10 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-[var(--hff-teal)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {category.label}
                          <span className="ml-1.5 text-xs font-normal text-gray-400">
                            ({category.weight}%)
                          </span>
                        </p>
                      </div>
                    </div>
                    {currentScore !== null && (
                      <span
                        className={`text-sm font-semibold ${getScoreColor(currentScore)}`}
                      >
                        {currentScore}/5
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 ml-9">{category.description}</p>

                  {/* Score Badges */}
                  <div className="flex gap-2 ml-9">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isSelected = currentScore === value
                      return (
                        <button
                          key={value}
                          onClick={() =>
                            setScores((prev) => ({ ...prev, [category.key]: value }))
                          }
                          className={`
                            relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border-2 transition-all text-sm font-medium min-w-[52px]
                            ${
                              isSelected
                                ? value >= 4
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                  : value === 3
                                    ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]/5 text-[var(--hff-teal)] shadow-sm'
                                    : value === 2
                                      ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                                      : 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <span>{value}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Level description for selected score */}
                  {currentScore !== null && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-gray-500 ml-9 italic"
                    >
                      {category.levels[currentScore - 1]}
                    </motion.p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Weighted Score Breakdown */}
          {compositeScore !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 pt-4 border-t border-gray-100"
            >
              <p className="text-xs font-medium text-gray-500 mb-2">Weighted Score Breakdown</p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {CATEGORIES.map((cat) => {
                  const score = scores[cat.key]
                  if (score === null) return null
                  const weighted = score * (cat.weight / 100)
                  return (
                    <div key={cat.key} className="p-2 rounded-lg bg-gray-50 text-center">
                      <p className="text-gray-400 truncate">{cat.label.split(' ')[0]}</p>
                      <p className="font-semibold text-gray-700">
                        {score} x {cat.weight}% = {weighted.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Notes */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              Assessment Notes
              <span className="text-xs font-normal text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional observations about the budget quality, concerns, or recommendations..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/30 focus:border-[var(--hff-teal)] resize-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={submitting || !CATEGORIES.every((cat) => scores[cat.key] !== null)}
              className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90 text-white gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {hasExistingAssessment ? 'Update Assessment' : 'Submit Assessment'}
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Assessment Summary - All Reviewers */}
      {assessments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <BarChart3 className="w-4 h-4 text-[var(--hff-teal)]" />
                Assessment Summary
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {assessments.length} {assessments.length === 1 ? 'assessment' : 'assessments'}
              </span>
            </div>

            {/* Average Scores */}
            {averages && (
              <div className="mb-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {CATEGORIES.map((cat) => {
                    const avg = averages[cat.key as keyof typeof averages] as number
                    const Icon = cat.icon
                    return (
                      <div key={cat.key} className="p-3 rounded-xl bg-gray-50 text-center">
                        <Icon className="w-4 h-4 text-[var(--hff-teal)] mx-auto mb-1" />
                        <p className="text-xs text-gray-500 mb-0.5">{cat.label}</p>
                        <p className={`text-lg font-bold ${getScoreColor(avg)}`}>
                          {avg.toFixed(1)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Composite Average */}
                <div
                  className={`p-4 rounded-xl border text-center ${getScoreBgColor(averages.composite)}`}
                >
                  <p className="text-xs text-gray-500 mb-1">Average Composite Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(averages.composite)}`}>
                    {averages.composite.toFixed(2)}{' '}
                    <span className="text-sm font-normal">/ 5.00</span>
                  </p>
                  <p className={`text-xs font-medium mt-0.5 ${getScoreColor(averages.composite)}`}>
                    {getScoreLabel(averages.composite)}
                  </p>
                </div>
              </div>
            )}

            {/* Individual Assessments */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Individual Assessments
              </p>
              {assessments.map((assessment, index) => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--hff-teal)]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[var(--hff-teal)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {assessment.reviewerName}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(assessment.updatedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    {assessment.compositeScore !== null && (
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getScoreBgColor(assessment.compositeScore)} ${getScoreColor(assessment.compositeScore)}`}
                      >
                        {assessment.compositeScore.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Score pills */}
                  <div className="flex flex-wrap gap-1.5 ml-10">
                    {CATEGORIES.map((cat) => {
                      const score = assessment[cat.key as keyof BudgetAssessment] as
                        | number
                        | null
                      if (score === null) return null
                      return (
                        <span
                          key={cat.key}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-xs text-gray-600"
                        >
                          {cat.label.split(' ')[0]}: <strong>{score}</strong>
                        </span>
                      )
                    })}
                  </div>

                  {assessment.notes && (
                    <p className="text-xs text-gray-600 mt-2 ml-10 italic">
                      &ldquo;{assessment.notes}&rdquo;
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-8 text-center text-gray-500">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="w-32 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      )}
    </div>
  )
}
