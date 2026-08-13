import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { IMAGES, heroMobileImg } from '../lib/assets'
import { Newsletter, Hero, GuideCard, EditorialRow, HomeIntro, Reveal, Stagger, RevealItem, serif, type Card } from '../components'

/** Whether the homepage load-in should play (once per session, honoring reduced motion). */
function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return !sessionStorage.getItem('rs-intro-played')
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

function DiscoverGuides() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
      <div className="flex flex-col gap-6">
        <Reveal as="h2" className="text-[30px] leading-[1.2] tracking-[-0.5px] text-black md:text-[42px]">
          <span style={{ fontFamily: serif }}>Discover the Guides</span>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {discoverCards.map((c) => (
            <RevealItem key={c.title} className="h-full">
              <GuideCard card={c} />
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

function EditorialSection() {
  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-5 md:gap-24 md:px-10">
      <EditorialRow
        image={IMAGES.jeweler}
        alt="A jeweler holding a diamond engagement ring"
        badge="Featured"
        eyebrow="Guide"
        title={
          <>
            How to Choose A Jeweler:
            <br />
            Our 10-Point Framework
          </>
        }
        body="Before you walk into any jeweler, there are 10 things you should be evaluating — from how long they've been in business and the quality of their customer reviews, to how they handle pricing, post-purchase support, and more."
      />
      <EditorialRow
        reverse
        image={IMAGES.settings}
        alt="An assortment of rings on a dark surface"
        eyebrow="Guide"
        title="The Complete Guide to Engagement Ring Settings & Styles"
        body="A visual guide detailing every major ring setting (Solitaire, Halo, Pavé, Bezel, Channel, Three-Stone). It covers the pros and cons of each, how different settings impact the perceived size of the center stone, and which styles suit more active lifestyles."
      />
      <div>
        <h2 className="sr-only">More engagement ring guides and articles</h2>
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {secondRowCards.map((c) => (
            <RevealItem key={c.title} className="h-full">
              <GuideCard card={c} />
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ---------- black section ---------- */
function BlackSection() {
  return (
    <section className="w-full bg-black py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-5 md:gap-24 md:px-10">
        <EditorialRow
          tone="light"
          image={IMAGES.emerald}
          alt="A gold ring set with an emerald-green stone"
          eyebrow="Guide"
          title={
            <>
              Go Big or Shop Small?
              <br />
              Big-Box vs. Local vs. Online
            </>
          }
          body="Before a single conversation about stones or settings, there's a bigger decision hiding underneath all of it: where you buy the ring. National chains, online-only retailers, and independent local jewelers each operate genuinely differently, and the differences matter more than most buyers expect going in."
        />
        <EditorialRow
          reverse
          tone="light"
          image={IMAGES.labGrown}
          alt="Loose diamonds scattered across a surface"
          eyebrow="Guide"
          title={
            <>
              Natural vs. Lab-Grown Diamonds:
              <br />
              The Honest, Unbiased Comparison
            </>
          }
          body="A transparent guide tackling the biggest question being asked right now. It compares price, chemical makeup, long-term value retention, and ethical considerations."
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

function MoreGuides() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
      <h2 className="sr-only">Diamond guides and expert perspectives</h2>
      <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {thirdRowCards.map((c) => (
          <RevealItem key={c.title} className="h-full">
            <GuideCard card={c} />
          </RevealItem>
        ))}
      </Stagger>
    </section>
  )
}

/* ---------- page ---------- */
export default function Home() {
  const [play] = useState(shouldPlayIntro)
  const [heroReady, setHeroReady] = useState(!play)

  useEffect(() => {
    if (!play) return
    sessionStorage.setItem('rs-intro-played', '1')
    const t = setTimeout(() => setHeroReady(true), 4200)
    return () => clearTimeout(t)
  }, [play])

  return (
    <>
      {play && <HomeIntro />}
      <motion.div
        className="flex w-full flex-col"
        style={{ transformOrigin: 'center top' }}
        initial={play ? { scale: 0.98 } : false}
        animate={play ? { scale: 1 } : undefined}
        transition={play ? { duration: 1.1, delay: 3.35, ease: [0.4, 0, 0.2, 1] } : undefined}
      >
        <Hero
          as="h1"
          image={IMAGES.hero}
          mobileImage={heroMobileImg}
          alt="A woman resting her hand against her face, an engagement ring catching the light"
          label="Guide"
          badge="most loved"
          mobileEyebrow="Our Most-Loved Guide"
          title="How to Buy an Engagement Ring"
          body="Shopping for an engagement ring should be one of life’s biggest moments… but often couples find it intimidating and stressful. We’ll show you everything, from styles to budgeting, to jewelers."
          ctaLabel="view the guide"
          ctaTo="/guides/the-definitive-engagement-ring-buying-guide-2026"
          ready={heroReady}
        />
        <div className="flex w-full flex-col items-center gap-16 pb-16 pt-16 md:gap-24 md:pb-24 md:pt-24">
          <DiscoverGuides />
          <EditorialSection />
          <BlackSection />
          <MoreGuides />
          <Newsletter />
        </div>
      </motion.div>
    </>
  )
}
