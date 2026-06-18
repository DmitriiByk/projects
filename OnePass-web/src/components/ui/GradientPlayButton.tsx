import { cn } from '../../lib/cn'

export type PlayButtonSize = 'sm' | 'md'

export interface GradientPlayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  size?: PlayButtonSize
}

const sizeClasses: Record<PlayButtonSize, string> = {
  sm: 'h-9 px-5 text-sm',
  md: 'h-11 px-7 text-base',
}

export function GradientPlayButton({
  label = 'PLAY',
  size = 'md',
  disabled,
  className,
  ...props
}: GradientPlayButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'font-extrabold italic uppercase tracking-wide text-white',
        'transition-opacity duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses[size],
        className,
      )}
      style={{ background: 'var(--gradient-play)' }}
      {...props}
    >
      {label}
    </button>
  )
}
