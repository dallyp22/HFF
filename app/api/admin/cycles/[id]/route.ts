import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/access'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await isAdmin()

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Only admins can modify grant cycles' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { isActive, acceptingApplications } = body

    // If setting this cycle as active, deactivate all others
    if (isActive === true) {
      await prisma.grantCycleConfig.updateMany({
        where: { NOT: { id } },
        data: { isActive: false },
      })
    }

    const cycle = await prisma.grantCycleConfig.update({
      where: { id },
      data: {
        isActive,
        acceptingApplications,
      },
    })

    return NextResponse.json(cycle)
  } catch (error) {
    console.error('Error updating cycle:', error)
    return NextResponse.json(
      { error: 'Failed to update cycle' },
      { status: 500 }
    )
  }
}
