import { Scan, Coins, CheckCircle2 } from 'lucide-react'
import { Avatar } from '../ui'
import { cn } from '../../lib/cn'
import type { ConnectedCasino } from '../../screens/discovery/mockData'

export interface PlayerPassCardProps {
  userName: string
  avatarSrc?: string
  memberSince: string
  kycVerified?: boolean
  connectedCount: number
  totalBalance: number
  offersCount: number
  connectedCasinos: ConnectedCasino[]
  moreCount?: number
  onWithdraw?: () => void
  onDeposit?: () => void
  className?: string
}

// ─── Small brand icon with PNG fallback ────────────────────────────────────
function CasinoChipIcon({
  src,
  name,
  fallbackColor,
  fallbackInitial,
}: {
  src: string
  name: string
  fallbackColor: string
  fallbackInitial: string
}) {
  return (
    <span
      className="inline-flex shrink-0 size-[22px] rounded-[6px] overflow-hidden items-center justify-center"
      style={{ background: fallbackColor }}
      role="img"
      aria-label={name}
    >
      <img
        src={src}
        alt=""
        className="size-full object-cover"
        onError={(e) => {
          const img = e.currentTarget
          img.style.display = 'none'
          const span = img.nextElementSibling as HTMLElement | null
          if (span) span.style.display = 'flex'
        }}
      />
      <span
        className="hidden items-center justify-center size-full text-white font-extrabold text-[10px] leading-none"
        aria-hidden="true"
      >
        {fallbackInitial}
      </span>
    </span>
  )
}

