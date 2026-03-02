import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { uploadFile, getOrganizationDocumentPath, validateFileType, validateFileSize } from '@/lib/storage'
import { isReviewer as checkIsReviewer } from '@/lib/auth/access'

export async function POST(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('type') as string
    const documentName = formData.get('name') as string
    const description = formData.get('description') as string | null
    const documentYear = formData.get('year') as string | null
    const scope = formData.get('scope') as 'ORGANIZATION' | 'APPLICATION'
    const organizationId = formData.get('organizationId') as string | null
    const applicationId = formData.get('applicationId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!validateFileType(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, Word, Excel, JPEG, and PNG.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!validateFileSize(file)) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const targetOrgId = organizationId || dbUser?.organizationId

    if (!targetOrgId && scope === 'ORGANIZATION') {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      )
    }

    // Upload to blob storage
    const storagePath = scope === 'ORGANIZATION'
      ? getOrganizationDocumentPath(targetOrgId!, file.name)
      : `applications/${applicationId}/${file.name}`

    let uploadResult
    try {
      uploadResult = await uploadFile(file, storagePath)
    } catch (uploadError) {
      const msg = uploadError instanceof Error ? uploadError.message : String(uploadError)
      console.error('Blob upload failed:', msg, uploadError)
      return NextResponse.json(
        { error: `File upload failed: ${msg}` },
        { status: 502 }
      )
    }

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        organizationId: scope === 'ORGANIZATION' ? targetOrgId : null,
        applicationId: scope === 'APPLICATION' ? applicationId : null,
        scope,
        type: documentType as any,
        name: documentName || file.name,
        description,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storageKey: uploadResult.pathname,
        storageUrl: uploadResult.url,
        documentYear: documentYear ? parseInt(documentYear) : null,
        uploadedById: user.id,
        uploadedByName: `${user.firstName} ${user.lastName}`.trim() || user.emailAddresses[0]?.emailAddress || 'Unknown',
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error uploading document:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to upload document: ${message}` },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const organizationId = searchParams.get('organizationId')
    const applicationId = searchParams.get('applicationId')

    // Get user's organization
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { organizationId: true },
    })

    const reviewerAccess = await checkIsReviewer()

    let documents

    if (organizationId) {
      // Check access
      if (!reviewerAccess && dbUser?.organizationId !== organizationId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      documents = await prisma.document.findMany({
        where: { organizationId },
        orderBy: { uploadedAt: 'desc' },
      })
    } else if (applicationId) {
      documents = await prisma.document.findMany({
        where: { applicationId },
        orderBy: { uploadedAt: 'desc' },
      })
    } else {
      return NextResponse.json({ error: 'Missing organizationId or applicationId' }, { status: 400 })
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
