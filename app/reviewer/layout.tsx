import { Header } from '@/components/brand/Header'
import { Footer } from '@/components/brand/Footer'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'

export default async function ReviewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Middleware handles org membership check and redirects
  // No need to check again here to avoid redirect loops

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="reviewer" />
      <main className="flex-1 relative">
        {/* Professional ambient background */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Base gradient - slightly darker/more professional */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-[var(--hff-slate)]/5" />

          {/* Decorative orbs - more subtle for professional feel */}
          <div
            className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, var(--hff-slate) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          <div
            className="absolute top-1/3 -left-60 w-[500px] h-[500px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, var(--hff-teal) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
          />
          <div
            className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--hff-gold) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />

          {/* Subtle dot pattern for professional feel */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(var(--hff-slate) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {children}
      </main>
      <Footer />
    </div>
  )
}
