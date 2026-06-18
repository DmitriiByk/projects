import { SectionHeader } from '../../../components/ui'
import { GameCard, HorizontalScroller } from '../../../components/discovery'
import { newGames } from '../mockData'

export function NewGamesSection() {
  return (
    <section aria-label="New games" className="py-4">
      <SectionHeader
        title="New Games"
        onSeeAll={() => undefined}
        className="px-4 mb-3"
      />
      <HorizontalScroller paddingX={16} gap={10}>
        {newGames.map((game) => (
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
