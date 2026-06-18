import { GradientPlayButton } from '../ui'
import { cn } from '../../lib/cn'

export interface PromoBannerProps {
  title: string
  subtitle?: string
  imageSrc?: string
  variant?: 'default' | 'drops'
  prize?: string
  className?: string
  onPlay?: () => void
}

export function PromoBanner({
  title,
  subtitle,
  imageSrc,
  variant = 'default',
  prize,
  className,
  onPlay,
}: PromoBannerProps) {
  const isDrops = variant === 'drops'

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl overflow-hidden',
        isDrops ? 'min-h-[180px]' : 'min-h-[160px]',
        className,
      )}
    >
      {/* Background image or gradient fallback */}
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'var(--gradient-play)' }}
        />
      )}

      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: isDrops
            ? 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
            : 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-4 gap-2 min-h-[inherit]">
        {prize && (
          <p className="text-accent-cyan font-extrabold italic text-2xl leading-none">{prize}</p>
        )}
        <p className="text-white font-extrabold italic text-lg leading-tight max-w-[60%]">
          {title}
        </p>
        {subtitle && (
          <p className="text-white/80 text-xs font-semibold max-w-[65%]">{subtitle}</p>
        )}
        <GradientPlayButton size="sm" onClick={onPlay} className="self-start mt-1" aria-label={`Play ${title}`} />
      </div>
    </div>
  )
}
