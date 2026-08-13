import { useEffect } from 'react'
import { Eyebrow, serif } from '../components'

export default function LegalPlaceholder({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | Ring Society`
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      document.head.appendChild(robots)
    }
    robots.setAttribute('content', 'noindex, nofollow')
    return () => robots?.remove()
  }, [title])

  return (
    <section className="w-full px-5 py-20 md:px-10 md:py-32">
      <div className="mx-auto max-w-[760px] rounded-lg bg-[#fbf9f7] px-8 py-14 md:px-16 md:py-20">
        <Eyebrow>Ring Society</Eyebrow>
        <h1 className="mt-5 text-[42px] leading-[1.1] text-black md:text-[58px]" style={{ fontFamily: serif }}>{title}</h1>
        <p className="mt-8 max-w-[560px] text-[16px] leading-[1.7] text-[#5f5f5f]">
          This page is being finalized and will be published here once the approved legal copy is available.
        </p>
      </div>
    </section>
  )
}
