import { Bell, Settings } from 'lucide-react'
import { Avatar, IconButton } from '../ui'
import { cn } from '../../lib/cn'

export interface WalletHeaderProps {
  userName: string
  avatarSrc?: string
  balance: number
  currency?: string
  bets: number
  wins: number
  bonus: number
  className?: string
}

export function WalletHeader({
  userName,
  avatarSrc,
  balance,
  currency = '€',
  bets,
  wins,
  bonus,
  className,
}: WalletHeaderProps) {
  const formatted = balance.toLocaleString('en-IE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className={cn('flex flex-col gap-3 px-4 pt-4 pb-2', className)}>
      {/* Top bar: avatar + name + icons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={avatarSrc}
            alt={userName}
            size="lg"
            online
            className="ring-2 ring-brand-300"
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-text-secondary font-semibold leading-none">Good day,</p>
            <p className="text-base font-extrabold text-text-primary leading-tight">{userName}</p>
            <button className="text-xs text-brand-500 font-semibold leading-none hover:text-brand-600 transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-sm">
              Manage account
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton aria-label="Settings" variant="ghost" size="sm">
            <Settings size={20} />
          </IconButton>
          <IconButton aria-label="Notifications" variant="ghost" size="sm">
            <Bell size={20} />
          </IconButton>
        </div>
      </div>

      {/* Balance card */}
      <div
        className="rounded-2xl bg-surface border border-border-subtle p-4 flex items-center justify-between"
        style={{ boxShadow: 'var(--shadow-wallet)' }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide">
            Wallet Balance
          </p>
          <p className="text-4xl font-extrabold italic text-text-primary leading-none">
            {currency}
            {formatted}
          </p>
        </div>
        <button
          className="h-10 px-5 rounded-full font-extrabold italic text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--gradient-play)' }}
          aria-label="Open wallet"
        >
          WALLET
        </button>
      </div>

      {/* Quick stats row */}
      <div className="flex gap-3">
        {[
          { label: 'Bets', value: String(bets) },
          { label: 'Wins', value: String(wins) },
          { label: 'Bonus', value: `${currency}${bonus}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex-1 bg-surface rounded-xl p-2.5 flex flex-col items-center gap-0.5 border border-border-subtle"
          >
            <p className="text-sm font-extrabold text-text-primary">{stat.value}</p>
            <p className="text-xs text-text-tertiary font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
