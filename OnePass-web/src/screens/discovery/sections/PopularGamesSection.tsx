import { SectionHeader } from '../../../components/ui'
import { GameCard, HorizontalScroller } from '../../../components/discovery'
import { popularGames } from '../mockData'

export function PopularGamesSection() {
  return (
    <section aria-label="Most played games" className="py-4">
      <SectionHeader
        title="Most played"
        onSeeAll={() => undefined}
        className="px-4 mb-3"
      />
      <HorizontalScroller paddingX={16} gap={10}>
        {popularGames.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            casinoName={game.casinoName}
            thumbnailSrc={game.thumbnailSrc}
          />
        ))}
      </HorizontalScroller>
    </section>
  )
}
