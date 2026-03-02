'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FadeIn } from '@/components/motion/FadeIn'
import {
  Link as LinkIcon,

  Copy,
  Check,
  Mail,
  Send,
  Loader2,
  ExternalLink,
  Info,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const PRODUCTION_URL = 'https://hff-five.vercel.app'

export default function InvitationsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  const signUpUrl = `${PRODUCTION_URL}/sign-up`
  const signInUrl = `${PRODUCTION_URL}/sign-in`

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleSendInvite = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send invitation')
      }

      toast.success(`Invitation sent to ${email}`)
      setEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/10">
                <LinkIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Applicant Invite Links
                </h1>
                <p className="text-gray-600">
                  Share registration links with nonprofit organizations
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Registration Links */}
        <FadeIn delay={0.1}>
          <GlassCard className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Registration Links
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Share these links with nonprofit organizations so they can create
              an account and begin the application process.
            </p>

            <div className="space-y-4">
              {/* Sign Up Link */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  New Applicant Registration
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={signUpUrl}
                    className="rounded-xl bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl shrink-0"
                    onClick={() => copyToClipboard(signUpUrl, 'signup')}
                  >
                    {copied === 'signup' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl shrink-0"
                    asChild
                  >
                    <a href={signUpUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  For organizations that need to create a new account
                </p>
              </div>

              {/* Sign In Link */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Returning Applicant Sign In
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={signInUrl}
                    className="rounded-xl bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    className="rounded-xl shrink-0"
                    onClick={() => copyToClipboard(signInUrl, 'signin')}
                  >
                    {copied === 'signin' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl shrink-0"
                    asChild
                  >
                    <a href={signInUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  For organizations that already have an account
                </p>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Send Email Invitation */}
        <FadeIn delay={0.15}>
          <GlassCard className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Send Email Invitation
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Send a direct email invitation to a nonprofit organization. They
              will receive a link to create their account and get started.
            </p>

            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="organization@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
                className="rounded-xl"
              />
              <Button
                onClick={handleSendInvite}
                disabled={sending || !email.trim()}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Invite
              </Button>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Info Box */}
        <FadeIn delay={0.2}>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How applicant registration works</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Share the registration link with the organization</li>
                  <li>They create an account using their email</li>
                  <li>They complete their organization profile</li>
                  <li>They can then submit Letters of Interest and applications</li>
                </ol>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
