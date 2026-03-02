import { clerkMiddleware, createRouteMatcher, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Temporary admin override emails
const ADMIN_EMAILS = ['dallas.polivka@vsinsights.ai']

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/eligibility',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth/redirect',
  '/api/webhooks(.*)',
])

const isApplicantRoute = createRouteMatcher([
  '/dashboard',
  '/profile(.*)',
  '/documents(.*)',
  '/applications(.*)',
  '/settings',
])

const isReviewerRoute = createRouteMatcher([
  '/reviewer(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/reviewer/admin(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Public routes - no auth required
  if (isPublicRoute(req)) return NextResponse.next()

  try {
    const { userId, orgRole } = await auth()

    // All other routes require authentication
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }

    // Get current user to check email for admin override
    const user = await currentUser()
    const userEmail = user?.emailAddresses?.[0]?.emailAddress
    const isHardcodedAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)

    // Admin routes - require admin role OR hardcoded admin email
    if (isAdminRoute(req)) {
      if (!isHardcodedAdmin && orgRole !== 'org:admin') {
        return NextResponse.redirect(new URL('/reviewer/dashboard', req.url))
      }
    }

    // Reviewer routes - require organization membership OR hardcoded admin
    if (isReviewerRoute(req)) {
      if (!isHardcodedAdmin && !orgRole) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Applicant routes - accessible to authenticated non-org users
    if (isApplicantRoute(req)) {
      if (orgRole || isHardcodedAdmin) {
        // Staff members and hardcoded admins redirect to reviewer dashboard
        return NextResponse.redirect(new URL('/reviewer/dashboard', req.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // Allow request to proceed on error to avoid blocking all routes
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|pdf|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
