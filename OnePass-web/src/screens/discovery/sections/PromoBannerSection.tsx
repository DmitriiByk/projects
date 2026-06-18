import { PromoBanner } from '../../../components/discovery'
import { HorizontalScroller } from '../../../components/discovery'
import { promoBanners } from '../mockData'

export function PromoBannerSection() {
  return (
    <section aria-label="Promotions" className="py-4">
      <HorizontalScroller paddingX={16} gap={12}>
        {promoBanners.map((banner) => (
          <div key={banner.id} className="shrink-0 w-[320px]">
            <PromoBanner
              title={banner.title}
              subtitle={banner.subtitle}
              imageSrc={banner.imageSrc}
            />
          </div>
        ))}
      </HorizontalScroller>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {promoBanners.map((banner, i) => (
          <span
            key={banner.id}
            className={`rounded-full transition-all duration-200 ${
              i === 0
                ? 'w-4 h-1.5 bg-brand-500'
                : 'w-1.5 h-1.5 bg-neutral-200'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </section>
  )
}
