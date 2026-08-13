import { useEffect, useState } from 'react'
import LeadForm from '../components/LeadForm'
import { resourcesBg } from '../lib/assets'
import { PageHeader, serif } from '../components'
import { getCmsPage } from '../sanity/queries'
import { resolvePageHero } from '../sanity/pageHero'

export default function Contact() {
  const [pageSettings, setPageSettings] = useState<CmsPageDocument | null>(null)
  useEffect(() => {
    let active = true
    getCmsPage('contactPage').then((page) => active && setPageSettings(page))
    return () => {
      active = false
    }
  }, [])

  const hero = resolvePageHero(pageSettings?.heroImage, resourcesBg, 'Green marble texture')
  const supportEmail = pageSettings?.supportEmail ?? 'hello@ringsociety.com'
  const responseTime = pageSettings?.responseTime ?? 'Within 1–2 business days'
  return (
    <>
      <PageHeader
        eyebrow={pageSettings?.eyebrow ?? 'Get In Touch'}
        title={pageSettings?.headline ?? "We're Here to Help"}
        subtitle={pageSettings?.introduction ?? 'Questions about engagement rings, jeweler partnerships, press inquiries — send us a note and we will be in touch within one business day.'}
        image={hero.image}
        imagePosition={hero.imagePosition}
        fullBleedDesktop
      />
      <section className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-[0.82fr_1.18fr] md:gap-24 md:px-10 md:py-24">
        <div>
          <h2 className="text-[34px] leading-[1.12] tracking-[-0.6px] text-[#173d2c] md:text-[48px]" style={{ fontFamily: serif }}>How can we help you?</h2>
          <p className="mt-7 max-w-[430px] text-[16px] leading-[1.7] text-[#626262] md:text-[18px]">
            Whether you are beginning your ring journey, interested in a jeweler partnership, or working on a story — we would love to hear from you.
          </p>
          <dl className="mt-12 flex flex-col gap-8 text-[#173d2c]">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[1.8px]">General Inquiries</dt>
              <dd className="mt-2 text-[17px]">{supportEmail}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[1.8px]">Response Time</dt>
              <dd className="mt-2 text-[17px]">{responseTime}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-lg bg-[#f3eeea] px-6 py-10 md:px-12 md:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#173d2c]">Send us a note</p>
          <p className="mt-4 max-w-[480px] text-[16px] leading-[1.7] text-[#626262]">Share your details below and our team will follow up as soon as possible.</p>
          <LeadForm source="Contact Page" submitLabel="Send Message" successMessage="Thank you — we will be in touch soon." className="mt-10 max-w-[540px]" />
          <p className="mt-7 text-[12px] leading-[1.6] text-[#747474]">By submitting this form you agree to our <a className="underline underline-offset-2" href="/privacy-policy">Privacy Policy</a> and <a className="underline underline-offset-2" href="/terms-and-conditions">Terms &amp; Conditions</a>.</p>
        </div>
      </section>
    </>
  )
}
