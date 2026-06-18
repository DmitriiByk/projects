import { SectionHeader } from '../../../components/ui'
import { GameCard, HorizontalScroller } from '../../../components/discovery'
import { liveGames } from '../mockData'

export function LiveGamesSection() {
  return (
    <section aria-label="Live casino games" className="py-4">
      <SectionHeader
        title="Live Casino"
        onSeeAll={() => undefined}
        className="px-4 mb-3"
      />
      <HorizontalScroller paddingX={16} gap={10}>
        {liveGames.map((game) => (
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
