import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { resourcesBg } from '../lib/assets'
import { FILTERS, allArticles, type FilterKey } from '../lib/content'
import { PageHeader, GuideCard, Newsletter, Stagger, RevealItem } from '../components'
import { getCmsArticleCards } from '../sanity/queries'

type Selected = FilterKey | 'all'

function FilterChips({ selected, onSelect }: { selected: Selected; onSelect: (key: Selected) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {FILTERS.map((f) => {
        const active = f.key === selected
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onSelect(f.key)}
            aria-pressed={active}
            className={`rounded-[14px] px-[14px] py-[6px] text-[11px] font-semibold uppercase tracking-[1.5px] text-[#f9f6f2] transition-colors ${
              active ? 'bg-[rgba(249,246,242,0.6)] text-black' : 'bg-[rgba(249,246,242,0.2)] hover:bg-[rgba(249,246,242,0.35)]'
            }`}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

const VALID_KEYS = new Set(FILTERS.map((f) => f.key))

export default function Resources() {
  const [searchParams, setSearchParams] = useSearchParams()
  const paramFilter = searchParams.get('filter')
  const initial: Selected = paramFilter && VALID_KEYS.has(paramFilter as Selected) ? (paramFilter as Selected) : 'all'
  const [selected, setSelected] = useState<Selected>(initial)
  const [articles, setArticles] = useState(allArticles)

  // keep the filter in sync when arriving via a pre-filtered link
  useEffect(() => {
    setSelected(initial)
  }, [initial])

  useEffect(() => {
    let active = true

    getCmsArticleCards().then((cmsArticles) => {
      if (active && cmsArticles.length) setArticles(cmsArticles)
    })

    return () => {
      active = false
    }
  }, [])

  const onSelect = (key: Selected) => {
    setSelected(key)
    setSearchParams(key === 'all' ? {} : { filter: key }, { replace: true })
  }

  const visible = useMemo(
    () => (selected === 'all' ? articles : articles.filter((a) => a.filters.includes(selected))),
    [articles, selected],
  )

  return (
    <>
      <PageHeader
        title="All Resources"
        subtitle="Browse our most-loved guides, trending engagement rings, and perspectives from industry insiders"
        image={resourcesBg}
        filters={<FilterChips selected={selected} onSelect={onSelect} />}
      />
      <section className="mx-auto w-full max-w-[1440px] px-5 pt-12 md:px-10 md:pt-16">
        <h2 className="sr-only">All engagement ring guides and articles</h2>
        <Stagger key={selected} className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {visible.map((a) => (
            <RevealItem key={a.title} className="h-full">
              <GuideCard card={a} />
            </RevealItem>
          ))}
        </Stagger>
      </section>
      <div className="w-full pb-16 pt-16 md:pb-24 md:pt-24">
        <Newsletter />
      </div>
    </>
  )
}
