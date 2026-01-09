import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isReviewer } from '@/lib/auth/access'
import { openai, SYSTEM_PROMPT, buildAnalysisPrompt, type AISummaryResponse } from '@/lib/openai'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await isReviewer()
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const application = await prisma.application.findUnique({
      where: { id },
      select: {
        aiSummary: true,
        aiSummaryGeneratedAt: true,
        aiMissionAlignment: true,
        aiBudgetAnalysis: true,
        aiStrengths: true,
        aiConcerns: true,
        aiQuestions: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (!application.aiSummary) {
      return NextResponse.json({ error: 'Summary not generated yet' }, { status: 404 })
    }

    return NextResponse.json({
      summary: application.aiSummary,
      generatedAt: application.aiSummaryGeneratedAt,
      missionAlignment: application.aiMissionAlignment,
      budgetAnalysis: application.aiBudgetAnalysis,
      strengths: application.aiStrengths,
      concerns: application.aiConcerns,
      questions: application.aiQuestions,
    })
  } catch (error) {
    console.error('Error fetching summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await isReviewer()
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Fetch application with full context
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        organization: true,
        documents: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(application)

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    const analysis: AISummaryResponse = JSON.parse(responseContent)

    // Save to database
    const updated = await prisma.application.update({
      where: { id },
      data: {
        aiSummary: analysis.overview,
        aiSummaryGeneratedAt: new Date(),
        aiMissionAlignment: analysis.missionAlignment.score,
        aiBudgetAnalysis: analysis.budgetAnalysis as any,
        aiStrengths: analysis.strengths,
        aiConcerns: analysis.concerns,
        aiQuestions: analysis.recommendedQuestions,
      },
    })

    return NextResponse.json({
      summary: updated.aiSummary,
      generatedAt: updated.aiSummaryGeneratedAt,
      missionAlignment: updated.aiMissionAlignment,
      budgetAnalysis: updated.aiBudgetAnalysis,
      strengths: updated.aiStrengths,
      concerns: updated.aiConcerns,
      questions: updated.aiQuestions,
    })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
