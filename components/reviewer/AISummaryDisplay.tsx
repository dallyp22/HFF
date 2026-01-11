'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'

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
}

function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 80) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
  if (score >= 60) return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
  if (score >= 40) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
  return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
}

function CircularScore({ score, label }: { score: number; label: string }) {
  const colors = getScoreColor(score)
  const circumference = 2 * Math.PI * 52
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="52"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="52"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            className={colors.text}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{score}</span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <p className="text-sm font-medium mt-2 text-center">{label}</p>
    </div>
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
}: AISummaryDisplayProps) {
  const [regenerating, setRegenerating] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    strengths: true,
    concerns: true,
    questions: true,
  })

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
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 mb-4">No AI summary generated yet</p>
          <Button onClick={handleRegenerate} disabled={regenerating}>
            {regenerating ? 'Generating...' : 'Generate AI Summary'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Score Badges - Compact Horizontal */}
      <div className="flex gap-2">
        {missionAlignment && (
          <div className={`flex-1 text-center p-2 rounded border-2 ${getScoreColor(missionAlignment).border} ${getScoreColor(missionAlignment).bg}`}>
            <div className="text-xl font-bold">{missionAlignment}</div>
            <div className="text-xs opacity-75">/100</div>
            <div className="text-xs font-medium mt-1">Mission</div>
          </div>
        )}
        {budgetAnalysis?.reasonableness && (
          <div className="flex-1 text-center p-2 rounded border-2 border-amber-200 bg-amber-50">
            <div className="text-xl font-bold text-amber-700">
              {budgetAnalysis.reasonableness.substring(0, 3).toUpperCase()}
            </div>
            <div className="text-xs font-medium mt-1 text-amber-700">Budget</div>
          </div>
        )}
        <div className="flex-1 text-center p-2 rounded border-2 border-gray-200 bg-gray-50">
          <div className="text-xl font-bold">72</div>
          <div className="text-xs opacity-75">/100</div>
          <div className="text-xs font-medium mt-1">Org</div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="pt-2">
        <p className="text-sm text-gray-700 leading-normal">{summary}</p>
        {generatedAt && (
          <p className="text-xs text-gray-400 mt-2">
            Generated {new Date(generatedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 my-3" />

      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <div className="bg-green-50 p-3 rounded">
          <h4 className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Strengths ({strengths.length})
          </h4>
          <ul className="space-y-1">
            {strengths.map((strength, i) => (
              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                <span className="text-green-600 mt-0.5">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Concerns */}
      {concerns && concerns.length > 0 && (
        <div className="bg-amber-50 p-3 rounded">
          <h4 className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Areas of Concern ({concerns.length})
          </h4>
          <ul className="space-y-1">
            {concerns.map((concern, i) => (
              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                <span className="text-amber-600 mt-0.5">•</span>
                {concern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions */}
      {questions && questions.length > 0 && (
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            Questions to Ask
          </h4>
          <ol className="space-y-1.5 text-xs text-gray-700">
            {questions.map((question, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-gray-400 font-medium">{i + 1}.</span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Regenerate Button */}
      {isAdmin && (
        <div className="pt-3 border-t border-gray-200">
          <Button
            onClick={handleRegenerate}
            disabled={regenerating}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1.5 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Regenerating...' : 'Regenerate Summary'}
          </Button>
        </div>
      )}
    </div>
  )
}
