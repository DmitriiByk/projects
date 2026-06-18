import { cn } from '../../lib/cn'

export interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
}

export interface BottomTabBarProps {
  items: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function BottomTabBar({ items, activeId, onChange, className }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'w-full bg-surface border-t border-border-subtle',
        'flex items-stretch',
        'shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-3',
              'text-xs font-semibold transition-colors duration-150 outline-none',
              'focus-visible:bg-surface-secondary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400',
              isActive ? 'text-brand-500' : 'text-text-tertiary hover:text-text-secondary',
              '[&>svg]:w-5 [&>svg]:h-5',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
