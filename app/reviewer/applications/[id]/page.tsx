import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Download, FileText } from 'lucide-react'
import { formatFileSize } from '@/lib/storage'
import { VotingPanel } from '@/components/reviewer/VotingPanel'
import { NotesPanel } from '@/components/reviewer/NotesPanel'
import { ApplicationActions } from '@/components/reviewer/ApplicationActions'
import { isAdmin, isManager } from '@/lib/auth/access'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await currentUser()

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      organization: true,
      documents: true,
      notes: {
        orderBy: { createdAt: 'desc' },
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
      communications: {
        orderBy: { sentAt: 'desc' },
      },
      votes: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!application) {
    notFound()
  }

  const userIsAdmin = await isAdmin()
  const userIsManager = await isManager()
  
  const approveVotes = application.votes.filter(v => v.vote === 'APPROVE').length
  const declineVotes = application.votes.filter(v => v.vote === 'DECLINE').length

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-purple-100 text-purple-700',
    INFO_REQUESTED: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    DECLINED: 'bg-red-100 text-red-700',
    WITHDRAWN: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {application.projectTitle || 'Untitled Application'}
              </h1>
              <p className="text-lg text-gray-600">{application.organization.legalName}</p>
              <p className="text-sm text-gray-500">
                {application.grantCycle} {application.cycleYear} • 
                {application.submittedAt && ` Submitted ${format(new Date(application.submittedAt), 'MMM d, yyyy')}`}
              </p>
            </div>
            <Badge className={statusColors[application.status]}>
              {application.status.replace(/_/g, ' ')}
            </Badge>
          </div>

          {/* Manager Actions */}
          <ApplicationActions
            applicationId={application.id}
            currentStatus={application.status}
            approveVotes={approveVotes}
            declineVotes={declineVotes}
            isAdmin={userIsAdmin}
            isManager={userIsManager}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList>
            <TabsTrigger value="summary">AI Summary</TabsTrigger>
            <TabsTrigger value="voting">
              Voting ({approveVotes}/{application.votes.length})
            </TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="notes">Notes ({application.notes.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* AI Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {application.aiSummary ? (
                  <div className="space-y-6">
                    <div className="prose max-w-none">
                      <p>{application.aiSummary}</p>
                    </div>

                    {application.aiMissionAlignment && (
                      <div>
                        <h3 className="font-semibold mb-2">Mission Alignment</h3>
                        <div className="flex items-center gap-4">
                          <div className="text-3xl font-bold text-[var(--hff-teal)]">
                            {application.aiMissionAlignment}/100
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[var(--hff-teal)]"
                                style={{ width: `${application.aiMissionAlignment}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {application.aiStrengths && application.aiStrengths.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-green-700">Strengths</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {application.aiStrengths.map((strength, i) => (
                            <li key={i} className="text-gray-700">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {application.aiConcerns && application.aiConcerns.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 text-amber-700">Concerns</h3>
                        <ul className="list-disc list-inside space-y-1">
                          {application.aiConcerns.map((concern, i) => (
                            <li key={i} className="text-gray-700">{concern}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {application.aiQuestions && application.aiQuestions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Recommended Questions</h3>
                        <ol className="list-decimal list-inside space-y-1">
                          {application.aiQuestions.map((question, i) => (
                            <li key={i} className="text-gray-700">{question}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    <Button variant="outline" size="sm">Regenerate Summary</Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="mb-4">No AI summary generated yet</p>
                    <Button>Generate Summary</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voting Tab */}
          <TabsContent value="voting">
            <VotingPanel
              applicationId={application.id}
              currentUserId={user!.id}
            />
          </TabsContent>

          {/* Application Tab */}
          <TabsContent value="application">
            <div className="space-y-6">
              {/* Project Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Project Title</p>
                    <p className="text-lg font-semibold">{application.projectTitle || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Description</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{application.projectDescription || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Goals</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{application.projectGoals || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Project Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {application.projectStartDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Start Date</p>
                        <p>{format(new Date(application.projectStartDate), 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                    {application.projectEndDate && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">End Date</p>
                        <p>{format(new Date(application.projectEndDate), 'MMMM d, yyyy')}</p>
                      </div>
                    )}
                  </div>
                  {application.geographicArea && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Geographic Area Served</p>
                      <p className="text-gray-700">{application.geographicArea}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Funding Request */}
              <Card>
                <CardHeader>
                  <CardTitle>Funding Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Amount Requested</p>
                      <p className="text-2xl font-bold text-[var(--hff-teal)]">
                        ${application.amountRequested?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Project Budget</p>
                      <p className="text-xl font-semibold">${application.totalProjectBudget?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Percentage Requested</p>
                      <p className="text-xl font-semibold">{application.percentageRequested?.toFixed(1) || '0'}%</p>
                    </div>
                  </div>
                  
                  {application.otherFundingSources && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Other Funding Sources</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{application.otherFundingSources}</p>
                    </div>
                  )}
                  
                  {application.previousHFFGrants && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Previous HFF Grants</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{application.previousHFFGrants}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Target Population */}
              <Card>
                <CardHeader>
                  <CardTitle>Target Population & Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {application.childrenServed && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Children Served</p>
                        <p className="text-2xl font-bold">{application.childrenServed}</p>
                      </div>
                    )}
                    {application.beneficiariesCount && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Beneficiaries</p>
                        <p className="text-2xl font-bold">{application.beneficiariesCount}</p>
                      </div>
                    )}
                    {application.ageRangeStart && application.ageRangeEnd && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Age Range</p>
                        <p className="text-xl font-semibold">{application.ageRangeStart} - {application.ageRangeEnd} years</p>
                      </div>
                    )}
                  </div>
                  
                  {application.targetPopulation && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Target Population Description</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{application.targetPopulation}</p>
                    </div>
                  )}
                  
                  {application.povertyIndicators && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Poverty Indicators</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{application.povertyIndicators}</p>
                    </div>
                  )}
                  
                  {application.schoolsServed && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Schools Served</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{application.schoolsServed}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Outcomes & Measurement */}
              <Card>
                <CardHeader>
                  <CardTitle>Expected Outcomes & Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {application.expectedOutcomes && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Expected Outcomes</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{application.expectedOutcomes}</p>
                    </div>
                  )}
                  
                  {application.measurementPlan && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Measurement Plan</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{application.measurementPlan}</p>
                    </div>
                  )}
                  
                  {application.sustainabilityPlan && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sustainability Plan</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{application.sustainabilityPlan}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Budget Breakdown */}
              {application.budgetBreakdown && (
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {typeof application.budgetBreakdown === 'string' 
                        ? application.budgetBreakdown 
                        : JSON.stringify(application.budgetBreakdown, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Organization Tab */}
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>{application.organization.legalName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-600">EIN</p>
                    <p>{application.organization.ein}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executive Director</p>
                    <p>{application.organization.executiveDirectorName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Annual Budget</p>
                    <p>${application.organization.annualBudget?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Form 990 Year</p>
                    <p>{application.organization.form990Year}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Mission</p>
                  <p className="text-gray-700">{application.organization.missionStatement}</p>
                </div>

                <Button variant="outline" asChild>
                  <Link href={`/reviewer/organizations/${application.organizationId}`}>
                    View Full Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Attached Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No documents attached</p>
                ) : (
                  <div className="space-y-3">
                    {application.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-[var(--hff-teal)]" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-600">
                              {doc.type.replace(/_/g, ' ')} • {formatFileSize(doc.fileSize)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <NotesPanel
              applicationId={application.id}
              initialNotes={application.notes}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.statusHistory.map((history) => (
                    <div key={history.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-[var(--hff-teal)]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          Status changed to {history.newStatus.replace(/_/g, ' ')}
                        </p>
                        {history.reason && (
                          <p className="text-sm text-gray-600 mt-1">{history.reason}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {history.changedByName} • {format(new Date(history.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
