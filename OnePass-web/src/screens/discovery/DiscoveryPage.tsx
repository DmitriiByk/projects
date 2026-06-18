import { useState } from 'react'
import { Home, Search, Trophy, Wallet, User } from 'lucide-react'
import { BottomTabBar } from '../../components/ui'
import type { TabItem } from '../../components/ui'
import { HeaderSection } from './sections/HeaderSection'
import { WalletSection } from './sections/WalletSection'
import { PromoBannerSection } from './sections/PromoBannerSection'
import { BestCasinoSection } from './sections/BestCasinoSection'
import { TopSportSection } from './sections/TopSportSection'
import { DropsWinsSection } from './sections/DropsWinsSection'
import { AccumulatorSection } from './sections/AccumulatorSection'
import { PopularGamesSection } from './sections/PopularGamesSection'
import { LiveGamesSection } from './sections/LiveGamesSection'
import { NewGamesSection } from './sections/NewGamesSection'
import { EventBannersSection } from './sections/EventBannersSection'
import { CashDropsSection } from './sections/CashDropsSection'

const NAV_TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={20} /> },
  { id: 'search', label: 'Search', icon: <Search size={20} /> },
  { id: 'top', label: 'Top', icon: <Trophy size={20} /> },
  { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
  { id: 'profile', label: 'Profile', icon: <User size={20} /> },
]

export function DiscoveryPage() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="relative flex flex-col" style={{ height: '100svh' }}>
      {/* Sticky top header */}
      <HeaderSection />

      {/* Scrollable content area with bottom padding for tab bar */}
      <main
        className="flex-1 overflow-y-auto bg-app-bg"
        style={{ paddingBottom: '72px' }}
      >
        <WalletSection />
        <PromoBannerSection />
        <BestCasinoSection />
        <TopSportSection />
        <DropsWinsSection />
        <AccumulatorSection />
        <PopularGamesSection />
        <LiveGamesSection />
        <NewGamesSection />
        <EventBannersSection />
        <CashDropsSection />

        {/* Bottom spacer so last content clears the fixed bar */}
        <div className="h-4" aria-hidden="true" />
      </main>

      {/* Fixed bottom tab bar — stays within the 375px column */}
      <div className="sticky bottom-0 left-0 right-0 z-50">
        <BottomTabBar
          items={NAV_TABS}
          activeId={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </div>
  )
}
