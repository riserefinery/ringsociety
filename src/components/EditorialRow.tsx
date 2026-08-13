import type { ReactNode } from 'react'
import { svgPaths } from '../lib/assets'
import { Stagger, RevealItem } from './Reveal'
import { Eyebrow, SolidButton, serif } from './ui'

/** Universal two-up editorial feature (image + copy). Reusable across pages. */
export default function EditorialRow({
  image,
  alt,
  eyebrow,
  title,
  body,
  reverse = false,
  badge,
  tone = 'dark',
}: {
  image: string
  alt: string
  eyebrow: string
  title: ReactNode
  body: string
  reverse?: boolean
  badge?: string
  tone?: 'dark' | 'light'
}) {
  const textColor = tone === 'light' ? '#fff' : '#000'
  return (
    <Stagger className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:[direction:rtl]' : ''}`}>
      <RevealItem className="relative overflow-hidden rounded-lg [direction:ltr]">
      <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '670 / 447', background: '#d8cfc4' }}>
        <img src={image} alt={alt} className="h-full w-full object-cover" />
        {badge && (
          <span className="absolute left-6 top-5 flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-sm">
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <g clipPath="url(#feat)">
                <path d={svgPaths.pf5a4280} fill="white" />
                <path d={svgPaths.p2026f000} fill="white" />
                <path d={svgPaths.p3b71c800} fill="white" />
                <path d={svgPaths.p122a5800} fill="white" />
              </g>
              <defs>
                <clipPath id="feat">
                  <rect width="14" height="12" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span className="text-[11px] font-semibold uppercase tracking-[2px] text-white">{badge}</span>
          </span>
        )}
      </div>
      </RevealItem>
      <RevealItem className="flex max-w-[575px] flex-col gap-8 [direction:ltr]">
      <div className="flex flex-col gap-8" style={{ color: textColor }}>
        <Eyebrow tone={tone === 'light' ? 'light' : 'muted'}>{eyebrow}</Eyebrow>
        <h2 className="text-[clamp(32px,3.2vw,42px)] leading-[1.2]" style={{ fontFamily: serif }}>
          {title}
        </h2>
        <p className="text-[18px] leading-[1.6]" style={{ color: tone === 'light' ? 'rgba(255,255,255,0.82)' : '#111' }}>
          {body}
        </p>
        <SolidButton variant={tone === 'light' ? 'light' : 'dark'} className="w-fit">view the guide</SolidButton>
      </div>
      </RevealItem>
    </Stagger>
  )
}
