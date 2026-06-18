import { SectionHeader } from '../../../components/ui'
import { PromoBanner } from '../../../components/discovery'

export function CashDropsSection() {
  return (
    <section aria-label="Special features and cash drops" className="px-4 py-4">
      <SectionHeader
        title="Special features"
        onSeeAll={() => undefined}
        className="mb-3"
      />
      <PromoBanner
        title="Cash Drops"
        subtitle="Random cash prizes drop every hour. Keep playing to win!"
        imageSrc="/assets/discovery/cash-crab.svg"
        variant="drops"
        prize="€500 / hr"
      />
    </section>
  )
}
