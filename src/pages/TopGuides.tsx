import { useEffect, useState } from 'react'
import { topGuidesBg } from '../lib/assets'
import { pillarGuides } from '../lib/content'
import { PageHeader, GuideFeature, Newsletter, Reveal } from '../components'
import { mergeTopGuideRows } from '../sanity/mappers'
import { getCmsTopGuidesPage } from '../sanity/queries'
import { resolvePageHero } from '../sanity/pageHero'
import type { CmsTopGuidesDocument } from '../sanity/types'

export default function TopGuides() {
  const [pageSettings, setPageSettings] = useState<CmsTopGuidesDocument | null>(null)
  useEffect(() => {
    let active = true
    getCmsTopGuidesPage().then((page) => active && setPageSettings(page))
    return () => {
      active = false
    }
  }, [])

  const hero = resolvePageHero(pageSettings?.heroImage, topGuidesBg, 'Black marble texture')
  const guides = mergeTopGuideRows(pageSettings?.selectedPosts, pillarGuides)
  return (
    <>
      <PageHeader
        title={pageSettings?.headline ?? 'Top Guides'}
        subtitle={pageSettings?.introduction ?? 'Browse our most-loved guides, trending engagement rings, and perspectives from industry insiders'}
        image={hero.image}
        imagePosition={hero.imagePosition}
        fullBleedDesktop
        matchResourcesHeight
      />
      <div className="flex w-full flex-col items-center gap-12 pt-8 md:gap-6 md:pt-16">
        {guides.map((g) => (
          <Reveal key={g.slug} className="w-full">
            <GuideFeature guide={g} />
          </Reveal>
        ))}
      </div>
      <div className="w-full pt-16 md:pt-24">
        <Newsletter />
      </div>
    </>
  )
}
