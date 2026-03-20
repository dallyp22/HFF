import { useEffect, useState } from 'react'
import type { FormConfigData } from '@/lib/default-form-configs'

export function useFormConfig(formType: 'LOI' | 'APPLICATION') {
  const [config, setConfig] = useState<FormConfigData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/form-config?formType=${formType}`)
        if (res.ok) {
          const data = await res.json()
          // Handle both nested (from DB) and flat (default) formats
          setConfig(data.steps ? data : data.config || data)
        }
      } catch (error) {
        console.error('Failed to load form config:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [formType])

  return { config, loading }
}
