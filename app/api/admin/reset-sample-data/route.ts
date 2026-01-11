import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'

const SAMPLE_EINS = ['47-1234567', '47-2345678', '47-3456789']

export async function POST() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await isAdmin()

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Only admins can reset data' },
        { status: 403 }
      )
    }

    // Delete sample organizations (cascade will delete applications, documents, etc.)
    const result = await prisma.organization.deleteMany({
      where: {
        ein: {
          in: SAMPLE_EINS,
        },
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Error clearing sample data:', error)
    return NextResponse.json(
      { error: 'Failed to clear sample data' },
      { status: 500 }
    )
  }
}
