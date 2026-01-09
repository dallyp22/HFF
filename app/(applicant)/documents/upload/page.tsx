'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Upload, FileText, Loader2, X, AlertCircle } from 'lucide-react'
import { formatFileSize, validateFileType, validateFileSize } from '@/lib/storage'

const DOCUMENT_TYPES = [
  { value: 'FORM_990', label: 'Form 990' },
  { value: 'FORM_990_EZ', label: 'Form 990-EZ' },
  { value: 'FORM_990_N', label: 'Form 990-N' },
  { value: 'IRS_DETERMINATION', label: 'IRS Determination Letter' },
  { value: 'FINANCIAL_STATEMENT', label: 'Financial Statement' },
  { value: 'AUDIT_REPORT', label: 'Audit Report' },
  { value: 'BOARD_LIST', label: 'Board of Directors List' },
  { value: 'ANNUAL_REPORT', label: 'Annual Report' },
  { value: 'PROJECT_NARRATIVE', label: 'Project Narrative' },
  { value: 'PROJECT_BUDGET', label: 'Project Budget' },
  { value: 'OTHER', label: 'Other' },
]

export default function DocumentUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [description, setDescription] = useState('')
  const [documentYear, setDocumentYear] = useState('')
  const [dragActive, setDragActive] = useState(false)

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  function handleFileSelect(selectedFile: File) {
    if (!validateFileType(selectedFile)) {
      toast.error('Invalid file type. Please upload PDF, Word, or Excel files only.')
      return
    }

    if (!validateFileSize(selectedFile)) {
      toast.error('File size exceeds 10MB limit.')
      return
    }

    setFile(selectedFile)
    if (!documentName) {
      setDocumentName(selectedFile.name.replace(/\.[^/.]+$/, ''))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    if (!documentType) {
      toast.error('Please select a document type')
      return
    }

    if (!documentName.trim()) {
      toast.error('Please enter a document name')
      return
    }

    setUploading(true)

    try {
      // Get organization ID
      const orgResponse = await fetch('/api/organizations')
      const org = await orgResponse.json()

      if (!org || !org.id) {
        toast.error('Please create your organization profile first')
        router.push('/profile/edit')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)
      formData.append('name', documentName)
      formData.append('description', description)
      formData.append('scope', 'ORGANIZATION')
      formData.append('organizationId', org.id)
      
      if (documentYear) {
        formData.append('year', documentYear)
      }

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast.success('Document uploaded successfully!')
        router.push('/documents')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
        <p className="text-gray-600 mb-8">Add a document to your organization library</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Select File</CardTitle>
              <CardDescription>PDF, Word, or Excel files up to 10MB</CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive
                      ? 'border-[var(--hff-teal)] bg-[var(--hff-teal-50)]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Drop file here or click to browse</p>
                  <p className="text-sm text-gray-600 mb-4">Accepted: PDF, DOC, DOCX, XLS, XLSX</p>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="max-w-xs mx-auto"
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-[var(--hff-teal)]" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document Details */}
          {file && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Document Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type *</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentName">Document Name *</Label>
                    <Input
                      id="documentName"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="e.g., Form 990 - 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Additional notes about this document..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentYear">Year (Optional)</Label>
                    <Input
                      id="documentYear"
                      type="number"
                      value={documentYear}
                      onChange={(e) => setDocumentYear(e.target.value)}
                      placeholder="2024"
                      min="2000"
                      max={new Date().getFullYear()}
                    />
                    <p className="text-sm text-gray-600">
                      For dated documents like Form 990 or financial statements
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Documents uploaded to your library can be reused across multiple grant applications.
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/documents')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || uploading}
              className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-dark)]"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
