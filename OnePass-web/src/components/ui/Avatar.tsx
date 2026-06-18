import { cn } from '../../lib/cn'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  src?: string
  alt?: string
  initials?: string
  size?: AvatarSize
  online?: boolean
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
}

const dotSizeClasses: Record<AvatarSize, string> = {
  sm: 'w-2 h-2 bottom-0 right-0',
  md: 'w-2.5 h-2.5 bottom-0.5 right-0.5',
  lg: 'w-3.5 h-3.5 bottom-0.5 right-0.5',
}

export function Avatar({ src, alt, initials, size = 'md', online, className }: AvatarProps) {
  const letters = initials
    ? initials.slice(0, 2).toUpperCase()
    : alt
      ? alt
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : '?'

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'rounded-full overflow-hidden inline-flex items-center justify-center',
          'bg-brand-100 text-brand-600 font-semibold select-none',
          sizeClasses[size],
        )}
      >
        {src ? (
          <img src={src} alt={alt ?? ''} className="w-full h-full object-cover" />
        ) : (
          <span>{letters}</span>
        )}
      </div>
      {online && (
        <span
          role="img"
          aria-label="Online"
          className={cn(
            'absolute rounded-full bg-green-400 border-2 border-white',
            dotSizeClasses[size],
          )}
        />
      )}
    </div>
  )
}
