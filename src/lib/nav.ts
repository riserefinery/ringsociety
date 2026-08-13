/* ---------------------------------------------------------------
   Central navigation model.
   Header (desktop), the mobile nav menu, and the Footer all pull
   their links from here so the three never drift out of sync.
----------------------------------------------------------------*/

export type NavLink = { label: string; to?: string }

/** Primary site navigation — shared by the desktop header and the mobile menu. */
export const primaryNav: NavLink[] = [
  { label: 'Overview', to: '/' },
  { label: 'Top Guides', to: '/top-guides' },
  { label: 'All Resources', to: '/all-resources' },
  { label: 'Find a Top Local Jeweler' },
  { label: 'Our Mission', to: '/our-mission' },
]

/** Desktop header links (Overview lives on the logo, so it is omitted here). */
export const headerNav: NavLink[] = primaryNav.filter((n) => n.to !== '/')

/** Legal / utility links — shared by the footer and the mobile menu. */
export const legalLinks: NavLink[] = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Your Privacy Choices', to: '/do-not-sell' },
]

export const copyright = '© Ring Society 2026 | All Rights Reserved'
