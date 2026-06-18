import { AccumulatorPromo } from '../../../components/discovery'
import { accumulatorData } from '../mockData'

export function AccumulatorSection() {
  return (
    <section aria-label="Accumulator boost" className="py-4">
      <AccumulatorPromo
        title={accumulatorData.title}
        subtitle={accumulatorData.subtitle}
        boostValue={accumulatorData.boostValue}
        imageSrc={accumulatorData.imageSrc}
      />
    </section>
  )
}
