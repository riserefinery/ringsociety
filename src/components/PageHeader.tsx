import type { ReactNode } from 'react'
import { serif } from './ui'

/**
 * Universal page header — a centered title + subtitle over a background image.
 * Reused for section landing pages (Top Guides, All Resources, etc.).
 * An optional `filters` slot renders below the subtitle (e.g. category chips).
 */
export default function PageHeader({
  title,
  subtitle,
  image,
  filters,
  fullBleedDesktop = false,
  imagePosition = 'center center',
  eyebrow,
  matchResourcesHeight = false,
}: {
  title: string
  subtitle?: string
  image: string
  filters?: ReactNode
  /** Extends the desktop header surface to the viewport edges while preserving its centered internal content. */
  fullBleedDesktop?: boolean
  /** Controls the object-position used by the desktop background image. */
  imagePosition?: string
  eyebrow?: string
  /** Keeps another page header level with the All Resources header. */
  matchResourcesHeight?: boolean
}) {
  return (
    <section className={fullBleedDesktop ? 'w-full' : 'w-full md:mx-auto md:max-w-[1440px] md:px-10'}>
      <div
        className={`relative flex min-h-[calc(100svh-91px)] items-center justify-center overflow-hidden px-6 py-20 md:py-[120px] ${matchResourcesHeight ? 'md:min-h-[480px]' : 'md:min-h-[320px]'} ${fullBleedDesktop ? 'md:rounded-none' : 'md:rounded-lg'}`}
        style={{ background: '#1a1a1a' }}
      >
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: imagePosition }} />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
        <div className="relative flex max-w-[560px] flex-col items-center gap-6 text-center text-[#f9f6f2]">
          {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#f9f6f2]/70">{eyebrow}</p>}
          <h1 className="text-[clamp(40px,6vw,58px)] leading-[1.1] tracking-[-1.5px]" style={{ fontFamily: serif }}>
            {title}
          </h1>
          {subtitle && <p className="max-w-[444px] text-[16px] leading-[1.6] md:text-[18px]">{subtitle}</p>}
          {filters && <div className="mt-3 md:mt-4">{filters}</div>}
        </div>
      </div>
    </section>
  )
}
