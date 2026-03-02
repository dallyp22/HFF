'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Trash2,
  Database,

  Shield,
  Building2,
  FileText,
  Loader2,
} from 'lucide-react'

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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-red-100">
              <Database className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
              <p className="text-gray-600">Manage and reset application data</p>
            </div>
          </div>
        </FadeIn>

        {/* Danger Zone Warning */}
        <FadeIn delay={0.1}>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-200/50">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Danger Zone</h3>
                <p className="text-sm text-red-700 mt-1">
                  Actions on this page are destructive and cannot be undone. Please proceed with
                  caution.
                </p>
              </div>
            </div>
          </motion.div>
        </FadeIn>

        {/* Clear Sample Data Card */}
        <FadeIn delay={0.15}>
          <GlassCard className="p-6 border-red-200/50">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-red-100">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Clear Sample Data</h2>
                <p className="text-gray-600 mb-4">
                  Remove all seeded sample organizations and their applications from the database.
                </p>

                {/* Affected Data */}
                <div className="p-4 rounded-xl bg-gray-50 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    This will permanently delete:
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>Omaha Youth Services (EIN: 47-1234567)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>Council Bluffs Community Center (EIN: 47-2345678)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>Hope Center (EIN: 47-3456789)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>All associated applications and documents</span>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100 mb-6">
                  <Shield className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    This action frees up the sample EINs for real use. User accounts and grant
                    cycles will not be affected.
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  variant="destructive"
                  onClick={handleClearSampleData}
                  disabled={deleting}
                  className="gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Clear Sample Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Additional Info */}
        <FadeIn delay={0.2}>
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact support or check the documentation for data management best
              practices.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
