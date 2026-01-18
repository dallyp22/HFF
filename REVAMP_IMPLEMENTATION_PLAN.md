# HFF Grant Portal — Frontend Revamp Implementation Plan

## Design Vision: "Quiet Confidence"

A foundation's grant portal must radiate **trust, warmth, and institutional gravitas** — but never feel dated or stiff. The "Quiet Confidence" aesthetic draws inspiration from **Nordic architecture** and **editorial magazine design**: generous whitespace, decisive typography, subtle depth through layered glass effects, and motion that feels intentional rather than decorative.

### Aesthetic DNA

| Trait | Expression |
|-------|------------|
| **Typography** | Satoshi (display/headings) + Source Serif 4 (formal/body accent) — a confident sans paired with a refined serif |
| **Color** | HFF Teal as hero; warm gold (#D4A574) and sage (#81B29A) as accent punctuation |
| **Texture** | Subtle grain overlays, glassmorphism panels, gentle teal radial glows |
| **Motion** | Expo easing, staggered reveals, parallax depth — never gratuitous |
| **Layout** | Bento grids, asymmetric hero compositions, generous breathing room |

### The "One Thing" to Remember
**Floating glass panels** that catch light and shadow — every major card and container uses a refined glassmorphism with subtle teal glow halos, creating a sense of elevated, thoughtful design that feels distinctly HFF.

---

## Phase 1: Design System Foundation

### 1.1 New Dependencies

```bash
npm install framer-motion @fontsource-variable/satoshi @fontsource-variable/source-serif-4
```

### 1.2 Enhanced CSS Variables (globals.css additions)

```css
:root {
  /* === HFF Extended Palette === */
  --hff-gold: #D4A574;
  --hff-coral: #E07A5F;
  --hff-sage: #81B29A;

  /* === Glassmorphism Tokens === */
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-bg-dark: rgba(32, 70, 82, 0.08);
  --glass-border: rgba(255, 255, 255, 0.25);
  --glass-blur: 20px;
  --glass-shadow: 0 8px 32px rgba(32, 70, 82, 0.12);

  /* === Gradient Definitions === */
  --hff-teal-gradient: linear-gradient(135deg, #204652 0%, #2d5a68 50%, #3a6e7e 100%);
  --hff-mesh-gradient: radial-gradient(ellipse at 20% 0%, rgba(32, 70, 82, 0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 100%, rgba(212, 165, 116, 0.1) 0%, transparent 50%);
  --hff-hero-glow: radial-gradient(ellipse at center, rgba(32, 70, 82, 0.2) 0%, transparent 70%);

  /* === Motion Tokens === */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;

  /* === Texture === */
  --noise-opacity: 0.03;
}

.dark {
  --glass-bg: rgba(32, 70, 82, 0.4);
  --glass-bg-dark: rgba(0, 0, 0, 0.3);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  --noise-opacity: 0.05;
}
```

### 1.3 Component File Structure

```
components/
├── ui/                          # Existing shadcn components (enhanced)
├── brand/
│   ├── Header.tsx               # ✨ Revamped with glassmorphism
│   ├── Footer.tsx               # ✨ Revamped
│   └── Logo.tsx                 # Existing
├── motion/                      # 🆕 NEW: Animation primitives
│   ├── FadeIn.tsx
│   ├── SlideIn.tsx
│   ├── StaggerContainer.tsx
│   ├── AnimatedCounter.tsx
│   ├── PageTransition.tsx
│   └── ParallaxSection.tsx
├── glass/                       # 🆕 NEW: Glassmorphism components
│   ├── GlassCard.tsx
│   ├── GlassPanel.tsx
│   └── GlassBadge.tsx
├── forms/                       # 🆕 NEW: Enhanced form components
│   ├── FloatingInput.tsx
│   ├── FloatingTextarea.tsx
│   ├── FloatingSelect.tsx
│   ├── FileDropzone.tsx
│   └── ProgressStepper.tsx
├── feedback/                    # 🆕 NEW: Loading/Error states
│   ├── SkeletonCard.tsx
│   ├── SkeletonTable.tsx
│   ├── EmptyState.tsx
│   └── ErrorState.tsx
└── data/                        # 🆕 NEW: Data visualization
    ├── StatCard.tsx
    ├── StatusBadge.tsx
    ├── ProgressRing.tsx
    └── MiniChart.tsx
```

---

## Phase 2: Core Motion Components

### 2.1 FadeIn Component

**File:** `components/motion/FadeIn.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  className?: string
}

const directionOffset = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  distance = 24,
  className,
}: FadeInProps) {
  const offset = direction !== 'none'
    ? { [direction === 'up' || direction === 'down' ? 'y' : 'x']: direction === 'up' || direction === 'left' ? distance : -distance }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // expo out
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### 2.2 StaggerContainer Component

**File:** `components/motion/StaggerContainer.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerContainerProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

### 2.3 AnimatedCounter Component

**File:** `components/motion/AnimatedCounter.tsx`

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({
  value,
  duration = 2,
  className,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [hasAnimated, setHasAnimated] = useState(false)

  const spring = useSpring(0, {
    mass: 1,
    stiffness: 75,
    damping: 15,
    duration: duration * 1000,
  })

  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value)
      setHasAnimated(true)
    }
  }, [isInView, value, spring, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}
