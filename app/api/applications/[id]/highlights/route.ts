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

    const highlights = await prisma.highlight.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(highlights)
  } catch (error) {
    console.error('Error fetching highlights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
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

    const body = await req.json()
    const { fieldName, startOffset, endOffset, color, comment } = body

    if (!fieldName || startOffset == null || endOffset == null) {
      return NextResponse.json(
        { error: 'fieldName, startOffset, and endOffset are required' },
        { status: 400 }
      )
    }

    if (startOffset < 0 || endOffset <= startOffset) {
      return NextResponse.json(
        { error: 'Invalid offset range' },
        { status: 400 }
      )
    }

    const validColors = ['yellow', 'green', 'blue']
    const highlightColor = validColors.includes(color) ? color : 'yellow'

    const highlight = await prisma.highlight.create({
      data: {
        applicationId: id,
        fieldName,
        startOffset,
        endOffset,
        color: highlightColor,
        comment: comment?.trim() || null,
        createdById: user.id,
        createdByName:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.emailAddresses[0]?.emailAddress ||
          'Unknown',
      },
    })

    return NextResponse.json(highlight)
  } catch (error) {
    console.error('Error creating highlight:', error)
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await isReviewer()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const highlightId = searchParams.get('highlightId')

    if (!highlightId) {
      return NextResponse.json(
        { error: 'highlightId query parameter is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.highlight.findUnique({
      where: { id: highlightId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      )
    }

    await prisma.highlight.delete({
      where: { id: highlightId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting highlight:', error)
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    )
  }
}
