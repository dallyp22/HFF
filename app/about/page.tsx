'use client'

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
import { useRef } from 'react'
import {
  Heart,
  MapPin,
  Users,
  ArrowRight,
  Target,
  Handshake,
  Lightbulb,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Quote
} from 'lucide-react'

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header variant="public" />

      <main className="flex-1">
        {/* ========== HERO SECTION WITH PARALLAX ========== */}
        <section ref={heroRef} className="relative min-h-[70vh] flex items-center overflow-hidden">
          {/* Parallax background layers */}
          <motion.div
            style={{ y: heroY }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--hff-teal)] via-[var(--hff-teal-800)] to-[var(--hff-teal-900)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(212,165,116,0.1)_0%,transparent_40%)]" />

            {/* Floating decorative elements */}
            <motion.div
              className="absolute top-20 right-20 w-64 h-64 border border-white/10 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute bottom-20 left-20 w-40 h-40 border border-white/5 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          <motion.div
            style={{ opacity: heroOpacity }}
            className="container mx-auto px-4 relative z-10"
          >
            <div className="max-w-4xl mx-auto text-center">
              <StaggerContainer staggerDelay={0.15}>
                <StaggerItem>
                  <GlassBadge variant="gold" size="lg" className="mb-6 bg-white/10 border-white/20 text-white">
                    <Heart className="w-4 h-4" />
                    Our Story
                  </GlassBadge>
                </StaggerItem>

                <StaggerItem>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                    About the
                    <br />
                    <span className="text-[var(--hff-gold)]">Heistand Family Foundation</span>
                  </h1>
                </StaggerItem>

                <StaggerItem>
                  <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                    For over a decade, we've partnered with organizations to create
                    lasting change for children in our community.
                  </p>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </motion.div>

          {/* Scroll fade overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* ========== MISSION SECTION ========== */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <FadeIn direction="left">
                  <div>
                    <GlassBadge variant="teal" className="mb-4">
                      <Target className="w-4 h-4" />
                      Our Mission
                    </GlassBadge>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      To encourage and multiply opportunities for children in poverty
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      The Heistand Family Foundation is committed to improving the lives of children
                      living in poverty in the Omaha/Council Bluffs metropolitan area and Western Iowa.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      We believe that every child deserves the opportunity to reach their full potential,
                      regardless of their economic circumstances. Through strategic grantmaking, we partner
                      with organizations that share our vision of creating lasting, meaningful change.
                    </p>
                  </div>
                </FadeIn>

                <FadeIn direction="right" delay={0.2}>
                  <div className="relative">
                    {/* Quote card */}
                    <GlassCard variant="elevated" className="p-8" glow>
                      <Quote className="w-12 h-12 text-[var(--hff-teal)]/20 mb-4" />
                      <blockquote className="text-2xl font-medium text-gray-900 mb-6 leading-relaxed">
                        "Every child deserves the chance to dream big and achieve their potential."
                      </blockquote>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--hff-teal)]/10 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-[var(--hff-teal)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">The Heistand Family</p>
                          <p className="text-sm text-gray-500">Foundation Founders</p>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-[var(--hff-gold)]/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[var(--hff-teal)]/10 rounded-full blur-2xl" />
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* ========== VALUES SECTION ========== */}
        <section className="py-24 bg-gradient-to-b from-white via-[var(--hff-teal-50)]/30 to-white">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <GlassBadge variant="sage" className="mb-4">
                  <Lightbulb className="w-4 h-4" />
                  Our Approach
                </GlassBadge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  How We Make a Difference
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Our grantmaking philosophy is built on three core principles that guide every decision.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Target,
                  title: 'Focus on Impact',
                  description: 'We prioritize programs that demonstrate measurable, lasting impact on children\'s lives. We look for innovative approaches that multiply opportunities and create sustainable change.',
                  color: 'teal',
                  number: '01'
                },
                {
                  icon: Handshake,
                  title: 'Partnership Mindset',
                  description: 'We view our grantees as partners in our mission. We value ongoing relationships and support organizations that align with our commitment to serving children in poverty.',
                  color: 'gold',
                  number: '02'
                },
                {
                  icon: TrendingUp,
                  title: 'Strategic Grantmaking',
                  description: 'We operate on a semi-annual grant cycle with structured deadlines. This approach allows us to carefully review applications and make strategic funding decisions.',
                  color: 'sage',
                  number: '03'
                },
              ].map((value, index) => (
                <FadeIn key={value.title} delay={index * 0.15}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="group h-full"
                  >
                    <GlassCard className="p-8 h-full relative overflow-hidden" hover={false}>
                      {/* Large number background */}
                      <span className="absolute -top-4 -right-2 text-[120px] font-bold text-gray-100 dark:text-gray-800 leading-none select-none">
                        {value.number}
                      </span>

                      <div className="relative">
                        <motion.div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                            value.color === 'teal' ? 'bg-[var(--hff-teal)]/10 group-hover:bg-[var(--hff-teal)]/20' :
                            value.color === 'gold' ? 'bg-[var(--hff-gold)]/15 group-hover:bg-[var(--hff-gold)]/25' :
                            'bg-[var(--hff-sage)]/15 group-hover:bg-[var(--hff-sage)]/25'
                          } transition-colors duration-300`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <value.icon className={`w-7 h-7 ${
                            value.color === 'teal' ? 'text-[var(--hff-teal)]' :
                            value.color === 'gold' ? 'text-[var(--hff-gold)]' :
                            'text-[var(--hff-sage)]'
                          }`} />
                        </motion.div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{value.description}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ========== GEOGRAPHIC FOCUS ========== */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <FadeIn direction="left" className="order-2 lg:order-1">
                  <GlassCard variant="teal" className="p-8" glow>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-[var(--hff-teal)]/20 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-[var(--hff-teal)]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Service Area</h3>
                        <p className="text-sm text-gray-500">Within 100 miles of Omaha</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        'Omaha metropolitan area',
                        'Council Bluffs, Iowa',
                        'Western Iowa communities',
                        'Surrounding rural areas'
                      ].map((area, index) => (
                        <motion.div
                          key={area}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-[var(--hff-sage)] flex-shrink-0" />
                          <span className="text-gray-700">{area}</span>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </FadeIn>

                <FadeIn direction="right" delay={0.2} className="order-1 lg:order-2">
                  <div>
                    <GlassBadge variant="teal" className="mb-4">
                      <MapPin className="w-4 h-4" />
                      Geographic Focus
                    </GlassBadge>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Serving Our Local Community
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      We believe in the power of focused, local giving. By concentrating our resources
                      in the Omaha/Council Bluffs metro area and Western Iowa, we can make a deeper,
                      more meaningful impact.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                      We serve organizations within a 100-mile radius of Omaha, Nebraska,
                      ensuring that every dollar stays close to home and directly benefits
                      children in our community.
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* ========== GRANT CYCLES ========== */}
        <section className="py-24 bg-gradient-to-b from-white to-[var(--hff-teal-50)]/30">
          <div className="container mx-auto px-4">
            <FadeIn>
              <div className="text-center mb-16">
                <GlassBadge variant="gold" className="mb-4">
                  <Calendar className="w-4 h-4" />
                  Grant Timeline
                </GlassBadge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Grant Cycles
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  We offer two funding opportunities each year, giving organizations flexibility in their timing.
                </p>
              </div>
            </FadeIn>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <FadeIn delay={0.1}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <GlassCard className="p-8 h-full text-center" hover={false}>
                    <div className="w-16 h-16 rounded-2xl bg-[var(--hff-sage)]/15 flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl">🌸</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Spring Cycle</h3>
                    <p className="text-4xl font-bold text-[var(--hff-teal)] mb-2">February 15</p>
                    <p className="text-gray-500 mb-4">Letter of Inquiry Deadline</p>
                    <p className="text-gray-600 text-sm">
                      Funding decisions announced in April
                    </p>
                  </GlassCard>
                </motion.div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <GlassCard className="p-8 h-full text-center" hover={false}>
                    <div className="w-16 h-16 rounded-2xl bg-[var(--hff-gold)]/15 flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl">🍂</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Fall Cycle</h3>
                    <p className="text-4xl font-bold text-[var(--hff-gold)] mb-2">July 15</p>
                    <p className="text-gray-500 mb-4">Letter of Inquiry Deadline</p>
                    <p className="text-gray-600 text-sm">
                      Funding decisions announced in September
                    </p>
                  </GlassCard>
                </motion.div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--hff-teal)] via-[var(--hff-teal-800)] to-[var(--hff-teal-900)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

          <motion.div
            className="absolute -top-20 -right-20 w-80 h-80 bg-[var(--hff-gold)]/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <FadeIn>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Partner With Us?
                </h2>
                <p className="text-xl text-white/80 mb-10 leading-relaxed">
                  Review our eligibility criteria to see if your organization qualifies for funding.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      asChild
                      className="bg-white text-[var(--hff-teal)] hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-xl"
                    >
                      <Link href="/eligibility">
                        View Eligibility
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full"
                    >
                      <Link href="/sign-up">Apply Now</Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
