'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Calendar, Check, X } from 'lucide-react'
import { format } from 'date-fns'

interface GrantCycle {
  id: string
  cycle: 'SPRING' | 'FALL'
  year: number
  loiDeadline: string
  isActive: boolean
  acceptingApplications: boolean
  maxRequestAmount: string | null
  _count?: {
    applications: number
  }
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<GrantCycle[]>([])
  const [loading, setLoading] = useState(true)

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
      toast.error('Failed to load grant cycles')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(cycleId: string, currentValue: boolean) {
    try {
      const response = await fetch(`/api/admin/cycles/${cycleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentValue }),
      })

      if (response.ok) {
        toast.success('Cycle updated')
        loadCycles()
      } else {
        toast.error('Failed to update cycle')
      }
    } catch (error) {
      console.error('Error updating cycle:', error)
      toast.error('Failed to update cycle')
    }
  }

  async function toggleAccepting(cycleId: string, currentValue: boolean) {
    try {
      const response = await fetch(`/api/admin/cycles/${cycleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptingApplications: !currentValue }),
      })

      if (response.ok) {
        toast.success('Cycle updated')
        loadCycles()
      } else {
        toast.error('Failed to update cycle')
      }
    } catch (error) {
      console.error('Error updating cycle:', error)
      toast.error('Failed to update cycle')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Grant Cycles</h1>
          <p className="text-gray-600">Manage Spring and Fall grant cycles</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {cycles.map(cycle => (
            <Card key={cycle.id} className={cycle.isActive ? 'border-[var(--hff-teal)] border-2' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {cycle.cycle} {cycle.year}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      LOI Deadline: {format(new Date(cycle.loiDeadline), 'MMMM d, yyyy')}
                    </CardDescription>
                  </div>
                  {cycle.isActive && (
                    <Badge className="bg-[var(--hff-teal)] text-white">Active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Active Cycle</span>
                  <Button
                    size="sm"
                    variant={cycle.isActive ? 'default' : 'outline'}
                    onClick={() => toggleActive(cycle.id, cycle.isActive)}
                  >
                    {cycle.isActive ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Inactive
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-sm font-medium">Accepting Applications</span>
                  <Button
                    size="sm"
                    variant={cycle.acceptingApplications ? 'default' : 'outline'}
                    onClick={() => toggleAccepting(cycle.id, cycle.acceptingApplications)}
                    className={cycle.acceptingApplications ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {cycle.acceptingApplications ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Open
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Closed
                      </>
                    )}
                  </Button>
                </div>

                {cycle.maxRequestAmount && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600">Max Request Amount</p>
                    <p className="text-lg font-semibold">
                      ${parseFloat(cycle.maxRequestAmount).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
