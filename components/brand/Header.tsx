'use client'

import { Logo } from './Logo'
import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  variant?: 'public' | 'applicant' | 'reviewer'
}

export function Header({ variant = 'public' }: HeaderProps) {
  const { isSignedIn, user } = useUser()
  const isReviewer = (user as any)?.organizationMemberships && (user as any).organizationMemberships.length > 0

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo variant="full-color" size="sm" />
          
          {variant === 'applicant' && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/profile" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                Profile
              </Link>
              <Link 
                href="/documents" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                Documents
              </Link>
              <Link 
                href="/applications" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                Applications
              </Link>
            </nav>
          )}

          {variant === 'reviewer' && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/reviewer/dashboard" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/reviewer/applications" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                Applications
              </Link>
              <Link 
                href="/reviewer/organizations" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                Organizations
              </Link>
              {(isReviewer && (user as any).organizationMemberships?.[0]?.role === 'org:admin') || 
               (user?.emailAddresses?.[0]?.emailAddress === 'dallas.polivka@vsinsights.ai') ? (
                <Link 
                  href="/reviewer/admin" 
                  className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
                >
                  Admin
                </Link>
              ) : null}
            </nav>
          )}

          {variant === 'public' && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/about" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                About
              </Link>
              <Link 
                href="/eligibility" 
                className="text-sm font-medium text-gray-700 hover:text-[var(--hff-teal)] transition-colors"
              >
                Eligibility
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-9 w-9'
                }
              }}
            />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-dark)]">
                <Link href="/sign-up">Apply for Grant</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
