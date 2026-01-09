import { currentUser as clerkCurrentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentUser() {
  const clerkUser = await clerkCurrentUser()
  
  if (!clerkUser) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      organization: true,
    },
  })

  return user
}

export async function getCurrentUserWithOrgRole() {
  const clerkUser = await clerkCurrentUser()
  
  if (!clerkUser) {
    return { user: null, isReviewer: false, isManager: false, isAdmin: false }
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      organization: true,
    },
  })

  // Check organization role from Clerk
  const orgRole = clerkUser.organizationMemberships?.[0]?.role
  
  return {
    user,
    isReviewer: !!orgRole,
    isManager: orgRole === 'org:manager' || orgRole === 'org:admin',
    isAdmin: orgRole === 'org:admin',
  }
}
