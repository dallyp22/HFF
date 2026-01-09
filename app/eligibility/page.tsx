import { Header } from '@/components/brand/Header'
import { Footer } from '@/components/brand/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

export default function EligibilityPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="public" />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[var(--hff-teal-50)] to-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Eligibility Criteria
              </h1>
              <p className="text-xl text-gray-600">
                Review these requirements before applying for a grant
              </p>
            </div>
          </div>
        </section>

        {/* Required Criteria */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Required Criteria</h2>
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <CheckCircle2 className="h-5 w-5" />
                    Your organization must meet ALL of these requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">501(c)(3) Tax-Exempt Status</p>
                      <p className="text-sm text-gray-600">
                        Your organization must be recognized by the IRS as a tax-exempt nonprofit organization
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Geographic Location</p>
                      <p className="text-sm text-gray-600">
                        Your organization must serve communities within 100 miles of Omaha, Nebraska, 
                        including the Omaha/Council Bluffs metro area and Western Iowa
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Focus on Children in Poverty</p>
                      <p className="text-sm text-gray-600">
                        Your proposed project must directly serve children living in poverty. 
                        Programs should demonstrate clear indicators of poverty among the target population
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Organizational Capacity</p>
                      <p className="text-sm text-gray-600">
                        Your organization must demonstrate the capacity to successfully implement 
                        the proposed project, including adequate staffing and financial management
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Ineligible */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Not Eligible</h2>
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <XCircle className="h-5 w-5" />
                    We do not fund the following
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Organizations that do not serve children as their primary mission
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Programs outside our geographic service area
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Capital campaigns or building projects
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Endowment funds or operating reserves
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Individual scholarships or direct assistance to individuals
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Political or lobbying activities
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Grant Sizes */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Grant Information</h2>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Typical Grant Range</p>
                  <p className="text-sm text-gray-600">
                    Most grants range from $10,000 to $50,000. However, we consider the specific needs 
                    of each project and may make exceptions based on demonstrated impact and organizational capacity.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-[var(--hff-teal)]">Spring Cycle</p>
                        <p className="text-sm text-gray-600">Letter of Inquiry due February 15</p>
                      </div>
                      <div>
                        <p className="font-medium text-[var(--hff-teal)]">Fall Cycle</p>
                        <p className="text-sm text-gray-600">Letter of Inquiry due July 15</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li>Most recent IRS Form 990 or 990-EZ</li>
                      <li>IRS determination letter confirming 501(c)(3) status</li>
                      <li>Current financial statements</li>
                      <li>Project budget</li>
                      <li>Board of Directors list</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[var(--hff-teal)] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Does Your Organization Qualify?</h2>
            <p className="text-xl mb-8 opacity-90">
              Create an account and start your application today
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/sign-up">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
