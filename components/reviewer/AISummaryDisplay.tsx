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
    <div className="space-y-6">
      {/* Overview */}
      <Card className="border-l-4 border-[var(--hff-teal)]">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed text-gray-700">{summary}</p>
          {generatedAt && (
            <p className="text-sm text-gray-500 mt-4">
              Generated {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Mission Alignment Score */}
      {missionAlignment && (
        <Card className={`${getScoreColor(missionAlignment).bg} ${getScoreColor(missionAlignment).border} border-2`}>
          <CardHeader>
            <CardTitle>Mission Alignment</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CircularScore score={missionAlignment} label="Alignment Score" />
          </CardContent>
        </Card>
      )}

      {/* Budget Analysis */}
      {budgetAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reasonableness:</span>
              <Badge 
                className={
                  budgetAnalysis.reasonableness === 'high' ? 'bg-green-100 text-green-700' :
                  budgetAnalysis.reasonableness === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }
              >
                {budgetAnalysis.reasonableness?.toUpperCase() || 'N/A'}
              </Badge>
            </div>
            {budgetAnalysis.percentageOfOrgBudget && (
              <div>
                <p className="text-sm text-gray-600">Percentage of Organization Budget</p>
                <p className="text-2xl font-bold text-[var(--hff-teal)]">
                  {budgetAnalysis.percentageOfOrgBudget}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Strengths ({strengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Concerns */}
      {concerns && concerns.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              Areas of Concern ({concerns.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {concerns.map((concern, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommended Questions */}
      {questions && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Recommended Follow-Up Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {questions.map((question, i) => (
                <li key={i} className="text-gray-700 pl-2">{question}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isAdmin && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Regenerating...' : 'Regenerate Summary'}
          </Button>
        </div>
      )}
    </div>
  )
}
