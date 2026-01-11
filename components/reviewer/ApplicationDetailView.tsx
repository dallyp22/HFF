'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { Download, FileText } from 'lucide-react'
import { formatFileSize } from '@/lib/storage'
import { AISummaryDisplay } from '@/components/reviewer/AISummaryDisplay'
import { StatusChangeDialog } from '@/components/reviewer/StatusChangeDialog'
import { InfoRequestDialog } from '@/components/reviewer/InfoRequestDialog'
import { useRouter } from 'next/navigation'

interface ApplicationDetailViewProps {
  application: any
  userIsAdmin: boolean
  userIsManager: boolean
}

export function ApplicationDetailView({
  application,
  userIsAdmin,
  userIsManager
}: ApplicationDetailViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  
  const approveVotes = application.votes?.filter((v: any) => v.vote === 'APPROVE').length || 0
  const declineVotes = application.votes?.filter((v: any) => v.vote === 'DECLINE').length || 0

  function handleApprove() {
    setSelectedStatus('APPROVED')
    setStatusDialogOpen(true)
  }

  function handleDecline() {
    setSelectedStatus('DECLINED')
    setStatusDialogOpen(true)
  }

  function handleRequestInfo() {
    setInfoDialogOpen(true)
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700',
    INFO_REQUESTED: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
    WITHDRAWN: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Sub-header with Actions */}
      <div className="bg-white border-b px-6 py-3">
        <Link href="/reviewer/applications" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
          ← Back to Applications
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {application.projectTitle || 'Untitled Application'}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{application.organization.legalName}</span>
              <span>·</span>
              <span>{application.grantCycle} {application.cycleYear}</span>
              <span>·</span>
              <span className="font-medium">
                ${application.amountRequested ? Math.round(parseFloat(application.amountRequested.toString())).toLocaleString() : '0'} requested
              </span>
              <span>·</span>
              <Badge className={statusColors[application.status]}>
                {application.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          {userIsAdmin && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
              >
                ✓ Approve
              </Button>
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDecline}
              >
                ✗ Decline
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleRequestInfo}
              >
                Request Information
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Split Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - AI Analysis */}
        <div className="w-80 bg-gray-50 border-r overflow-y-auto p-4">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">AI Analysis</h2>
          
          <AISummaryDisplay
            summary={application.aiSummary}
            missionAlignment={application.aiMissionAlignment}
            budgetAnalysis={application.aiBudgetAnalysis}
            strengths={application.aiStrengths || []}
            concerns={application.aiConcerns || []}
            questions={application.aiQuestions || []}
            generatedAt={application.aiSummaryGeneratedAt?.toString() || null}
            applicationId={application.id}
            isAdmin={userIsAdmin}
          />
        </div>

        {/* Right Panel - Application Details */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {/* Mini Tabs */}
            <div className="flex gap-1 mb-4 border-b">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'funding', label: 'Funding' },
                { id: 'impact', label: 'Impact' },
                { id: 'docs', label: 'Documents' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === tab.id 
                      ? 'text-[var(--hff-teal)] border-b-2 border-[var(--hff-teal)]' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <section>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Project Overview</h3>
                  <div className="bg-white rounded-lg border p-3">
                    <p className="text-sm text-gray-700 mb-3">
                      {application.projectDescription || 'No description provided'}
                    </p>
                    <div className="text-sm text-gray-500">
                      <strong className="text-gray-700">Goals:</strong> {application.projectGoals || 'Not specified'}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Timeline & Location</h3>
                  <div className="bg-white rounded-lg border p-3 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Start</p>
                      <p className="text-sm font-medium">
                        {application.projectStartDate ? format(new Date(application.projectStartDate), 'MMMM d, yyyy') : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">End</p>
                      <p className="text-sm font-medium">
                        {application.projectEndDate ? format(new Date(application.projectEndDate), 'MMMM d, yyyy') : 'TBD'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Area</p>
                      <p className="text-sm font-medium">{application.geographicArea || 'Not specified'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Organization</h3>
                  <div className="bg-white rounded-lg border p-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Annual Budget</p>
                        <p className="font-medium">${application.organization.annualBudget?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Staff</p>
                        <p className="font-medium">
                          {application.organization.fullTimeStaff || 0} FT, {application.organization.partTimeStaff || 0} PT
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Program Ratio</p>
                        <p className="font-medium">
                          {application.organization.form990ProgramExpenses && application.organization.form990TotalExpenses
                            ? `${Math.round((parseFloat(application.organization.form990ProgramExpenses.toString()) / parseFloat(application.organization.form990TotalExpenses.toString())) * 100)}%`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Link 
                      href={`/reviewer/organizations/${application.organizationId}`}
                      className="text-sm text-[var(--hff-teal)] hover:text-[var(--hff-teal-dark)] mt-3 inline-block"
                    >
                      View Full Profile →
                    </Link>
                  </div>
                </section>
              </div>
            )}

            {/* Funding Tab */}
            {activeTab === 'funding' && (
              <div className="space-y-3">
                <section>
                  <h3 className="section-title mb-2">Funding Request</h3>
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex items-end gap-8 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Amount Requested</p>
                        <p className="text-2xl font-bold text-[var(--hff-teal)]">
                          ${application.amountRequested ? Math.round(parseFloat(application.amountRequested.toString())).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Project Budget</p>
                        <p className="text-lg font-medium">
                          ${application.totalProjectBudget ? Math.round(parseFloat(application.totalProjectBudget.toString())).toLocaleString() : '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Percentage</p>
                        <p className="text-lg font-medium">
                          {application.percentageRequested ? parseFloat(application.percentageRequested.toString()).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                    {application.percentageRequested && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[var(--hff-teal)] h-2 rounded-full" 
                          style={{ width: `${Math.min(parseFloat(application.percentageRequested.toString()), 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="section-title mb-2">Other Funding</h3>
                  <div className="bg-white rounded-lg border p-4 text-sm">
                    <p><strong>Other sources:</strong> {application.otherFundingSources || 'None specified'}</p>
                    <p className="mt-2"><strong>Previous HFF grants:</strong> {application.previousHFFGrants || 'None'}</p>
                  </div>
                </section>
              </div>
            )}

            {/* Impact Tab */}
            {activeTab === 'impact' && (
              <div className="space-y-3">
                <section>
                  <h3 className="section-title mb-2">Target Population</h3>
                  <div className="bg-white rounded-lg border p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Children Served</p>
                        <p className="text-2xl font-bold text-gray-900">{application.childrenServed || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Age Range</p>
                        <p className="text-lg font-medium">
                          {application.ageRangeStart && application.ageRangeEnd 
                            ? `${application.ageRangeStart}-${application.ageRangeEnd} years`
                            : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t text-sm">
                      <p><strong>Description:</strong> {application.targetPopulation || 'Not specified'}</p>
                      <p className="mt-1"><strong>Poverty Indicators:</strong> {application.povertyIndicators || 'Not specified'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="section-title mb-2">Expected Outcomes</h3>
                  <div className="bg-white rounded-lg border p-4 text-sm space-y-2">
                    <p><strong>Expected:</strong> {application.expectedOutcomes || 'Not specified'}</p>
                    <p><strong>Measurement:</strong> {application.measurementPlan || 'Not specified'}</p>
                    <p><strong>Sustainability:</strong> {application.sustainabilityPlan || 'Not specified'}</p>
                  </div>
                </section>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'docs' && (
              <div className="space-y-2">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc: any) => (
                    <div key={doc.id} className="bg-white rounded-lg border p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <span className="text-sm font-medium">{doc.name}</span>
                          <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-sm">No documents attached</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Bar */}
          <div className="border-t bg-gray-50 px-4 py-2">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Notes ({application.notes?.length || 0})</span>
              <span>·</span>
              <span>Votes ({application.votes?.filter((v: any) => v.vote).length || 0}/{application.votes?.length || 0})</span>
              <span>·</span>
              <Button variant="ghost" size="sm" className="text-[var(--hff-teal)] h-6 text-xs">
                + Add Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <StatusChangeDialog
        applicationId={application.id}
        currentStatus={application.status}
        approveVotes={approveVotes}
        declineVotes={declineVotes}
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />

      <InfoRequestDialog
        applicationId={application.id}
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
      />
    </div>
  )
}
