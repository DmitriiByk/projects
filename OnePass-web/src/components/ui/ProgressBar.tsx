import { cn } from '../../lib/cn'

export interface ProgressBarProps {
  value: number
  label?: string
  showValue?: boolean
  className?: string
}

export function ProgressBar({ value, label, showValue = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-semibold text-text-secondary">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-brand-500">{clamped}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
