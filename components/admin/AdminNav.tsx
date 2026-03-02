'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Shield,
  Calendar,
  Users,
  Link as LinkIcon,
  Bell,
  Settings,
  Database,
} from 'lucide-react'

const adminNavItems = [
  { href: '/reviewer/admin', label: 'Dashboard', icon: Shield, exact: true },
  { href: '/reviewer/admin/cycles', label: 'Cycles', icon: Calendar },
  { href: '/reviewer/admin/users', label: 'Reviewers', icon: Users },
  { href: '/reviewer/admin/invitations', label: 'Invites', icon: LinkIcon },
  { href: '/reviewer/admin/releases', label: 'Releases', icon: Bell },
  { href: '/reviewer/admin/settings', label: 'Settings', icon: Settings },
  { href: '/reviewer/admin/reset', label: 'Data', icon: Database },
]

export function AdminNav() {
  const pathname = usePathname()

  const isActive = (item: (typeof adminNavItems)[number]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="border-b border-gray-200/60 bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <nav className="flex gap-1 overflow-x-auto scrollbar-none -mb-px" aria-label="Admin navigation">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap',
                  'border-b-2 transition-colors duration-150',
                  active
                    ? 'border-[var(--hff-teal)] text-[var(--hff-teal)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
