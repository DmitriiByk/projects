import { SectionHeader } from '../../../components/ui'
import { PromoBanner, HorizontalScroller } from '../../../components/discovery'
import { eventBanners } from '../mockData'

export function EventBannersSection() {
  return (
    <section aria-label="Events and promotions" className="py-4">
      <SectionHeader
        title="Special Events"
        onSeeAll={() => undefined}
        className="px-4 mb-3"
      />
      <HorizontalScroller paddingX={16} gap={12}>
        {eventBanners.map((banner) => (
          <div key={banner.id} className="shrink-0 w-[260px]">
            <PromoBanner
              title={banner.title}
              subtitle={banner.subtitle}
              imageSrc={banner.imageSrc}
              prize={banner.prize}
            />
          </div>
        ))}
      </HorizontalScroller>
    </section>
  )
}
