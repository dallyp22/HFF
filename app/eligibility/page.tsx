'use client'

import { useState } from 'react'
import { Header } from '@/components/brand/Header'
import { Footer } from '@/components/brand/Footer'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/motion/StaggerContainer'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  FileText,
  DollarSign,
  Calendar,
  ChevronDown,
  Sparkles,
  AlertCircle,
  Info,
  Building2,
  MapPin,
  Users,
  ClipboardCheck
} from 'lucide-react'

const requiredCriteria = [
  {
    id: 'nonprofit',
    title: '501(c)(3) Tax-Exempt Status',
    description: 'Your organization must be recognized by the IRS as a tax-exempt nonprofit organization.',
    icon: Building2,
  },
  {
    id: 'location',
    title: 'Geographic Location',
    description: 'Your organization must serve communities within 100 miles of Omaha, Nebraska, including the Omaha/Council Bluffs metro area and Western Iowa.',
    icon: MapPin,
  },
  {
    id: 'children',
    title: 'Focus on Children in Poverty',
    description: 'Your proposed project must directly serve children living in poverty. Programs should demonstrate clear indicators of poverty among the target population.',
    icon: Users,
  },
  {
    id: 'capacity',
    title: 'Organizational Capacity',
    description: 'Your organization must demonstrate the capacity to successfully implement the proposed project, including adequate staffing and financial management.',
    icon: ClipboardCheck,
  },
]

const ineligibleItems = [
  'Organizations that do not serve children as their primary mission',
  'Programs outside our geographic service area',
  'Capital campaigns or building projects',
  'Endowment funds or operating reserves',
  'Individual scholarships or direct assistance to individuals',
  'Political or lobbying activities',
]

const requiredDocuments = [
  'Most recent IRS Form 990 or 990-EZ',
  'IRS determination letter confirming 501(c)(3) status',
  'Current financial statements',
  'Project budget',
  'Board of Directors list',
]

