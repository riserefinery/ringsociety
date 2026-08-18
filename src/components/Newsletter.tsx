import { useState, type FormEvent } from 'react'
import { IMAGES, iconDiamond } from '../lib/assets'
import { Eyebrow, serif } from './ui'
import LeadForm from './LeadForm'

/** Universal newsletter / CTA block. Shared across every page. */
export default function Newsletter() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-5 md:max-w-none md:px-0">
        <div className="relative overflow-hidden rounded-lg md:rounded-none">
          <img src={IMAGES.roses} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'rgba(16,45,31,0.28)' }} />
          <div className="relative flex justify-center px-6 py-24">
            <div className="relative mt-9 w-full max-w-[528px] rounded-lg px-6 pb-14 pt-16 text-center" style={{ background: 'var(--cream)' }}>
              <img
                src={iconDiamond}
                alt=""
                className="absolute left-1/2 top-0 h-[72px] w-auto -translate-x-1/2 -translate-y-1/2"
              />
              <Eyebrow>Engagement Ring Shopping 101</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-[400px] text-[32px] leading-[1.2] tracking-[-0.5px] text-black md:text-[42px]" style={{ fontFamily: serif }}>
                Get Our 3 Most-Loved Guides for Ring Shopping
              </h2>
              <p className="body-copy mx-auto mt-4 max-w-[400px]" style={{ color: 'var(--muted)' }}>
                Start with our most-loved guides on diamonds, settings, and budgeting — the same
                questions thousands of couples ask before they buy.
              </p>
              <LeadForm
                source="footer"
                submitLabel="Send Me the Guides"
                successMessage="Thank you — your guides are on the way."
                className="mx-auto mt-9 max-w-[404px]"
              />
              <p className="mx-auto mt-6 max-w-[408px] text-center text-[11px] leading-[1.5]" style={{ color: 'var(--muted)' }}>
                By submitting your details, you agree to receive emails, invitations and offers from Ring Society.
                No spam ever. Unsubscribe whenever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
