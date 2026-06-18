import type { CasinoCategory } from '../../components/discovery/CasinoRowItem'

// ── User ────────────────────────────────────────────────────────────────────
export interface ConnectedCasino {
  name: string
  iconSrc: string
}

export interface UserData {
  name: string
  avatarSrc: string
  balance: number
  bets: number
  wins: number
  bonus: number
  // PlayerPassCard fields
  memberSince: string
  kycVerified: boolean
  connectedCount: number
  totalBalance: number
  offersCount: number
  connectedCasinos: ConnectedCasino[]
  moreCount: number
}

export const mockUser: UserData = {
  name: 'Alex Johnson',
  avatarSrc: '/assets/discovery/avatar-user.png',
  balance: 4_788.94,
  bets: 12,
  wins: 5,
  bonus: 45,
  // PlayerPassCard fields
  memberSince: 'Mar 2027',
  kycVerified: true,
  connectedCount: 4,
  totalBalance: 786.66,
  offersCount: 3,
  connectedCasinos: [
    { name: 'Mr.Pacho', iconSrc: '/assets/discovery/icon-mrpacho.svg' },
    { name: 'BillyBets', iconSrc: '/assets/discovery/icon-billybets.png' },
  ],
  moreCount: 2,
}

// ── Promo banners (carousel) ─────────────────────────────────────────────────
export interface PromoBannerData {
  id: string
  title: string
  subtitle: string
  imageSrc: string
}

export const promoBanners: PromoBannerData[] = [
  {
    id: 'b1',
    title: 'Welcome Bonus 100%',
    subtitle: 'Up to €500 on your first deposit',
    imageSrc: '/assets/discovery/banner-main.png',
  },
  {
    id: 'b2',
    title: 'Free Spins Every Day',
    subtitle: '50 free spins on Book of Dead',
    imageSrc: '/assets/discovery/banner-2.png',
  },
  {
    id: 'b3',
    title: 'VIP Cashback 20%',
    subtitle: 'Weekly cashback for loyal players',
    imageSrc: '/assets/discovery/banner-boomerang.png',
  },
]

// ── Casinos ──────────────────────────────────────────────────────────────────
export interface CasinoData {
  id: string
  name: string
  subtitle: string
  logoSrc?: string
  logoInitials?: string
  category: CasinoCategory
}

export const bestCasinos: CasinoData[] = [
  {
    id: 'c1',
    name: 'Boomerang',
    subtitle: 'Best for slots & live dealer',
    logoSrc: '/assets/discovery/casino-boomerang.png',
    category: 'Casino',
  },
  {
    id: 'c2',
    name: 'BillyBets',
    subtitle: 'Top sportsbook & casino',
    logoSrc: '/assets/discovery/casino-billy.png',
    category: 'Sport',
  },
  {
    id: 'c3',
    name: 'BingoPlus',
    subtitle: 'Daily promotions & bonuses',
    logoInitials: 'BP',
    category: 'Promo',
  },
  {
    id: 'c4',
    name: 'RiseOfOlympus',
    subtitle: 'Exclusive Play\'n GO titles',
    logoInitials: 'RO',
    category: 'Slots',
  },
  {
    id: 'c5',
    name: 'PaxoFC',
    subtitle: 'Sports & in-play betting',
    logoInitials: 'PF',
    category: 'Sport',
  },
  {
    id: 'c6',
    name: 'WinnerCasino',
    subtitle: 'Live tables & jackpots',
    logoInitials: 'WC',
    category: 'Live',
  },
]

// ── Top Sport Events casinos ─────────────────────────────────────────────────
export const topSportCasinos: CasinoData[] = [
  {
    id: 's1',
    name: 'Goal to the West',
    subtitle: 'Play.Go • Football',
    logoSrc: '/assets/discovery/img-premier-chelsea.png',
    category: 'Sport',
  },
  {
    id: 's2',
    name: 'Book of Dead',
    subtitle: 'Play.Go • Slots',
    logoInitials: 'BD',
    category: 'Slots',
  },
  {
    id: 's3',
    name: 'BingoPlus',
    subtitle: 'Live • Casino',
    logoInitials: 'BP',
    category: 'Live',
  },
]

// ── Game cards ───────────────────────────────────────────────────────────────
export interface GameData {
  id: string
  title: string
  casinoName: string
  thumbnailSrc?: string
}

