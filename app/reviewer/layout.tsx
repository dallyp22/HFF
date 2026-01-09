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
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  )
}
