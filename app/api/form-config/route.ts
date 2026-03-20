import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { defaultLOIConfig, defaultApplicationConfig } from '@/lib/default-form-configs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const formType = searchParams.get('formType')

  if (!formType || !['LOI', 'APPLICATION'].includes(formType)) {
    return NextResponse.json({ error: 'Invalid formType' }, { status: 400 })
  }

  const config = await prisma.formConfig.findUnique({
    where: { formType },
  })

  if (config) {
    return NextResponse.json(config.config)
  }

  // Return default config if none exists
  return NextResponse.json(formType === 'LOI' ? defaultLOIConfig : defaultApplicationConfig)
}
