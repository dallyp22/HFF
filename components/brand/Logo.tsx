import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  variant?: 'full-color' | 'full-black' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
}

const sizes = {
  sm: { full: { width: 120, height: 48 }, icon: { width: 32, height: 32 } },
  md: { full: { width: 180, height: 72 }, icon: { width: 48, height: 48 } },
  lg: { full: { width: 240, height: 96 }, icon: { width: 64, height: 64 } },
}

const sources = {
  'full-color': '/logos/hff-full-color.png',
  'full-black': '/logos/hff-full-black.png',
  'icon': '/logos/hff-icon.png',
}

export function Logo({ 
  variant = 'full-color', 
  size = 'md', 
  className = '',
  href = '/'
}: LogoProps) {
  const isIcon = variant === 'icon'
  const dimensions = sizes[size][isIcon ? 'icon' : 'full']
  
  const logoImage = (
    <Image
      src={sources[variant]}
      alt="Heistand Family Foundation"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      priority
    />
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoImage}
      </Link>
    )
  }

  return logoImage
}
