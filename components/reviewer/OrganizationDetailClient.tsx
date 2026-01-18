'use client'

import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Building2,
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Mail,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface OrganizationDetailClientProps {
  organization: {
    id: string
    legalName: string
    ein: string
    missionStatement: string | null
    executiveDirectorName: string | null
    executiveDirectorEmail: string | null
    city: string | null
    state: string | null
    yearFounded: number | null
    annualBudget: number | null
    fullTimeStaff: number | null
    partTimeStaff: number | null
    volunteers: number | null
    form990Year: number | null
    form990TotalRevenue: number | null
    form990TotalExpenses: number | null
    form990NetAssets: number | null
    programRatio: number | null
  }
  applications: {
    id: string
    projectTitle: string | null
    status: string
    grantCycle: string
    cycleYear: number
    amountRequested: number | null
  }[]
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  DRAFT: { color: 'bg-gray-100 text-gray-700', icon: <FileText className="w-3.5 h-3.5" /> },
  SUBMITTED: { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3.5 h-3.5" /> },
  UNDER_REVIEW: { color: 'bg-purple-100 text-purple-700', icon: <Target className="w-3.5 h-3.5" /> },
  INFO_REQUESTED: {
    color: 'bg-amber-100 text-amber-700',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    color: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  DECLINED: { color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
  WITHDRAWN: { color: 'bg-gray-100 text-gray-500', icon: <XCircle className="w-3.5 h-3.5" /> },
}

export function OrganizationDetailClient({
  organization,
  applications,
}: OrganizationDetailClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <Link
            href="/reviewer/organizations"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--hff-teal)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Organizations
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-[var(--hff-teal)]/10">
                <Building2 className="w-7 h-7 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{organization.legalName}</h1>
                <p className="text-gray-500">EIN: {organization.ein}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stats Row */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <GlassCard className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                <AnimatedCounter value={applications.length} />
              </p>
              <p className="text-sm text-gray-500">Applications</p>
            </GlassCard>

            <GlassCard className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--hff-teal)]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {organization.annualBudget ? (
                  <>
                    $<AnimatedCounter value={Math.round(organization.annualBudget / 1000)} />K
                  </>
                ) : (
                  'N/A'
                )}
              </p>
              <p className="text-sm text-gray-500">Annual Budget</p>
            </GlassCard>

            <GlassCard className="p-5 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--hff-gold)]/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[var(--hff-gold)]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {organization.yearFounded || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Founded</p>
            </GlassCard>
          </div>
        </FadeIn>

        {/* Organization Profile */}
        <FadeIn delay={0.15}>
          <GlassCard className="p-6 mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Building2 className="w-5 h-5 text-[var(--hff-teal)]" />
              Organization Profile
            </h2>

            {/* Mission */}
            {organization.missionStatement && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Mission Statement</h3>
                <p className="text-gray-700 leading-relaxed">{organization.missionStatement}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Executive Director */}
              {organization.executiveDirectorName && (
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Executive Director</h3>
                  <p className="font-medium text-gray-900">{organization.executiveDirectorName}</p>
                  {organization.executiveDirectorEmail && (
                    <a
                      href={`mailto:${organization.executiveDirectorEmail}`}
                      className="text-sm text-[var(--hff-teal)] hover:underline flex items-center gap-1 mt-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {organization.executiveDirectorEmail}
                    </a>
                  )}
                </div>
              )}

              {/* Location */}
              {organization.city && organization.state && (
                <div className="p-4 rounded-xl bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {organization.city}, {organization.state}
                  </p>
                </div>
              )}
            </div>

            {/* Staffing */}
            {(organization.fullTimeStaff ||
              organization.partTimeStaff ||
              organization.volunteers) && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Staffing
                </h3>
                <div className="flex gap-6">
                  {organization.fullTimeStaff && (
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {organization.fullTimeStaff}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">Full-time</span>
                    </div>
                  )}
                  {organization.partTimeStaff && (
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {organization.partTimeStaff}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">Part-time</span>
                    </div>
                  )}
                  {organization.volunteers && (
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {organization.volunteers}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">Volunteers</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </GlassCard>
        </FadeIn>

        {/* Form 990 Summary */}
        {organization.form990Year && (
          <FadeIn delay={0.2}>
            <GlassCard className="p-6 mb-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <TrendingUp className="w-5 h-5 text-[var(--hff-teal)]" />
                Form 990 Summary ({organization.form990Year})
              </h2>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">
                    {organization.form990TotalRevenue
                      ? `$${organization.form990TotalRevenue.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                  <p className="text-xl font-bold text-gray-900">
                    {organization.form990TotalExpenses
                      ? `$${organization.form990TotalExpenses.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500 mb-1">Net Assets</p>
                  <p className="text-xl font-bold text-gray-900">
                    {organization.form990NetAssets
                      ? `$${organization.form990NetAssets.toLocaleString()}`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {organization.programRatio && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--hff-teal)]/5 to-[var(--hff-teal)]/10 border border-[var(--hff-teal)]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Program Expense Ratio</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Percentage of expenses going to programs
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-[var(--hff-teal)]">
                      {organization.programRatio}%
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>
          </FadeIn>
        )}

        {/* Grant History */}
        <FadeIn delay={0.25}>
          <GlassCard className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <FileText className="w-5 h-5 text-[var(--hff-teal)]" />
              Grant History with HFF
            </h2>

            {applications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications</h3>
                <p className="text-gray-500">This organization hasn't submitted any applications yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app, index) => {
                  const status = statusConfig[app.status] || statusConfig.DRAFT
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/reviewer/applications/${app.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 group-hover:text-[var(--hff-teal)] transition-colors">
                              {app.projectTitle || 'Untitled Application'}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {app.grantCycle} {app.cycleYear}
                              {app.amountRequested && (
                                <span className="ml-2 font-medium text-gray-700">
                                  ${app.amountRequested.toLocaleString()}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                            >
                              {status.icon}
                              {app.status.replace(/_/g, ' ')}
                            </span>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[var(--hff-teal)] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </FadeIn>
      </div>
    </div>
  )
}
