import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion'
import ArticleLabel from './ArticleLabel'
import { SolidButton, serif } from './ui'

/**
 * Motion props for the hero's stagger container.
 * - `ready === undefined` → reveal when scrolled into view (interior pages).
 * - `ready` boolean       → gated by the homepage load-in (hidden until true).
 */
function heroContainerProps(ready?: boolean) {
  const base = { variants: staggerContainer, initial: 'hidden' as const }
  return ready === undefined
    ? { ...base, whileInView: 'show' as const, viewport: viewportOnce }
    : { ...base, animate: ready ? ('show' as const) : ('hidden' as const) }
}

/**
 * Universal hero. One component, a few knobs for the page variations.
 *
 * Structure is fixed:
 *  - Desktop: full-bleed image card with a left-aligned overlay (small
 *    label + optional "most loved" badge pill, headline, body, button).
 *  - Mobile:  image block stacked above a solid text panel.
 *
 * Only the content + a couple of styling knobs change per page.
 */
export type HeroProps = {
  /** Desktop image */
  image: string
  /** Mobile image (falls back to `image`) */
  mobileImage?: string
  alt: string
  title: ReactNode
  body: string
  /** Small uppercase label shown above the headline on desktop. */
  label?: string
  /** Optional badge pill next to the desktop label, e.g. "most loved". */
  badge?: string
  /** Eyebrow shown above the headline on the mobile panel. */
  mobileEyebrow?: string
  ctaLabel?: string
  /** Optional route the CTA button links to. */
  ctaTo?: string
  /** Makes the CTA fill the mobile content column while preserving its desktop width. */
  mobileCtaFullWidth?: boolean
  /** Heading level — use `h1` for the primary page hero, `h2` elsewhere. */
  as?: 'h1' | 'h2'
  /** Solid background color of the mobile text panel. */
  mobilePanelColor?: string
  /** Loading surface shown behind the hero image before it is available. */
  imageBackground?: string
  /** object-position for the desktop image. */
  imagePosition?: string
  /** object-position for the mobile image. */
  mobileImagePosition?: string
  /** Homepage load-in gate. When set, hero content stays hidden until true. */
  ready?: boolean
  /** Makes only the desktop image surface full-bleed while retaining its original inner content grid. */
  fullBleedDesktop?: boolean
  /** Aligns a full-bleed desktop hero’s content column with the shared page grid while retaining its original right edge. */
  alignContentToPageGrid?: boolean
}

export default function Hero(props: HeroProps) {
  return (
    <>
      <HeroMobile {...props} />
      <HeroDesktop {...props} />
    </>
  )
}

