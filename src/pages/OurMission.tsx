import { useEffect, useState } from 'react'
import {
  missionHero,
  missionHeroMobile,
  visionImg,
  visionImgMobile,
  iconResearch,
  iconResources,
  iconMatch,
} from '../lib/assets'
import { Hero, Newsletter, Reveal, Stagger, RevealItem, serif } from '../components'
import { getCmsPage } from '../sanity/queries'
import { resolvePageHero } from '../sanity/pageHero'

/* ---------- shared statement block (Our Mission / Our Vision) ---------- */
function Statement({
  eyebrow,
  statement,
  body,
}: {
  eyebrow: string
  statement: string
  body?: string
}) {
  return (
    <Reveal as="section" className="mx-auto w-full max-w-[1440px] px-6 py-12 md:px-[130px] md:py-[103px]">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-16">
        <p
          className="shrink-0 text-[28px] leading-[1.2] tracking-[-0.3px] text-[#0e0e0e] md:text-[42px] md:tracking-[-0.5px]"
          style={{ fontFamily: serif }}
        >
          {eyebrow}
        </p>
        <div className="flex flex-col gap-6 md:w-[828px]">
          <p
            className="text-[28px] leading-[1.18] tracking-[-0.3px] text-[#0e0e0e] md:text-[40px] md:leading-[1.1] md:tracking-[-1.5px]"
            style={{ fontFamily: serif }}
          >
            {statement}
          </p>
          {body && (
            <p className="text-[15px] font-light leading-[1.5] tracking-[0.3px] text-[#0f2d1e] md:text-[20px] md:tracking-normal">
              {body}
            </p>
          )}
        </div>
      </div>
    </Reveal>
  )
}

/* ---------- vision — full-bleed image with overlaid copy ---------- */
const visionStatement =
  "We are the definitive starting point for every couple's engagement journey, and are here to facilitate a transparent, supportive, and celebratory experience."

function Vision() {
  return (
    <section className="w-full">
      {/* mobile: taller image above copy on white */}
      <div className="md:hidden">
        <div className="h-[565px] w-full overflow-hidden">
          <img src={visionImgMobile} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-6 bg-white px-6 py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#0e0e0e]">Our Vision</p>
          <p className="text-[28px] leading-[1.18] tracking-[-0.3px] text-[#0e0e0e]" style={{ fontFamily: serif }}>
            {visionStatement}
          </p>
        </div>
      </div>

      {/* desktop: full-bleed image, label top-left, statement bottom-right column */}
      <div className="relative hidden w-full overflow-hidden md:block md:min-h-[700px]">
        <img src={visionImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
        <div className="relative mx-auto flex min-h-[700px] w-full max-w-[1440px] justify-between px-[130px] py-[94px] text-[#fbf9f7]">
          <p className="text-[42px] leading-[1.2] tracking-[-0.5px]" style={{ fontFamily: serif }}>
            Our Vision
          </p>
          <div className="flex w-[828px] flex-col justify-end">
            <p className="w-[795px] text-[40px] leading-[1.2] tracking-[-0.5px]" style={{ fontFamily: serif }}>
              {visionStatement}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------- what we do — feature cards on black ---------- */
type Feature = { icon: string; title: string; body: string }

const features: Feature[] = [
  {
    icon: iconResearch,
    title: 'Research',
    body: 'Our research is based on industry news and standards, as well as genuine trust signals & data gathered from multiple sources.',
  },
  {
    icon: iconResources,
    title: 'Resources',
    body: 'Our articles are designed to be the absolute best available answers to the most frequently asked questions from ring buyers & couples.',
  },
  {
    icon: iconMatch,
    title: 'Match',
    body: "When you're ready to take the next step, we'll help you find a trusted local jeweler that has passed our rigorous vetting process.",
  },
]

function WhatWeDo() {
  return (
    <section className="w-full bg-black">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-12 md:gap-[100px] md:px-[50px] md:py-[90px]">
        <h2
          className="text-[28px] leading-[1.18] tracking-[-0.3px] text-[#f3eeea] md:text-center md:text-[42px] md:tracking-[-0.5px]"
          style={{ fontFamily: serif }}
        >
          What We Do
        </h2>
        <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((f) => (
            <RevealItem
              key={f.title}
              className="flex flex-col items-start gap-4 rounded-lg border border-[#e5e5e5] bg-[#f3eeea] p-6 md:gap-[120px] md:border-0"
            >
              <img src={f.icon} alt="" className="h-[96px] w-auto self-start" />
              <div className="flex flex-col gap-2 md:gap-3">
                <p className="text-[18px] font-medium leading-[1.35] text-[#0e0e0e] md:text-[24px] md:tracking-[-0.96px]">
                  {f.title}
                </p>
                <p className="text-[14px] leading-[1.6] tracking-[0.1px] text-[#6e6e6e] md:text-[16px] md:tracking-normal">
                  {f.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

/* ---------- page ---------- */
export default function OurMission() {
  const [pageSettings, setPageSettings] = useState<CmsPageDocument | null>(null)
  useEffect(() => {
    let active = true
    getCmsPage('missionPage').then((page) => active && setPageSettings(page))
    return () => {
      active = false
    }
  }, [])

  const hero = resolvePageHero(pageSettings?.heroImage, missionHero, 'A couple embracing, the light catching an engagement ring')
  return (
    <>
      <Hero
        as="h1"
        image={hero.image}
        mobileImage={hero.mobileImage === missionHero ? missionHeroMobile : hero.mobileImage}
        alt={hero.alt}
        label={pageSettings?.eyebrow ?? 'The #1 resource for finding your engagement ring'}
        title={pageSettings?.headline ?? "We're here to make one of life's biggest decisions feel less like gambling."}
        body={pageSettings?.introduction ?? 'We are a free, independent resource for couples researching engagement rings.'}
        ctaLabel="explore top guides"
          mobilePanelColor="#000000"
        imagePosition={hero.imagePosition}
        mobileImagePosition={hero.imagePosition}
          fullBleedDesktop
          alignContentToPageGrid
      />
      <Statement
        eyebrow="Our Mission"
        statement="To be the most trusted, unbiased, and comprehensive resource for couples navigating the journey of choosing an engagement ring."
        body="We empower you with the knowledge to make a confident and joyful decision, regardless of your budget, by providing expert guidance, and — when the time is right — connecting you with a vetted and trusted local jeweler."
      />
      <Vision />
      <WhatWeDo />
      <div className="w-full pt-16 md:pt-24">
        <Newsletter />
      </div>
    </>
  )
}
