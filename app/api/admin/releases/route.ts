import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'
import { sendLOIApproved, sendLOIDeclined } from '@/lib/email'

// GET - Returns LOIs pending release (decided but not yet notified)
export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await isAdmin()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pendingLois = await prisma.letterOfInterest.findMany({
      where: {
        status: { in: ['APPROVED', 'DECLINED'] },
        notificationSent: false,
      },
      include: {
        organization: {
          select: {
            legalName: true,
            ein: true,
            users: {
              select: { email: true },
              take: 1,
            },
          },
        },
        cycleConfig: {
          select: {
            cycle: true,
            year: true,
            fullAppDeadline: true,
          },
        },
        application: {
          select: { id: true },
        },
      },
      orderBy: { reviewedAt: 'desc' },
    })

    return NextResponse.json(pendingLois)
  } catch (error) {
    console.error('Error fetching pending releases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending releases' },
      { status: 500 }
    )
  }
}

// POST - Release selected notifications (send emails and mark as sent)
export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await isAdmin()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { loiIds, releaseAll } = body as { loiIds?: string[]; releaseAll?: boolean }

    if (!releaseAll && (!loiIds || loiIds.length === 0)) {
      return NextResponse.json(
        { error: 'Provide loiIds or set releaseAll to true' },
        { status: 400 }
      )
    }

    // Fetch LOIs to release
    const whereClause: any = {
      status: { in: ['APPROVED', 'DECLINED'] },
      notificationSent: false,
    }

    if (!releaseAll && loiIds) {
      whereClause.id = { in: loiIds }
    }

    const loisToRelease = await prisma.letterOfInterest.findMany({
      where: whereClause,
      include: {
        organization: {
          select: {
            legalName: true,
            users: {
              select: { email: true },
              take: 1,
            },
          },
        },
        cycleConfig: {
          select: {
            fullAppDeadline: true,
          },
        },
        application: {
          select: { id: true },
        },
      },
    })

    if (loisToRelease.length === 0) {
      return NextResponse.json(
        { error: 'No pending LOI decisions found to release' },
        { status: 400 }
      )
    }

    const results: { loiId: string; status: string; emailSent: boolean; error?: string }[] = []

    for (const loi of loisToRelease) {
      const applicantEmail = loi.primaryContactEmail || loi.organization.users[0]?.email

      let emailSent = false

      if (applicantEmail) {
        try {
          if (loi.status === 'APPROVED' && loi.application) {
            await sendLOIApproved({
              loiId: loi.id,
              applicationId: loi.application.id,
              projectTitle: loi.projectTitle || 'Your Project',
              organizationName: loi.organization.legalName,
              applicantEmail,
              fullAppDeadline: loi.cycleConfig.fullAppDeadline?.toISOString(),
            })
            emailSent = true
          } else if (loi.status === 'DECLINED') {
            await sendLOIDeclined({
              projectTitle: loi.projectTitle || 'Your Project',
              organizationName: loi.organization.legalName,
              applicantEmail,
              reason: loi.decisionReason || undefined,
            })
            emailSent = true
          }
        } catch (emailError) {
          console.error(`Failed to send email for LOI ${loi.id}:`, emailError)
        }
      }

      // Mark notification as sent regardless of email success
      // (the decision is being released to the portal either way)
      await prisma.letterOfInterest.update({
        where: { id: loi.id },
        data: {
          notificationSent: true,
          notificationSentAt: new Date(),
        },
      })

      results.push({
        loiId: loi.id,
        status: loi.status,
        emailSent,
      })
    }

    const successCount = results.length
    const emailsSent = results.filter((r) => r.emailSent).length

    return NextResponse.json({
      message: `Released ${successCount} decision(s). ${emailsSent} email(s) sent.`,
      results,
      releasedCount: successCount,
      emailsSentCount: emailsSent,
    })
  } catch (error) {
    console.error('Error releasing LOI decisions:', error)
    return NextResponse.json(
      { error: 'Failed to release LOI decisions' },
      { status: 500 }
    )
  }
}
