import { Bell, Menu } from 'lucide-react'
import { IconButton } from '../../../components/ui'

export function HeaderSection() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border-subtle">
      <IconButton aria-label="Open menu" variant="ghost" size="sm">
        <Menu size={20} />
      </IconButton>

      <div className="flex items-center gap-1.5">
        <img
          src="/assets/discovery/logo-onepass.png"
          alt="OnePass"
          className="h-7 object-contain"
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = 'none'
            const next = t.nextElementSibling as HTMLElement | null
            if (next) next.style.display = 'block'
          }}
        />
        <span
          className="text-lg font-extrabold italic text-brand-500 hidden"
          aria-hidden="true"
        >
          OnePass
        </span>
      </div>

      <IconButton aria-label="Notifications" variant="ghost" size="sm">
        <Bell size={20} />
      </IconButton>
    </header>
  )
}
