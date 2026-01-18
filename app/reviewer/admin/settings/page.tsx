'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'
import { EditSettingsDialog } from '@/components/admin/EditSettingsDialog'
import { toast } from 'sonner'

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
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600">Settings not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Foundation Settings</h1>
            <p className="text-gray-600">
              Manage foundation information and contact details
            </p>
          </div>
          <Button onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Settings
          </Button>
        </div>

        <div className="space-y-6">
          {/* Foundation Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[var(--hff-teal)]" />
                Foundation Identity
              </CardTitle>
              <CardDescription>Basic information about the foundation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Foundation Name</label>
                <p className="text-lg font-semibold">{settings.foundationName}</p>
              </div>
              {settings.tagline && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tagline</label>
                  <p className="text-gray-900">{settings.tagline}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mission & Vision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[var(--hff-teal)]" />
                Mission & Vision
              </CardTitle>
              <CardDescription>Foundation purpose and goals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Mission Statement</label>
                <p className="text-gray-900 mt-1">{settings.missionStatement}</p>
              </div>
              {settings.visionStatement && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Vision Statement</label>
                  <p className="text-gray-900 mt-1">{settings.visionStatement}</p>
                </div>
              )}
              {settings.focusAreas.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Focus Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {settings.focusAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="bg-[var(--hff-teal-50)] text-[var(--hff-teal)]">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-[var(--hff-teal)]" />
                Contact Information
              </CardTitle>
              <CardDescription>Primary contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{settings.primaryEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{settings.phoneNumber}</p>
                </div>
              </div>
              {settings.websiteUrl && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-600">Website</label>
                    <a 
                      href={settings.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--hff-teal)] hover:underline"
                    >
                      {settings.websiteUrl}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Physical Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[var(--hff-teal)]" />
                Physical Address
              </CardTitle>
              <CardDescription>Foundation mailing address</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900">
                <p>{settings.streetAddress}</p>
                {settings.addressLine2 && <p>{settings.addressLine2}</p>}
                <p>{settings.city}, {settings.state} {settings.zipCode}</p>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          {(settings.facebookUrl || settings.twitterUrl || settings.linkedinUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[var(--hff-teal)]" />
                  Social Media
                </CardTitle>
                <CardDescription>Social media presence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {settings.facebookUrl && (
                  <div className="flex items-center gap-3">
                    <Facebook className="h-4 w-4 text-gray-500" />
                    <a 
                      href={settings.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--hff-teal)] hover:underline text-sm"
                    >
                      {settings.facebookUrl}
                    </a>
                  </div>
                )}
                {settings.twitterUrl && (
                  <div className="flex items-center gap-3">
                    <Twitter className="h-4 w-4 text-gray-500" />
                    <a 
                      href={settings.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--hff-teal)] hover:underline text-sm"
                    >
                      {settings.twitterUrl}
                    </a>
                  </div>
                )}
                {settings.linkedinUrl && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-gray-500" />
                    <a 
                      href={settings.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--hff-teal)] hover:underline text-sm"
                    >
                      {settings.linkedinUrl}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Last Updated */}
          {settings.updatedByName && (
            <div className="text-sm text-gray-500 text-center">
              Last updated by {settings.updatedByName} on{' '}
              {new Date(settings.updatedAt).toLocaleString()}
            </div>
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
