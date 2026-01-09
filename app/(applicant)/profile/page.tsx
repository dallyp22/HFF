import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { calculateProfileCompletion } from '@/lib/validation/profile'

export default async function ProfilePage() {
  const clerkUser = await currentUser()

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser!.id },
    include: { organization: true },
  })

  if (!user?.organization) {
    redirect('/profile/edit')
  }

  const org = user.organization
  const completion = calculateProfileCompletion(org as any)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{org.legalName}</h1>
            <p className="text-gray-600">EIN: {org.ein}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={completion === 100 ? 'default' : 'secondary'}>
              {completion}% Complete
            </Badge>
            <Button asChild>
              <Link href="/profile/edit">Edit Profile</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Legal Name</p>
                <p className="font-medium">{org.legalName}</p>
              </div>
              {org.dbaName && (
                <div>
                  <p className="text-sm text-gray-600">DBA Name</p>
                  <p className="font-medium">{org.dbaName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">EIN</p>
                <p className="font-medium">{org.ein}</p>
              </div>
              {org.yearFounded && (
                <div>
                  <p className="text-sm text-gray-600">Year Founded</p>
                  <p className="font-medium">{org.yearFounded}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{org.address}</p>
              {org.addressLine2 && <p>{org.addressLine2}</p>}
              <p>{org.city}, {org.state} {org.zipCode}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{org.phone}</p>
              </div>
              {org.website && (
                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <p className="font-medium">
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-[var(--hff-teal)] hover:underline">
                      {org.website}
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{org.missionStatement}</p>
            </CardContent>
          </Card>

          {org.executiveDirectorName && (
            <Card>
              <CardHeader>
                <CardTitle>Leadership</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Executive Director</p>
                  <p className="font-medium">{org.executiveDirectorName}</p>
                </div>
                {org.executiveDirectorEmail && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{org.executiveDirectorEmail}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(org.annualBudget || org.form990Year) && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {org.annualBudget && (
                  <div>
                    <p className="text-sm text-gray-600">Annual Budget</p>
                    <p className="font-medium">${org.annualBudget.toLocaleString()}</p>
                  </div>
                )}
                {org.form990Year && (
                  <div>
                    <p className="text-sm text-gray-600">Most Recent Form 990</p>
                    <p className="font-medium">{org.form990Year}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
