import { Link } from 'react-router'
import { svgPaths, iconRS, logoXL } from '../lib/assets'
import { legalLinks, copyright } from '../lib/nav'
import { serif } from './ui'

type FooterLink = string | { label: string; to: string }

function ArrowCircle() {
  return (
    <span className="inline-grid place-items-center transition-transform duration-300 group-hover:translate-x-1">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7.5" stroke="#F9F6F2" />
        <path
          d="M5.5 8h5M8 5.5 10.5 8 8 10.5"
          stroke="#F9F6F2"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

/** Universal site footer. Shared across every page. */
export default function Footer() {
  const guides = [
    'How to Choose Your Jeweler: Use Our 10-Point Framework',
    'How to Buy an Engagement Ring',
    'Engagement Ring Budgets Explained: How Much Should You Spend?',
    'Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison',
    'The 4Cs of Diamonds (Explained in Plain English)',
  ]
  const col = (heading: string, items: FooterLink[], width: string) => (
    <div className={`flex flex-col gap-[23px] ${width}`}>
      <p className="text-[12px] font-semibold uppercase tracking-[1px] text-white">{heading}</p>
      <div className="flex flex-col gap-3.5">
        {items.map((i) => {
          const label = typeof i === 'string' ? i : i.label
          const cls =
            'cursor-pointer text-[14px] leading-[1.6] text-[color:var(--sage)] transition-colors hover:text-white'
          return typeof i === 'string' ? (
            <a key={label} className={cls}>
              {label}
            </a>
          ) : (
            <Link key={label} to={i.to} className={cls}>
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
  return (
    <footer
      className="relative w-full"
      style={{ background: 'linear-gradient(180deg, #244737 0%, #102d1f 100%)' }}
    >
      <div className="mx-auto max-w-[1440px] px-5 pt-[92px] pb-10 md:px-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-x-10 md:gap-y-14 lg:grid-cols-4 lg:gap-8 xl:gap-12">
          {/* brand column */}
          <div className="flex w-full flex-col md:min-w-0">
            <img src={iconRS} alt="Ring Society" className="h-[38px] w-auto self-start" />
            <p className="mt-[23px] text-[19px] italic leading-[1.4]" style={{ fontFamily: serif, color: 'var(--sage)' }}>
              Your trusted guide to the perfect ring
            </p>
            <div className="mt-[23px] flex items-center gap-5">
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" className="cursor-pointer">
                <path d={svgPaths.pf3bcd00} fill="#ABB7B1" />
              </svg>
              <svg width="25" height="25" viewBox="0 0 25 25" fill="none" className="cursor-pointer">
                <path d={svgPaths.p1f8aca00} fill="#ABB7B1" />
              </svg>
            </div>
            <p className="mt-[72px] text-[32px] leading-[1.25] text-white" style={{ fontFamily: serif }}>
              Need a Top Local Jeweler?
            </p>
            <button className="group mt-[29px] flex items-center gap-3 text-white">
              <span className="text-[13px] font-semibold uppercase tracking-[2px]">Find a jeweler</span>
              <ArrowCircle />
            </button>
          </div>

          {col('Most-Loved Guides', guides, 'w-full min-w-0')}
          {col('More', [{ label: 'Our Mission', to: '/our-mission' }, { label: 'Contact Us', to: '/contact' }], 'w-full min-w-0')}
          <div className="flex w-full min-w-0 flex-col gap-[25px]">
            {col('Legal', legalLinks, 'w-full')}
            <p className="text-[11px] leading-[1.5]" style={{ color: 'var(--sage)', opacity: 0.6 }}>
              {copyright}
            </p>
          </div>
        </div>

        <div className="mt-[60px] h-px w-full" style={{ background: 'rgba(171,183,177,0.3)' }} />
      </div>

      <div className="overflow-hidden px-5 pb-6 md:px-10">
        <img src={logoXL} alt="Ring Society" className="mx-auto block w-full max-w-[1340px]" />
      </div>
    </footer>
  )
}
