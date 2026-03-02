'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { CycleFormDialog } from '@/components/admin/CycleFormDialog'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,

} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default function CyclesPage() {
  const [cycles, setCycles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCycle, setSelectedCycle] = useState<any>(null)

  useEffect(() => {
    loadCycles()
  }, [])

  async function loadCycles() {
    try {
      const response = await fetch('/api/admin/cycles')
      if (response.ok) {
        const data = await response.json()
        setCycles(data)
      }
    } catch (error) {
      console.error('Error loading cycles:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(cycleId: string, cycleName: string) {
    if (!confirm(`Delete ${cycleName}? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/cycles/${cycleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Cycle deleted successfully')
        loadCycles()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete cycle')
      }
    } catch (error) {
      toast.error('Failed to delete cycle')
    }
  }

  function handleEdit(cycle: any) {
    setSelectedCycle(cycle)
    setEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-100 rounded-xl" />
            <div className="h-32 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--hff-teal)]/10">
                <Calendar className="w-6 h-6 text-[var(--hff-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Grant Cycles</h1>
                <p className="text-gray-600">Manage Spring and Fall grant cycles</p>
              </div>
            </div>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
            >
              <Plus className="w-4 h-4" />
              Create Cycle
            </Button>
          </div>
        </FadeIn>

        {/* Cycles List */}
        <div className="space-y-4">
          <AnimatePresence>
            {cycles.map((cycle, index) => (
              <FadeIn key={cycle.id} delay={0.05 * index}>
                <GlassCard
                  className={`p-5 relative overflow-hidden ${
                    cycle.isActive ? 'ring-2 ring-[var(--hff-teal)] ring-offset-2' : ''
                  }`}
                >
                  {/* Active Indicator */}
                  {cycle.isActive && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--hff-teal)]/5 rounded-full -mr-8 -mt-8" />
                  )}

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-xl ${
                            cycle.cycle === 'SPRING'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {cycle.cycle} {cycle.year}
                          </h2>
                          <p className="text-sm text-gray-500">
                            LOI Deadline: {format(new Date(cycle.loiDeadline), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {cycle.isActive && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[var(--hff-teal)] text-white">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        )}
                        {cycle.acceptingLOIs && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                            <Clock className="w-4 h-4" />
                            LOIs Open
                          </span>
                        )}
                        {cycle.acceptingApplications && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                            <Clock className="w-4 h-4" />
                            Apps Open
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-6 mb-4">
                      {cycle.maxRequestAmount && (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-500">Max Request:</span>{' '}
                          <span className="font-medium text-gray-900">
                            ${parseFloat(cycle.maxRequestAmount).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(cycle)}
                        className="gap-1.5"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(cycle.id, `${cycle.cycle} ${cycle.year}`)}
                        className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
          </AnimatePresence>

          {cycles.length === 0 && (
            <FadeIn>
              <GlassCard className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Grant Cycles</h3>
                <p className="text-gray-500 mb-4">Create your first grant cycle to get started.</p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="gap-2 bg-[var(--hff-teal)] hover:bg-[var(--hff-teal)]/90"
                >
                  <Plus className="w-4 h-4" />
                  Create Cycle
                </Button>
              </GlassCard>
            </FadeIn>
          )}
        </div>

        <CycleFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} mode="create" />

        <CycleFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          cycle={selectedCycle}
          mode="edit"
        />
      </div>
    </div>
  )
}
