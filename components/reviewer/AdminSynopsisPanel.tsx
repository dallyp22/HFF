'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FileEdit, Save, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AdminSynopsisPanelProps {
  entityId: string
  entityType: 'application' | 'loi'
  adminSynopsis?: string
  adminSynopsisBy?: string
  adminSynopsisAt?: string
  userIsAdmin: boolean
}

export function AdminSynopsisPanel({
  entityId,
  entityType,
  adminSynopsis,
  adminSynopsisBy,
  adminSynopsisAt,
  userIsAdmin,
}: AdminSynopsisPanelProps) {
  const [synopsis, setSynopsis] = useState(adminSynopsis || '')
  const [saving, setSaving] = useState(false)
  const [lastSavedBy, setLastSavedBy] = useState(adminSynopsisBy)
  const [lastSavedAt, setLastSavedAt] = useState(adminSynopsisAt)

  async function handleSave() {
    if (!synopsis.trim()) {
      toast.error('Please enter a synopsis before saving')
      return
    }

    setSaving(true)
    try {
      const endpoint =
        entityType === 'loi'
          ? `/api/loi/${entityId}`
          : `/api/applications/${entityId}`

      const now = new Date().toISOString()

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSynopsis: synopsis.trim(),
          adminSynopsisBy: 'current-user',
          adminSynopsisAt: now,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setLastSavedBy(data.adminSynopsisBy || 'Admin')
        setLastSavedAt(data.adminSynopsisAt || now)
        toast.success('Synopsis saved successfully')
      } else {
        toast.error('Failed to save synopsis')
      }
    } catch (error) {
      console.error('Error saving synopsis:', error)
      toast.error('Failed to save synopsis')
    } finally {
      setSaving(false)
    }
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-[var(--hff-teal)]/10">
          <FileEdit className="w-4 h-4 text-[var(--hff-teal)]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Admin Synopsis</h3>
        {lastSavedAt && (
          <span className="ml-auto text-xs text-gray-400">
            {lastSavedBy && <>{lastSavedBy} &middot; </>}
            {formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true })}
          </span>
        )}
      </div>

      {userIsAdmin ? (
        <div className="space-y-3">
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            placeholder="Write a brief admin synopsis for this application..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white/50 px-3 py-2 text-sm text-gray-700 leading-relaxed placeholder:text-gray-400 focus:border-[var(--hff-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/20 resize-none transition-colors"
          />
          <div className="flex items-center justify-end">
            <Button
              onClick={handleSave}
              disabled={!synopsis.trim() || saving}
              size="sm"
              className="gap-1.5 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Synopsis'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {adminSynopsis || 'No synopsis yet.'}
        </p>
      )}
    </GlassCard>
  )
}