export default function EligibilityPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
  }

  const allChecked = checkedItems.size === requiredCriteria.length

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header variant="public" />

      <main className="flex-1">
        {/* ========== HERO SECTION ========== */}
        <section className="relative py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--hff-teal-50)] via-white to-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(32,70,82,0.1)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_100%,rgba(129,178,154,0.08)_0%,transparent_40%)]" />
          </div>

          <div className="container mx-auto px-4 relative">
            <StaggerContainer staggerDelay={0.1} className="max-w-3xl mx-auto text-center">
              <StaggerItem>
                <GlassBadge variant="teal" size="lg" className="mb-6">
                  <ClipboardCheck className="w-4 h-4" />
                  Requirements
                </GlassBadge>
              </StaggerItem>

              <StaggerItem>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                  Eligibility
                  <span className="text-[var(--hff-teal)]"> Criteria</span>
                </h1>
              </StaggerItem>

              <StaggerItem>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Review these requirements to determine if your organization qualifies
                  for a grant from the Heistand Family Foundation.
                </p>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ========== INTERACTIVE CHECKLIST ========== */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      Required Criteria
                    </h2>
                    <p className="text-gray-600">
                      Your organization must meet <span className="font-semibold text-[var(--hff-teal)]">all</span> of these requirements
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <GlassBadge variant={allChecked ? 'success' : 'default'} size="lg">
                      {checkedItems.size}/{requiredCriteria.length} checked
                    </GlassBadge>
                  </div>
                </div>
              </FadeIn>

              {/* Progress bar */}
              <FadeIn delay={0.1}>
                <div className="mb-8">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--hff-teal)] to-[var(--hff-sage)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(checkedItems.size / requiredCriteria.length) * 100}%` }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </FadeIn>

              {/* Criteria cards */}
              <div className="space-y-4">
                {requiredCriteria.map((criterion, index) => {
                  const isChecked = checkedItems.has(criterion.id)

                  return (
                    <FadeIn key={criterion.id} delay={index * 0.1}>
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleCheck(criterion.id)}
                        className="cursor-pointer"
                      >
                        <GlassCard
                          variant={isChecked ? 'teal' : 'default'}
                          className={`p-6 transition-all duration-300 ${
                            isChecked ? 'border-[var(--hff-sage)]/30' : ''
                          }`}
                          hover={false}
                        >
                          <div className="flex gap-4">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 pt-1">
                              <motion.div
                                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-[var(--hff-sage)] border-[var(--hff-sage)]'
                                    : 'border-gray-300 hover:border-[var(--hff-teal)]'
                                }`}
                                animate={isChecked ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 0.2 }}
                              >
                                <AnimatePresence>
                                  {isChecked && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                    >
                                      <CheckCircle2 className="w-5 h-5 text-white" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                  isChecked ? 'bg-[var(--hff-sage)]/20' : 'bg-[var(--hff-teal)]/10'
                                }`}>
                                  <criterion.icon className={`w-5 h-5 ${
                                    isChecked ? 'text-[var(--hff-sage)]' : 'text-[var(--hff-teal)]'
                                  }`} />
                                </div>
                                <div>
                                  <h3 className={`font-semibold text-lg mb-1 ${
                                    isChecked ? 'text-gray-900' : 'text-gray-800'
                                  }`}>
                                    {criterion.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {criterion.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    </FadeIn>
                  )
                })}
              </div>

              {/* Result message */}
              <AnimatePresence>
                {allChecked && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8"
                  >
                    <GlassCard variant="teal" className="p-6" glow>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--hff-sage)]/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-[var(--hff-sage)]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            You may be eligible!
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Based on your selections, your organization appears to meet our basic criteria.
                          </p>
                        </div>
                        <Button asChild className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)]">
                          <Link href="/sign-up">
                            Apply Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ========== NOT ELIGIBLE SECTION ========== */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FadeIn>
                <GlassCard className="p-8 border-red-100 bg-red-50/30" hover={false}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Not Eligible for Funding
                      </h2>
                      <p className="text-gray-600">
                        We do not provide grants for the following purposes
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {ineligibleItems.map((item, index) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/60"
                      >
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ========== GRANT INFORMATION ========== */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <FadeIn>
                <div className="text-center mb-12">
                  <GlassBadge variant="gold" className="mb-4">
                    <Info className="w-4 h-4" />
                    Grant Details
                  </GlassBadge>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Grant Information
                  </h2>
                </div>
              </FadeIn>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Grant Range */}
                <FadeIn delay={0.1}>
                  <GlassCard className="p-6 text-center h-full" hover={false}>
                    <div className="w-14 h-14 rounded-2xl bg-[var(--hff-gold)]/15 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-7 h-7 text-[var(--hff-gold)]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Grant Range</h3>
                    <p className="text-3xl font-bold text-[var(--hff-teal)] mb-2">
                      $10K - $50K
                    </p>
                    <p className="text-sm text-gray-500">
                      Typical award amount, with exceptions based on impact
                    </p>
                  </GlassCard>
                </FadeIn>

                {/* Spring Cycle */}
                <FadeIn delay={0.2}>
                  <GlassCard className="p-6 text-center h-full" hover={false}>
                    <div className="w-14 h-14 rounded-2xl bg-[var(--hff-sage)]/15 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-[var(--hff-sage)]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Spring Cycle</h3>
                    <p className="text-3xl font-bold text-[var(--hff-sage)] mb-2">
                      Feb 15
                    </p>
                    <p className="text-sm text-gray-500">
                      Letter of Inquiry deadline
                    </p>
                  </GlassCard>
                </FadeIn>

                {/* Fall Cycle */}
                <FadeIn delay={0.3}>
                  <GlassCard className="p-6 text-center h-full" hover={false}>
                    <div className="w-14 h-14 rounded-2xl bg-[var(--hff-teal)]/10 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-[var(--hff-teal)]" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">Fall Cycle</h3>
                    <p className="text-3xl font-bold text-[var(--hff-teal)] mb-2">
                      Jul 15
                    </p>
                    <p className="text-sm text-gray-500">
                      Letter of Inquiry deadline
                    </p>
                  </GlassCard>
                </FadeIn>
              </div>

              {/* Required Documents */}
              <FadeIn delay={0.4}>
                <GlassCard className="p-8 mt-8" hover={false}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[var(--hff-teal)]/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-[var(--hff-teal)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Required Documents
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Please have these ready when you apply
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {requiredDocuments.map((doc, index) => (
                      <motion.div
                        key={doc}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[var(--hff-teal)]/5"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[var(--hff-teal)] flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{doc}</span>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--hff-teal)] via-[var(--hff-teal-800)] to-[var(--hff-teal-900)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(129,178,154,0.15)_0%,transparent_40%)]" />

          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <FadeIn>
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Does Your Organization Qualify?
                </h2>
                <p className="text-xl text-white/80 mb-10 leading-relaxed">
                  If you meet our eligibility criteria, we'd love to hear from you.
                  Start your application today.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      asChild
                      className="bg-white text-[var(--hff-teal)] hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-xl"
                    >
                      <Link href="/sign-up">
                        Create Account
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
                      <Link href="/documents/sample-loi.pdf" target="_blank">
                        Preview LOI Questions (PDF)
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
                      <Link href="/documents/sample-application.pdf" target="_blank">
                        Preview Application Questions (PDF)
                      </Link>
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
