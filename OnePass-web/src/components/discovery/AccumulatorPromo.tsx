import { GradientPlayButton } from '../ui'
import { cn } from '../../lib/cn'

export interface AccumulatorPromoProps {
  title: string
  subtitle: string
  boostValue: string
  imageSrc?: string
  className?: string
  onPlay?: () => void
}

export function AccumulatorPromo({
  title,
  subtitle,
  boostValue,
  imageSrc,
  className,
  onPlay,
}: AccumulatorPromoProps) {
  return (
    <div
      className={cn(
        'relative mx-4 rounded-2xl overflow-hidden flex items-center min-h-[100px]',
        className,
      )}
      style={{
        background: 'linear-gradient(135deg, #0044a0 0%, #0080ff 50%, #00d4ff 100%)',
      }}
    >
      {/* Background image overlay */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
      )}

      {/* Left content */}
      <div className="relative z-10 flex-1 p-4 flex flex-col gap-1">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">{subtitle}</p>
        <p className="text-white font-extrabold italic text-base leading-tight">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-2xl font-extrabold italic leading-none"
            style={{ color: '#00d4ff' }}
          >
            {boostValue}
          </span>
          <span className="text-white/80 text-xs font-semibold">BOOST</span>
        </div>
      </div>

      {/* Right: Play button */}
      <div className="relative z-10 pr-4">
        <GradientPlayButton size="sm" onClick={onPlay} aria-label={`Play ${title}`} />
      </div>
    </div>
  )
}
