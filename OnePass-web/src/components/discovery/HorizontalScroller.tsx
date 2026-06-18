import { cn } from '../../lib/cn'

export interface HorizontalScrollerProps {
  children: React.ReactNode
  className?: string
  /** px gap between items — default 12 */
  gap?: number
  /** left/right padding when no edge padding on parent — default 16 */
  paddingX?: number
  /** Accessible label for the scroll region, announced by screen readers */
  'aria-label'?: string
}

export function HorizontalScroller({
  children,
  className,
  gap = 12,
  paddingX = 16,
  'aria-label': ariaLabel,
}: HorizontalScrollerProps) {
  return (
    <div
      // tabIndex makes the scroll container keyboard-reachable so keyboard-only
      // users can arrow-scroll the list when no item inside has focus.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-label={ariaLabel}
      className={cn('overflow-x-auto no-scrollbar focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:outline-offset-2', className)}
      style={{
        paddingLeft: paddingX,
        paddingRight: paddingX,
      }}
    >
      <div
        className="flex"
        style={{ gap }}
      >
        {children}
      </div>
    </div>
  )
}
