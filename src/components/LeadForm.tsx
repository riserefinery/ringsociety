import { useState, type FormEvent } from 'react'
import { SolidButton, serif } from './ui'
import { submitLead } from '../lib/leadCapture'

type LeadFormProps = {
  source: string
  submitLabel: string
  successMessage: string
  className?: string
}

const field =
  'w-full border-b bg-transparent pb-2 text-[13px] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-black md:text-[15px]'

/** Reused public form with the exact approved First Name, Last Name, and Email payload. */
export default function LeadForm({ source, submitLabel, successMessage, className = '' }: LeadFormProps) {
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
      <input required name="firstName" autoComplete="given-name" placeholder="First Name*" className={field} style={{ borderColor: '#c1c1c1' }} />
      <input required name="lastName" autoComplete="family-name" placeholder="Last Name*" className={field} style={{ borderColor: '#c1c1c1' }} />
      <input required name="email" type="email" autoComplete="email" placeholder="Email*" className={field} style={{ borderColor: '#c1c1c1' }} />
      <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      {status === 'error' && <p role="alert" className="-mt-2 text-[13px] leading-[1.5] text-[#9b3131]">{error}</p>}
      <SolidButton disabled={status === 'sending'} className="mt-3 w-full">
        {status === 'sending' ? 'Sending…' : submitLabel}
      </SolidButton>
    </form>
  )
}
