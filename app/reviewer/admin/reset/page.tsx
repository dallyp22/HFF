'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { AlertTriangle, Trash2 } from 'lucide-react'

export default function ResetDataPage() {
  const [deleting, setDeleting] = useState(false)

  async function handleClearSampleData() {
    if (!confirm('Are you sure? This will delete all sample organizations and applications.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch('/api/admin/reset-sample-data', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Sample data cleared')
      } else {
        toast.error('Failed to clear data')
      }
    } catch (error) {
      toast.error('Failed to clear data')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Data Management</h1>

        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-medium mb-2">Danger Zone</p>
            <p>These actions cannot be undone.</p>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Clear Sample Data</CardTitle>
            <CardDescription>
              Remove seeded organizations and applications (Omaha Youth Services, Council Bluffs CC, Hope Center)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              This will delete the 3 sample organizations and their applications created during seeding.
              This frees up their EINs (47-1234567, 47-2345678, 47-3456789) for real use.
            </p>
            <Button
              variant="destructive"
              onClick={handleClearSampleData}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Clear Sample Data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