```

---

## Phase 3: Glassmorphism Components

### 3.1 GlassCard Component

**File:** `components/glass/GlassCard.tsx`

```tsx
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'teal'
  glow?: boolean
  hover?: boolean
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  glow = false,
  hover = true,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        // Base glass styles
        'relative rounded-2xl border backdrop-blur-[20px]',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',

        // Variant styles
        variant === 'default' && [
          'bg-white/70 border-white/25',
          'shadow-[0_8px_32px_rgba(32,70,82,0.08)]',
          'dark:bg-[rgba(32,70,82,0.3)] dark:border-white/10',
        ],
        variant === 'elevated' && [
          'bg-white/80 border-white/30',
          'shadow-[0_12px_40px_rgba(32,70,82,0.12)]',
          'dark:bg-[rgba(32,70,82,0.4)] dark:border-white/15',
        ],
        variant === 'teal' && [
          'bg-[rgba(32,70,82,0.08)] border-[rgba(32,70,82,0.15)]',
          'shadow-[0_8px_32px_rgba(32,70,82,0.1)]',
          'dark:bg-[rgba(32,70,82,0.5)] dark:border-[rgba(32,70,82,0.3)]',
        ],

        // Hover effects
        hover && 'hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(32,70,82,0.15)]',

        // Glow effect
        glow && 'before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:blur-xl before:bg-[rgba(32,70,82,0.15)]',

        className
      )}
    >
      {children}
    </div>
  )
}

export function GlassCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-2', className)}>{children}</div>
}

export function GlassCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function GlassCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-2 pb-6 border-t border-white/10', className)}>{children}</div>
}
```

### 3.2 GlassBadge Component

**File:** `components/glass/GlassBadge.tsx`

```tsx
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GlassBadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  pulse?: boolean
}

const variantStyles = {
  default: 'bg-[var(--hff-slate)]/10 text-[var(--hff-slate)] border-[var(--hff-slate)]/20',
  success: 'bg-[var(--hff-sage)]/15 text-emerald-700 border-[var(--hff-sage)]/30',
  warning: 'bg-[var(--hff-gold)]/15 text-amber-700 border-[var(--hff-gold)]/30',
  error: 'bg-[var(--hff-coral)]/15 text-red-700 border-[var(--hff-coral)]/30',
  info: 'bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] border-[var(--hff-teal)]/20',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

export function GlassBadge({
  children,
  variant = 'default',
  size = 'md',
  className,
  pulse = false,
}: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error' && 'bg-red-500',
            variant === 'info' && 'bg-[var(--hff-teal)]',
            variant === 'default' && 'bg-[var(--hff-slate)]',
          )} />
          <span className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'error' && 'bg-red-500',
            variant === 'info' && 'bg-[var(--hff-teal)]',
            variant === 'default' && 'bg-[var(--hff-slate)]',
          )} />
        </span>
      )}
      {children}
    </span>
  )
}
```

---

## Phase 4: Enhanced Form Components

### 4.1 FloatingInput Component

**File:** `components/forms/FloatingInput.tsx`

```tsx
'use client'

