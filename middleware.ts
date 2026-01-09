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
  
  try {
    const { userId, orgRole } = await auth()
    
    // All other routes require authentication
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
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
  } catch (error) {
    console.error('Middleware error:', error)
    // Allow request to proceed on error to avoid blocking all routes
    return
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
