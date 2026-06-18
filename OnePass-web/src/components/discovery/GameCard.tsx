import { cn } from '../../lib/cn'

export interface GameCardProps {
  title: string
  casinoName: string
  thumbnailSrc?: string
  className?: string
  onPlay?: () => void
}

export function GameCard({ title, casinoName, thumbnailSrc, className, onPlay }: GameCardProps) {
  return (
    <button
      onClick={onPlay}
      className={cn(
        'relative w-[136px] rounded-xl overflow-hidden shrink-0 flex flex-col',
        'bg-brand-25 border border-border-subtle',
        'hover:border-brand-300 transition-colors duration-150 text-left',
        'focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:outline-offset-2',
        className,
      )}
      aria-label={`Play ${title}`}
    >
      {/* Thumbnail */}
      <div className="w-full aspect-[4/3] bg-brand-100 relative overflow-hidden shrink-0">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: 'var(--gradient-play)', opacity: 0.3 }}
          />
        )}
      </div>

      {/* Info */}
      <div className="px-2 py-2 flex flex-col gap-0.5">
        <p className="text-xs font-extrabold text-text-primary leading-tight truncate">{title}</p>
        <p className="text-xs text-text-tertiary leading-tight truncate">{casinoName}</p>
      </div>
    </button>
  )
}
