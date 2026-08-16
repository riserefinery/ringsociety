import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { IMAGES, heroMobileImg } from '../lib/assets'
import { articlePathForTitle } from '../lib/content'
import { Newsletter, Hero, GuideCard, EditorialRow, Reveal, Stagger, RevealItem, serif, type Card } from '../components'
import { getCmsArticleCards } from '../sanity/queries'

function startsWithReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ---------- discover guides ---------- */
const discoverCards: Card[] = [
  {
    category: 'Trends',
    title: 'The Most Popular & Trending Ring Styles and Diamonds in 2026',
    cta: 'trending diamond rings',
    image: IMAGES.trending,
    alt: 'A brilliant-cut diamond ring resting on textured fabric',
  },
  {
    category: 'Perspectives',
    title: 'Engagement Rings with Hidden Halos: The Subtle Sparkle Trend',
    cta: 'hidden halo engagement rings',
    image: IMAGES.halo,
    alt: 'A diamond solitaire ring on deep blue velvet',
  },
  {
    category: 'Guides',
    title: 'Engagement Ring Budgets: How Much Should You Spend?',
    cta: 'view the guide',
    image: IMAGES.budgets,
    alt: 'An engagement ring displayed in a presentation box',
  },
]

function cmsCardFor(card: Card, cmsCards: Card[]) {
  const path = articlePathForTitle(card.title)
  const cmsCard = cmsCards.find((candidate) => candidate.to === path)
  return { ...card, ...cmsCard, to: path }
}

