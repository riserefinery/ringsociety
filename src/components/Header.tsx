import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { logoWordmark, burgerMenu } from '../lib/assets'
import { headerNav } from '../lib/nav'
import MobileNav from './MobileNav'
import SearchOverlay from './SearchOverlay'
import { SearchIcon } from './ui'
import { getCmsSiteSettings } from '../sanity/queries'

/** Universal site header + nav. Shared across every page. */
export default function Header() {
  const nav = headerNav.slice(0, 2)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [helloBarText, setHelloBarText] = useState('Your trusted guide to the perfect Engagement ring')
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // global shortcuts: ⌘K / Ctrl+K anywhere, or "/" when not already typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      const typing =
        document.activeElement instanceof HTMLElement &&
        ['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      } else if (k === '/' && !typing && !searchOpen) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  useEffect(() => {
    let active = true
    getCmsSiteSettings().then((settings) => {
      if (active && settings?.helloBarText) setHelloBarText(settings.helloBarText)
    })
    return () => {
      active = false
    }
  }, [])

  const openSearch = () => {
    setMenuOpen(false)
    setSearchOpen(true)
  }
  return (
    <>
      {/* green top bar — scrolls away with the page */}
      <div
        className="flex min-h-[34px] w-full items-center justify-center px-4 py-2"
        style={{ background: 'var(--forest)' }}
      >
        <p className="text-center text-[11px] font-semibold uppercase tracking-[1.5px] text-white">
          {helloBarText}
        </p>
      </div>

      {/* white bar — sticks to the top of the viewport sitewide */}
      <header
        className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-[600ms] ${scrolled ? 'shadow-[0_6px_16px_-6px_rgba(0,0,0,0.18)]' : 'shadow-none'}`}
      >
      {/* desktop header */}
      <div
        className={`mx-auto hidden max-w-[1440px] items-center justify-between px-10 transition-[height] duration-300 ease-out md:flex ${scrolled ? 'h-[66px]' : 'h-[99px]'}`}
      >
        <nav className="flex flex-1 items-center gap-9">
          {nav.map((n) =>
            n.to ? (
              <Link
                key={n.label}
                to={n.to}
                className="cursor-pointer text-[12px] font-semibold uppercase tracking-[1px] text-black transition-opacity hover:opacity-60"
              >
                {n.label}
              </Link>
            ) : (
              <a
                key={n.label}
                className="cursor-pointer text-[12px] font-semibold uppercase tracking-[1px] text-black transition-opacity hover:opacity-60"
              >
                {n.label}
              </a>
            ),
          )}
        </nav>
        <Link to="/" className="shrink-0 cursor-pointer">
          <img src={logoWordmark} alt="Ring Society" className="h-[26px] w-auto" />
        </Link>
        <div className="flex flex-1 items-center justify-end gap-9">
          <Link
            to="/our-mission"
            className="cursor-pointer text-[12px] font-semibold uppercase tracking-[1px] text-black transition-opacity hover:opacity-60"
          >
            Our Mission
          </Link>
          <button
            onClick={openSearch}
            className="flex cursor-pointer items-center gap-3 text-[12px] font-semibold uppercase tracking-[1px] text-black transition-opacity hover:opacity-60"
          >
            Search
            <SearchIcon />
          </button>
        </div>
      </div>

      {/* mobile header */}
      <div className="relative border-b border-[#e5e5e5] md:hidden">
        <div className="flex h-[57px] items-center justify-between px-5">
          <button
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-6 w-[15px] items-center justify-center"
          >
            <img src={burgerMenu} alt="" className="h-6 w-[15px]" />
          </button>
          <Link to="/" className="shrink-0 cursor-pointer" onClick={() => setMenuOpen(false)}>
            <img src={logoWordmark} alt="Ring Society" className="h-[22px] w-auto" />
          </Link>
          <button onClick={openSearch} aria-label="Search" className="flex h-6 w-6 items-center justify-center">
            <SearchIcon size={16} />
          </button>
        </div>
      </div>
      </header>

      {/* full-screen mobile nav overlay */}
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* command-palette search overlay */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
