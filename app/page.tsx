import { Header } from '@/components/brand/Header'
import { Footer } from '@/components/brand/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Calendar, Heart, MapPin, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="public" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[var(--hff-teal-50)] to-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Heistand Family Foundation Grant Portal
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                To encourage and multiply opportunities for children in poverty
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-dark)]">
                  <Link href="/sign-up">Apply for a Grant</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/eligibility">View Eligibility Criteria</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Grant Cycle Info */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Current Grant Cycles</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[var(--hff-teal)]" />
                      Spring 2026 Cycle
                    </CardTitle>
                    <CardDescription>Letter of Inquiry Deadline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-[var(--hff-teal)] mb-2">February 15, 2026</p>
                    <p className="text-sm text-gray-600">
                      Applications are now being accepted for the Spring 2026 grant cycle.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[var(--hff-slate)]" />
                      Fall 2026 Cycle
                    </CardTitle>
                    <CardDescription>Letter of Inquiry Deadline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-[var(--hff-slate)] mb-2">July 15, 2026</p>
                    <p className="text-sm text-gray-600">
                      Applications for the Fall 2026 cycle will open in June 2026.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Our Focus Areas</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--hff-teal-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-[var(--hff-teal)]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Children in Poverty</h3>
                  <p className="text-gray-600">
                    Supporting programs that directly impact children living in poverty
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--hff-teal-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-[var(--hff-teal)]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Local Community</h3>
                  <p className="text-gray-600">
                    Serving the Omaha/Council Bluffs metro area and Western Iowa
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--hff-teal-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-[var(--hff-teal)]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Lasting Impact</h3>
                  <p className="text-gray-600">
                    Creating sustainable solutions and multiplying opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[var(--hff-teal)] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Apply?</h2>
            <p className="text-xl mb-8 opacity-90">
              Create an account to get started with your grant application
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