export const popularGames: GameData[] = [
  { id: 'g1', title: 'Gates of Olympus', casinoName: 'Pragmatic Play', thumbnailSrc: '/assets/discovery/game-thumb-1.png' },
  { id: 'g2', title: 'Sugar Rush', casinoName: 'Pragmatic Play', thumbnailSrc: '/assets/discovery/game-thumb-2.png' },
  { id: 'g3', title: 'Big Bass Bonanza', casinoName: 'Pragmatic Play', thumbnailSrc: '/assets/discovery/game-thumb-3.png' },
  { id: 'g4', title: 'Sweet Bonanza', casinoName: 'Pragmatic Play', thumbnailSrc: '/assets/discovery/game-thumb-4.png' },
  { id: 'g5', title: 'Book of Dead', casinoName: 'Play\'n GO', thumbnailSrc: '/assets/discovery/game-thumb-5.png' },
  { id: 'g6', title: 'Starburst XXXtreme', casinoName: 'NetEnt', thumbnailSrc: '/assets/discovery/game-thumb-6.png' },
  { id: 'g7', title: 'Wolf Gold', casinoName: 'Pragmatic Play', thumbnailSrc: '/assets/discovery/game-thumb-7.png' },
]

export const liveGames: GameData[] = [
  { id: 'l1', title: 'Live Roulette', casinoName: 'Evolution', thumbnailSrc: '/assets/discovery/game-image23.png' },
  { id: 'l2', title: 'Live Blackjack', casinoName: 'Evolution', thumbnailSrc: '/assets/discovery/game-image22.png' },
  { id: 'l3', title: 'Crazy Time', casinoName: 'Evolution', thumbnailSrc: '/assets/discovery/game-image21.png' },
  { id: 'l4', title: 'Lightning Roulette', casinoName: 'Evolution', thumbnailSrc: '/assets/discovery/game-image32.png' },
  { id: 'l5', title: 'Dream Catcher', casinoName: 'Evolution', thumbnailSrc: '/assets/discovery/game-thumb-1.png' },
]

export const newGames: GameData[] = [
  { id: 'n1', title: 'Cash Crab', casinoName: 'Push Gaming', thumbnailSrc: '/assets/discovery/cash-crab.svg' },
  { id: 'n2', title: 'Monthly Race', casinoName: 'Various', thumbnailSrc: '/assets/discovery/monthly-race-1.png' },
  { id: 'n3', title: 'Rise of Olympus 100', casinoName: 'Play\'n GO', thumbnailSrc: '/assets/discovery/game-thumb-3.png' },
  { id: 'n4', title: 'Big Bass Christmas', casinoName: 'Pragmatic Play', thumbnailSrc: '/assets/discovery/game-thumb-4.png' },
  { id: 'n5', title: 'Collection Card', casinoName: 'OnePass', thumbnailSrc: '/assets/discovery/collection-card.png' },
]

// ── Drops & Wins banner ──────────────────────────────────────────────────────
export const dropsWinsData = {
  prize: '€2,000,000',
  title: 'Drops & Wins',
  subtitle: 'Win a share of the massive prize pool every week',
  imageSrc: '/assets/discovery/drops-big-bg.png',
}

// ── Accumulator promo ────────────────────────────────────────────────────────
export const accumulatorData = {
  title: 'Accumulator Boost',
  subtitle: 'Parlay special',
  boostValue: '100%',
  imageSrc: '/assets/discovery/accumulator-bg.svg',
}

// ── Event promo banners ──────────────────────────────────────────────────────
export interface EventBannerData {
  id: string
  title: string
  subtitle: string
  imageSrc: string
  prize?: string
}

export const eventBanners: EventBannerData[] = [
  {
    id: 'e1',
    title: 'Complete the tournament',
    subtitle: 'Win big prizes in weekly tournaments',
    imageSrc: '/assets/discovery/sports-tennis.png',
    prize: '€1500',
  },
  {
    id: 'e2',
    title: 'Premier League Bets',
    subtitle: 'Chelsea vs Manchester United',
    imageSrc: '/assets/discovery/sports-basketball.png',
  },
  {
    id: 'e3',
    title: 'Monthly Race',
    subtitle: '10% up to €5,000 • 100% up to €500',
    imageSrc: '/assets/discovery/monthly-race-2.png',
  },
]
