'use client'

import Link from 'next/link'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Mail, MapPin, ArrowUpRight, Heart } from 'lucide-react'

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/eligibility', label: 'Eligibility' },
  { href: '/sign-in', label: 'Sign In' },
  { href: '/sign-up', label: 'Apply Now' },
]

const resourceLinks = [
  { href: '/dashboard', label: 'Applicant Portal' },
  { href: '/documents', label: 'Document Library' },
  { href: '/applications', label: 'My Applications' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[var(--hff-teal-50)]/50 to-[var(--hff-teal-50)]" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--hff-teal)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--hff-gold)]/5 rounded-full blur-3xl" />

      <div className="relative">
        {/* Main footer content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <Logo variant="full-color" size="md" />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xs">
                To encourage and multiply opportunities for children in poverty across our community.
              </p>

              {/* Contact info */}
              <div className="space-y-3">
                <a
                  href="mailto:grants@heistandfamilyfoundation.org"
                  className={cn(
                    'flex items-center gap-2 text-sm text-gray-600',
                    'hover:text-[var(--hff-teal)] transition-colors group'
                  )}
                >
                  <Mail className="w-4 h-4 text-[var(--hff-teal)]" />
                  <span>grants@heistandfamilyfoundation.org</span>
                </a>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-[var(--hff-teal)] mt-0.5 flex-shrink-0" />
                  <span>Serving the Omaha/Council Bluffs metro area and Western Iowa</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Applicant Resources
              </h3>
              <ul className="space-y-3">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grant Cycles */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Grant Cycles
              </h3>
              <div className="space-y-4">
                <div className={cn(
                  'p-4 rounded-xl',
                  'bg-white/60 backdrop-blur-sm border border-[var(--hff-teal)]/10',
                  'transition-all duration-200 hover:border-[var(--hff-teal)]/20'
                )}>
                  <p className="text-xs font-medium text-[var(--hff-teal)] uppercase tracking-wide mb-1">
                    Spring 2026
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    LOI Deadline: Feb 15
                  </p>
                </div>
                <div className={cn(
                  'p-4 rounded-xl',
                  'bg-white/60 backdrop-blur-sm border border-[var(--hff-gold)]/10',
                  'transition-all duration-200 hover:border-[var(--hff-gold)]/20'
                )}>
                  <p className="text-xs font-medium text-[var(--hff-gold)] uppercase tracking-wide mb-1">
                    Fall 2026
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    LOI Deadline: Jul 15
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--hff-teal)]/10">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                &copy; {currentYear} Heistand Family Foundation. All rights reserved.
              </p>

              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                Made with
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  <Heart className="w-4 h-4 text-[var(--hff-coral)] fill-[var(--hff-coral)]" />
                </motion.span>
                for our community
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  children,
  external = false,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
}) {
  const Component = external ? 'a' : Link

  return (
    <Component
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'group flex items-center gap-1 text-sm text-gray-600',
        'hover:text-[var(--hff-teal)] transition-colors duration-200'
      )}
    >
      <span>{children}</span>
      {external && (
        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
      )}
    </Component>
  )
}