function HeroMobile({
  image,
  mobileImage,
  alt,
  title,
  body,
  mobileEyebrow,
  ctaLabel = 'view the guide',
  ctaTo,
  mobileCtaFullWidth = false,
  as = 'h1',
  mobilePanelColor = '#817164',
  imageBackground = '#978778',
  mobileImagePosition = 'center 30%',
  ready,
  badge,
}: HeroProps) {
  const MHeading = motion[as]
  return (
    <section className="w-full md:hidden">
      <div className="relative h-[330px] w-full overflow-hidden" style={{ background: imageBackground }}>
        <img src={mobileImage ?? image} alt={alt} className="h-full w-full object-cover" style={{ objectPosition: mobileImagePosition }} />
        {badge && (
          <div className="absolute bottom-4 left-6">
            <ArticleLabel label={badge} />
          </div>
        )}
      </div>
      <motion.div
        className="flex flex-col gap-6 px-6 pb-12 pt-8"
        style={{ background: mobilePanelColor }}
        {...heroContainerProps(ready)}
      >
        <div className="flex flex-col gap-3 text-white">
          {mobileEyebrow && (
            <motion.p variants={fadeUp} className="text-[11px] font-semibold uppercase tracking-[1.5px] opacity-60">
              {mobileEyebrow}
            </motion.p>
          )}
          <MHeading variants={fadeUp} className="text-[44px] leading-[1.1] tracking-[-0.5px]" style={{ fontFamily: serif }}>
            {title}
          </MHeading>
        </div>
        <motion.p variants={fadeUp} className="body-copy tracking-[0.3px] text-white">
          {body}
        </motion.p>
        <motion.div variants={fadeUp}>
          {ctaTo ? (
            <Link
              to={ctaTo}
              prefetch="intent"
              viewTransition
              className={`inline-flex h-[45px] items-center justify-center rounded-lg border border-transparent bg-white px-6 text-[13px] font-semibold uppercase tracking-[1.5px] text-black transition-colors duration-500 ease-out hover:bg-black hover:text-white ${mobileCtaFullWidth ? 'w-full' : 'w-fit'}`}
            >
              {ctaLabel}
            </Link>
          ) : (
            <button className={`inline-flex h-[45px] items-center justify-center rounded-lg border border-transparent bg-white px-6 text-[13px] font-semibold uppercase tracking-[1.5px] text-black transition-colors duration-500 ease-out hover:bg-black hover:text-white ${mobileCtaFullWidth ? 'w-full' : 'w-fit'}`}>
              {ctaLabel}
            </button>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}

function HeroDesktop({
  image,
  alt,
  title,
  body,
  label,
  badge,
  ctaLabel = 'view the guide',
  ctaTo,
  as = 'h1',
  imagePosition = '70% center',
  imageBackground = '#978778',
  ready,
  fullBleedDesktop = false,
  alignContentToPageGrid = false,
}: HeroProps) {
  const MHeading = motion[as]
  return (
    <section className={fullBleedDesktop ? 'hidden w-full md:block' : 'mx-auto hidden w-full max-w-[1440px] px-10 md:block'}>
      <div
        className={fullBleedDesktop ? 'relative overflow-hidden rounded-lg md:rounded-none' : 'relative overflow-hidden rounded-lg'}
        style={
          fullBleedDesktop
            ? { background: imageBackground, minHeight: 520, height: 'clamp(520px, calc((100vw - 80px) * 0.5647), 768px)' }
            : { background: imageBackground, aspectRatio: '1360 / 768', minHeight: 520 }
        }
      >
        <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: imagePosition }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,14,10,0.28) 0%, rgba(20,14,10,0.14) 38%, rgba(20,14,10,0) 62%)',
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <motion.div
            className={`flex flex-col gap-9 px-8 text-white md:px-24 ${fullBleedDesktop && alignContentToPageGrid ? 'max-w-none' : 'max-w-[560px]'}`}
            style={
              fullBleedDesktop
                ? alignContentToPageGrid
                  ? {
                      width: 'clamp(467px, calc(100vw - 813px), 620px)',
                      maxWidth: 'calc(100vw - max(40px, calc((100vw - 1440px) / 2 + 40px)) - 40px)',
                      boxSizing: 'content-box',
                      paddingLeft: 'max(40px, calc((100vw - 1440px) / 2 + 40px))',
                      paddingRight: 0,
                    }
                  : { paddingLeft: 'max(136px, calc((100vw - 1440px) / 2 + 136px))', paddingRight: 96 }
                : undefined
            }
            {...heroContainerProps(ready)}
          >
            {(label || badge) && (
              <motion.div variants={fadeUp} className="flex items-center gap-5">
                {label && <span className="text-[11px] font-semibold uppercase tracking-[2px]">{label}</span>}
                {badge && (
                  <ArticleLabel label={badge} background="rgba(255,255,255,0.15)" />
                )}
              </motion.div>
            )}
            <MHeading
              variants={fadeUp}
              className={`text-[clamp(40px,5vw,58px)] leading-[1.05] tracking-[-1px] ${alignContentToPageGrid ? 'max-w-[620px]' : ''}`}
              style={{ fontFamily: serif }}
            >
              {title}
            </MHeading>
            <motion.p variants={fadeUp} className={`body-copy text-white/90 ${alignContentToPageGrid ? 'max-w-[620px]' : 'max-w-[467px]'}`}>
              {body}
            </motion.p>
            <motion.div variants={fadeUp}>
              {ctaTo ? (
                <Link to={ctaTo} prefetch="intent" viewTransition className="w-fit">
                  <SolidButton variant="light" className="w-fit !h-[41px]">{ctaLabel}</SolidButton>
                </Link>
              ) : (
                <SolidButton variant="light" className="w-fit !h-[41px]">{ctaLabel}</SolidButton>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
