import { cn } from '../../lib/cn'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps {
  padding?: CardPadding
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

export function Card({ padding = 'md', onClick, className, children }: CardProps) {
  const isClickable = typeof onClick === 'function'

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'bg-surface rounded-2xl border border-border-subtle',
        paddingClasses[padding],
        isClickable &&
          'cursor-pointer hover:border-border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
        className,
      )}
    >
      {children}
    </div>
  )
}
