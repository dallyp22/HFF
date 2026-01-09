import { Header } from '@/components/brand/Header'
import { Footer } from '@/components/brand/Footer'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

export default async function ApplicantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // If user is a reviewer, redirect to reviewer dashboard
  const orgs = (user as any).organizationMemberships
  if (orgs && orgs.length > 0) {
    redirect('/reviewer/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="applicant" />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  )
}
