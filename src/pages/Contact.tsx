import { Eyebrow, serif } from '../components'
import LeadForm from '../components/LeadForm'

export default function Contact() {
  return (
    <section className="w-full px-5 py-14 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-lg bg-[#fbf9f7] md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between bg-[#244737] px-8 py-14 text-[#f9f6f2] md:px-16 md:py-20">
          <div>
            <Eyebrow>Ring Society</Eyebrow>
            <h1 className="mt-6 max-w-[540px] text-[46px] leading-[1.08] tracking-[-0.8px] md:text-[66px]" style={{ fontFamily: serif }}>
              Let’s Start With Your Questions
            </h1>
          </div>
          <p className="mt-12 max-w-[450px] text-[16px] leading-[1.65] text-[#dce3dc] md:text-[18px]">
            Whether you are looking for the right guide or have a question about Ring Society, send us a note and we will be in touch.
          </p>
        </div>
        <div className="px-8 py-14 md:px-16 md:py-20">
          <Eyebrow>Contact Us</Eyebrow>
          <p className="mt-5 max-w-[360px] text-[15px] leading-[1.65] text-[#7b7b7b]">
            Please share your details below. Fields marked with an asterisk are required.
          </p>
          <LeadForm
            source="Contact Page"
            submitLabel="Send Message"
            successMessage="Thank you — we will be in touch soon."
            className="mt-12 max-w-[420px]"
          />
        </div>
      </div>
    </section>
  )
}