function DiscoverGuides({ cmsCards }: { cmsCards: Card[] }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
      <div className="flex flex-col gap-6">
        <Reveal as="h2" className="text-[30px] leading-[1.2] tracking-[-0.5px] text-black md:text-[42px]">
          <span style={{ fontFamily: serif }}>Discover the Guides</span>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {discoverCards.map((c) => (
            <RevealItem key={c.title} className="h-full">
              <GuideCard card={cmsCardFor(c, cmsCards)} />
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ---------- editorial section ---------- */
const secondRowCards: Card[] = [
  {
    category: 'Article',
    title: 'How to Find Her Ring Size Without Ruining the Surprise',
    cta: 'ring sizing guide',
    image: IMAGES.ringSize,
    alt: 'A couple holding hands',
  },
  {
    category: 'Article',
    title: 'Which Diamond Shape Looks the Biggest?',
    cta: 'compare diamond shapes',
    image: IMAGES.shape,
    alt: 'A diamond ring photographed on fabric',
  },
  {
    category: 'Guides',
    title: 'The 4Cs of Diamonds (Explained in Plain English)',
    cta: 'view the guide',
    image: IMAGES.fourCs,
    alt: 'A woman with her hand resting near her face',
  },
]

function EditorialSection({ cmsCards }: { cmsCards: Card[] }) {
  const jeweler = cmsCardFor({ category: 'Guide', title: 'How to Choose A Jeweler: Our 10-Point Framework', cta: 'view the guide', image: IMAGES.jeweler, alt: 'A jeweler holding a diamond engagement ring' }, cmsCards)
  const settings = cmsCardFor({ category: 'Guide', title: 'The Complete Guide to Engagement Ring Settings & Styles', cta: 'view the guide', image: IMAGES.settings, alt: 'An assortment of rings on a dark surface' }, cmsCards)

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-5 md:gap-24 md:px-10">
      <EditorialRow
        image={jeweler.image}
        alt={jeweler.alt}
        badge={jeweler.badge ?? 'Featured'}
        eyebrow="Guide"
        title={
          <>
            How to Choose A Jeweler:
            <br />
            Our 10-Point Framework
          </>
        }
        body="Before you walk into any jeweler, there are 10 things you should be evaluating — from how long they've been in business and the quality of their customer reviews, to how they handle pricing, post-purchase support, and more."
        to="/guides/how-to-choose-a-jeweler"
        mobileCtaFullWidth
      />
      <EditorialRow
        reverse
        image={settings.image}
        alt={settings.alt}
        badge={settings.badge}
        eyebrow="Guide"
        title="The Complete Guide to Engagement Ring Settings & Styles"
        body="A visual guide detailing every major ring setting (Solitaire, Halo, Pavé, Bezel, Channel, Three-Stone). It covers the pros and cons of each, how different settings impact the perceived size of the center stone, and which styles suit more active lifestyles."
        to="/guides/engagement-ring-settings-and-styles"
        mobileCtaFullWidth
      />
      <div>
        <h2 className="sr-only">More engagement ring guides and articles</h2>
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {secondRowCards.map((c) => (
            <RevealItem key={c.title} className="h-full">
              <GuideCard card={cmsCardFor(c, cmsCards)} />
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ---------- black section ---------- */
function BlackSection({ cmsCards }: { cmsCards: Card[] }) {
  const bigBox = cmsCardFor({ category: 'Guide', title: 'Go Big or Shop Small? Big-Box vs. Local vs. Online', cta: 'view the guide', image: IMAGES.emerald, alt: 'A gold ring set with an emerald-green stone' }, cmsCards)
  const labGrown = cmsCardFor({ category: 'Guide', title: 'Natural vs. Lab-Grown Diamonds: The Honest, Unbiased Comparison', cta: 'view the guide', image: IMAGES.labGrown, alt: 'Loose diamonds scattered across a surface' }, cmsCards)

  return (
    <section className="w-full bg-black py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-5 md:gap-24 md:px-10">
        <EditorialRow
          tone="light"
          image={bigBox.image}
          alt={bigBox.alt}
          badge={bigBox.badge}
          eyebrow="Guide"
          title={
            <>
              Go Big or Shop Small?
              <br />
              Big-Box vs. Local vs. Online
            </>
        }
        body="Before a single conversation about stones or settings, there's a bigger decision hiding underneath all of it: where you buy the ring. National chains, online-only retailers, and independent local jewelers each operate genuinely differently, and the differences matter more than most buyers expect going in."
        to="/guides/go-big-or-shop-small"
        mobileCtaFullWidth
      />
        <EditorialRow
          reverse
          tone="light"
          image={labGrown.image}
          alt={labGrown.alt}
          badge={labGrown.badge}
          eyebrow="Guide"
          title={
            <>
              Natural vs. Lab-Grown Diamonds:
              <br />
              The Honest, Unbiased Comparison
            </>
        }
        body="A transparent guide tackling the biggest question being asked right now. It compares price, chemical makeup, long-term value retention, and ethical considerations."
        to="/guides/natural-vs-lab-grown-diamonds"
        mobileCtaFullWidth
      />
      </div>
    </section>
  )
}

/* ---------- more guides ---------- */
const thirdRowCards: Card[] = [
  {
    category: 'Guides',
    title: 'What Drives Diamond Pricing? Hear from Experts',
    cta: 'diamond pricing guide',
    image: IMAGES.pricing,
    alt: 'A jeweler working at a bench',
  },
  {
    category: 'Guides',
    title: 'The Ultimate Guide to Diamond Clarity, and What it Means for Your Ring Choice & Budget',
    cta: 'view the guide',
    image: IMAGES.clarity,
    alt: 'A gold ring with a green gemstone on a table',
  },
  {
    category: 'Article',
    title: 'The Ideal Diamond Cut: How to Choose the Right Diamond for Your Ring Setting and Budget',
    cta: 'how to choose a diamond',
    image: IMAGES.idealCut,
    alt: 'A silver ring worn on a finger',
    dark: true,
  },
]

function MoreGuides({ cmsCards }: { cmsCards: Card[] }) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
      <h2 className="sr-only">Diamond guides and expert perspectives</h2>
      <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {thirdRowCards.map((c) => (
            <RevealItem key={c.title} className="h-full">
              <GuideCard card={cmsCardFor(c, cmsCards)} />
          </RevealItem>
        ))}
      </Stagger>
    </section>
  )
}

/* ---------- page ---------- */
export default function Home() {
  const [heroReady, setHeroReady] = useState(startsWithReducedMotion)
  const [cmsCards, setCmsCards] = useState<Card[]>([])

  useEffect(() => {
    if (heroReady) return
    const frame = requestAnimationFrame(() => setHeroReady(true))
    return () => cancelAnimationFrame(frame)
  }, [heroReady])

  useEffect(() => {
    let active = true
    getCmsArticleCards().then((cards) => {
      if (active) setCmsCards(cards)
    })
    return () => {
      active = false
    }
  }, [])

  const heroLabel = cmsCards.find((card) => card.to === '/guides/the-definitive-engagement-ring-buying-guide-2026')?.badge ?? 'most loved'

  return (
    <>
      <div className="flex w-full flex-col">
        <Hero
          as="h1"
          image={IMAGES.hero}
          mobileImage={heroMobileImg}
          alt="A woman resting her hand against her face, an engagement ring catching the light"
          label="Guide"
          badge={heroLabel}
          mobileEyebrow="Our Most-Loved Guide"
          title="How to Buy an Engagement Ring"
          body="Shopping for an engagement ring should be one of life’s biggest moments… but often couples find it intimidating and stressful. We’ll show you everything, from styles to budgeting, to jewelers."
          ctaLabel="view the guide"
          ctaTo="/guides/the-definitive-engagement-ring-buying-guide-2026"
          mobileCtaFullWidth
          ready={heroReady}
          fullBleedDesktop
          alignContentToPageGrid
        />
        <motion.div
          className="flex w-full flex-col items-center gap-16 pb-16 pt-16 md:gap-24 md:pb-0 md:pt-24"
          initial={startsWithReducedMotion() ? false : { opacity: 0, y: 10 }}
          animate={startsWithReducedMotion() ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.48, delay: 0.14, ease: [0.23, 1, 0.32, 1] }}
        >
          <DiscoverGuides cmsCards={cmsCards} />
          <EditorialSection cmsCards={cmsCards} />
          <BlackSection cmsCards={cmsCards} />
          <MoreGuides cmsCards={cmsCards} />
          <Newsletter />
        </motion.div>
      </div>
    </>
  )
}
