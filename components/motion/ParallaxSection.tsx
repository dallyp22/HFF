'use client'

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { ReactNode, useRef } from 'react'

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  speed?: number // Positive = slower, Negative = faster
  direction?: 'vertical' | 'horizontal'
}

export function ParallaxSection({
  children,
  className,
  speed = 0.5,
  direction = 'vertical',
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])
  const x = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])

  return (
    <motion.div
      ref={ref}
      style={direction === 'vertical' ? { y } : { x }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Parallax background that moves slower than content
interface ParallaxBackgroundProps {
  children?: ReactNode
  className?: string
  speed?: number
  imageUrl?: string
}

export function ParallaxBackground({
  children,
  className,
  speed = 0.3,
  imageUrl,
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${50 * speed}%`])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{
          y,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        }}
        className="absolute inset-0 bg-cover bg-center"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// Floating element that responds to scroll
interface FloatingElementProps {
  children: ReactNode
  className?: string
  amplitude?: number // How much it moves
  frequency?: number // How fast it oscillates
}

export function FloatingElement({
  children,
  className,
  amplitude = 10,
}: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [amplitude, -amplitude, amplitude]
  )

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

// Hook for custom parallax effects
export function useParallax(
  scrollYProgress: MotionValue<number>,
  distance: number = 100
) {
  return useTransform(scrollYProgress, [0, 1], [-distance, distance])
}
