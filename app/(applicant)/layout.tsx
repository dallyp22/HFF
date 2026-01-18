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
      <main className="flex-1 relative">
        {/* Ambient background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-[var(--hff-teal)]/5" />

          {/* Decorative orbs */}
          <div
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, var(--hff-teal) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, var(--hff-sage) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, var(--hff-gold) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `
                linear-gradient(var(--hff-teal) 1px, transparent 1px),
                linear-gradient(90deg, var(--hff-teal) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {children}
      </main>
      <Footer />
    </div>
  )
}
