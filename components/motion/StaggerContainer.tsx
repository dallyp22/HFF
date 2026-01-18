'use client'

import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerContainerProps {
  children: ReactNode
  staggerDelay?: number
  delayStart?: number
  className?: string
  once?: boolean
}

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { staggerDelay: number; delayStart: number }) => ({
    transition: {
      staggerChildren: custom.staggerDelay,
      delayChildren: custom.delayStart,
    },
  }),
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayStart = 0,
  className,
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-50px' }}
      variants={containerVariants}
      custom={{ staggerDelay, delayStart }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}

const getItemVariants = (direction: string, distance: number): Variants => {
  const getOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance }
      case 'down':
        return { y: -distance }
      case 'left':
        return { x: distance }
      case 'right':
        return { x: -distance }
      default:
        return { y: distance }
    }
  }

  return {
    hidden: { opacity: 0, ...getOffset() },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }
}

export function StaggerItem({
  children,
  className,
  direction = 'up',
  distance = 20,
}: StaggerItemProps) {
  return (
    <motion.div
      variants={getItemVariants(direction, distance)}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Export variants for custom use
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}
