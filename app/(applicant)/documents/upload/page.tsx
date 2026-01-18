'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Upload,
  FileText,
  Loader2,
  X,
  AlertCircle,
  ArrowLeft,
  FolderOpen,
  CheckCircle,
} from 'lucide-react'
import { formatFileSize, validateFileType, validateFileSize } from '@/lib/storage'
import Link from 'next/link'

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
        {/* Header */}
        <FadeIn>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--hff-teal)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Documents
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                <Upload className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
                <p className="text-gray-600">Add a document to your organization library</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <FadeIn delay={0.1}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
                <FolderOpen className="w-5 h-5 text-[var(--hff-teal)]" />
                Select File
              </h2>
              <p className="text-sm text-gray-500 mb-4">PDF, Word, or Excel files up to 10MB</p>

              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive
                      ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]/5 scale-[1.02]'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                  }`}
                >
                  <motion.div
                    animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                  </motion.div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop file here or click to browse
                  </p>
                  <p className="text-sm text-gray-600 mb-4">Accepted: PDF, DOC, DOCX, XLS, XLSX</p>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="max-w-xs mx-auto bg-white"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-xl p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </FadeIn>

          {/* Document Details */}
          {file && (
            <>
              <FadeIn delay={0.15}>
                <GlassCard className="p-6">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <FileText className="w-5 h-5 text-[var(--hff-teal)]" />
                    Document Details
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Document Type *</Label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger className="bg-white/50">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((type) => (
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
                        className="bg-white/50"
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
                        className="bg-white/50"
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
                        className="bg-white/50 max-w-[200px]"
                      />
                      <p className="text-sm text-gray-500">
                        For dated documents like Form 990 or financial statements
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-blue-800 text-sm">
                      Documents uploaded to your library can be reused across multiple grant
                      applications.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </>
          )}

          {/* Submit Buttons */}
          <FadeIn delay={file ? 0.25 : 0.15}>
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={() => router.push('/documents')}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!file || uploading}
                className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </FadeIn>
        </form>
      </div>
    </div>
  )
}
