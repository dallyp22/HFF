import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { format } from 'date-fns'

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const searchQuery = params.search

  const organizations = await prisma.organization.findMany({
    where: {
      ...(searchQuery && {
        OR: [
          { legalName: { contains: searchQuery, mode: 'insensitive' } },
          { city: { contains: searchQuery, mode: 'insensitive' } },
          { state: { contains: searchQuery, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
      applications: {
        orderBy: { submittedAt: 'desc' },
        take: 1,
        select: {
          submittedAt: true,
        },
      },
    },
    orderBy: { legalName: 'asc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Organizations</h1>
          <p className="text-gray-600">{organizations.length} organizations in system</p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form action="/reviewer/organizations" method="get">
              <Input 
                name="search"
                placeholder="Search organizations by name, city, or state..." 
                defaultValue={searchQuery}
              />
            </form>
          </CardContent>
        </Card>

        {/* Organizations List */}
        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-600">
                  {searchQuery ? 'No organizations found matching your search' : 'No organizations yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {organizations.map(org => (
                  <Link
                    key={org.id}
                    href={`/reviewer/organizations/${org.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold">{org.legalName}</p>
                        {org.profileComplete && (
                          <Badge className="bg-green-100 text-green-700">Complete</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {org.city}, {org.state}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {org.annualBudget && (
                          <span>Annual Budget: ${org.annualBudget.toLocaleString()}</span>
                        )}
                        {org.applications[0]?.submittedAt && (
                          <span>Last Application: {format(new Date(org.applications[0].submittedAt), 'MMM d, yyyy')}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
