import { forwardRef } from 'react'
import { cn } from '../../lib/cn'

export type IconButtonVariant = 'ghost' | 'filled'
export type IconButtonSize = 'sm' | 'md' | 'lg'
export type IconButtonShape = 'square' | 'circle'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  variant?: IconButtonVariant
  size?: IconButtonSize
  shape?: IconButtonShape
  children: React.ReactNode
}

const variantClasses: Record<IconButtonVariant, string> = {
  ghost: [
    'bg-transparent text-text-secondary',
    'hover:bg-surface-secondary hover:text-text-primary',
    'focus-visible:ring-2 focus-visible:ring-brand-400',
    'disabled:text-neutral-300',
  ].join(' '),
  filled: [
    'bg-brand-500 text-white',
    'hover:bg-brand-600',
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    'disabled:bg-neutral-200 disabled:text-neutral-500',
  ].join(' '),
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8 [&>svg]:w-4 [&>svg]:h-4',
  md: 'w-10 h-10 [&>svg]:w-5 [&>svg]:h-5',
  lg: 'w-12 h-12 [&>svg]:w-6 [&>svg]:h-6',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', shape = 'circle', disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center shrink-0',
          'transition-colors duration-150 outline-none',
          'cursor-pointer disabled:cursor-not-allowed',
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
