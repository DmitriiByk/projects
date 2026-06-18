import { Badge, GradientPlayButton } from '../ui'
import { cn } from '../../lib/cn'

export type CasinoCategory = 'Sport' | 'Casino' | 'Promo' | 'Live' | 'Slots'

export interface CasinoRowItemProps {
  name: string
  subtitle: string
  logoSrc?: string
  logoInitials?: string
  category: CasinoCategory
  rank?: number
  className?: string
  onPlay?: () => void
}

const categoryColor: Record<CasinoCategory, string> = {
  Sport: 'brand',
  Casino: 'accent',
  Promo: 'neutral',
  Live: 'accent',
  Slots: 'neutral',
} as const

export function CasinoRowItem({
  name,
  subtitle,
  logoSrc,
  logoInitials,
  category,
  rank,
  className,
  onPlay,
}: CasinoRowItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-surface border-b border-border-subtle last:border-b-0',
        className,
      )}
    >
      {/* Rank */}
      {rank !== undefined && (
        <span className="w-5 text-xs font-extrabold text-text-tertiary text-center shrink-0">
          {rank}
        </span>
      )}

      {/* Logo */}
      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-brand-25 border border-border-subtle flex items-center justify-center">
        {logoSrc ? (
          <img src={logoSrc} alt={`${name} logo`} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-extrabold text-brand-500">
            {logoInitials ?? name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold text-text-primary truncate leading-tight">{name}</p>
        <div className="flex items-center gap-1.5 mt-1 min-w-0">
          <Badge
            variant={categoryColor[category] as 'brand' | 'accent' | 'neutral'}
            size="xs"
            className="shrink-0"
          >
            {category}
          </Badge>
          <p className="text-xs text-text-secondary truncate">{subtitle}</p>
        </div>
      </div>

      {/* Play */}
      <GradientPlayButton size="sm" onClick={onPlay} aria-label={`Play ${name}`} className="shrink-0" />
    </div>
  )
}
