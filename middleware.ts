import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/eligibility',
  '/sign-in(.*)',
  '/sign-up(.*)',
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
  if (isPublicRoute(req)) return

  const { userId, orgRole } = await auth()

  // All other routes require authentication
  if (!userId) {
    return auth().redirectToSignIn()
  }

  // Admin routes - require admin role
  if (isAdminRoute(req)) {
    if (orgRole !== 'org:admin') {
      return Response.redirect(new URL('/reviewer/dashboard', req.url))
    }
  }

  // Reviewer routes - require organization membership
  if (isReviewerRoute(req)) {
    if (!orgRole) {
      return Response.redirect(new URL('/dashboard', req.url))
    }
  }

  // Applicant routes - accessible to authenticated non-org users
  if (isApplicantRoute(req)) {
    if (orgRole) {
      // Staff members redirect to reviewer dashboard
      return Response.redirect(new URL('/reviewer/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
