import { prisma } from '@/lib/prisma'
import { ReportsClient } from './ReportsClient'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const cycles = await prisma.grantCycleConfig.findMany({
    orderBy: [{ year: 'desc' }, { cycle: 'asc' }],
    select: { id: true, cycle: true, year: true, isActive: true },
  })
  return <ReportsClient cycles={cycles} />
}
