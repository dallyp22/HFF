'use client'

import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { format } from 'date-fns'
import { InfoResponseForm } from '@/components/applicant/InfoResponseForm'
import { printPage } from '@/lib/print'
import {
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Send,
  Calendar,
  Edit,
  Printer,
} from 'lucide-react'

interface ApplicationStatusClientProps {
  application: {
    id: string
    projectTitle: string | null
    grantCycle: string
    cycleYear: number
    status: string
    submittedAt: string | null
  }
  statusHistory: {
    id: string
    newStatus: string
    reason: string | null
    createdAt: string
  }[]
  pendingInfoRequest: {
    id: string
    content: string
    responseDeadline: string | null
  } | null
}

const statusConfig: Record<
  string,
  { color: string; bgColor: string; icon: React.ReactNode; label: string }
> = {
  DRAFT: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: <Edit className="w-4 h-4" />,
    label: 'Draft',
  },
  SUBMITTED: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: <Send className="w-4 h-4" />,
    label: 'Submitted',
  },
  UNDER_REVIEW: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: <Target className="w-4 h-4" />,
    label: 'Under Review',
  },
  INFO_REQUESTED: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Info Requested',
  },
  APPROVED: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Approved',
  },
  DECLINED: {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Declined',
  },
  WITHDRAWN: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Withdrawn',
  },
}

export function ApplicationStatusClient({
  application,
  statusHistory,
  pendingInfoRequest,
}: ApplicationStatusClientProps) {
  const status = statusConfig[application.status] || statusConfig.DRAFT

  // Determine progress steps
  const steps = [
    { key: 'submitted', label: 'Submitted', completed: application.status !== 'DRAFT' },
    {
      key: 'review',
      label: 'Under Review',
      completed: ['UNDER_REVIEW', 'INFO_REQUESTED', 'APPROVED', 'DECLINED'].includes(
        application.status
      ),
    },
    {
      key: 'decision',
      label: 'Decision',
      completed: ['APPROVED', 'DECLINED'].includes(application.status),
      isApproved: application.status === 'APPROVED',
      isDeclined: application.status === 'DECLINED',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Print-only Header */}
        <div className="print-only print-header">
          <h1>Heistand Family Foundation</h1>
          <h2>Grant Application</h2>
          <p>{application.projectTitle || 'Application'} — {application.grantCycle} {application.cycleYear}</p>
        </div>

        {/* Header */}
        <FadeIn>
          <Link
            href="/applications"
            className="no-print inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--hff-teal)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applications
          </Link>

          <div className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                  <FileText className="w-6 h-6 text-[var(--hff-teal)]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {application.projectTitle || 'Application'}
                  </h1>
                  <p className="text-gray-600">
                    {application.grantCycle} {application.cycleYear} Grant Cycle
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="no-print rounded-lg"
                onClick={() => printPage()}
              >
                <Printer className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Current Status */}
        <FadeIn delay={0.1}>
          <GlassCard className="p-6 mb-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Clock className="w-5 h-5 text-[var(--hff-teal)]" />
              Application Status
            </h2>

            <div className="flex items-center gap-3 mb-6">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}
              >
                {status.icon}
                {status.label}
              </span>
              {application.submittedAt && (
                <span className="text-sm text-gray-600">
                  Submitted {format(new Date(application.submittedAt), 'MMMM d, yyyy')}
                </span>
              )}
            </div>

            {/* Progress Steps */}
            <div className="relative">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed
                          ? step.isDeclined
                            ? 'bg-red-500'
                            : step.isApproved
                              ? 'bg-emerald-500'
                              : 'bg-[var(--hff-teal)]'
                          : 'bg-gray-200'
                      }`}
                    >
                      {step.completed ? (
                        step.isDeclined ? (
                          <XCircle className="w-5 h-5 text-white" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                      )}
                    </motion.div>
                    <span className="text-xs text-gray-600 mt-2 font-medium">{step.label}</span>
                  </div>
                ))}
              </div>

              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0 mx-16">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: steps[2].completed ? '100%' : steps[1].completed ? '50%' : '0%',
                  }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-full ${
                    steps[2].isDeclined
                      ? 'bg-red-500'
                      : steps[2].isApproved
                        ? 'bg-emerald-500'
                        : 'bg-[var(--hff-teal)]'
                  }`}
                />
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Information Request */}
        {pendingInfoRequest && (
          <FadeIn delay={0.15}>
            <div className="mb-6">
              <InfoResponseForm
                applicationId={application.id}
                communicationId={pendingInfoRequest.id}
                message={pendingInfoRequest.content}
                responseDeadline={pendingInfoRequest.responseDeadline}
              />
            </div>
          </FadeIn>
        )}

        {/* Status History / Timeline */}
        <FadeIn delay={0.2}>
          <GlassCard className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <Calendar className="w-5 h-5 text-[var(--hff-teal)]" />
              Timeline
            </h2>

            {statusHistory.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No status changes yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {statusHistory.map((history, index) => {
                  const historyStatus = statusConfig[history.newStatus] || statusConfig.DRAFT
                  return (
                    <motion.div
                      key={history.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            history.newStatus === 'APPROVED'
                              ? 'bg-emerald-500'
                              : history.newStatus === 'DECLINED'
                                ? 'bg-red-500'
                                : 'bg-[var(--hff-teal)]'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Status changed to{' '}
                          <span className={historyStatus.color}>
                            {history.newStatus.replace(/_/g, ' ')}
                          </span>
                        </p>
                        {history.reason && (
                          <p className="text-sm text-gray-600 mt-1">{history.reason}</p>
                        )}
                        <p className="text-sm text-gray-400 mt-1">
                          {format(new Date(history.createdAt), 'MMMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </GlassCard>
        </FadeIn>

        {/* Action Buttons */}
        <FadeIn delay={0.25}>
          <div className="no-print mt-6 flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/applications">Back to Applications</Link>
            </Button>
            {application.status === 'DRAFT' && (
              <Button asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90">
                <Link href={`/applications/${application.id}/edit`}>Continue Editing</Link>
              </Button>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
