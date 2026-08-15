import type { Guide } from '../lib/content'
import { Link } from 'react-router'
import ArticleLabel from './ArticleLabel'
import { serif } from './ui'
import { prefetchCmsArticle } from '../sanity/queries'

/**
 * Universal large "guide feature" block for pillar guides.
 * Structure is fixed; content comes from a `Guide` record.
 *
 *  - Desktop: wide image card with a left-aligned overlay (eyebrow + optional
 *    badge pill, serif headline, excerpt, button). Text tone follows `guide.tone`.
 *  - Mobile:  the article's feature image (with any badge overlaid) stacked
 *    above a light text block — consistent across all cards.
 */
export default function GuideFeature({ guide }: { guide: Guide }) {
  const { slug, category, badge, title, excerpt, feature, guideFeature, tone, imagePosition = 'center' } = guide
  const articlePath = `/guides/${slug}`
  const prefetchArticle = () => prefetchCmsArticle(slug)
  const light = tone === 'light' // white text on desktop overlay

  const overlay = light
    ? 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0) 78%)'
    : 'linear-gradient(90deg, rgba(249,246,242,0.85) 0%, rgba(249,246,242,0.4) 45%, rgba(249,246,242,0) 78%)'
  const textColor = light ? '#fff' : '#101010'

  return (
    <>
      {/* mobile */}
      <section className="w-full px-5 md:hidden">
        <article className="flex flex-col gap-5">
          <div className="relative h-[228px] w-full overflow-hidden rounded-[12px]" style={{ background: '#d8cfc4' }}>
            <Link to={articlePath} aria-label={`Read ${title}`} className="block h-full w-full" prefetch="intent" viewTransition onPointerDown={prefetchArticle} onPointerEnter={prefetchArticle} onFocus={prefetchArticle}>
              <img src={feature} alt="" className="h-full w-full object-cover" style={{ objectPosition: imagePosition }} />
            </Link>
            {badge && (
              <span className="absolute right-4 top-4">
                <ArticleLabel label={badge} />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--muted)' }}>
              {category}
            </p>
            <Link to={articlePath} className="w-fit transition-opacity hover:opacity-65" prefetch="intent" viewTransition onPointerDown={prefetchArticle} onPointerEnter={prefetchArticle} onFocus={prefetchArticle}>
              <h2 className="text-[36px] leading-[1.18] tracking-[-0.3px] text-black" style={{ fontFamily: serif }}>
                {title}
              </h2>
            </Link>
            <p className="body-copy tracking-[0.3px]" style={{ color: 'var(--muted)' }}>
              {excerpt}
            </p>
            <Link to={articlePath} className="mt-1 w-full rounded-lg bg-black py-[14px] text-center text-[12px] font-semibold uppercase tracking-[1.2px] text-[#fbf9f7]" prefetch="intent" viewTransition onPointerDown={prefetchArticle} onPointerEnter={prefetchArticle} onFocus={prefetchArticle}>
              View the guide
            </Link>
          </div>
        </article>
      </section>

      {/* desktop */}
      <section className="mx-auto hidden w-full max-w-[1440px] px-10 md:block">
        <div className="relative overflow-hidden rounded-lg" style={{ background: '#31353d', aspectRatio: '1344 / 633', minHeight: 560 }}>
          <Link to={articlePath} aria-label={`Read ${title}`} className="absolute inset-0 block" prefetch="intent" viewTransition onPointerDown={prefetchArticle} onPointerEnter={prefetchArticle} onFocus={prefetchArticle}>
            <img
              src={guideFeature ?? feature}
              alt=""
              className="h-full w-full object-cover"
              style={{ objectPosition: imagePosition }}
            />
          </Link>
          <div className="pointer-events-none absolute inset-0" style={{ background: overlay }} />
          <div className="absolute inset-0 flex items-center">
            <div className="flex max-w-[560px] flex-col gap-9 px-[92px]" style={{ color: textColor }}>
              <div className="flex items-center gap-5">
                <span className="text-[11px] font-semibold uppercase tracking-[2px]" style={{ color: textColor }}>
                  {category}
                </span>
                {badge && (
                  <ArticleLabel label={badge} color={textColor} background={light ? 'rgba(255,255,255,0.15)' : 'rgba(16,16,16,0.08)'} />
                )}
              </div>
              <Link to={articlePath} className="w-fit transition-opacity hover:opacity-65" prefetch="intent" viewTransition onPointerDown={prefetchArticle} onPointerEnter={prefetchArticle} onFocus={prefetchArticle}>
                <h2 className="text-[clamp(32px,3.2vw,42px)] leading-[1.15] tracking-[-0.6px]" style={{ fontFamily: serif }}>
                  {title}
                </h2>
              </Link>
              <p className="body-copy max-w-[467px] tracking-[0.1px]" style={{ color: light ? 'rgba(255,255,255,0.9)' : '#2a2a2a' }}>
                {excerpt}
              </p>
              <Link
                to={articlePath}
                className={`inline-flex h-[41px] w-fit items-center justify-center rounded-lg px-6 text-[13px] font-semibold uppercase tracking-[1.5px] transition-colors duration-500 ease-out ${
                  light ? 'border border-transparent bg-white text-black hover:bg-black hover:text-white' : 'border border-black bg-black text-[#fbf9f7] hover:bg-white hover:text-black'
                }`}
                prefetch="intent"
                viewTransition
                onPointerDown={prefetchArticle}
                onPointerEnter={prefetchArticle}
                onFocus={prefetchArticle}
              >
                view the guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
