import { SectionHeader, SegmentedTabs } from '../../../components/ui'
import { CasinoRowItem } from '../../../components/discovery'
import { bestCasinos } from '../mockData'
import { useState } from 'react'

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'sport', label: 'Sport' },
  { value: 'casino', label: 'Casino' },
  { value: 'promo', label: 'Promo' },
]

export function BestCasinoSection() {
  const [activeTab, setActiveTab] = useState('all')

  const filtered =
    activeTab === 'all'
      ? bestCasinos
      : bestCasinos.filter((c) => c.category.toLowerCase() === activeTab)

  return (
    <section aria-label="Best casino for you" className="px-4 py-4">
      <SectionHeader
        title="Best casino for you"
        onSeeAll={() => undefined}
        className="mb-3"
      />

      <SegmentedTabs
        options={tabs}
        value={activeTab}
        onChange={setActiveTab}
        aria-label="Filter casinos by category"
        className="mb-3"
      />

      <div className="rounded-xl bg-surface border border-border-subtle overflow-hidden">
        {filtered.map((casino, i) => (
          <CasinoRowItem
            key={casino.id}
            name={casino.name}
            subtitle={casino.subtitle}
            logoSrc={casino.logoSrc}
            logoInitials={casino.logoInitials}
            category={casino.category}
            rank={i + 1}
            className="last:border-b-0"
          />
        ))}
      </div>
    </section>
  )
}
