import { useState, type FormEvent } from 'react'
import { SolidButton, serif } from './ui'
import { submitLead } from '../lib/leadCapture'

type LeadFormProps = {
  source: string
  submitLabel: string
  successMessage: string
  className?: string
  variant?: 'compact' | 'contact'
}

const field =
  'w-full border-b border-[#c1c1c1] bg-transparent pb-2 text-[17px] leading-[1.5] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-black'
const contactField = field
const contactLabel = 'sr-only'
const contactTopics = [
  'General question about engagement rings',
  'Jeweler partnership inquiry',
  'Press or media inquiry',
  'Feedback or suggestion',
  'Other',
]

/** Reused lead form. Contact pages may opt into topic/message capture; footer CTAs retain the concise three-field form. */
export default function LeadForm({ source, submitLabel, successMessage, className = '', variant = 'compact' }: LeadFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setStatus('sending')
    setError('')

    try {
      await submitLead({
        firstName: String(form.get('firstName') ?? ''),
        lastName: String(form.get('lastName') ?? ''),
        email: String(form.get('email') ?? ''),
        website: String(form.get('website') ?? ''),
        source,
        topic: String(form.get('topic') ?? ''),
        message: String(form.get('message') ?? ''),
      })
      setStatus('success')
    } catch (submissionError) {
      setStatus('error')
      setError(submissionError instanceof Error ? submissionError.message : 'We could not deliver your message. Please try again.')
    }
  }

  if (status === 'success') {
    return <p className="mt-10 text-[18px] text-black" style={{ fontFamily: serif }}>{successMessage}</p>
  }

  return (
    <form onSubmit={submit} className={`flex flex-col gap-6 text-left ${className}`} noValidate>
      {variant === 'contact' ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <label className={contactLabel}>
              First Name
              <input required name="firstName" autoComplete="given-name" placeholder="First Name*" className={contactField} />
            </label>
            <label className={contactLabel}>
              Last Name
              <input required name="lastName" autoComplete="family-name" placeholder="Last Name*" className={contactField} />
            </label>
          </div>
          <label className={contactLabel}>
            Email Address
            <input required name="email" type="email" autoComplete="email" placeholder="Email*" className={contactField} />
          </label>
          <label className={contactLabel}>
            What brings you here?
            <select required name="topic" defaultValue="" className={`${contactField} appearance-none`}>
              <option value="" disabled>What brings you here?*</option>
              {contactTopics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
            </select>
          </label>
          <label className={contactLabel}>
            Message <span className="normal-case tracking-normal text-[#818181]">(optional)</span>
            <textarea name="message" rows={6} placeholder="Message (optional)" className={`${contactField} min-h-32 resize-y`} />
          </label>
        </>
      ) : (
        <>
          <input required name="firstName" autoComplete="given-name" placeholder="First Name*" className={field} />
          <input required name="lastName" autoComplete="family-name" placeholder="Last Name*" className={field} />
          <input required name="email" type="email" autoComplete="email" placeholder="Email*" className={field} />
        </>
      )}
      <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      {status === 'error' && <p role="alert" className="-mt-2 text-[13px] leading-[1.5] text-[#9b3131]">{error}</p>}
      <SolidButton disabled={status === 'sending'} className="mt-3 w-full">
        {status === 'sending' ? 'Sending…' : submitLabel}
      </SolidButton>
    </form>
  )
}
