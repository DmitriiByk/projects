import { cn } from '../../lib/cn'

export type BadgeVariant = 'brand' | 'neutral' | 'accent' | 'category'
export type BadgeSize = 'xs' | 'sm'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  brand: 'bg-brand-500 text-text-on-brand',
  neutral: 'bg-neutral-50 text-text-secondary',
  accent: 'bg-accent-magenta text-white',
  category: 'bg-brand-25 text-brand-500 border border-brand-100',
}

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-sm',
}

export function Badge({ variant = 'neutral', size = 'xs', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold leading-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
