import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasAccess = await isAdmin()

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cycleId = req.nextUrl.searchParams.get('cycleId')

    // If no cycleId, return all cycles for the dropdown
    if (!cycleId) {
      const cycles = await prisma.grantCycleConfig.findMany({
        orderBy: [{ year: 'desc' }, { cycle: 'asc' }],
        select: { id: true, cycle: true, year: true, isActive: true },
      })
      return NextResponse.json({ cycles })
    }

    // Fetch the cycle config
    const cycleConfig = await prisma.grantCycleConfig.findUnique({
      where: { id: cycleId },
    })

    if (!cycleConfig) {
      return NextResponse.json({ error: 'Cycle not found' }, { status: 404 })
    }

    // LOI stats: count by status
    const loiByStatus = await prisma.letterOfInterest.groupBy({
      by: ['status'],
      where: { cycleConfigId: cycleId },
      _count: { id: true },
    })

    // Application stats: count by status
    const appByStatus = await prisma.application.groupBy({
      by: ['status'],
      where: {
        grantCycle: cycleConfig.cycle,
        cycleYear: cycleConfig.year,
      },
      _count: { id: true },
    })

    // Dollar amounts: sum of amountRequested (all apps)
    const totalRequested = await prisma.application.aggregate({
      where: {
        grantCycle: cycleConfig.cycle,
        cycleYear: cycleConfig.year,
        status: { not: 'DRAFT' },
      },
      _sum: { amountRequested: true },
    })

    // Dollar amounts: sum of amountRequested (approved only)
    const approvedRequested = await prisma.application.aggregate({
      where: {
        grantCycle: cycleConfig.cycle,
        cycleYear: cycleConfig.year,
        status: 'APPROVED',
      },
      _sum: { amountRequested: true },
    })

    // Unique organizations count
    const uniqueOrgs = await prisma.letterOfInterest.findMany({
      where: { cycleConfigId: cycleId },
      select: { organizationId: true },
      distinct: ['organizationId'],
    })

    // Average time from LOI submittedAt to reviewedAt (where both exist)
    const loisWithReview = await prisma.letterOfInterest.findMany({
      where: {
        cycleConfigId: cycleId,
        submittedAt: { not: null },
        reviewedAt: { not: null },
      },
      select: {
        submittedAt: true,
        reviewedAt: true,
      },
    })

    let avgTimeToDecisionDays = 0
    if (loisWithReview.length > 0) {
      const totalMs = loisWithReview.reduce((sum, loi) => {
        const submitted = new Date(loi.submittedAt!).getTime()
        const reviewed = new Date(loi.reviewedAt!).getTime()
        return sum + (reviewed - submitted)
      }, 0)
      avgTimeToDecisionDays = Math.round(totalMs / loisWithReview.length / (1000 * 60 * 60 * 24))
    }

    // Build LOI status map
    const loiStats: Record<string, number> = {}
    let totalLois = 0
    for (const row of loiByStatus) {
      loiStats[row.status] = row._count.id ?? 0
      totalLois += row._count.id ?? 0
    }

    // Build Application status map
    const appStats: Record<string, number> = {}
    let totalApps = 0
    for (const row of appByStatus) {
      appStats[row.status] = row._count.id ?? 0
      totalApps += row._count.id ?? 0
    }

    const approvedApps = appStats['APPROVED'] ?? 0
    const submittedApps = totalApps - (appStats['DRAFT'] ?? 0)

    return NextResponse.json({
      cycleId,
      cycleName: `${cycleConfig.cycle === 'SPRING' ? 'Spring' : 'Fall'} ${cycleConfig.year}`,
      loi: {
        total: totalLois,
        byStatus: loiStats,
      },
      applications: {
        total: totalApps,
        submitted: submittedApps,
        byStatus: appStats,
      },
      dollars: {
        totalRequested: Number(totalRequested._sum.amountRequested ?? 0),
        totalApproved: Number(approvedRequested._sum.amountRequested ?? 0),
      },
      uniqueOrganizations: uniqueOrgs.length,
      avgTimeToDecisionDays,
      approvalRate: submittedApps > 0 ? Math.round((approvedApps / submittedApps) * 100) : 0,
      avgGrantRequest: submittedApps > 0
        ? Math.round(Number(totalRequested._sum.amountRequested ?? 0) / submittedApps)
        : 0,
    })
  } catch (error) {
    console.error('Error fetching report stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch report stats' },
      { status: 500 }
    )
  }
}
