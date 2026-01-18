'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useSpring, useTransform, MotionValue } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
  formatNumber?: boolean
}

function AnimatedDigits({
  motionValue,
  decimals,
  formatNumber,
}: {
  motionValue: MotionValue<number>
  decimals: number
  formatNumber: boolean
}) {
  const display = useTransform(motionValue, (current) => {
    const rounded = decimals > 0 ? current.toFixed(decimals) : Math.round(current)
    if (formatNumber) {
      return Number(rounded).toLocaleString()
    }
    return rounded.toString()
  })

  return <motion.span>{display}</motion.span>
}

export function AnimatedCounter({
  value,
  duration = 2,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
  formatNumber = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15,
  })

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value)
      setHasAnimated(true)
    }
  }, [isInView, value, spring, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {prefix}
      <AnimatedDigits
        motionValue={spring}
        decimals={decimals}
        formatNumber={formatNumber}
      />
      {suffix}
    </span>
  )
}

// Simple version without spring animation for smaller numbers
interface SimpleCounterProps {
  value: number
  className?: string
  prefix?: string
  suffix?: string
}

export function SimpleCounter({
  value,
  className,
  prefix = '',
  suffix = '',
}: SimpleCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const increment = end / 50
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setDisplayValue(end)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(start))
        }
      }, 30)
      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}
