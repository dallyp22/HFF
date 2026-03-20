import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { defaultLOIConfig, defaultApplicationConfig } from '@/lib/default-form-configs'

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const formType = searchParams.get('formType')

  if (!formType || !['LOI', 'APPLICATION'].includes(formType)) {
    return NextResponse.json({ error: 'Invalid formType' }, { status: 400 })
  }

  const config = await prisma.formConfig.findUnique({
    where: { formType },
  })

  if (config) {
    return NextResponse.json(config)
  }

  // Return default config if none exists
  const defaultConfig = formType === 'LOI' ? defaultLOIConfig : defaultApplicationConfig
  return NextResponse.json({
    id: null,
    formType,
    config: defaultConfig,
    updatedAt: null,
    updatedByName: null,
  })
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { formType, config, updatedByName } = body

  if (!formType || !['LOI', 'APPLICATION'].includes(formType)) {
    return NextResponse.json({ error: 'Invalid formType' }, { status: 400 })
  }

  if (!config) {
    return NextResponse.json({ error: 'Config is required' }, { status: 400 })
  }

  const result = await prisma.formConfig.upsert({
    where: { formType },
    update: {
      config,
      updatedById: userId,
      updatedByName: updatedByName || null,
    },
    create: {
      formType,
      config,
      updatedById: userId,
      updatedByName: updatedByName || null,
    },
  })

  return NextResponse.json(result)
}
