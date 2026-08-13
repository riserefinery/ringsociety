import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { useEffect } from 'react'
import { Header, Footer } from '../components'

const canonicalHost = 'https://ringsociety.com'

const routeMeta: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Ring Society — Your Trusted Guide to the Perfect Engagement Ring',
    description: 'Expert, unbiased guides on diamonds, ring settings, budgets, and choosing the right jeweler before you buy an engagement ring.',
  },
  '/top-guides': {
    title: 'Top Engagement Ring Guides | Ring Society',
    description: 'Start with Ring Society’s most-loved expert guides for choosing an engagement ring with clarity and confidence.',
  },
  '/all-resources': {
    title: 'Engagement Ring Resources | Ring Society',
    description: 'Explore unbiased Ring Society resources on diamonds, ring settings, engagement ring budgets, and choosing a jeweler.',
  },
  '/our-mission': {
    title: 'Our Mission | Ring Society',
    description: 'Learn how Ring Society helps couples make clear, confident engagement ring decisions with unbiased education.',
  },
  '/contact': {
    title: 'Contact Ring Society',
    description: 'Contact Ring Society with questions about our engagement ring education and resources.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Ring Society',
    description: 'Read the Ring Society Privacy Policy, including information practices, privacy choices, and consumer rights.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions | Ring Society',
    description: 'Read the terms governing access to Ring Society websites, quizzes, educational content, and matching services.',
  },
  '/accessibility': {
    title: 'Accessibility Statement | Ring Society',
    description: 'Learn about Ring Society’s accessibility commitment and how to request accessibility assistance.',
  },
  '/do-not-sell': {
    title: 'Your Privacy Choices | Ring Society',
    description: 'Learn how to exercise applicable privacy choices with Ring Society, including sale, sharing, and targeted-advertising opt-outs.',
  },
}

function RouteMeta() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname === '/' ? '/' : location.pathname.replace(/\/$/, '')
    const fallback = routeMeta['/']
    const meta = routeMeta[path] ?? (path.startsWith('/guides/')
      ? { title: 'Engagement Ring Guide | Ring Society', description: fallback.description }
      : fallback)
    const canonical = `${canonicalHost}${path}`

    document.title = meta.title
    const upsert = (selector: string, attribute: 'name' | 'property', value: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, selector.match(/="([^"]+)"/)?.[1] ?? '')
        document.head.appendChild(element)
      }
      element.content = value
    }

    upsert('meta[name="description"]', 'name', meta.description)
    upsert('meta[property="og:title"]', 'property', meta.title)
    upsert('meta[property="og:description"]', 'property', meta.description)
    upsert('meta[property="og:url"]', 'property', canonical)
    upsert('meta[name="twitter:title"]', 'name', meta.title)
    upsert('meta[name="twitter:description"]', 'name', meta.description)

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.rel = 'canonical'
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.href = canonical
  }, [location.pathname])

  return null
}
/** Shared app shell: header + routed page + footer. */
export default function Root() {
  return (
    <div className="flex w-full flex-col items-center bg-white">
      <RouteMeta />
      <Header />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
