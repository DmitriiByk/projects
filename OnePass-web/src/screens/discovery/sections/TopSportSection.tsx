import { SectionHeader } from '../../../components/ui'
import { CasinoRowItem } from '../../../components/discovery'
import { topSportCasinos } from '../mockData'

export function TopSportSection() {
  return (
    <section aria-label="Top Sport Events" className="px-4 py-4">
      <SectionHeader
        title="Top Sport Events"
        onSeeAll={() => undefined}
        className="mb-3"
      />
      <div className="rounded-xl bg-surface border border-border-subtle overflow-hidden">
        {topSportCasinos.map((casino, i) => (
          <CasinoRowItem
            key={casino.id}
            name={casino.name}
            subtitle={casino.subtitle}
            logoSrc={casino.logoSrc}
            logoInitials={casino.logoInitials}
            category={casino.category}
            rank={i + 1}
          />
        ))}
      </div>
    </section>
  )
}
