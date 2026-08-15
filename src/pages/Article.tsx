import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  getArticle,
  getRelated,
  filterKeyForCategory,
  readingTimeFor,
  defaultArticleCta,
  type ArticleBlock,
  type ArticleCta,
  type ArticleDoc,
} from '../lib/content'
import { shareArrow } from '../lib/assets'
import { ArticleLabel, GuideCard, Newsletter, Reveal, Stagger, RevealItem, serif } from '../components'
import ResponsiveImage from '../components/ResponsiveImage'
import { getCmsArticle } from '../sanity/queries'

/* ---------- icons ---------- */

/** Blurred-glass circle with a magnifier — the in-article image zoom control. */
function ZoomIcon({ className = '' }: { className?: string }) {
  return (
    <span
      className={`grid h-[33px] w-[33px] place-items-center rounded-full border border-[#e7e6e6] ${className}`}
      style={{ background: 'rgba(252,246,242,0.1)', backdropFilter: 'blur(3px)' }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="7" cy="6.5" r="4.6" stroke="black" strokeWidth="1.4" />
        <line x1="10.4" y1="10" x2="14.4" y2="14" stroke="black" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="5" y1="6.5" x2="9" y2="6.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="7" y1="4.5" x2="7" y2="8.5" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/* ---------- shared building blocks ---------- */

/* ---------- lightbox gallery ---------- */

type GalleryImage = { src: string; alt: string; caption?: string }

function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: GalleryImage[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
}) {
  const current = images[index]
  const prev = () => onIndex((index - 1 + images.length) % images.length)
  const next = () => onIndex((index + 1) % images.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  })

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: current.alt, url: current.src })
      } catch {
        /* dismissed */
      }
    }
  }

  const ctrl =
    'grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10'

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/[0.94]"
      onClick={onClose}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-5 py-5 md:px-8" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px] font-semibold uppercase tracking-[2px] text-white/70">
          {index + 1} / {images.length}
        </span>
        <div className="flex items-center gap-3">
          <a href={current.src} download className={ctrl} aria-label="Save image">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2v9m0 0 3.5-3.5M9 11 5.5 7.5M3 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button className={ctrl} onClick={share} aria-label="Share image">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13 6a2 2 0 1 0-1.9-2.6L6.8 5.6a2 2 0 1 0 0 3.4l4.3 2.2A2 2 0 1 0 12 9.4L7.7 7.2a2 2 0 0 0 0-.4L12 4.6A2 2 0 0 0 13 6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button className={ctrl} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* stage — clicking the backdrop around the image closes the lightbox */}
      <div className="relative flex flex-1 items-center justify-center px-5 pb-10 md:px-20">
        {images.length > 1 && (
          <button className={`${ctrl} absolute left-4 md:left-6`} onClick={(e) => { e.stopPropagation(); prev() }} aria-label="Previous image">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 3 5 9l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <figure className="flex max-h-full flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <img
            src={current.src}
            alt={current.alt}
            className="max-h-[72vh] w-auto max-w-full rounded-[8px] object-contain"
          />
          {current.caption && (
            <figcaption className="max-w-[560px] text-center text-[12px] leading-[1.5] text-white/60">
              {current.caption}
            </figcaption>
          )}
        </figure>
        {images.length > 1 && (
          <button className={`${ctrl} absolute right-4 md:right-6`} onClick={(e) => { e.stopPropagation(); next() }} aria-label="Next image">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 3l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------- body renderer ---------- */

function ArticleBody({
  intro,
  body,
  onZoom,
  galleryIndexOf,
}: {
  intro: ArticleBlock[]
  body: ArticleBlock[]
  onZoom: (i: number) => void
  galleryIndexOf: (src: string) => number
}) {
  const Divider = () => <div className="h-px w-full bg-[#abb7b1]/20" />

  const renderBlock = (block: ArticleBlock, key: number) => {
    switch (block.type) {
      case 'h2':
        return (
          <h2
            key={key}
            id={slugify(block.toc)}
            className="scroll-mt-[120px] text-[28px] leading-[1.18] tracking-[-0.3px] text-black md:text-[42px] md:leading-[1.2] md:tracking-normal"
            style={{ fontFamily: serif }}
          >
            {block.text}
          </h2>
        )
      case 'p':
        return (
          <p
            key={key}
            className={`body-copy tracking-[0.1px] md:tracking-normal ${
              block.muted ? 'text-[#7b7b7b]' : 'text-black'
            }`}
          >
            {block.text}
          </p>
        )
      case 'note':
        return (
          <div
            key={key}
            className="body-copy rounded-[8px] border border-[#abb7b1]/20 bg-[#fbf9f7] p-4 tracking-[0.1px] text-black"
          >
            <span className="font-semibold">{block.label}: </span>
            {block.text}
          </div>
        )
      case 'deflist':
        return (
          <dl key={key} className="flex flex-col gap-6 pl-2 md:pl-4">
            {block.items.map((it, i) => (
              <div key={i} className="flex flex-col gap-1">
                <dt className="text-[12px] font-semibold uppercase tracking-[1px] text-black">
                  {it.term}
                </dt>
                <dd className="body-copy text-[#7b7b7b]">{it.def}</dd>
              </div>
            ))}
          </dl>
        )
      case 'image': {
        const gi = galleryIndexOf(block.src)
        return (
          <figure key={key} className="flex flex-col gap-3">
            <div className="group relative overflow-hidden rounded-[8px]">
              <img
                src={block.src}
                alt={block.alt}
                onClick={() => onZoom(gi)}
                className="h-auto w-full cursor-zoom-in object-cover"
              />
              <button
                onClick={() => onZoom(gi)}
                aria-label="Zoom image"
                className="absolute right-4 top-4 transition-transform duration-300 hover:scale-110"
              >
                <ZoomIcon />
              </button>
            </div>
            {block.caption && (
              <figcaption className="text-[11px] leading-[1.5] tracking-[0.2px] text-[#7b7b7b]">
                {block.caption}
              </figcaption>
            )}
            {block.note && (
              <p className="body-copy italic text-black">{block.note}</p>
            )}
          </figure>
        )
      }
    }
  }

  // group body into sections that each begin with an h2, so we can insert dividers
  const sections: ArticleBlock[][] = []
  body.forEach((b) => {
    if (b.type === 'h2') sections.push([b])
    else if (sections.length) sections[sections.length - 1].push(b)
    else sections.push([b])
  })

  let key = 0
  return (
    <div className="flex w-full flex-col gap-8 md:gap-12">
      <div className="body-copy flex flex-col gap-4 text-black md:gap-5">
        {intro.map((b) => (
          <p key={key++}>{b.type === 'p' ? b.text : ''}</p>
        ))}
      </div>
      {sections.map((section, si) => (
        <div key={si} className="flex flex-col gap-6 md:gap-6">
          <Divider />
          {section.map((b) => renderBlock(b, key++))}
        </div>
      ))}
    </div>
  )
}

/* ---------- sticky right sidebar ---------- */

function Sidebar({
  toc,
  activeId,
  categories,
  cta,
}: {
  toc: { id: string; label: string }[]
  activeId: string
  categories: string[]
  cta: ArticleCta
}) {
  const heading = 'text-[12px] font-semibold uppercase tracking-[1px] text-black'
  return (
    <aside className="sticky top-[66px] hidden w-[344px] shrink-0 flex-col gap-8 self-start py-24 lg:flex">
      {/* table of contents */}
      <nav className="flex flex-col gap-3">
        <p className={heading}>Table of contents</p>
        {toc.map((t, i) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              history.replaceState(null, '', `#${t.id}`)
            }}
            className={`text-[13px] leading-[1.5] transition-colors ${
              activeId === t.id ? 'text-black' : 'text-[#7b7b7b] hover:text-black'
            }`}
          >
            {String(i + 1).padStart(2, '0')}. {t.label}
          </a>
        ))}
      </nav>

      {/* categories */}
      <div className="flex flex-col gap-4">
        <p className={heading}>Categories</p>
        <div className="flex flex-col gap-3">
          {categories.map((c) => {
            const key = filterKeyForCategory(c)
            return (
              <Link
                key={c}
                to={key ? `/all-resources?filter=${key}` : '/all-resources'}
                className="cursor-pointer text-[14px] leading-[1.6] text-[#7b7b7b] transition-colors hover:text-black"
              >
                {c}
              </Link>
            )
          })}
        </div>
      </div>

      <CtaCard cta={cta} />
    </aside>
  )
}

function CtaCard({ cta }: { cta: ArticleCta }) {
  const inner = (
    <div
      className="group relative h-[408px] w-full overflow-hidden rounded-[8px]"
      style={{ background: cta.background ?? '#000' }}
    >
      <img
        src={cta.image}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <p
        className="absolute left-1/2 top-[30px] w-[280px] -translate-x-1/2 text-center text-[31px] italic leading-[1.2] text-white"
        style={{ fontFamily: serif }}
      >
        {cta.title}
      </p>
      <span className="absolute bottom-[39px] left-1/2 flex h-[45px] w-[264px] max-w-[calc(100%-48px)] -translate-x-1/2 items-center justify-center gap-3 rounded-[8px] border border-[#707070] bg-black/20 backdrop-blur-[2px]">
        <span className="text-[13px] font-semibold uppercase tracking-[2px] text-white">{cta.label}</span>
        <span className="grid place-items-center transition-transform duration-300 group-hover:translate-x-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.5" stroke="white" />
            <path d="M6 5l3 3-3 3" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </div>
  )
  return cta.to ? (
    <Link to={cta.to} className="block w-full">
      {inner}
    </Link>
  ) : (
    inner
  )
}

/* ---------- page ---------- */

export default function Article() {
  const { slug } = useParams()
  const fallbackDoc = useMemo(() => getArticle(slug), [slug])
  const [cmsDoc, setCmsDoc] = useState<ArticleDoc | null>(null)
  // The route component is reused when readers move between guides. Ignore the
  // prior guide's CMS record until the matching record finishes loading so the
  // destination hero receives the correct shared-image transition identity.
  const cmsDocForSlug = cmsDoc?.slug === slug ? cmsDoc : null
  const doc = cmsDocForSlug ?? fallbackDoc
  const cta = doc.cta ?? defaultArticleCta
  const readTime = useMemo(() => readingTimeFor(doc), [doc])

  useEffect(() => {
    let active = true
    setCmsDoc(null)

    getCmsArticle(slug).then((nextDoc) => {
      if (active && nextDoc) setCmsDoc(nextDoc)
    })

    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    const canonical = `https://ringsociety.com/guides/${doc.slug}`
    const upsert = (selector: string, attribute: 'name' | 'property', content: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, selector.match(/="([^"]+)"/)?.[1] ?? '')
        document.head.appendChild(element)
      }
      element.content = content
    }
    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')

    document.title = `${doc.title} | Ring Society`
    upsert('meta[name="description"]', 'name', doc.subtitle)
    upsert('meta[property="og:title"]', 'property', doc.title)
    upsert('meta[property="og:description"]', 'property', doc.subtitle)
    upsert('meta[property="og:url"]', 'property', canonical)
    upsert('meta[property="og:type"]', 'property', 'article')
    upsert('meta[name="twitter:title"]', 'name', doc.title)
    upsert('meta[name="twitter:description"]', 'name', doc.subtitle)
    if (canonicalLink) canonicalLink.href = canonical

    const schemaId = 'ring-society-article-schema'
    let schema = document.getElementById(schemaId) as HTMLScriptElement | null
    if (!schema) {
      schema = document.createElement('script')
      schema.id = schemaId
      schema.type = 'application/ld+json'
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: doc.title,
      description: doc.subtitle,
      mainEntityOfPage: canonical,
      author: { '@type': 'Organization', name: 'Ring Society' },
      publisher: { '@type': 'Organization', name: 'Ring Society', url: 'https://ringsociety.com/' },
    })

    return () => {
      document.getElementById(schemaId)?.remove()
      upsert('meta[property="og:type"]', 'property', 'website')
    }
  }, [doc])

  const gallery: GalleryImage[] = useMemo(
    () =>
      doc.body
        .filter((b): b is Extract<ArticleBlock, { type: 'image' }> => b.type === 'image')
        .map((b) => ({ src: b.src, alt: b.alt, caption: b.caption })),
    [doc],
  )
  const galleryIndexOf = (src: string) => gallery.findIndex((g) => g.src === src)

  const toc = useMemo(
    () =>
      doc.body
        .filter((b): b is Extract<ArticleBlock, { type: 'h2' }> => b.type === 'h2')
        .map((b) => ({ id: slugify(b.toc), label: b.toc })),
    [doc],
  )

  const related = getRelated(doc)
  const heroRef = useRef<HTMLElement>(null)
  const readingRef = useRef<HTMLDivElement>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [activeId, setActiveId] = useState(toc[0]?.id ?? '')
  const [progress, setProgress] = useState(0)
  const [barVisible, setBarVisible] = useState(false)
  const [fadeVisible, setFadeVisible] = useState(true)
  const [heroReady, setHeroReady] = useState(false)
  const heroReadySlug = useRef<string | null>(null)

  useEffect(() => {
    heroReadySlug.current = null
    setHeroReady(false)
  }, [slug])

  const revealHero = () => {
    if (heroReadySlug.current === doc.slug) return
    heroReadySlug.current = doc.slug
    setHeroReady(true)
  }

  useEffect(() => {
    const image = heroRef.current?.querySelector('img')
    if (image?.complete && image.naturalWidth > 0) revealHero()
  }, [doc.slug, doc.hero, doc.heroImage])

  // scroll-spy + reading progress
  useEffect(() => {
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el)
    const onScroll = () => {
      // reading progress (0–1) — reaches 100% when the end of the article
      // content (not the page) reaches the bottom of the viewport
      const readingEndDoc =
        window.scrollY + (readingRef.current?.getBoundingClientRect().bottom ?? document.documentElement.scrollHeight)
      const max = readingEndDoc - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
      // show the progress bar only while reading: once the hero has scrolled
      // out of view, and until the end of the article content is reached
      const heroBottom = heroRef.current?.getBoundingClientRect().bottom ?? 0
      const readingBottom = readingRef.current?.getBoundingClientRect().bottom ?? Infinity
      setBarVisible(heroBottom <= 0 && readingBottom > window.innerHeight)
      // release the bottom fade once the end of the article is in view, so the
      // final paragraph reads fully (dark), not washed out
      setFadeVisible(readingBottom > window.innerHeight + 8)
      // active section heading nearest the top of the viewport
      if (headings.length) {
        const offset = 160
        let current = headings[0].id
        for (const h of headings) {
          if (h.getBoundingClientRect().top - offset <= 0) current = h.id
        }
        setActiveId(current)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [toc])

  return (
    <>
      {/* ---------- reading-progress bar (article only; fades in once the hero leaves the viewport) ---------- */}
      <div
        className={`sticky top-[57px] z-50 h-1 w-full bg-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.18)] transition-opacity duration-[600ms] md:top-[66px] ${
          barVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="h-full bg-[#244737] transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* ---------- hero split card ---------- */}
      <section key={doc.slug} ref={heroRef} className={`w-full ${heroReady ? 'article-hero-arrival' : 'article-hero-pending'}`}>
        <div className="mx-auto w-full max-w-[1440px] px-0 md:px-10">
          <div className="overflow-hidden bg-[#fbf9f7] md:rounded-[8px]">
            <div className="flex flex-col md:flex-row">
              {/* text */}
              <div className="order-2 flex flex-col gap-6 px-6 py-12 md:order-1 md:w-1/2 md:justify-center md:gap-[66px] md:px-[96px] md:py-[52px]">
                <p className="text-[11px] font-semibold uppercase tracking-[2px] text-black">
                  {doc.category}
                </p>
                <div className="flex flex-col gap-4 md:gap-6">
                  <h1
                    className="text-[38px] leading-[1.1] tracking-[-0.5px] text-black md:text-[58px] md:tracking-[-1px]"
                    style={{ fontFamily: serif }}
                  >
                    {doc.title}
                  </h1>
                  <p className="body-copy tracking-[0.3px] text-black md:tracking-normal">
                    {doc.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[11px] font-semibold uppercase tracking-[2px] text-[#7b7b7b]">
                    {readTime}
                  </span>
                  <button aria-label="Share article" className="transition-opacity hover:opacity-60">
                    <img src={shareArrow} alt="" className="h-[16px] w-auto" />
                  </button>
                </div>
              </div>
              {/* photo */}
              <div
                className={`relative order-1 h-[316px] w-full md:order-2 md:h-[551px] md:w-1/2 ${heroReady ? 'article-hero-image-expand' : ''}`}
              >
                <ResponsiveImage
                  image={doc.heroImage}
                  fallbackSrc={doc.hero}
                  alt=""
                  className="h-full w-full object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  onLoad={revealHero}
                />
                {doc.badge && (
                  <div className="absolute bottom-4 left-6 md:bottom-[60px] md:left-auto md:right-[60px]">
                    <ArticleLabel label={doc.badge} background="rgba(155,155,155,0.25)" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- reading body + sticky sidebar ---------- */}
      <section className="w-full">
        <div className="mx-auto flex w-full max-w-[1440px] justify-center gap-16 px-6 md:px-10 xl:gap-[115px]">
          <div ref={readingRef} className="w-full max-w-[710px] pt-16 md:pt-24">
            <ArticleBody
              intro={doc.intro}
              body={doc.body}
              onZoom={(i) => setLightbox(i)}
              galleryIndexOf={galleryIndexOf}
            />
            {/* bottom-of-article fade to entice the scroll; releases at the end */}
            <div
              className={`pointer-events-none sticky bottom-0 -mt-24 h-24 w-full bg-gradient-to-b from-transparent to-white transition-opacity duration-500 ${
                fadeVisible ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
          <Sidebar
            toc={toc}
            activeId={activeId}
            categories={doc.categories}
            cta={cta}
          />
        </div>
      </section>

      {/* ---------- sidebar CTA (mobile: sits above the newsletter, per the layout) ---------- */}
      <div className="w-full px-6 pt-12 lg:hidden">
        <div className="mx-auto max-w-[440px]">
          <CtaCard cta={cta} />
        </div>
      </div>

      {/* ---------- newsletter ---------- */}
      <div className="w-full pt-16 md:pt-24">
        <Newsletter />
      </div>

      {/* ---------- explore more ---------- */}
      <section className="w-full pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10">
          <h2 className="text-[32px] leading-[1.2] tracking-[-0.5px] text-black md:text-[42px]">
            <span style={{ fontFamily: serif }}>Explore More</span>
          </h2>
          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-3">
            {related.map((c) => (
              <div key={c.title} className="h-full">
                <GuideCard card={c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox !== null && (
        <Lightbox
          images={gallery}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onIndex={setLightbox}
        />
      )}
    </>
  )
}
