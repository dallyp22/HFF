'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CycleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cycle?: any
  mode: 'create' | 'edit'
}

export function CycleFormDialog({ open, onOpenChange, cycle, mode }: CycleFormDialogProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    cycle: cycle?.cycle || 'SPRING',
    year: cycle?.year || new Date().getFullYear() + 1,
    loiOpenDate: cycle?.loiOpenDate ? new Date(cycle.loiOpenDate).toISOString().split('T')[0] : '',
    loiDeadline: cycle?.loiDeadline ? new Date(cycle.loiDeadline).toISOString().split('T')[0] : '',
    loiReviewDeadline: cycle?.loiReviewDeadline ? new Date(cycle.loiReviewDeadline).toISOString().split('T')[0] : '',
    fullAppOpenDate: cycle?.fullAppOpenDate ? new Date(cycle.fullAppOpenDate).toISOString().split('T')[0] : '',
    fullAppDeadline: cycle?.fullAppDeadline ? new Date(cycle.fullAppDeadline).toISOString().split('T')[0] : '',
    reviewStartDate: cycle?.reviewStartDate ? new Date(cycle.reviewStartDate).toISOString().split('T')[0] : '',
    decisionDate: cycle?.decisionDate ? new Date(cycle.decisionDate).toISOString().split('T')[0] : '',
    maxRequestAmount: cycle?.maxRequestAmount || '',
    isActive: cycle?.isActive || false,
    acceptingLOIs: cycle?.acceptingLOIs || false,
    acceptingApplications: cycle?.acceptingApplications || false,
  })

  useEffect(() => {
    if (cycle && mode === 'edit') {
      setFormData({
        cycle: cycle.cycle,
        year: cycle.year,
        loiOpenDate: cycle.loiOpenDate ? new Date(cycle.loiOpenDate).toISOString().split('T')[0] : '',
        loiDeadline: cycle.loiDeadline ? new Date(cycle.loiDeadline).toISOString().split('T')[0] : '',
        loiReviewDeadline: cycle.loiReviewDeadline ? new Date(cycle.loiReviewDeadline).toISOString().split('T')[0] : '',
        fullAppOpenDate: cycle.fullAppOpenDate ? new Date(cycle.fullAppOpenDate).toISOString().split('T')[0] : '',
        fullAppDeadline: cycle.fullAppDeadline ? new Date(cycle.fullAppDeadline).toISOString().split('T')[0] : '',
        reviewStartDate: cycle.reviewStartDate ? new Date(cycle.reviewStartDate).toISOString().split('T')[0] : '',
        decisionDate: cycle.decisionDate ? new Date(cycle.decisionDate).toISOString().split('T')[0] : '',
        maxRequestAmount: cycle.maxRequestAmount || '',
        isActive: cycle.isActive,
        acceptingLOIs: cycle.acceptingLOIs || false,
        acceptingApplications: cycle.acceptingApplications || false,
      })
    }
  }, [cycle, mode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.loiDeadline) {
      toast.error('LOI Deadline is required')
      return
    }

    setSubmitting(true)
    try {
      const url = mode === 'create' 
        ? '/api/admin/cycles'
        : `/api/admin/cycles/${cycle.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(`Cycle ${mode === 'create' ? 'created' : 'updated'} successfully`)
        onOpenChange(false)
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${mode} cycle`)
      }
    } catch (error) {
      toast.error(`Failed to ${mode} cycle`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create' : 'Edit'} Grant Cycle</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Set up a new grant cycle' : 'Update grant cycle details'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cycle *</Label>
              <Select
                value={formData.cycle}
                onValueChange={(value) => setFormData({ ...formData, cycle: value })}
                disabled={mode === 'edit'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SPRING">Spring</SelectItem>
                  <SelectItem value="FALL">Fall</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Year *</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                disabled={mode === 'edit'}
                min={2024}
                max={2050}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">LOI Phase Dates</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LOI Open Date</Label>
                <Input
                  type="date"
                  value={formData.loiOpenDate}
                  onChange={(e) => setFormData({ ...formData, loiOpenDate: e.target.value })}
                />
                <p className="text-xs text-gray-500">When applicants can start submitting LOIs</p>
              </div>

              <div className="space-y-2">
                <Label>LOI Deadline *</Label>
                <Input
                  type="date"
                  value={formData.loiDeadline}
                  onChange={(e) => setFormData({ ...formData, loiDeadline: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500">Last day to submit LOIs</p>
              </div>

              <div className="space-y-2">
                <Label>LOI Review Deadline</Label>
                <Input
                  type="date"
                  value={formData.loiReviewDeadline}
                  onChange={(e) => setFormData({ ...formData, loiReviewDeadline: e.target.value })}
                />
                <p className="text-xs text-gray-500">Deadline for admin to review all LOIs</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Full Application Phase Dates</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Application Open Date</Label>
                <Input
                  type="date"
                  value={formData.fullAppOpenDate}
                  onChange={(e) => setFormData({ ...formData, fullAppOpenDate: e.target.value })}
                />
                <p className="text-xs text-gray-500">When approved LOI applicants can start full applications</p>
              </div>

              <div className="space-y-2">
                <Label>Full Application Deadline</Label>
                <Input
                  type="date"
                  value={formData.fullAppDeadline}
                  onChange={(e) => setFormData({ ...formData, fullAppDeadline: e.target.value })}
                />
                <p className="text-xs text-gray-500">Last day to submit full applications</p>
              </div>

              <div className="space-y-2">
                <Label>Review Start Date</Label>
                <Input
                  type="date"
                  value={formData.reviewStartDate}
                  onChange={(e) => setFormData({ ...formData, reviewStartDate: e.target.value })}
                />
                <p className="text-xs text-gray-500">When reviewers begin evaluating applications</p>
              </div>

              {/* Decision Date hidden from UI but kept in schema for backward compatibility */}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Request Amount</Label>
            <Input
              type="number"
              value={formData.maxRequestAmount}
              onChange={(e) => setFormData({ ...formData, maxRequestAmount: e.target.value })}
              placeholder="50000"
            />
            <p className="text-xs text-gray-500">Maximum grant amount applicants can request</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Status</h3>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[var(--hff-teal)] focus:ring-[var(--hff-teal)]"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Set as Active Cycle
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">Only one cycle can be active at a time</p>

            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="acceptingLOIs"
                checked={formData.acceptingLOIs}
                onChange={(e) => setFormData({ ...formData, acceptingLOIs: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[var(--hff-teal)] focus:ring-[var(--hff-teal)]"
              />
              <Label htmlFor="acceptingLOIs" className="cursor-pointer">
                Accepting Letters of Interest
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">Allow applicants to submit new LOIs for this cycle</p>

            <div className="flex items-center space-x-2 mt-4">
              <input
                type="checkbox"
                id="acceptingApplications"
                checked={formData.acceptingApplications}
                onChange={(e) => setFormData({ ...formData, acceptingApplications: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-[var(--hff-teal)] focus:ring-[var(--hff-teal)]"
              />
              <Label htmlFor="acceptingApplications" className="cursor-pointer">
                Accepting Full Applications
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">Allow approved LOI applicants to submit full applications</p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : mode === 'create' ? 'Create Cycle' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
