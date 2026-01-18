'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  User,
  Edit,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Target,
  Shield,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'

interface Organization {
  id: string
  legalName: string
  dbaName: string | null
  ein: string
  yearFounded: number | null
  address: string
  addressLine2: string | null
  city: string
  state: string
  zipCode: string
  phone: string
  website: string | null
  missionStatement: string | null
  executiveDirectorName: string | null
  executiveDirectorEmail: string | null
  annualBudget: number | null
  form990Year: number | null
  profileComplete: boolean
}

interface ProfileData {
  organization: Organization | null
  profileCompletion: number
}

interface SectionItem {
  label: string
  value: string | number | null
  isLink?: boolean
  isEmail?: boolean
  copyable?: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedEin, setCopiedEin] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const result = await response.json()
          setData(result)

          // Redirect to edit page if no organization
          if (!result.organization) {
            router.push('/profile/edit')
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const org = data?.organization
  const completion = data?.profileCompletion ?? 0

  const copyEin = () => {
    if (org?.ein) {
      navigator.clipboard.writeText(org.ein)
      setCopiedEin(true)
      toast.success('EIN copied to clipboard')
      setTimeout(() => setCopiedEin(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!org) {
    return null // Will redirect
  }

  const sections: Array<{
    title: string
    icon: typeof Building2
    color: string
    items: SectionItem[]
  }> = [
    {
      title: 'Basic Information',
      icon: Building2,
      color: 'bg-[var(--hff-teal)]/10 text-[var(--hff-teal)]',
      items: ([
        { label: 'Legal Name', value: org.legalName },
        { label: 'DBA Name', value: org.dbaName },
        { label: 'EIN', value: org.ein, copyable: true },
        { label: 'Year Founded', value: org.yearFounded },
      ] as SectionItem[]).filter((item) => item.value),
    },
    {
      title: 'Address',
      icon: MapPin,
      color: 'bg-[var(--hff-sage)]/20 text-[var(--hff-sage)]',
      items: ([
        { label: 'Street', value: org.address },
        { label: 'Line 2', value: org.addressLine2 },
        { label: 'City', value: org.city },
        { label: 'State', value: org.state },
        { label: 'ZIP', value: org.zipCode },
      ] as SectionItem[]).filter((item) => item.value),
    },
    {
      title: 'Contact',
      icon: Phone,
      color: 'bg-blue-100 text-blue-600',
      items: ([
        { label: 'Phone', value: org.phone },
        { label: 'Website', value: org.website, isLink: true },
      ] as SectionItem[]).filter((item) => item.value),
    },
    {
      title: 'Leadership',
      icon: User,
      color: 'bg-purple-100 text-purple-600',
      items: ([
        { label: 'Executive Director', value: org.executiveDirectorName },
        { label: 'Email', value: org.executiveDirectorEmail, isEmail: true },
      ] as SectionItem[]).filter((item) => item.value),
    },
    {
      title: 'Financial',
      icon: DollarSign,
      color: 'bg-[var(--hff-gold)]/20 text-[var(--hff-gold)]',
      items: ([
        { label: 'Annual Budget', value: org.annualBudget ? `$${org.annualBudget.toLocaleString()}` : null },
        { label: 'Most Recent 990', value: org.form990Year },
      ] as SectionItem[]).filter((item) => item.value),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <FadeIn>
          <GlassCard variant="elevated" className="p-6 md:p-8 mb-8 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
              <Building2 className="w-full h-full" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--hff-teal)] to-[var(--hff-teal-800)] flex items-center justify-center shadow-lg shadow-[var(--hff-teal)]/20">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{org.legalName}</h1>
                    {org.dbaName && (
                      <p className="text-gray-500 mt-1">DBA: {org.dbaName}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={copyEin}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[var(--hff-teal)] transition-colors"
                      >
                        <span className="font-mono">EIN: {org.ein}</span>
                        {copiedEin ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Completion Badge */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-gray-200"
                        />
                        <motion.circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className={completion === 100 ? 'text-green-500' : 'text-orange-500'}
                          strokeLinecap="round"
                          initial={{ strokeDasharray: '0 126' }}
                          animate={{ strokeDasharray: `${(completion / 100) * 126} 126` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {completion === 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <span className="text-xs font-bold">{completion}%</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className={cn('font-medium', completion === 100 ? 'text-green-600' : 'text-orange-600')}>
                        {completion === 100 ? 'Complete' : 'Incomplete'}
                      </p>
                      <p className="text-gray-500">Profile</p>
                    </div>
                  </div>

                  <Button asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]">
                    <Link href="/profile/edit">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Mission Statement */}
              {org.missionStatement && (
                <div className="mt-6 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-[var(--hff-teal)]" />
                    <h3 className="text-sm font-medium text-gray-700">Mission</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{org.missionStatement}</p>
                </div>
              )}
            </div>
          </GlassCard>
        </FadeIn>

        {/* Information Sections */}
        <StaggerContainer className="grid md:grid-cols-2 gap-4" staggerDelay={0.05}>
          {sections.map((section) => {
            if (section.items.length === 0) return null
            const Icon = section.icon

            return (
              <StaggerItem key={section.title}>
                <GlassCard hover className="p-5 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', section.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>

                  <div className="space-y-3">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</span>
                        {item.isLink ? (
                          <a
                            href={item.value as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--hff-teal)] hover:underline flex items-center gap-1 mt-0.5"
                          >
                            {item.value}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : item.isEmail ? (
                          <a
                            href={`mailto:${item.value}`}
                            className="text-[var(--hff-teal)] hover:underline mt-0.5"
                          >
                            {item.value}
                          </a>
                        ) : item.copyable ? (
                          <button
                            onClick={copyEin}
                            className="flex items-center gap-1.5 text-gray-900 font-medium hover:text-[var(--hff-teal)] transition-colors mt-0.5"
                          >
                            <span className="font-mono">{item.value}</span>
                            {copiedEin ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          <span className="text-gray-900 font-medium mt-0.5">{item.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Quick Actions */}
        <FadeIn delay={0.3}>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/applications">
                <FileText className="w-4 h-4 mr-2" />
                View Applications
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/documents">
                <Shield className="w-4 h-4 mr-2" />
                Manage Documents
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/applications/new">
                <Briefcase className="w-4 h-4 mr-2" />
                New Application
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
