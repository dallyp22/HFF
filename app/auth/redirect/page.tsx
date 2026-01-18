'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function AuthRedirectPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    // Check if user is a reviewer (has organization membership)
    const isReviewer = (user as any).organizationMemberships?.length > 0
    const isHardcodedAdmin = user.emailAddresses?.[0]?.emailAddress === 'dallas.polivka@vsinsights.ai'

    if (isReviewer || isHardcodedAdmin) {
      router.push('/reviewer/dashboard')
    } else {
      router.push('/dashboard')
    }
  }, [user, isLoaded, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--hff-teal)] mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