import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes, useState } from 'react'

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const hasValue = Boolean(props.value || props.defaultValue)

    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          className={cn(
            'peer w-full rounded-xl border bg-white/50 px-4 pt-6 pb-2',
            'text-base text-gray-900 placeholder-transparent',
            'backdrop-blur-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-[var(--hff-teal)]/30 focus:border-[var(--hff-teal)]',
            'dark:bg-white/5 dark:text-white',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/30'
              : 'border-gray-200 dark:border-white/10',
            className
          )}
          placeholder={label}
        />
        <label
          className={cn(
            'absolute left-4 transition-all duration-200 pointer-events-none',
            'text-gray-500 dark:text-gray-400',
            (isFocused || hasValue)
              ? 'top-2 text-xs font-medium text-[var(--hff-teal)]'
              : 'top-1/2 -translate-y-1/2 text-base',
            error && (isFocused || hasValue) && 'text-red-500'
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

FloatingInput.displayName = 'FloatingInput'
```

### 4.2 FileDropzone Component

**File:** `components/forms/FileDropzone.tsx`

```tsx
'use client'

import { cn } from '@/lib/utils'
import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, CheckCircle } from 'lucide-react'

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number // in MB
  className?: string
}

export function FileDropzone({
  onFilesSelected,
  accept = '*',
  maxFiles = 5,
  maxSize = 10,
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, maxFiles)
    setFiles(droppedFiles)
    onFilesSelected(droppedFiles)
  }, [maxFiles, onFilesSelected])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).slice(0, maxFiles)
    setFiles(selectedFiles)
    onFilesSelected(selectedFiles)
  }, [maxFiles, onFilesSelected])

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    onFilesSelected(newFiles)
  }

  return (
    <div className={className}>
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? 'var(--hff-teal)' : undefined,
        }}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-8',
          'bg-gradient-to-b from-white/50 to-white/30 backdrop-blur-sm',
          'transition-colors duration-200 cursor-pointer',
          'hover:border-[var(--hff-teal)]/50 hover:bg-[var(--hff-teal)]/5',
          isDragging ? 'border-[var(--hff-teal)] bg-[var(--hff-teal)]/10' : 'border-gray-200',
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ y: isDragging ? -5 : 0 }}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center mb-4',
              'bg-[var(--hff-teal)]/10'
            )}
          >
            <Upload className="w-6 h-6 text-[var(--hff-teal)]" />
          </motion.div>

          <p className="text-base font-medium text-gray-700 mb-1">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse · Max {maxSize}MB per file
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={file.name + index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100"
              >
                <File className="w-5 h-5 text-[var(--hff-teal)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### 4.3 ProgressStepper Component

**File:** `components/forms/ProgressStepper.tsx`

```tsx
'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface Step {
  id: string
  label: string
  description?: string
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function ProgressStepper({ steps, currentStep, className }: ProgressStepperProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Progress line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
        <motion.div
          className="h-full bg-[var(--hff-teal)]"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep

          return (
            <div key={step.id} className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted || isCurrent ? 'var(--hff-teal)' : '#fff',
                }}
                className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                  'border-2 transition-colors duration-300',
                  isCompleted || isCurrent
                    ? 'border-[var(--hff-teal)]'
                    : 'border-gray-300 bg-white'
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isCurrent ? 'text-white' : 'text-gray-400'
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </motion.div>

              <div className="mt-3 text-center">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-[var(--hff-teal)]' : 'text-gray-600'
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

## Phase 5: Data Visualization Components

### 5.1 StatCard Component

**File:** `components/data/StatCard.tsx`

```tsx
'use client'

import { cn } from '@/lib/utils'
import { AnimatedCounter } from '@/components/motion/AnimatedCounter'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean }
  prefix?: string
  suffix?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  prefix,
  suffix,
  className,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-white/70 backdrop-blur-[20px] border border-white/25',
        'shadow-[0_8px_32px_rgba(32,70,82,0.08)]',
        'dark:bg-[rgba(32,70,82,0.3)] dark:border-white/10',
        className
      )}
    >
      {/* Decorative gradient */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--hff-teal)]/5 rounded-full blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </p>

          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm font-medium',
              trend.isPositive ? 'text-emerald-600' : 'text-red-500'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}%</span>
              <span className="text-gray-400 font-normal">vs last period</span>
            </div>
          )}
        </div>

        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          'bg-[var(--hff-teal)]/10'
        )}>
          <Icon className="w-6 h-6 text-[var(--hff-teal)]" />
        </div>
      </div>
    </motion.div>
  )
}
```

### 5.2 ProgressRing Component

**File:** `components/data/ProgressRing.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  showPercentage?: boolean
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  label,
  showPercentage = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-800"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            strokeDasharray: circumference,
          }}
        />

        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--hff-teal)" />
            <stop offset="100%" stopColor="#3a6e7e" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span
            className="text-2xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {progress}%
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-gray-500 mt-0.5">{label}</span>
        )}
      </div>
    </div>
  )
}
```

---

## Phase 6: Page-by-Page Implementation Order

### Priority 1: Foundation (Sprint 1)

| Task | File | Description |
|------|------|-------------|
| 1.1 | `globals.css` | Add new CSS variables, gradients, motion tokens |
| 1.2 | `package.json` | Add framer-motion, font packages |
| 1.3 | `components/motion/*` | Create FadeIn, StaggerContainer, AnimatedCounter |
| 1.4 | `components/glass/*` | Create GlassCard, GlassBadge |
| 1.5 | `components/brand/Header.tsx` | Revamp with glassmorphism scroll effect |
| 1.6 | `components/brand/Footer.tsx` | Elegant redesign |

### Priority 2: Public Pages (Sprint 2)

| Task | File | Description |
|------|------|-------------|
| 2.1 | `app/page.tsx` | Hero with animated gradient mesh, kinetic typography, bento features |
| 2.2 | `app/about/page.tsx` | Parallax hero, animated values, team section |
| 2.3 | `app/eligibility/page.tsx` | Interactive checklist, flowchart |
| 2.4 | `app/sign-in/page.tsx` | Split-screen with animated branding |
| 2.5 | `app/sign-up/page.tsx` | Multi-step with progress indicator |

### Priority 3: Applicant Portal (Sprint 3-4)

| Task | File | Description |
|------|------|-------------|
| 3.1 | `app/(applicant)/dashboard/page.tsx` | Personalized greeting, stat cards, pipeline view |
| 3.2 | `app/(applicant)/applications/page.tsx` | Grid/list toggle, filtering, status badges |
| 3.3 | `app/(applicant)/applications/new/page.tsx` | Stepper, floating inputs, auto-save |
| 3.4 | `app/(applicant)/applications/[id]/page.tsx` | Status banner, timeline, document previews |
| 3.5 | `app/(applicant)/profile/page.tsx` | Avatar upload, progress ring, inline edit |
| 3.6 | `app/(applicant)/documents/page.tsx` | Grid view, batch upload, previews |
| 3.7 | `components/forms/*` | FloatingInput, FloatingTextarea, FileDropzone, ProgressStepper |
| 3.8 | `components/feedback/*` | SkeletonCard, EmptyState, ErrorState |

### Priority 4: Reviewer Portal (Sprint 5)

| Task | File | Description |
|------|------|-------------|
| 4.1 | `app/reviewer/dashboard/page.tsx` | Stats overview, review queue, analytics |
| 4.2 | `app/reviewer/applications/page.tsx` | Priority indicators, batch actions |
| 4.3 | `app/reviewer/applications/[id]/page.tsx` | Split-view, AI summary, voting panel |
| 4.4 | `app/reviewer/organizations/page.tsx` | Organization cards, search |
| 4.5 | `app/reviewer/admin/page.tsx` | System health, cycle timeline |

### Priority 5: Polish (Sprint 6)

| Task | File | Description |
|------|------|-------------|
| 5.1 | Dark mode implementation | Toggle in header, CSS variable swaps |
| 5.2 | Accessibility audit | Focus states, ARIA, reduced motion |
| 5.3 | Performance optimization | Lazy loading, image optimization |
| 5.4 | Mobile responsiveness | Touch interactions, drawer nav |

---

## Sample: Revamped Home Page

Here's a preview of what the home page hero section will look like:

```tsx
// app/page.tsx (hero section)

<section className="relative min-h-screen flex items-center overflow-hidden">
  {/* Animated mesh gradient background */}
  <div className="absolute inset-0 bg-gradient-to-b from-[var(--hff-teal-50)] via-white to-white">
    <div className="absolute inset-0 bg-[var(--hff-mesh-gradient)]" />
    <motion.div
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--hff-teal)]/10 rounded-full blur-3xl"
      animate={{
        x: [0, 50, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
  </div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-4xl mx-auto text-center">
      {/* Staggered headline reveal */}
      <StaggerContainer staggerDelay={0.15}>
        <StaggerItem>
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--hff-teal)]/10 text-[var(--hff-teal)] mb-6">
            Now Accepting Spring 2026 Applications
          </span>
        </StaggerItem>

        <StaggerItem>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Multiply Opportunities
            <br />
            <span className="text-[var(--hff-teal)]">for Children</span>
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-serif">
            The Heistand Family Foundation partners with organizations
            creating lasting change for children in poverty.
          </p>
        </StaggerItem>

        <StaggerItem className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="bg-[var(--hff-teal)] hover:bg-[var(--hff-teal-800)] rounded-full px-8">
            Apply for a Grant
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-8">
            Learn More
          </Button>
        </StaggerItem>
      </StaggerContainer>
    </div>
  </div>

  {/* Scroll indicator */}
  <motion.div
    className="absolute bottom-8 left-1/2 -translate-x-1/2"
    animate={{ y: [0, 8, 0] }}
    transition={{ duration: 1.5, repeat: Infinity }}
  >
    <div className="w-6 h-10 rounded-full border-2 border-[var(--hff-teal)]/30 flex items-start justify-center p-2">
      <motion.div
        className="w-1 h-2 bg-[var(--hff-teal)] rounded-full"
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  </motion.div>
</section>
```

---

## Sample: Revamped Dashboard Stats

```tsx
// components in dashboard

<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  <StatCard
    label="Draft Applications"
    value={stats.draft}
    icon={FileEdit}
  />
  <StatCard
    label="Submitted"
    value={stats.submitted}
    icon={Send}
  />
  <StatCard
    label="Under Review"
    value={stats.underReview}
    icon={Eye}
    trend={{ value: 12, isPositive: true }}
  />
  <StatCard
    label="Approved"
    value={stats.approved}
    icon={CheckCircle}
    prefix="$"
    suffix="K"
  />
</div>

<div className="flex items-center gap-6">
  <ProgressRing
    progress={profileCompletion}
    label="Profile Complete"
    size={100}
  />
  <div>
    <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
    <p className="text-sm text-gray-500">
      Add your organization's mission statement to reach 100%
    </p>
  </div>
</div>
```

---

## Typography Setup

Add to `app/layout.tsx`:

```tsx
import { Satoshi } from '@fontsource-variable/satoshi'
import { Source_Serif_4 } from '@fontsource-variable/source-serif-4'

// Or use next/font for optimization:
import { Geist, Geist_Mono } from "next/font/google"
import localFont from 'next/font/local'

const satoshi = localFont({
  src: '../fonts/Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})
```

Update `globals.css`:

```css
@theme inline {
  --font-sans: var(--font-satoshi), var(--font-geist-sans);
  --font-serif: var(--font-source-serif), Georgia, serif;
  --font-display: var(--font-satoshi);
}
```

---

## Accessibility Considerations

1. **Reduced Motion**: All animations respect `prefers-reduced-motion`
2. **Focus States**: Visible focus rings on all interactive elements
3. **Color Contrast**: WCAG 2.1 AA compliance maintained
4. **Keyboard Navigation**: Full keyboard accessibility throughout
5. **Screen Reader**: ARIA labels on all icons and decorative elements

```tsx
// Example reduced motion support in FadeIn
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false

if (prefersReducedMotion) {
  return <div className={className}>{children}</div>
}
```

---

## Next Steps

1. **Approve this plan** and I'll begin implementation starting with Phase 1 (Design System Foundation)
2. I'll create each component with full TypeScript types and documentation
3. Each page will be revamped iteratively, preserving all existing functionality
4. Regular checkpoints to review progress before moving to next phase

Ready to begin implementation?
