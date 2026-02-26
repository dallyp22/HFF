import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/auth/access'

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ isAdmin: false })
    }

    const adminStatus = await isAdmin()

    return NextResponse.json({ isAdmin: adminStatus })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
