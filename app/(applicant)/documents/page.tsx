import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, Upload, Download, Trash2 } from 'lucide-react'
import { formatFileSize } from '@/lib/storage'
import { format } from 'date-fns'

export default async function DocumentsPage() {
  const clerkUser = await currentUser()

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser!.id },
    include: {
      organization: {
        include: {
          documents: {
            where: { scope: 'ORGANIZATION' },
            orderBy: { uploadedAt: 'desc' },
          },
        },
      },
    },
  })

  const organization = user?.organization
  const documents = organization?.documents || []

  const requiredDocTypes = ['FORM_990', 'IRS_DETERMINATION', 'FINANCIAL_STATEMENT']
  const hasRequiredDocs = requiredDocTypes.map(type => ({
    type,
    doc: documents.find(d => d.type === type),
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Document Library</h1>
            <p className="text-gray-600 mt-1">
              Store documents to reuse across multiple applications
            </p>
          </div>
          <Button asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-dark)]">
            <Link href="/documents/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Link>
          </Button>
        </div>

        {!organization && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                Please create your organization profile before uploading documents.
              </p>
              <Button asChild size="sm" className="mt-4 bg-yellow-600 hover:bg-yellow-700">
                <Link href="/profile/edit">Create Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {organization && (
          <>
            {/* Required Documents */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>
                  These documents are typically required for grant applications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasRequiredDocs.map(({ type, doc }) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      {doc ? (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {type.replace(/_/g, ' ')}
                          {doc && doc.documentYear && ` (${doc.documentYear})`}
                        </p>
                        {doc ? (
                          <p className="text-sm text-gray-600">
                            {doc.fileName} • {formatFileSize(doc.fileSize)} • 
                            Uploaded {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">Not uploaded</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc ? (
                        <>
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/documents/upload">Upload</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Documents</CardTitle>
                <CardDescription>
                  Other supporting documents for your applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.filter(d => !requiredDocTypes.includes(d.type)).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No additional documents uploaded yet</p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href="/documents/upload">Upload Document</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents
                      .filter(d => !requiredDocTypes.includes(d.type))
                      .map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[var(--hff-teal)]" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-600">
                                {doc.fileName} • {formatFileSize(doc.fileSize)} • 
                                {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{doc.type.replace(/_/g, ' ')}</Badge>
                            <Button variant="outline" size="sm" asChild>
                              <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
