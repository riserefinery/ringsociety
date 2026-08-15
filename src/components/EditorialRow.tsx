import type { ReactNode } from 'react'
import { Link } from 'react-router'
import ArticleLabel from './ArticleLabel'
import { Stagger, RevealItem } from './Reveal'
import { Eyebrow, serif } from './ui'

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
  to,
  mobileCtaFullWidth = false,
}: {
  image: string
  alt: string
  eyebrow: string
  title: ReactNode
  body: string
  reverse?: boolean
  badge?: string
  tone?: 'dark' | 'light'
  to?: string
  mobileCtaFullWidth?: boolean
}) {
  const textColor = tone === 'light' ? '#fff' : '#000'
  const ctaClasses = `inline-flex h-[45px] ${mobileCtaFullWidth ? 'w-full md:w-fit' : 'w-fit'} items-center justify-center rounded-lg px-6 text-[13px] font-semibold uppercase tracking-[1.5px] transition-colors duration-500 ease-out ${
    tone === 'light' ? 'border border-transparent bg-white text-black hover:bg-black hover:text-white' : 'border border-black bg-black text-[#fbf9f7] hover:bg-white hover:text-black'
  }`
  return (
    <Stagger className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 ${reverse ? 'lg:[direction:rtl]' : ''}`}>
      <RevealItem className="relative overflow-hidden rounded-lg [direction:ltr]">
      <div className="relative overflow-hidden rounded-lg" style={{ aspectRatio: '670 / 447', background: '#d8cfc4' }}>
        {to ? (
          <Link to={to} aria-label={`Read ${typeof title === 'string' ? title : eyebrow}`} className="block h-full w-full">
            <img src={image} alt={alt} className="h-full w-full object-cover transition-transform duration-[900ms] ease-out hover:scale-105" />
          </Link>
        ) : (
          <img src={image} alt={alt} className="h-full w-full object-cover" />
        )}
        {badge && (
          <div className="absolute right-6 top-5 md:bottom-4 md:left-6 md:right-auto md:top-auto">
            <ArticleLabel label={badge} background="rgba(255,255,255,0.20)" />
          </div>
        )}
      </div>
      </RevealItem>
      <RevealItem className="flex max-w-[575px] flex-col gap-8 [direction:ltr]">
      <div className="flex flex-col gap-8" style={{ color: textColor }}>
        <Eyebrow tone={tone === 'light' ? 'light' : 'muted'}>{eyebrow}</Eyebrow>
        {to ? (
          <Link to={to} className="w-fit transition-opacity hover:opacity-65">
            <h2 className="text-[clamp(32px,3.2vw,42px)] leading-[1.2]" style={{ fontFamily: serif }}>
              {title}
            </h2>
          </Link>
        ) : (
          <h2 className="text-[clamp(32px,3.2vw,42px)] leading-[1.2]" style={{ fontFamily: serif }}>
            {title}
          </h2>
        )}
        <p className="body-copy" style={{ color: tone === 'light' ? 'rgba(255,255,255,0.82)' : '#111' }}>
          {body}
        </p>
        {to ? <Link to={to} className={ctaClasses}>view the guide</Link> : <span className={ctaClasses}>view the guide</span>}
      </div>
      </RevealItem>
    </Stagger>
  )
}
