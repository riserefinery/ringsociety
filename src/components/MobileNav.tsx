import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { iconCream, logoWordmark } from '../lib/assets'
import { primaryNav, legalLinks, copyright } from '../lib/nav'
import { serif } from './ui'

/**
 * Full-screen mobile navigation overlay.
 * Adapted from the Figma "mobile-nav-menu" frame; links and legal items
 * are pulled from the shared nav model so it never drifts from the
 * desktop header or the footer.
 */
export default function MobileNav({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: () => void
}) {
  const { pathname } = useLocation()

  // lock body scroll while the overlay is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col justify-between bg-[#f9f6f2] transition-[transform,opacity] md:hidden ${
        open ? 'duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)]' : 'duration-[180ms] ease-[cubic-bezier(0.4,0,1,1)]'
      } ${
        open ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-full opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-[rgba(36,71,55,0.12)] px-6 py-4">
        <Link to="/" onClick={onClose} className="shrink-0">
          <img src={logoWordmark} alt="Ring Society" className="h-[25px] w-auto" />
        </Link>
        <button aria-label="Close menu" onClick={onClose} className="grid h-6 w-6 place-items-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#1B211D" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="#1B211D" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* nav links */}
      <nav className="relative flex flex-1 flex-col items-start justify-start gap-5 overflow-hidden px-8 pt-20">
        {/* cream RS watermark, centered */}
        <img
          src={iconCream}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/2 w-[84%] max-w-[326px] -translate-x-1/2 translate-y-[8%] select-none"
        />
        {primaryNav.map((item, i) => {
          const active = item.to === pathname
          const content = (
            <span
              className={`flex items-center gap-3 leading-[1.18] tracking-[-0.3px] text-[28px] ${
                active ? 'italic text-[#1b211d]' : 'not-italic text-[#244737] opacity-80'
              } ${!active ? 'pl-4' : ''}`}
              style={{ fontFamily: serif }}
            >
              {active && (
                <span className="inline-block h-[7px] w-[5px] shrink-0 rotate-[14deg] rounded-full bg-[#244737]" />
              )}
              {item.label}
            </span>
          )
          return (
            <div key={item.label} className="relative z-[1] w-full">
              {item.to ? (
                <Link to={item.to} prefetch="intent" onClick={onNavigate} className="block w-full">
                  {content}
                </Link>
              ) : (
                <button className="block w-full text-left" onClick={onClose}>
                  {content}
                </button>
              )}
              {i < primaryNav.length - 1 && <div className="mt-5 h-px w-full bg-[rgba(36,71,55,0.12)]" />}
            </div>
          )
        })}
      </nav>

      {/* footer */}
      <div
        className="relative flex flex-col gap-5 p-8"
        style={{ background: 'linear-gradient(180deg, #244737 0%, #102d1f 100%)' }}
      >
        <div className="flex flex-col gap-1 text-[13px] leading-[2] text-[#f9f6f2] opacity-80">
          <p className="flex flex-wrap gap-x-2">
            {legalLinks.slice(0, 3).map((l, i) => (
              <span key={l.label}>
                <Link to={l.to ?? '/'} prefetch="intent" onClick={onNavigate} className="cursor-pointer transition-opacity hover:opacity-100">{l.label}</Link>
                {i < 2 && <span className="pl-2 opacity-60">|</span>}
              </span>
            ))}
          </p>
          {legalLinks.slice(3).map((l) => (
            <Link key={l.label} to={l.to ?? '/'} prefetch="intent" onClick={onNavigate} className="cursor-pointer transition-opacity hover:opacity-100">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="text-[11px] leading-[1.5] text-[#abb7b1] opacity-80">{copyright}</p>
      </div>
    </div>
  )
}
