import { useEffect, useState } from 'react'
import { topGuidesBg } from '../lib/assets'
import { pillarGuides } from '../lib/content'
import { PageHeader, GuideFeature, Newsletter, Reveal } from '../components'
import { mergeTopGuideRows } from '../sanity/mappers'
import { getCmsTopGuidesPage } from '../sanity/queries'
import { resolvePageHero } from '../sanity/pageHero'
import type { CmsTopGuidesDocument } from '../sanity/types'

function preloadImage(source: string | undefined): Promise<void> {
  if (!source) return Promise.resolve()

  return new Promise((resolve) => {
    const image = new Image()
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      resolve()
    }
    const timeout = window.setTimeout(finish, 2_500)
    image.onload = () => {
      void image.decode().catch(() => undefined).finally(finish)
    }
    image.onerror = finish
    image.src = source
  })
}

export default function TopGuides() {
  const [pageSettings, setPageSettings] = useState<CmsTopGuidesDocument | null>(null)
  const [cmsResolved, setCmsResolved] = useState(false)
  const [firstFeatureReady, setFirstFeatureReady] = useState(false)
  useEffect(() => {
    let active = true
    getCmsTopGuidesPage().then(async (page) => {
      const firstGuide = mergeTopGuideRows(page?.selectedPosts, pillarGuides)[0]
      await preloadImage(firstGuide?.guideFeature ?? firstGuide?.feature)
      if (!active) return
      setPageSettings(page)
      setCmsResolved(true)
      setFirstFeatureReady(true)
    })
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
      <div
        className="flex w-full flex-col items-center gap-12 pt-8 md:gap-6 md:pt-16"
        aria-busy={!cmsResolved}
      >
        {guides.map((guide, index) => (
          <Reveal key={guide.slug} className="w-full" startWhenReady={index === 0 ? firstFeatureReady : undefined}>
            <GuideFeature guide={guide} imageReady={cmsResolved} />
          </Reveal>
        ))}
      </div>
      <div className="w-full pt-16 md:pt-24">
        <Newsletter />
      </div>
    </>
  )
}
