import { useEffect, useRef, useState } from 'react'

export const MATCHING_FUNNEL_URL = 'https://app.ringsociety.com/quiz/find-your-ring'
const OPEN_MATCHING_FUNNEL_EVENT = 'ring-society:open-matching-funnel'

export function openMatchingFunnel() {
  window.dispatchEvent(new Event(OPEN_MATCHING_FUNNEL_EVENT))
}

/**
 * Embeds the existing Shopfine quiz in an in-page layer rather than opening a
 * new browser window, so visitors can always return to Ring Society.
 */
export default function MatchingFunnelModal() {
  const [open, setOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const openModal = () => setOpen(true)
    window.addEventListener(OPEN_MATCHING_FUNNEL_EVENT, openModal)
    return () => window.removeEventListener(OPEN_MATCHING_FUNNEL_EVENT, openModal)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70" role="presentation">
      <button
        type="button"
        aria-label="Close ring matching quiz"
        className="absolute inset-0 cursor-default"
        onClick={() => setOpen(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Find your perfect ring"
        className="relative z-[1] h-[90vh] w-[90vw] overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close ring matching quiz"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-[2] grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white text-xl leading-none text-[#1b211d] shadow-sm transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#244737] focus:ring-offset-2"
        >
          <span aria-hidden>×</span>
        </button>
        <iframe
          title="Ring Society perfect ring matching quiz"
          src={MATCHING_FUNNEL_URL}
          className="h-full w-full border-0"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </section>
    </div>
  )
}
