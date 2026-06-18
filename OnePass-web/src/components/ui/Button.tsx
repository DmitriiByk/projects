import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-500 text-text-on-brand',
    'hover:bg-brand-600',
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
    'disabled:bg-neutral-200 disabled:text-neutral-500',
  ].join(' '),
  secondary: [
    'bg-surface-secondary text-text-secondary border border-border-subtle',
    'hover:bg-neutral-100 hover:border-border',
    'focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2',
    'disabled:bg-neutral-25 disabled:text-neutral-300 disabled:border-neutral-100',
  ].join(' '),
  tertiary: [
    'bg-transparent text-brand-500 border border-brand-300',
    'hover:bg-brand-25 hover:border-brand-500',
    'focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
    'disabled:text-btn-tertiary-disabled disabled:border-btn-tertiary-disabled',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'h-8 px-3 text-xs gap-1.5',
  sm: 'h-10 px-4 text-sm gap-2',
  md: 'h-11 px-5 text-base gap-2',
  lg: 'h-13 px-6 text-lg gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-extrabold italic',
          'transition-colors duration-150 outline-none',
          'cursor-pointer disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
            {children}
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
