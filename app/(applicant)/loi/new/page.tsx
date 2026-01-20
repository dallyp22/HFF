'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/glass/GlassCard'
import { FadeIn } from '@/components/motion/FadeIn'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Loader2,
  Calendar,
  FileText,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

interface GrantCycle {
  id: string
  cycle: string
  year: number
  loiDeadline: string
  fullAppDeadline: string | null
  maxRequestAmount: string | null
  isActive: boolean
  acceptingLOIs: boolean
}

export default function NewLOIPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [cycles, setCycles] = useState<GrantCycle[]>([])
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCycles() {
      try {
        const response = await fetch('/api/cycles')
        if (response.ok) {
          const data = await response.json()
          // Filter to only show cycles accepting LOIs
          const acceptingCycles = data.filter((c: GrantCycle) => c.isActive && c.acceptingLOIs)
          setCycles(acceptingCycles)

          // Auto-select if only one cycle
          if (acceptingCycles.length === 1) {
            setSelectedCycle(acceptingCycles[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching cycles:', error)
        toast.error('Failed to load grant cycles')
      } finally {
        setLoading(false)
      }
    }

    fetchCycles()
  }, [])

  const handleCreate = async () => {
    if (!selectedCycle) {
      toast.error('Please select a grant cycle')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/loi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleConfigId: selectedCycle }),
      })

      if (response.ok) {
        const loi = await response.json()
        toast.success('Letter of Interest created')
        router.push(`/loi/${loi.id}/edit`)
      } else {
        const error = await response.json()
        if (error.existingId) {
          toast.info('You already have an LOI for this cycle')
          router.push(`/loi/${error.existingId}/edit`)
        } else {
          toast.error(error.error || 'Failed to create LOI')
        }
      }
    } catch (error) {
      console.error('Error creating LOI:', error)
      toast.error('Failed to create Letter of Interest')
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(parseFloat(amount))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[500px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--hff-teal)]/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--hff-teal)]" />
          </div>
          <p className="text-gray-600">Loading available grant cycles...</p>
        </motion.div>
      </div>
    )
  }

  if (cycles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <GlassCard className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Active Grant Cycles
              </h2>
              <p className="text-gray-600 mb-6">
                There are currently no grant cycles accepting Letters of Interest.
                Please check back later or contact the Heistand Family Foundation for more information.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/loi')}
                className="rounded-xl"
              >
                Back to LOI List
              </Button>
            </GlassCard>
          </FadeIn>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] mb-4"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">New Letter of Interest</span>
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Select a Grant Cycle
            </h1>
            <p className="text-gray-600">
              Choose the grant cycle you'd like to apply for
            </p>
          </div>
        </FadeIn>

        {/* Cycle Selection */}
        <FadeIn delay={0.1}>
          <div className="space-y-4 mb-8">
            {cycles.map((cycle) => {
              const isSelected = selectedCycle === cycle.id
              const deadline = new Date(cycle.loiDeadline)
              const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const isUrgent = daysUntilDeadline <= 7

              return (
                <motion.button
                  key={cycle.id}
                  onClick={() => setSelectedCycle(cycle.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full text-left"
                >
                  <GlassCard
                    variant={isSelected ? 'teal' : 'default'}
                    hover={false}
                    className={`p-5 transition-all ${
                      isSelected
                        ? 'ring-2 ring-[var(--hff-teal)] ring-offset-2'
                        : 'hover:border-[var(--hff-teal)]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-[var(--hff-teal)] text-white'
                              : 'bg-[var(--hff-teal)]/10 text-[var(--hff-teal)]'
                          }`}
                        >
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cycle.cycle} {cycle.year} Cycle
                          </h3>
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">LOI Deadline:</span>{' '}
                              <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
                                {formatDate(cycle.loiDeadline)}
                              </span>
                              {isUrgent && (
                                <span className="ml-2 text-red-600">
                                  ({daysUntilDeadline} days left)
                                </span>
                              )}
                            </p>
                            {cycle.fullAppDeadline && (
                              <p>
                                <span className="font-medium">Full Application Deadline:</span>{' '}
                                {formatDate(cycle.fullAppDeadline)}
                              </p>
                            )}
                            {cycle.maxRequestAmount && (
                              <p>
                                <span className="font-medium">Max Request:</span>{' '}
                                {formatCurrency(cycle.maxRequestAmount)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  </GlassCard>
                </motion.button>
              )
            })}
          </div>
        </FadeIn>

        {/* Action Buttons */}
        <FadeIn delay={0.2}>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/loi')}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!selectedCycle || creating}
              className="rounded-xl bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] shadow-lg shadow-[var(--hff-teal)]/20"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Start LOI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
