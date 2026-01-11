import { prisma } from '@/lib/prisma'
import { currentUser, clerkClient } from '@clerk/nextjs/server'

/**
 * Check if the current user can access an application
 */
export async function canAccessApplication(applicationId: string): Promise<boolean> {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return false

  // Reviewers (org members) can access all applications
  if ((clerkUser as any).organizationMemberships && (clerkUser as any).organizationMemberships.length > 0) {
    return true
  }

  // Applicants can only access their own organization's applications
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { organizationId: true },
  })

  if (!user?.organizationId) return false

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { organizationId: true },
  })

  if (!application) return false

  return user.organizationId === application.organizationId
}

/**
 * Check if the current user can access an organization
 */
export async function canAccessOrganization(organizationId: string): Promise<boolean> {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return false

  // Reviewers can access all organizations
  if ((clerkUser as any).organizationMemberships && (clerkUser as any).organizationMemberships.length > 0) {
    return true
  }

  // Applicants can only access their own organization
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { organizationId: true },
  })

  return user?.organizationId === organizationId
}

/**
 * Check if the current user can modify an application
 */
export async function canModifyApplication(applicationId: string): Promise<boolean> {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return false

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { 
      organizationId: true,
      status: true,
    },
  })

  if (!application) return false

  // Managers and admins can modify any application
  const orgRole = (clerkUser as any).organizationMemberships?.[0]?.role
  if (orgRole === 'org:manager' || orgRole === 'org:admin') {
    return true
  }

  // Applicants can only modify DRAFT applications from their organization
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { organizationId: true },
  })

  if (!user?.organizationId) return false
  if (user.organizationId !== application.organizationId) return false

  // Can only modify drafts
  return application.status === 'DRAFT'
}

/**
 * Check if the current user has reviewer access
 */
export async function isReviewer(): Promise<boolean> {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return false

  // Temporary override: Allow specific email as reviewer
  const reviewerEmails = ['dallas.polivka@vsinsights.ai']
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress
  if (userEmail && reviewerEmails.includes(userEmail)) {
    return true
  }

  // First try to get from session
  const sessionOrgs = (clerkUser as any).organizationMemberships
  if (sessionOrgs && sessionOrgs.length > 0) {
    return true
  }

  // Fallback: Check via Clerk API
  try {
    const client = await clerkClient()
    const orgMemberships = await client.users.getOrganizationMembershipList({
      userId: clerkUser.id,
    })
    return orgMemberships.data.length > 0
  } catch (error) {
    console.error('Error checking org membership:', error)
    return false
  }
}

/**
 * Check if the current user has manager access
 */
export async function isManager(): Promise<boolean> {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return false

  // Temporary override: Allow specific email as manager
  const managerEmails = ['dallas.polivka@vsinsights.ai']
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress
  if (userEmail && managerEmails.includes(userEmail)) {
    return true
  }

  // Check session first
  const orgRole = (clerkUser as any).organizationMemberships?.[0]?.role
  if (orgRole === 'org:manager' || orgRole === 'org:admin') {
    return true
  }

  // Fallback: Check via Clerk API
  try {
    const client = await clerkClient()
    const orgMemberships = await client.users.getOrganizationMembershipList({
      userId: clerkUser.id,
    })
    
    if (orgMemberships.data.length > 0) {
      const role = orgMemberships.data[0].role
      return role === 'org:manager' || role === 'org:admin'
    }
    
    return false
  } catch (error) {
    console.error('Error checking manager access:', error)
    return false
  }
}

/**
 * Check if the current user has admin access
 */
export async function isAdmin(): Promise<boolean> {
  const clerkUser = await currentUser()
  
  if (!clerkUser) return false

  // Temporary override: Allow specific email as admin
  const adminEmails = ['dallas.polivka@vsinsights.ai']
  const userEmail = clerkUser.emailAddresses[0]?.emailAddress
  if (userEmail && adminEmails.includes(userEmail)) {
    return true
  }

  // Check session first
  const orgRole = (clerkUser as any).organizationMemberships?.[0]?.role
  if (orgRole === 'org:admin') {
    return true
  }

  // Fallback: Check via Clerk API
  try {
    const client = await clerkClient()
    const orgMemberships = await client.users.getOrganizationMembershipList({
      userId: clerkUser.id,
    })
    
    if (orgMemberships.data.length > 0) {
      const role = orgMemberships.data[0].role
      return role === 'org:admin'
    }
    
    return false
  } catch (error) {
    console.error('Error checking admin access:', error)
    return false
  }
}
