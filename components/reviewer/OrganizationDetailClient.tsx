'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import { formatFileSize } from '@/lib/storage'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  FolderOpen,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Shield,
  FileCheck,
  File,
} from 'lucide-react'

interface OrganizationDocument {
  id: string
  name: string
  type: string
  fileName: string
  fileSize: number
  mimeType: string
  storageUrl: string
  documentYear: number | null
  uploadedAt: string
  uploadedByName: string
}

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
  documents: OrganizationDocument[]
}

const docTypeLabels: Record<string, string> = {
  FORM_990: 'Form 990',
  FORM_990_EZ: 'Form 990-EZ',
  FORM_990_N: 'Form 990-N',
  FINANCIAL_STATEMENT: 'Financial Statement',
  AUDIT_REPORT: 'Audit Report',
  PROJECT_NARRATIVE: 'Project Narrative',
  PROJECT_BUDGET: 'Project Budget',
  BOARD_LIST: 'Board List',
  IRS_DETERMINATION: 'IRS Determination Letter',
  ANNUAL_REPORT: 'Annual Report',
  ANNUAL_ORG_BUDGET: 'Annual Org Budget',
  END_OF_YEAR_FINANCIAL: 'End of Year Financial',
  OTHER: 'Other',
}

const docTypeIcons: Record<string, typeof FileText> = {
  FORM_990: FileSpreadsheet,
  FORM_990_EZ: FileSpreadsheet,
  FORM_990_N: FileSpreadsheet,
  FINANCIAL_STATEMENT: FileCheck,
  AUDIT_REPORT: FileCheck,
  IRS_DETERMINATION: Shield,
  BOARD_LIST: FileText,
  ANNUAL_REPORT: FileText,
  ANNUAL_ORG_BUDGET: FileSpreadsheet,
  END_OF_YEAR_FINANCIAL: FileCheck,
  OTHER: File,
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
  documents,
}: OrganizationDetailClientProps) {
  const [previewDocId, setPreviewDocId] = useState<string | null>(null)

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

        {/* Organization Documents */}
        <FadeIn delay={0.25}>
          <GlassCard className="p-6 mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <FolderOpen className="w-5 h-5 text-[var(--hff-teal)]" />
              Organization Documents
            </h2>

            {documents.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <FolderOpen className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Uploaded</h3>
                <p className="text-gray-500">
                  This organization has not uploaded any documents yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, index) => {
                  const Icon = docTypeIcons[doc.type] || File
                  const isPdf = doc.mimeType === 'application/pdf'
                  const isPreviewOpen = previewDocId === doc.id

                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="rounded-xl bg-gray-50 overflow-hidden">
                        {/* Document Row */}
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-[var(--hff-teal)]/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-[var(--hff-teal)]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-gray-900 truncate">
                                  {doc.name}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--hff-teal)]/10 text-[var(--hff-teal)]">
                                  {docTypeLabels[doc.type] || doc.type}
                                </span>
                                {doc.documentYear && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                                    {doc.documentYear}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mt-0.5">
                                {doc.fileName} &middot; {formatFileSize(doc.fileSize)} &middot; Uploaded{' '}
                                {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                                {doc.uploadedByName && (
                                  <span> by {doc.uploadedByName}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            {isPdf && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() =>
                                  setPreviewDocId(isPreviewOpen ? null : doc.id)
                                }
                              >
                                <Eye className="w-4 h-4" />
                                {isPreviewOpen ? 'Hide' : 'Preview'}
                                {isPreviewOpen ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="gap-1.5" asChild>
                              <a
                                href={doc.storageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>

                        {/* Inline PDF Preview */}
                        <AnimatePresence>
                          {isPdf && isPreviewOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4">
                                <iframe
                                  src={doc.storageUrl}
                                  className="w-full h-[500px] rounded-lg border border-gray-200"
                                  title={`Preview: ${doc.name}`}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </FadeIn>

        {/* Grant History */}
        <FadeIn delay={0.3}>
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
