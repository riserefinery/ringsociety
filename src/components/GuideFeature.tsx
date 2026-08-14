import { svgPaths } from '../lib/assets'
import type { Guide } from '../lib/content'
import { Link } from 'react-router'
import { SolidButton, serif } from './ui'

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
            <img src={feature} alt="" className="h-full w-full object-cover" style={{ objectPosition: imagePosition }} />
            {badge && (
              <span className="absolute left-4 top-4">
                <Badge badge={badge} color="#fff" bg="rgba(155,155,155,0.28)" />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--muted)' }}>
              {category}
            </p>
            <h2 className="text-[28px] leading-[1.18] tracking-[-0.3px] text-black" style={{ fontFamily: serif }}>
              {title}
            </h2>
            <p className="text-[15px] leading-[1.6] tracking-[0.3px]" style={{ color: 'var(--muted)' }}>
              {excerpt}
            </p>
            <Link to={`/guides/${slug}`} className="mt-1 w-full rounded-lg bg-black py-[14px] text-center text-[12px] font-semibold uppercase tracking-[1.2px] text-[#fbf9f7]">
              View the guide
            </Link>
          </div>
        </article>
      </section>

      {/* desktop */}
      <section className="mx-auto hidden w-full max-w-[1440px] px-10 md:block">
        <div className="relative overflow-hidden rounded-lg" style={{ background: '#31353d', aspectRatio: '1344 / 633', minHeight: 560 }}>
          <img
            src={guideFeature ?? feature}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0" style={{ background: overlay }} />
          <div className="absolute inset-0 flex items-center">
            <div className="flex max-w-[560px] flex-col gap-9 px-[92px]" style={{ color: textColor }}>
              <div className="flex items-center gap-5">
                <span className="text-[11px] font-semibold uppercase tracking-[2px]" style={{ color: textColor }}>
                  {category}
                </span>
                {badge && (
                  <Badge
                    badge={badge}
                    color={textColor}
                    bg={light ? 'rgba(255,255,255,0.15)' : 'rgba(16,16,16,0.08)'}
                  />
                )}
              </div>
              <h2 className="text-[clamp(32px,3.2vw,42px)] leading-[1.15] tracking-[-0.6px]" style={{ fontFamily: serif }}>
                {title}
              </h2>
              <p className="max-w-[467px] text-[15px] leading-[1.6] tracking-[0.1px]" style={{ color: light ? 'rgba(255,255,255,0.9)' : '#2a2a2a' }}>
                {excerpt}
              </p>
              <Link to={`/guides/${slug}`}>
                <SolidButton variant={light ? 'light' : 'dark'} className="w-fit !h-[41px]">view the guide</SolidButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Badge({ badge, color, bg }: { badge: NonNullable<Guide['badge']>; color: string; bg: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full px-4 py-1.5 backdrop-blur-sm" style={{ background: bg }}>
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
        {badge === 'most loved' ? (
          <path clipRule="evenodd" d={svgPaths.p206fd380} fill={color} fillRule="evenodd" />
        ) : (
          <g>
            <path d={svgPaths.pf5a4280} fill={color} />
            <path d={svgPaths.p2026f000} fill={color} />
            <path d={svgPaths.p3b71c800} fill={color} />
            <path d={svgPaths.p122a5800} fill={color} />
          </g>
        )}
      </svg>
      <span className="text-[11px] font-semibold uppercase tracking-[2px]" style={{ color }}>
        {badge}
      </span>
    </span>
  )
}
