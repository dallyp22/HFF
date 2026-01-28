import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isReviewer } from '@/lib/auth/access'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hasAccess = await isReviewer()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const assessments = await prisma.budgetAssessment.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('Error fetching budget assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget assessments' },
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
    const hasAccess = await isReviewer()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { budgetReasonableness, costEfficiency, budgetDetail, sustainability, notes } = body

    // Validate scores are 1-5
    const scores = [budgetReasonableness, costEfficiency, budgetDetail, sustainability]
    for (const score of scores) {
      if (score !== null && score !== undefined) {
        if (typeof score !== 'number' || score < 1 || score > 5 || !Number.isInteger(score)) {
          return NextResponse.json(
            { error: 'Scores must be integers between 1 and 5' },
            { status: 400 }
          )
        }
      }
    }

    // Calculate weighted composite score
    let compositeScore: number | null = null
    if (budgetReasonableness && costEfficiency && budgetDetail && sustainability) {
      compositeScore =
        budgetReasonableness * 0.3 +
        costEfficiency * 0.25 +
        budgetDetail * 0.25 +
        sustainability * 0.2
    }

    const reviewerName =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      user.emailAddresses[0]?.emailAddress ||
      'Unknown'

    // Upsert assessment (update if exists, create if not)
    const result = await prisma.budgetAssessment.upsert({
      where: {
        applicationId_reviewerId: {
          applicationId: id,
          reviewerId: user.id,
        },
      },
      update: {
        budgetReasonableness,
        costEfficiency,
        budgetDetail,
        sustainability,
        compositeScore,
        notes: notes || null,
        reviewerName,
        updatedAt: new Date(),
      },
      create: {
        applicationId: id,
        reviewerId: user.id,
        reviewerName,
        budgetReasonableness,
        costEfficiency,
        budgetDetail,
        sustainability,
        compositeScore,
        notes: notes || null,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error submitting budget assessment:', error)
    return NextResponse.json(
      { error: 'Failed to submit budget assessment' },
      { status: 500 }
    )
  }
}
