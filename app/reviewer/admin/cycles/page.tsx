'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CycleFormDialog } from '@/components/admin/CycleFormDialog'
import { toast } from 'sonner'
import { Calendar, Plus, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function CyclesPage() {
  const router = useRouter()
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
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Grant Cycles</h1>
            <p className="text-gray-600">Manage Spring and Fall grant cycles</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Cycle
          </Button>
        </div>

        <div className="space-y-4">
          {cycles.map(cycle => (
            <Card key={cycle.id} className={cycle.isActive ? 'border-[var(--hff-teal)] border-2' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {cycle.cycle} {cycle.year}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <div>LOI Deadline: {format(new Date(cycle.loiDeadline), 'MMMM d, yyyy')}</div>
                      {cycle.decisionDate && (
                        <div>Decision Date: {format(new Date(cycle.decisionDate), 'MMMM d, yyyy')}</div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {cycle.isActive && (
                      <Badge className="bg-[var(--hff-teal)] text-white">Active</Badge>
                    )}
                    {cycle.acceptingApplications && (
                      <Badge className="bg-green-600 text-white">Open</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 space-y-1">
                    {cycle.maxRequestAmount && (
                      <div>Max Request: ${parseFloat(cycle.maxRequestAmount).toLocaleString()}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(cycle)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(cycle.id, `${cycle.cycle} ${cycle.year}`)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {cycles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No grant cycles yet. Create your first cycle above.
              </CardContent>
            </Card>
          )}
        </div>

        <CycleFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          mode="create"
        />

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
