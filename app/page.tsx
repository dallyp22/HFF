'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/brand/Header'
import { Footer } from '@/components/brand/Footer'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Calendar,
  Heart,
  MapPin,
  Users,
  Loader2,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Shield,
  ChevronDown
} from 'lucide-react'

export default function HomePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { scrollYProgress } = useScroll()

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  useEffect(() => {
    if (!isLoaded) return

    if (user) {
      const isReviewer = (user as any).organizationMemberships?.length > 0
      const isHardcodedAdmin = user.emailAddresses?.[0]?.emailAddress === 'dallas.polivka@vsinsights.ai'

      if (isReviewer || isHardcodedAdmin) {
        router.push('/reviewer/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, isLoaded, router])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[var(--hff-teal-50)] to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-10 w-10 text-[var(--hff-teal)]" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header variant="public" />

      <main className="flex-1">
        {/* ========== HERO SECTION ========== */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Animated gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--hff-teal-50)] via-white to-white">
            {/* Mesh gradient overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(32,70,82,0.12)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(212,165,116,0.08)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(129,178,154,0.06)_0%,transparent_40%)]" />

            {/* Floating orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--hff-teal)]/[0.07] rounded-full blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--hff-gold)]/[0.06] rounded-full blur-3xl"
              animate={{
                x: [0, -20, 0],
                y: [0, 30, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
          </div>

          {/* Hero content */}
          <motion.div
            style={{ opacity: heroOpacity, scale: heroScale }}
            className="container mx-auto px-4 relative z-10"
          >
            <div className="max-w-5xl mx-auto">
              <StaggerContainer staggerDelay={0.15} className="text-center">
                {/* Badge */}
                <StaggerItem>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-block mb-8"
                  >
                    <GlassBadge variant="teal" size="lg" pulse>
                      <Sparkles className="w-4 h-4" />
                      Now Accepting Spring 2026 Applications
                    </GlassBadge>
                  </motion.div>
                </StaggerItem>

                {/* Main headline with gradient */}
                <StaggerItem>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
                    <span className="text-gray-900">Multiply</span>
                    <br />
                    <span className="bg-gradient-to-r from-[var(--hff-teal)] via-[var(--hff-teal-700)] to-[var(--hff-sage)] bg-clip-text text-transparent">
                      Opportunities
                    </span>
                  </h1>
                </StaggerItem>

                {/* Subheadline */}
                <StaggerItem>
                  <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                    The Heistand Family Foundation partners with organizations
                    creating <span className="text-[var(--hff-teal)] font-semibold">lasting change</span> for
                    children in poverty.
                  </p>
                </StaggerItem>

                {/* Capital Requests Notice */}
                <StaggerItem>
                  <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    <strong>Capital Requests:</strong> Capital Requests must go through the Foundation Director. Do not apply for a Capital Grant through this portal.
                  </div>
                </StaggerItem>

                {/* CTA Buttons */}
                <StaggerItem>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        asChild
                        className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] text-lg px-8 py-6 rounded-full shadow-lg shadow-[var(--hff-teal)]/25 hover:shadow-xl hover:shadow-[var(--hff-teal)]/30 transition-all"
                      >
                        <Link href="/sign-up">
                          Apply for a Grant
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="text-lg px-8 py-6 rounded-full border-2 hover:bg-[var(--hff-teal)]/5"
                      >
                        <Link href="/eligibility">View Eligibility</Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="text-lg px-8 py-6 rounded-full border-2 hover:bg-[var(--hff-teal)]/5"
                      >
                        <Link href="/documents/sample-loi.pdf" target="_blank">
                          Preview LOI Questions (PDF)
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="text-lg px-8 py-6 rounded-full border-2 hover:bg-[var(--hff-teal)]/5"
                      >
                        <Link href="/documents/sample-application.pdf" target="_blank">
                          Preview Application Questions (PDF)
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <ChevronDown className="w-5 h-5" />
            </div>
          </motion.div>
        </section>

        {/* ========== IMPACT STATS ========== */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(32,70,82,0.03)_0%,transparent_70%)]" />

          <div className="container mx-auto px-4 relative">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Impact
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Since our founding, we've partnered with organizations to create meaningful change.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { value: 150, suffix: '+', label: 'Grants Awarded', icon: Target },
                { value: 2.5, prefix: '$', suffix: 'M+', label: 'Total Funding', icon: TrendingUp },
                { value: 50000, suffix: '+', label: 'Children Served', icon: Users },
                { value: 12, suffix: '+', label: 'Years of Impact', icon: Heart },
              ].map((stat, index) => (
                <FadeIn key={stat.label} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassCard variant="elevated" className="text-center p-6 h-full" hover={false}>
                      <div className="w-12 h-12 rounded-xl bg-[var(--hff-teal)]/10 flex items-center justify-center mx-auto mb-4">
                        <stat.icon className="w-6 h-6 text-[var(--hff-teal)]" />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        <AnimatedCounter
                          value={stat.value}
                          prefix={stat.prefix}
                          suffix={stat.suffix}
                          decimals={stat.value < 10 ? 1 : 0}
                        />
                      </div>
                      <p className="text-gray-600 font-medium">{stat.label}</p>
                    </GlassCard>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ========== GRANT CYCLES - BENTO GRID ========== */}
        <section className="py-20 bg-gradient-to-b from-white to-[var(--hff-teal-50)]/30">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <GlassBadge variant="gold" className="mb-4">
                  <Calendar className="w-4 h-4" />
                  Grant Cycles
                </GlassBadge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Funding Opportunities
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  We offer two grant cycles per year, giving organizations multiple opportunities to apply.
                </p>
              </div>
            </FadeIn>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Spring Cycle - Large card */}
              <FadeIn delay={0.1} className="md:col-span-2 lg:col-span-2">
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <GlassCard variant="teal" className="p-8 h-full" glow hover={false}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <GlassBadge variant="sage" className="mb-4">Now Open</GlassBadge>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                          Spring 2026 Cycle
                        </h3>
                        <p className="text-gray-600 mb-4 max-w-md">
                          Applications are now being accepted. Submit your Letter of Inquiry before the deadline.
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-[var(--hff-teal)]">Feb 15</span>
                          <span className="text-gray-500">2026 Deadline</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button asChild size="lg" className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] rounded-full">
                          <Link href="/sign-up">
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </FadeIn>

              {/* Fall Cycle */}
              <FadeIn delay={0.2}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <GlassCard className="p-6 h-full" hover={false}>
                    <GlassBadge variant="default" className="mb-4">Coming Soon</GlassBadge>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Fall 2026 Cycle
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Applications open in June 2026.
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[var(--hff-slate)]">Jul 15</span>
                      <span className="text-gray-500 text-sm">Deadline</span>
                    </div>
                  </GlassCard>
                </motion.div>
              </FadeIn>

              {/* Grant Range */}
              <FadeIn delay={0.3}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <GlassCard className="p-6 h-full bg-gradient-to-br from-white to-[var(--hff-gold)]/5" hover={false}>
                    <div className="w-10 h-10 rounded-lg bg-[var(--hff-gold)]/20 flex items-center justify-center mb-4">
                      <TrendingUp className="w-5 h-5 text-[var(--hff-gold)]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Grant Range
                    </h3>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      $10K - $50K
                    </p>
                    <p className="text-gray-500 text-sm">
                      Typical award amount
                    </p>
                  </GlassCard>
                </motion.div>
              </FadeIn>

              {/* Geographic Focus */}
              <FadeIn delay={0.4}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <GlassCard className="p-6 h-full bg-gradient-to-br from-white to-[var(--hff-sage)]/5" hover={false}>
                    <div className="w-10 h-10 rounded-lg bg-[var(--hff-sage)]/20 flex items-center justify-center mb-4">
                      <MapPin className="w-5 h-5 text-[var(--hff-sage)]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Service Area
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Omaha/Council Bluffs metro and Western Iowa within 100 miles
                    </p>
                  </GlassCard>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ========== FOCUS AREAS ========== */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Focus Areas
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  We support initiatives that create lasting, measurable impact for children in need.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: Users,
                  title: 'Children in Poverty',
                  description: 'Supporting programs that directly impact children living in poverty with essential services and opportunities.',
                  color: 'teal',
                },
                {
                  icon: MapPin,
                  title: 'Local Community',
                  description: 'Serving the Omaha/Council Bluffs metro area and Western Iowa communities we call home.',
                  color: 'sage',
                },
                {
                  icon: Heart,
                  title: 'Lasting Impact',
                  description: 'Creating sustainable solutions that multiply opportunities for generations to come.',
                  color: 'gold',
                },
              ].map((focus, index) => (
                <FadeIn key={focus.title} delay={index * 0.15}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="group"
                  >
                    <div className="text-center p-8 rounded-3xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 hover:border-[var(--hff-teal)]/20 hover:shadow-xl hover:shadow-[var(--hff-teal)]/5 transition-all duration-300">
                      <motion.div
                        className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                          focus.color === 'teal' ? 'bg-[var(--hff-teal)]/10 group-hover:bg-[var(--hff-teal)]/20' :
                          focus.color === 'sage' ? 'bg-[var(--hff-sage)]/15 group-hover:bg-[var(--hff-sage)]/25' :
                          'bg-[var(--hff-gold)]/15 group-hover:bg-[var(--hff-gold)]/25'
                        } transition-colors duration-300`}
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <focus.icon className={`w-10 h-10 ${
                          focus.color === 'teal' ? 'text-[var(--hff-teal)]' :
                          focus.color === 'sage' ? 'text-[var(--hff-sage)]' :
                          'text-[var(--hff-gold)]'
                        }`} />
                      </motion.div>
                      <h3 className="font-bold text-xl text-gray-900 mb-3">{focus.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{focus.description}</p>
                    </div>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="py-24 relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--hff-teal)] via-[var(--hff-teal-800)] to-[var(--hff-teal-900)]" />

          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,165,116,0.1)_0%,transparent_50%)]" />

          <motion.div
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <FadeIn>
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Make a Difference?
                  </h2>
                </motion.div>
                <p className="text-xl text-white/80 mb-10 leading-relaxed">
                  Join our community of changemakers working to create opportunities
                  for children in our region.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      asChild
                      className="bg-white text-[var(--hff-teal)] hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-xl"
                    >
                      <Link href="/sign-up">
                        Start Your Application
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full backdrop-blur-sm"
                    >
                      <Link href="/about">Learn About Us</Link>
                    </Button>
                  </motion.div>
                </div>

                {/* Trust indicators */}
                <motion.div
                  className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-white/60">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">501(c)(3) Foundation</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Target className="w-5 h-5" />
                    <span className="text-sm">Mission-Driven</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Community Focused</span>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
