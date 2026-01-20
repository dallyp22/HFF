import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  ArrowRight,
  Calendar,
  BarChart3,
  Shield,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Application } from '@prisma/client'
import { ReviewerDashboardClient } from '@/components/reviewer/ReviewerDashboardClient'

export default async function ReviewerDashboardPage() {
  const user = await currentUser()

  // Get active grant cycle
  const activeCycle = await prisma.grantCycleConfig.findFirst({
    where: { isActive: true },
  })

  // Get applications for active cycle
  const applications = await prisma.application.findMany({
    where: activeCycle
      ? {
          grantCycle: activeCycle.cycle,
          cycleYear: activeCycle.year,
        }
      : undefined,
    include: {
      organization: {
        select: {
          legalName: true,
        },
      },
    },
    orderBy: { submittedAt: 'desc' },
  })

  // Get LOIs for active cycle
  const lois = activeCycle
    ? await prisma.letterOfInterest.findMany({
        where: {
          cycleConfigId: activeCycle.id,
        },
        include: {
          organization: {
            select: {
              legalName: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      })
    : []

  // Get organization count
  const organizationCount = await prisma.organization.count()

  const stats = {
    total: applications.length,
    submitted: applications.filter((a: Application) => a.status === 'SUBMITTED').length,
    underReview: applications.filter((a: Application) => a.status === 'UNDER_REVIEW').length,
    infoRequested: applications.filter((a: Application) => a.status === 'INFO_REQUESTED').length,
    approved: applications.filter((a: Application) => a.status === 'APPROVED').length,
    declined: applications.filter((a: Application) => a.status === 'DECLINED').length,
  }

  const loiStats = {
    total: lois.length,
    submitted: lois.filter((l: any) => l.status === 'SUBMITTED').length,
    underReview: lois.filter((l: any) => l.status === 'UNDER_REVIEW').length,
    approved: lois.filter((l: any) => l.status === 'APPROVED').length,
    declined: lois.filter((l: any) => l.status === 'DECLINED').length,
    pendingReview: lois.filter((l: any) => l.status === 'SUBMITTED' || l.status === 'UNDER_REVIEW').length,
  }

  const needsLoiReview = lois
    .filter((l: any) => l.status === 'SUBMITTED' || l.status === 'UNDER_REVIEW')
    .sort((a: any, b: any) => {
      const aDate = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const bDate = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return aDate - bDate
    })
    .slice(0, 5)

  const totalRequested = applications
    .filter((a: Application) => a.amountRequested)
    .reduce((sum: number, a: Application) => sum + parseFloat(a.amountRequested?.toString() || '0'), 0)

  const totalApproved = applications
    .filter((a: Application) => a.status === 'APPROVED' && a.amountRequested)
    .reduce((sum: number, a: Application) => sum + parseFloat(a.amountRequested?.toString() || '0'), 0)

  const needsAttention = applications
    .filter((a: Application) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW')
    .sort((a, b) => {
      const aDate = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const bDate = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return aDate - bDate
    })
    .slice(0, 5)

  return (
    <ReviewerDashboardClient
      user={{
        firstName: user?.firstName || 'Reviewer',
      }}
      activeCycle={activeCycle}
      stats={stats}
      loiStats={loiStats}
      totalRequested={totalRequested}
      totalApproved={totalApproved}
      organizationCount={organizationCount}
      needsAttention={needsAttention.map((app: any) => ({
        id: app.id,
        projectTitle: app.projectTitle,
        status: app.status,
        submittedAt: app.submittedAt?.toISOString() || null,
        organizationName: app.organization.legalName,
        amountRequested: app.amountRequested ? parseFloat(app.amountRequested.toString()) : null,
      }))}
      needsLoiReview={needsLoiReview.map((loi: any) => ({
        id: loi.id,
        projectTitle: loi.projectTitle,
        status: loi.status,
        submittedAt: loi.submittedAt?.toISOString() || null,
        organizationName: loi.organization.legalName,
        grantRequestAmount: loi.grantRequestAmount ? parseFloat(loi.grantRequestAmount.toString()) : null,
      }))}
    />
  )
}
