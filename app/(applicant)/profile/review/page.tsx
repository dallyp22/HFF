'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  DollarSign,
  User,
  Edit,
  CheckCircle2,
  AlertCircle,
  Shield,
  Target,
  Clock,
  Loader2,
  ArrowRight,
  ExternalLink,
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
  executiveDirectorPhone: string | null
  devDirectorName: string | null
  devDirectorEmail: string | null
  devDirectorPhone: string | null
  devDirectorTitle: string | null
  annualBudget: number | null
  fiscalYearEnd: string | null
  form990Year: number | null
  form990TotalRevenue: number | null
  form990TotalExpenses: number | null
  form990NetAssets: number | null
  fullTimeStaff: number | null
  partTimeStaff: number | null
  volunteers: number | null
  boardMembers: number | null
  profileComplete: boolean
  updatedAt: string
}

export default function ProfileReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cycleId = searchParams.get('cycleId')
  const returnTo = searchParams.get('returnTo') || '/loi/new'

  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/organizations')
        if (response.ok) {
          const data = await response.json()
          if (data && data.id) {
            setOrg(data)
          } else if (data.organization) {
            setOrg(data.organization)
          } else {
            toast.error('No organization profile found')
            router.push('/profile/edit')
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleConfirm = async () => {
    if (!cycleId) {
      toast.error('Missing cycle information')
      return
    }

    setConfirming(true)
    try {
      const response = await fetch('/api/organizations/review-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId }),
      })

      if (response.ok) {
        toast.success('Profile confirmed as up to date')
        router.push(returnTo)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to confirm profile')
      }
    } catch (error) {
      console.error('Error confirming profile:', error)
      toast.error('Failed to confirm profile')
    } finally {
      setConfirming(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(amount))
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    }
    const years = Math.floor(diffDays / 365)
    return `${years} year${years > 1 ? 's' : ''} ago`
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
    return null
  }

  const sections = [
    {
      title: 'Basic Information',
      icon: Building2,
      color: 'bg-[var(--hff-teal)]/10 text-[var(--hff-teal)]',
      items: [
        { label: 'Legal Name', value: org.legalName },
        { label: 'DBA Name', value: org.dbaName },
        { label: 'EIN', value: org.ein },
        { label: 'Year Founded', value: org.yearFounded },
      ].filter((item) => item.value),
    },
    {
      title: 'Address',
      icon: MapPin,
      color: 'bg-[var(--hff-sage)]/20 text-[var(--hff-sage)]',
      items: [
        { label: 'Street', value: org.address },
        { label: 'Line 2', value: org.addressLine2 },
        { label: 'City, State ZIP', value: `${org.city}, ${org.state} ${org.zipCode}` },
      ].filter((item) => item.value),
    },
    {
      title: 'Contact',
      icon: Phone,
      color: 'bg-blue-100 text-blue-600',
      items: [
        { label: 'Phone', value: org.phone },
        { label: 'Website', value: org.website, isLink: true },
      ].filter((item) => item.value),
    },
    {
      title: 'Leadership',
      icon: User,
      color: 'bg-purple-100 text-purple-600',
      items: [
        { label: 'Executive Director', value: org.executiveDirectorName },
        { label: 'ED Email', value: org.executiveDirectorEmail },
        { label: 'ED Phone', value: org.executiveDirectorPhone },
        { label: 'Dev Director', value: org.devDirectorName },
        { label: 'Dev Director Email', value: org.devDirectorEmail },
      ].filter((item) => item.value),
    },
    {
      title: 'Financial Information',
      icon: DollarSign,
      color: 'bg-[var(--hff-gold)]/20 text-[var(--hff-gold)]',
      highlight: true,
      items: [
        { label: 'Annual Budget', value: formatCurrency(org.annualBudget) },
        { label: 'Fiscal Year End', value: org.fiscalYearEnd },
        { label: 'Most Recent 990 Year', value: org.form990Year },
        { label: '990 Total Revenue', value: formatCurrency(org.form990TotalRevenue) },
        { label: '990 Total Expenses', value: formatCurrency(org.form990TotalExpenses) },
        { label: '990 Net Assets', value: formatCurrency(org.form990NetAssets) },
      ].filter((item) => item.value),
    },
    {
      title: 'Organizational Capacity',
      icon: Shield,
      color: 'bg-emerald-100 text-emerald-600',
      items: [
        { label: 'Full-Time Staff', value: org.fullTimeStaff },
        { label: 'Part-Time Staff', value: org.partTimeStaff },
        { label: 'Volunteers', value: org.volunteers },
        { label: 'Board Members', value: org.boardMembers },
      ].filter((item) => item.value),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <FadeIn>
          <GlassCard variant="elevated" className="p-6 md:p-8 mb-8 overflow-hidden relative" hover={false}>
            <div className="absolute top-0 right-0 w-40 h-40 opacity-5">
              <Shield className="w-full h-full" />
            </div>

            <div className="relative z-10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <AlertCircle className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Review Your Organization Profile
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Before starting a new Letter of Interest, please review your organization
                    profile and confirm that all information is current and accurate.
                  </p>
                </div>
              </div>

              {org.updatedAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded-xl">
                  <Clock className="w-4 h-4" />
                  <span>Profile last updated: <strong>{getTimeAgo(org.updatedAt)}</strong></span>
                </div>
              )}
            </div>
          </GlassCard>
        </FadeIn>

        {/* Mission Statement */}
        {org.missionStatement && (
          <FadeIn delay={0.05}>
            <GlassCard className="p-5 mb-6" hover={false}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[var(--hff-teal)]" />
                <h3 className="text-sm font-medium text-gray-700">Mission Statement</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{org.missionStatement}</p>
            </GlassCard>
          </FadeIn>
        )}

        {/* Information Sections */}
        <StaggerContainer className="grid md:grid-cols-2 gap-4 mb-8" staggerDelay={0.05}>
          {sections.map((section) => {
            if (section.items.length === 0) return null
            const Icon = section.icon

            return (
              <StaggerItem key={section.title}>
                <GlassCard
                  hover={false}
                  className={cn(
                    'p-5 h-full',
                    section.highlight && 'ring-1 ring-amber-200 bg-amber-50/30'
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          section.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    </div>
                    {section.highlight && (
                      <GlassBadge variant="warning" size="sm">
                        Verify
                      </GlassBadge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {item.label}
                        </span>
                        {(item as any).isLink ? (
                          <a
                            href={item.value as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--hff-teal)] hover:underline flex items-center gap-1 mt-0.5"
                          >
                            {item.value}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-gray-900 font-medium mt-0.5">
                            {String(item.value)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Action Buttons */}
        <FadeIn delay={0.3}>
          <GlassCard variant="teal" className="p-6" hover={false}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Is this information up to date?
                </h3>
                <p className="text-sm text-gray-600">
                  If anything needs updating, edit your profile first. Otherwise, confirm to proceed.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  variant="outline"
                  asChild
                  className="gap-2"
                >
                  <Link href={`/profile/edit?returnTo=/profile/review${cycleId ? `?cycleId=${cycleId}&returnTo=${encodeURIComponent(returnTo)}` : ''}`}>
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={confirming || !cycleId}
                  className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] shadow-lg shadow-[var(--hff-teal)]/20"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      I Confirm This Is Up To Date
                    </>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>
        </FadeIn>
      </div>
    </div>
  )
}
