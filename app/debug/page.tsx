import { currentUser } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DebugPage() {
  const user = await currentUser()

  const orgs = (user as any)?.organizationMemberships || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-mono">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p>{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p>{user?.firstName} {user?.lastName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            {orgs.length === 0 ? (
              <div className="text-center py-8">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  No Organization Memberships
                </Badge>
                <p className="text-sm text-gray-600 mt-4">
                  You are not a member of any Clerk organization.
                  <br />
                  This means you'll see the applicant portal.
                </p>
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-left">
                  <p className="font-semibold text-yellow-900 mb-2">To become a reviewer:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                    <li>Get invited to "HFF Reviewers" organization in Clerk</li>
                    <li>Check your email for invitation</li>
                    <li>Accept the invitation</li>
                    <li>Log out and log back in</li>
                    <li>You'll be redirected to reviewer dashboard</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orgs.map((org: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{org.organization?.name || 'Unknown'}</p>
                      <Badge className="bg-green-100 text-green-700">Active Member</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Organization ID</p>
                        <p className="font-mono text-xs">{org.organization?.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your Role</p>
                        <p className="font-semibold">{org.role}</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded text-sm">
                      <p className="text-green-900 font-medium">✓ You should see the reviewer portal</p>
                      <p className="text-green-700 mt-1">
                        Try navigating to: <a href="/reviewer/dashboard" className="underline">/reviewer/dashboard</a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Expected Behavior</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">If you are a REVIEWER:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Visiting /dashboard should redirect to /reviewer/dashboard</li>
                <li>Visiting /applications should redirect to /reviewer/applications</li>
                <li>Header should show "Reviewer Portal" navigation</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">If you are an APPLICANT:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>You can access /dashboard (applicant dashboard)</li>
                <li>You can create organization profiles</li>
                <li>You can submit applications</li>
                <li>Header shows "Dashboard, Profile, Documents, Applications"</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
