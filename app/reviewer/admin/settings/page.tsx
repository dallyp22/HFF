'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'
import {
  Settings,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  Loader2,
  Target,
  Heart,
  Facebook,
  Twitter,
  Linkedin,

  ExternalLink,
  Sparkles,
  Brain,
} from 'lucide-react'
import { EditSettingsDialog } from '@/components/admin/EditSettingsDialog'
import { toast } from 'sonner'
import Link from 'next/link'

interface FoundationSettings {
  id: string
  foundationName: string
  tagline?: string
  missionStatement: string
  visionStatement?: string
  focusAreas: string[]
  primaryEmail: string
  phoneNumber: string
  websiteUrl?: string
  streetAddress: string
  addressLine2?: string
  city: string
  state: string
  zipCode: string
  facebookUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  aiScoringPriorities?: string[]
  aiGeographicFocus?: string
  aiCustomGuidance?: string
  aiTemperature?: number
  aiMaxTokens?: number
  updatedAt: string
  updatedByName?: string
}

export default function FoundationSettingsPage() {
  const [settings, setSettings] = useState<FoundationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-40 bg-gray-100 rounded-xl" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <GlassCard className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Not Found</h3>
              <p className="text-gray-500">Foundation settings have not been configured.</p>
            </GlassCard>
          </FadeIn>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--hff-slate)]/10">
                <Settings className="w-6 h-6 text-[var(--hff-slate)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Foundation Settings</h1>
                <p className="text-gray-600">Manage foundation information and contact details</p>
              </div>
            </div>
            <Button
              onClick={() => setEditDialogOpen(true)}
              className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
            >
              <Edit className="w-4 h-4" />
              Edit Settings
            </Button>
          </div>
        </FadeIn>

        <div className="space-y-6">
          {/* Foundation Identity */}
          <FadeIn delay={0.1}>
            <GlassCard className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--hff-teal)]/5 rounded-full -mr-12 -mt-12" />
              <div className="relative">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Building2 className="w-5 h-5 text-[var(--hff-teal)]" />
                  Foundation Identity
                </h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--hff-teal)]/5 to-[var(--hff-teal)]/10 border border-[var(--hff-teal)]/20">
                    <p className="text-sm font-medium text-gray-500 mb-1">Foundation Name</p>
                    <p className="text-2xl font-bold text-gray-900">{settings.foundationName}</p>
                  </div>
                  {settings.tagline && (
                    <div className="p-4 rounded-xl bg-gray-50">
                      <p className="text-sm font-medium text-gray-500 mb-1">Tagline</p>
                      <p className="text-gray-900 italic">&ldquo;{settings.tagline}&rdquo;</p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Mission & Vision */}
          <FadeIn delay={0.15}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Target className="w-5 h-5 text-[var(--hff-teal)]" />
                Mission & Vision
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50">
                  <p className="text-sm font-medium text-gray-500 mb-2">Mission Statement</p>
                  <p className="text-gray-700 leading-relaxed">{settings.missionStatement}</p>
                </div>

                {settings.visionStatement && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm font-medium text-gray-500 mb-2">Vision Statement</p>
                    <p className="text-gray-700 leading-relaxed">{settings.visionStatement}</p>
                  </div>
                )}

                {settings.focusAreas.length > 0 && (
                  <div className="pt-4">
                    <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Focus Areas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {settings.focusAreas.map((area, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-4 py-2 rounded-full text-sm font-medium bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] border border-[var(--hff-teal)]/20"
                        >
                          {area}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Contact Information */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Heart className="w-5 h-5 text-[var(--hff-teal)]" />
                Contact Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <a
                      href={`mailto:${settings.primaryEmail}`}
                      className="text-gray-900 hover:text-[var(--hff-teal)] transition-colors"
                    >
                      {settings.primaryEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Phone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <a
                      href={`tel:${settings.phoneNumber}`}
                      className="text-gray-900 hover:text-[var(--hff-teal)] transition-colors"
                    >
                      {settings.phoneNumber}
                    </a>
                  </div>
                </div>

                {settings.websiteUrl && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 md:col-span-2">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      <a
                        href={settings.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--hff-teal)] hover:underline flex items-center gap-1"
                      >
                        {settings.websiteUrl}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          </FadeIn>

          {/* Physical Address */}
          <FadeIn delay={0.25}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <MapPin className="w-5 h-5 text-[var(--hff-teal)]" />
                Physical Address
              </h2>

              <div className="p-4 rounded-xl bg-gray-50">
                <p className="text-gray-900 font-medium">{settings.streetAddress}</p>
                {settings.addressLine2 && (
                  <p className="text-gray-700">{settings.addressLine2}</p>
                )}
                <p className="text-gray-700">
                  {settings.city}, {settings.state} {settings.zipCode}
                </p>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Social Media */}
          {(settings.facebookUrl || settings.twitterUrl || settings.linkedinUrl) && (
            <FadeIn delay={0.3}>
              <GlassCard className="p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                  <Globe className="w-5 h-5 text-[var(--hff-teal)]" />
                  Social Media
                </h2>

                <div className="flex flex-wrap gap-3">
                  {settings.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                      <span className="font-medium">Facebook</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </a>
                  )}
                  {settings.twitterUrl && (
                    <a
                      href={settings.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                      <span className="font-medium">Twitter</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </a>
                  )}
                  {settings.linkedinUrl && (
                    <a
                      href={settings.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                      <span className="font-medium">LinkedIn</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </a>
                  )}
                </div>
              </GlassCard>
            </FadeIn>
          )}

          {/* AI Scoring Configuration */}
          <FadeIn delay={0.35}>
            <GlassCard className="p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                <Brain className="w-5 h-5 text-[var(--hff-teal)]" />
                AI Scoring Configuration
              </h2>

              <div className="space-y-4">
                {/* Scoring Priorities */}
                {settings.aiScoringPriorities && settings.aiScoringPriorities.length > 0 && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm font-medium text-gray-500 mb-3">Scoring Priorities</p>
                    <ol className="space-y-2">
                      {settings.aiScoringPriorities.map((priority, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] text-xs font-medium flex items-center justify-center mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 text-sm">{priority}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Geographic Focus */}
                {settings.aiGeographicFocus && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm font-medium text-gray-500 mb-1">Geographic Focus</p>
                    <p className="text-gray-700">{settings.aiGeographicFocus}</p>
                  </div>
                )}

                {/* Custom Guidance */}
                {settings.aiCustomGuidance && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm font-medium text-gray-500 mb-1">Custom Guidance</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{settings.aiCustomGuidance}</p>
                  </div>
                )}

                {/* Temperature & Max Tokens */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm font-medium text-gray-500 mb-1">Temperature</p>
                    <p className="text-gray-900 font-medium">
                      {settings.aiTemperature?.toFixed(1) ?? '0.3'}
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({(settings.aiTemperature ?? 0.3) <= 0.3 ? 'Consistent' : (settings.aiTemperature ?? 0.3) >= 0.7 ? 'Creative' : 'Balanced'})
                      </span>
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50">
                    <p className="text-sm font-medium text-gray-500 mb-1">Max Tokens</p>
                    <p className="text-gray-900 font-medium">{settings.aiMaxTokens ?? 2000}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Last Updated */}
          {settings.updatedByName && (
            <FadeIn delay={0.4}>
              <div className="text-sm text-gray-500 text-center py-4">
                Last updated by <span className="font-medium">{settings.updatedByName}</span> on{' '}
                {new Date(settings.updatedAt).toLocaleString()}
              </div>
            </FadeIn>
          )}
        </div>

        {/* Edit Dialog */}
        <EditSettingsDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          settings={settings}
          onSuccess={() => {
            fetchSettings()
            setEditDialogOpen(false)
          }}
        />
      </div>
    </div>
  )
}
