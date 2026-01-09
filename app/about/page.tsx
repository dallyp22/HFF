import { Header } from '@/components/brand/Header'
import { Footer } from '@/components/brand/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="public" />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[var(--hff-teal-50)] to-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                About Heistand Family Foundation
              </h1>
              <p className="text-xl text-gray-600">
                Supporting children in poverty through strategic grantmaking
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg text-gray-700 mb-4">
                    "To encourage and multiply opportunities for children in poverty"
                  </p>
                  <p className="text-gray-600">
                    The Heistand Family Foundation is committed to improving the lives of children 
                    living in poverty in the Omaha/Council Bluffs metropolitan area and Western Iowa. 
                    We believe that every child deserves the opportunity to reach their full potential, 
                    regardless of their economic circumstances.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Geographic Area */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Geographic Focus</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-700 mb-4">
                    We serve organizations within a 100-mile radius of Omaha, Nebraska, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Omaha metropolitan area</li>
                    <li>Council Bluffs, Iowa</li>
                    <li>Western Iowa communities</li>
                    <li>Surrounding rural areas within our service region</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Grant Approach */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Our Grant Approach</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Focus on Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      We prioritize programs that demonstrate measurable, lasting impact on children's lives. 
                      We look for innovative approaches that multiply opportunities and create sustainable change.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Partnership Mindset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      We view our grantees as partners in our mission. We value ongoing relationships 
                      and support organizations that align with our commitment to serving children in poverty.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Strategic Grantmaking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      We operate on a semi-annual grant cycle with deadlines on February 15 and July 15. 
                      This structured approach allows us to carefully review applications and make strategic 
                      funding decisions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[var(--hff-teal)] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Learn More</h2>
            <p className="text-xl mb-8 opacity-90">
              Review our eligibility criteria to see if your organization qualifies
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/eligibility">Eligibility Criteria</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/sign-up">Apply Now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
