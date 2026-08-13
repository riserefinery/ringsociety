import { topGuidesBg } from '../lib/assets'
import { pillarGuides } from '../lib/content'
import { PageHeader, GuideFeature, Newsletter, Reveal } from '../components'

export default function TopGuides() {
  return (
    <>
      <PageHeader
        title="Top Guides"
        subtitle="Browse our most-loved guides, trending engagement rings, and perspectives from industry insiders"
        image={topGuidesBg}
      />
      <div className="flex w-full flex-col items-center gap-12 pt-8 md:gap-6 md:pt-6">
        {pillarGuides.map((g) => (
          <Reveal key={g.slug} className="w-full">
            <GuideFeature guide={g} />
          </Reveal>
        ))}
      </div>
      <div className="w-full pb-16 pt-16 md:pb-24 md:pt-24">
        <Newsletter />
      </div>
    </>
  )
}
