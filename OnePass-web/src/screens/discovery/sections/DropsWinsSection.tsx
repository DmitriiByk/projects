import { PromoBanner } from '../../../components/discovery'
import { dropsWinsData } from '../mockData'

export function DropsWinsSection() {
  return (
    <section aria-label="Drops and Wins" className="px-4 py-2">
      <PromoBanner
        title={dropsWinsData.title}
        subtitle={dropsWinsData.subtitle}
        imageSrc={dropsWinsData.imageSrc}
        variant="drops"
        prize={dropsWinsData.prize}
      />
    </section>
  )
}
