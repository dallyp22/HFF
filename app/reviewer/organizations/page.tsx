import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Building2 } from 'lucide-react'

export default async function OrganizationsPage() {
  const organizations = await prisma.organization.findMany({
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

        {organizations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-600">No organizations yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {organizations.map(org => (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{org.legalName}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {org.city}, {org.state} • EIN: {org.ein}
                      </p>
                    </div>
                    {org.profileComplete && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Complete
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Applications:</span>
                      <span className="font-medium">{org._count.applications}</span>
                    </div>
                    {org.annualBudget && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Annual Budget:</span>
                        <span className="font-medium">${org.annualBudget.toLocaleString()}</span>
                      </div>
                    )}
                    {org.applications[0]?.submittedAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Application:</span>
                        <span className="font-medium">
                          {new Date(org.applications[0].submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href={`/reviewer/organizations/${org.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
