'use client'

import { Logo } from './Logo'
import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

interface HeaderProps {
  variant?: 'public' | 'applicant' | 'reviewer'
}

const navLinks = {
  public: [
    { href: '/about', label: 'About' },
    { href: '/eligibility', label: 'Eligibility' },
  ],
  applicant: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/applications', label: 'Applications' },
    { href: '/documents', label: 'Documents' },
    { href: '/profile', label: 'Profile' },
  ],
  reviewer: [
    { href: '/reviewer/dashboard', label: 'Dashboard' },
    { href: '/reviewer/applications', label: 'Applications' },
    { href: '/reviewer/organizations', label: 'Organizations' },
  ],
}

export function Header({ variant = 'public' }: HeaderProps) {
  const { isSignedIn, user } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { scrollY } = useScroll()
  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)']
  )
  const headerBlur = useTransform(scrollY, [0, 50], ['blur(0px)', 'blur(20px)'])
  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(32, 70, 82, 0.1)']
  )
  const headerShadow = useTransform(
    scrollY,
    [0, 50],
    ['0 0 0 rgba(0,0,0,0)', '0 4px 30px rgba(32, 70, 82, 0.08)']
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const isReviewer =
    (user as any)?.organizationMemberships &&
    (user as any).organizationMemberships.length > 0
  const isAdmin =
    (isReviewer && (user as any).organizationMemberships?.[0]?.role === 'org:admin') ||
    user?.emailAddresses?.[0]?.emailAddress === 'dallas.polivka@vsinsights.ai'

  const links = navLinks[variant]

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
      <motion.header
        style={{
          backgroundColor: headerBg,
          backdropFilter: headerBlur,
          WebkitBackdropFilter: headerBlur,
          borderBottomColor: headerBorder,
          boxShadow: headerShadow,
        }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'border-b transition-colors duration-300'
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Logo variant="full-color" size="sm" />
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
              {variant === 'reviewer' && isAdmin && (
                <NavLink href="/reviewer/admin">Admin</NavLink>
              )}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {mounted && isSignedIn ? (
              <div className="flex items-center gap-3">
                {/* User menu */}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox:
                        'h-9 w-9 ring-2 ring-white/50 ring-offset-2 ring-offset-transparent',
                    },
                  }}
                />
              </div>
            ) : (
              mounted && (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="hidden sm:inline-flex text-gray-700 hover:text-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/5"
                  >
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className={cn(
                      'bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]',
                      'shadow-lg shadow-[var(--hff-teal)]/20',
                      'transition-all duration-200 hover:shadow-xl hover:shadow-[var(--hff-teal)]/30'
                    )}
                  >
                    <Link href="/sign-up">Apply for Grant</Link>
                  </Button>
                </>
              )
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5 text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
            >
              <nav className="container mx-auto px-4 py-4 space-y-1">
                {links.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 rounded-xl text-base font-medium',
                        'text-gray-700 hover:text-[var(--hff-teal)]',
                        'hover:bg-[var(--hff-teal)]/5 transition-colors'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {variant === 'reviewer' && isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: links.length * 0.05 }}
                  >
                    <Link
                      href="/reviewer/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 rounded-xl text-base font-medium',
                        'text-gray-700 hover:text-[var(--hff-teal)]',
                        'hover:bg-[var(--hff-teal)]/5 transition-colors'
                      )}
                    >
                      Admin
                    </Link>
                  </motion.div>
                )}
                {!isSignedIn && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (links.length + 1) * 0.05 }}
                    className="pt-4 border-t border-gray-100"
                  >
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 rounded-xl text-base font-medium',
                        'text-gray-700 hover:text-[var(--hff-teal)]',
                        'hover:bg-[var(--hff-teal)]/5 transition-colors'
                      )}
                    >
                      Sign In
                    </Link>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  )
}

// Nav link component with hover effects
function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative px-4 py-2 text-sm font-medium rounded-lg',
        'text-gray-600 hover:text-[var(--hff-teal)]',
        'transition-colors duration-200',
        'group'
      )}
    >
      {children}
      {/* Hover underline effect */}
      <span
        className={cn(
          'absolute bottom-1 left-4 right-4 h-0.5 rounded-full',
          'bg-[var(--hff-teal)] transform scale-x-0 origin-left',
          'transition-transform duration-200 ease-out',
          'group-hover:scale-x-100'
        )}
      />
    </Link>
  )
}
