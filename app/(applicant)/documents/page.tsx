'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { formatFileSize } from '@/lib/storage'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  FolderOpen,
  Shield,
  FileCheck,
  Clock,
  Plus,
  ExternalLink,
  File,
  FileSpreadsheet,
  FileImage,
} from 'lucide-react'

interface Document {
  id: string
  name: string
  fileName: string
  type: string
  fileSize: number
  storageUrl: string
  documentYear: number | null
  uploadedAt: string
}

interface Organization {
  id: string
  legalName: string
  documents: Document[]
}

const requiredDocTypes = ['FORM_990', 'IRS_DETERMINATION', 'FINANCIAL_STATEMENT']

const docTypeConfig: Record<string, { label: string; description: string; icon: typeof FileText }> = {
  FORM_990: {
    label: 'Form 990',
    description: 'IRS Form 990 (most recent)',
    icon: FileSpreadsheet,
  },
  IRS_DETERMINATION: {
    label: 'IRS Determination Letter',
    description: '501(c)(3) status confirmation',
    icon: Shield,
  },
  FINANCIAL_STATEMENT: {
    label: 'Financial Statement',
    description: 'Audited or compiled financials',
    icon: FileCheck,
  },
  OTHER: {
    label: 'Other',
    description: 'Supporting documentation',
    icon: File,
  },
  BOARD_LIST: {
    label: 'Board List',
    description: 'Board of Directors listing',
    icon: FileText,
  },
  ANNUAL_REPORT: {
    label: 'Annual Report',
    description: 'Organization annual report',
    icon: FileText,
  },
}

export default function DocumentsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/organizations')
        if (response.ok) {
          const org = await response.json()
          if (org && org.id) {
            // Fetch documents
            const docsResponse = await fetch('/api/documents')
            if (docsResponse.ok) {
              const docs = await docsResponse.json()
              setOrganization({ ...org, documents: docs })
            } else {
              setOrganization({ ...org, documents: [] })
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const documents = organization?.documents || []

  // Get status of required documents
  const requiredDocsStatus = requiredDocTypes.map((type) => ({
    type,
    config: docTypeConfig[type],
    doc: documents.find((d) => d.type === type),
  }))

  // Get additional documents
  const additionalDocs = documents.filter((d) => !requiredDocTypes.includes(d.type))

  // Calculate completion
  const requiredComplete = requiredDocsStatus.filter((s) => s.doc).length
  const completionPercent = Math.round((requiredComplete / requiredDocTypes.length) * 100)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-1/4" />
            <div className="h-24 bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] mb-3"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Document Library</span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Your Documents</h1>
              <p className="text-gray-600 mt-1">
                Store and manage documents for your grant applications
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                asChild
                className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] shadow-lg shadow-[var(--hff-teal)]/20"
              >
                <Link href="/documents/upload">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Link>
              </Button>
            </motion.div>
          </div>
        </FadeIn>

        {/* No Organization Warning */}
        <AnimatePresence>
          {!organization && (
            <FadeIn>
              <GlassCard variant="elevated" className="mb-6 border-l-4 border-l-yellow-500 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Create Your Profile First</h3>
                    <p className="text-gray-600 text-sm">
                      Please create your organization profile before uploading documents.
                    </p>
                  </div>
                  <Button
                    asChild
                    className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/20"
                  >
                    <Link href="/profile/edit">Create Profile</Link>
                  </Button>
                </div>
              </GlassCard>
            </FadeIn>
          )}
        </AnimatePresence>

        {organization && (
          <>
            {/* Completion Overview */}
            <FadeIn delay={0.1}>
              <GlassCard variant="teal" className="p-6 mb-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <Shield className="w-full h-full" />
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Progress Ring */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className={completionPercent === 100 ? 'text-green-500' : 'text-[var(--hff-teal)]'}
                          strokeLinecap="round"
                          initial={{ strokeDasharray: '0 220' }}
                          animate={{ strokeDasharray: `${(completionPercent / 100) * 220} 220` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {completionPercent === 100 ? (
                          <CheckCircle2 className="w-8 h-8 text-green-500" />
                        ) : (
                          <span className="text-lg font-bold text-gray-900">{completionPercent}%</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {completionPercent === 100
                          ? 'All Required Documents Uploaded'
                          : 'Document Checklist'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {completionPercent === 100
                          ? 'You have all the documents needed to submit applications.'
                          : `Upload ${requiredDocTypes.length - requiredComplete} more document${requiredDocTypes.length - requiredComplete > 1 ? 's' : ''} to complete your library.`}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {requiredDocsStatus.map((status) => (
                          <span
                            key={status.type}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                              status.doc
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {status.doc ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {status.config.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>

            {/* Required Documents */}
            <FadeIn delay={0.15}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Documents</h2>
            </FadeIn>
            <StaggerContainer className="space-y-3 mb-10" staggerDelay={0.05}>
              {requiredDocsStatus.map((status) => {
                const Icon = status.config.icon

                return (
                  <StaggerItem key={status.type}>
                    <GlassCard
                      hover={!status.doc}
                      className={cn(
                        'p-4 transition-all duration-300',
                        !status.doc && 'border-dashed hover:border-[var(--hff-teal)]/30'
                      )}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                            status.doc ? 'bg-green-100' : 'bg-gray-100'
                          )}
                        >
                          {status.doc ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <Icon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{status.config.label}</h3>
                            {status.doc && status.doc.documentYear && (
                              <GlassBadge variant="default" size="sm">
                                {status.doc.documentYear}
                              </GlassBadge>
                            )}
                          </div>
                          {status.doc ? (
                            <p className="text-sm text-gray-500 mt-0.5">
                              {status.doc.fileName} • {formatFileSize(status.doc.fileSize)} •
                              Uploaded {format(new Date(status.doc.uploadedAt), 'MMM d, yyyy')}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-0.5">
                              {status.config.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {status.doc ? (
                            <>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={status.doc.storageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  View
                                </a>
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="border-[var(--hff-teal)]/30 text-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/5"
                            >
                              <Link href="/documents/upload">
                                <Upload className="w-4 h-4 mr-1" />
                                Upload
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>

            {/* Additional Documents */}
            <FadeIn delay={0.2}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Additional Documents</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/documents/upload">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.25}>
              {additionalDocs.length === 0 ? (
                <GlassCard className="p-8 text-center border-dashed">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No Additional Documents</h3>
                  <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                    Upload supporting documents like annual reports, board lists, or other materials
                    that strengthen your applications.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/documents/upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Link>
                  </Button>
                </GlassCard>
              ) : (
                <GlassCard className="overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {additionalDocs.map((doc, index) => {
                      const typeConfig = docTypeConfig[doc.type] || docTypeConfig.OTHER
                      const Icon = typeConfig.icon

                      return (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[var(--hff-teal)]/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[var(--hff-teal)]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-sm text-gray-500">
                                {doc.fileName} • {formatFileSize(doc.fileSize)} •{' '}
                                {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <GlassBadge variant="default" size="sm">
                              {typeConfig.label}
                            </GlassBadge>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </GlassCard>
              )}
            </FadeIn>

            {/* Help Text */}
            <FadeIn delay={0.3}>
              <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">About Documents</h4>
                <p className="text-sm text-gray-500">
                  Documents uploaded here are stored securely and can be reused across multiple grant
                  applications. Required documents are typically needed for all applications, while
                  additional documents may be requested for specific grants.
                </p>
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </div>
  )
}
