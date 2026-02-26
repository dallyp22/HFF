import { put, del, head } from '@vercel/blob'

export interface UploadResult {
  url: string
  downloadUrl: string
  pathname: string
  contentType: string
  contentDisposition: string
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadFile(
  file: File,
  path: string
): Promise<UploadResult> {
  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: true,
  })

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    contentType: blob.contentType || file.type,
    contentDisposition: blob.contentDisposition,
  }
}

/**
 * Delete a file from Vercel Blob storage
 */
export async function deleteFile(url: string): Promise<void> {
  await del(url)
}

/**
 * Check if a file exists in Vercel Blob storage
 */
export async function fileExists(url: string): Promise<boolean> {
  try {
    await head(url)
    return true
  } catch {
    return false
  }
}

/**
 * Generate a storage path for an organization document
 */
export function getOrganizationDocumentPath(
  organizationId: string,
  fileName: string
): string {
  return `organizations/${organizationId}/${fileName}`
}

/**
 * Generate a storage path for an application document
 */
export function getApplicationDocumentPath(
  applicationId: string,
  fileName: string
): string {
  return `applications/${applicationId}/${fileName}`
}

/**
 * Validate file type
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'image/jpeg', // .jpg, .jpeg
    'image/png', // .png
  ]

  return allowedTypes.includes(file.type)
}

/**
 * Validate file size (max 10MB)
 */
export function validateFileSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  return file.size <= maxSize
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