// ─── The 1PassApp small mark icon (rendered in CSS — gradient rounded square) ─
function OnePassMark() {
  return (
    <span
      className="inline-flex shrink-0 size-[22px] rounded-[6px] items-center justify-center"
      style={{ background: 'var(--gradient-play)' }}
      aria-hidden="true"
    >
      {/* White plus/cross pinwheel */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <rect x="4.5" y="0" width="3" height="12" rx="1.5" fill="white" />
        <rect x="0" y="4.5" width="12" height="3" rx="1.5" fill="white" />
      </svg>
    </span>
  )
}

// ─── Thin horizontal divider ────────────────────────────────────────────────
function HDivider() {
  return (
    <div
      className="w-full h-px shrink-0"
      style={{ background: 'var(--color-neutral-100, #d0e0fd)' }}
      role="separator"
    />
  )
}

export function PlayerPassCard({
  userName,
  avatarSrc,
  memberSince,
  kycVerified = false,
  connectedCount,
  totalBalance,
  offersCount,
  connectedCasinos,
  moreCount = 0,
  onWithdraw,
  onDeposit,
  className,
}: PlayerPassCardProps) {
  const formattedBalance = `€${totalBalance.toLocaleString('en-IE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

  return (
    <div
      className={cn('mx-4 rounded-2xl overflow-hidden', className)}
      style={{
        background: 'linear-gradient(145deg, var(--color-card-pass-from, #e8effe) 0%, var(--color-card-pass-to, #d6e8ff) 100%)',
        border: '1px solid var(--color-neutral-100, #d0e0fd)',
      }}
    >
      {/* ── Section 1: Brand + KYC ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: small mark + wordmark */}
        <div className="flex items-center gap-2">
          <OnePassMark />
          <span className="text-[11px] leading-none tracking-wide">
            <span className="font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
              1PASSAP
            </span>
            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {' · PLAYER PASS'}
            </span>
          </span>
        </div>

        {/* Right: KYC badge */}
        {kycVerified && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none"
            style={{
              background: 'var(--color-kyc-bg, #e6f9ee)',
              color: 'var(--color-kyc-text, #1a7f4b)',
            }}
          >
            <CheckCircle2 size={11} strokeWidth={2.5} aria-hidden="true" />
            KYC Verified
          </span>
        )}
      </div>

      <HDivider />

      {/* ── Section 2: Profile row ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: avatar + name + member since */}
        <div className="flex items-center gap-3">
          <Avatar
            src={avatarSrc}
            alt={userName}
            size="lg"
            className="rounded-full ring-2 ring-white"
          />
          <div className="flex flex-col gap-0.5">
            <p
              className="text-lg font-extrabold leading-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {userName}
            </p>
            <p
              className="text-[13px] font-medium leading-none"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Right: scan/expand icon button */}
        <button
          type="button"
          aria-label="Scan player pass QR code"
          className="flex items-center justify-center size-10 rounded-xl border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          style={{
            borderColor: 'var(--color-neutral-100, #d0e0fd)',
            background: 'transparent',
          }}
        >
          <Scan
            size={18}
            strokeWidth={2}
            aria-hidden="true"
            style={{ color: 'var(--color-text-secondary)' }}
          />
        </button>
      </div>

      <HDivider />

      {/* ── Section 3: Stats row ──────────────────────────────────────── */}
      <div className="flex items-stretch px-4 py-3">
        {/* Connected */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <p
            className="text-lg font-extrabold leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {connectedCount}
          </p>
          <p
            className="text-[11px] font-semibold leading-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Connected
          </p>
        </div>

        {/* Vertical divider */}
        <div
          className="w-px self-stretch mx-1"
          style={{ background: 'var(--color-neutral-100, #d0e0fd)' }}
          role="separator"
        />

        {/* Total balance */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <p
            className="text-lg font-extrabold leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {formattedBalance}
          </p>
          <p
            className="text-[11px] font-semibold leading-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Total balance
          </p>
        </div>

        {/* Vertical divider */}
        <div
          className="w-px self-stretch mx-1"
          style={{ background: 'var(--color-neutral-100, #d0e0fd)' }}
          role="separator"
        />

        {/* Offers */}
        <div className="flex-1 flex flex-col items-center gap-0.5">
          <p
            className="text-lg font-extrabold leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {offersCount}
          </p>
          <p
            className="text-[11px] font-semibold leading-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Offers
          </p>
        </div>
      </div>

      <HDivider />

      {/* ── Section 4 + 5: Connected Casinos label + chip row ─────────── */}
      <div className="flex flex-col gap-2.5 px-4 pt-3 pb-3">
        <p
          className="text-[12px] font-semibold leading-none"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Connected Casinos
        </p>

        {/* Chip row */}
        <div className="flex items-center gap-2 flex-wrap">
          {connectedCasinos.map((casino) => {
            const isMrPacho = casino.name === 'Mr.Pacho'
            const isBillyBets = casino.name === 'BillyBets'
            const fallbackColor = isMrPacho ? '#7c3aed' : isBillyBets ? '#8b1a1a' : '#5977b2'
            const fallbackInitial = casino.name.charAt(0)

            return (
              <span
                key={casino.name}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: 'white',
                  border: '1px solid var(--color-neutral-100, #d0e0fd)',
                }}
              >
                <CasinoChipIcon
                  src={casino.iconSrc}
                  name={casino.name}
                  fallbackColor={fallbackColor}
                  fallbackInitial={fallbackInitial}
                />
                <span
                  className="text-[12px] font-semibold leading-none"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {casino.name}
                </span>
              </span>
            )
          })}

          {moreCount > 0 && (
            <span
              className="inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none"
              style={{
                background: 'white',
                border: '1px solid var(--color-neutral-100, #d0e0fd)',
                color: 'var(--color-text-secondary)',
              }}
            >
              +{moreCount} more
            </span>
          )}
        </div>
      </div>

      <HDivider />

      {/* ── Section 6: Buttons row ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* WITHDRAW — outline pill */}
        <button
          type="button"
          onClick={onWithdraw}
          aria-label="Withdraw funds"
          className="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 font-extrabold italic text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          style={{
            background: 'white',
            border: '1.5px solid var(--color-neutral-100, #d0e0fd)',
            color: 'var(--color-text-primary)',
          }}
        >
          <Coins size={16} strokeWidth={2.5} aria-hidden="true" />
          WITHDRAW
        </button>

        {/* DEPOSIT — gradient pill */}
        <button
          type="button"
          onClick={onDeposit}
          aria-label="Deposit funds"
          className="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 font-extrabold italic text-sm text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          style={{ background: 'var(--gradient-play)' }}
        >
          <Coins size={16} strokeWidth={2.5} aria-hidden="true" />
          DEPOSIT
        </button>
      </div>
    </div>
  )
}
