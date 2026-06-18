import { useRef } from 'react'
import { cn } from '../../lib/cn'

export interface TabOption {
  value: string
  label: string
}

export interface SegmentedTabsProps {
  options: TabOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  /** Accessible label for the tablist — describe what the tabs filter/switch */
  'aria-label'?: string
}

export function SegmentedTabs({ options, value, onChange, className, 'aria-label': ariaLabel }: SegmentedTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      role="tablist"
      aria-label={ariaLabel ?? 'Tabs'}
      className={cn(
        'flex gap-2 overflow-x-auto no-scrollbar py-0.5',
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'shrink-0 inline-flex items-center justify-center rounded-full px-4 h-9',
              'text-sm font-semibold transition-colors duration-150 outline-none',
              'focus-visible:ring-2 focus-visible:ring-brand-400',
              isActive
                ? 'bg-brand-500 text-white'
                : 'bg-surface-secondary text-text-secondary hover:bg-neutral-100',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
