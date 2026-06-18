import { cn } from '../../lib/cn'

export interface SectionHeaderProps {
  title: string
  seeAllLabel?: string
  onSeeAll?: () => void
  className?: string
}

export function SectionHeader({
  title,
  seeAllLabel = 'See all',
  onSeeAll,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h2 className="text-lg font-extrabold text-text-primary leading-tight">{title}</h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className={cn(
            'text-sm font-semibold text-brand-500',
            'hover:text-brand-600 transition-colors duration-150',
            'outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1 rounded-sm',
          )}
        >
          {seeAllLabel}
        </button>
      )}
    </div>
  )
}
