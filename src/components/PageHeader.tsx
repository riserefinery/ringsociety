import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp, staggerContainer } from '../lib/motion'
import { serif } from './ui'

/**
 * Universal page header — a centered title + subtitle over a background image.
 * Reused for section landing pages (Top Guides, All Resources, etc.).
 * An optional `filters` slot renders below the subtitle (e.g. category chips).
 */
export default function PageHeader({
  title,
  subtitle,
  image,
  filters,
  fullBleedDesktop = false,
  imagePosition = 'center center',
  eyebrow,
  matchResourcesHeight = false,
}: {
  title: string
  subtitle?: string
  image: string
  filters?: ReactNode
  /** Extends the desktop header surface to the viewport edges while preserving its centered internal content. */
  fullBleedDesktop?: boolean
  /** Controls the object-position used by the desktop background image. */
  imagePosition?: string
  eyebrow?: string
  /** Keeps another page header level with the All Resources header. */
  matchResourcesHeight?: boolean
}) {
  const [loadedImage, setLoadedImage] = useState<string | null>(null)
  const imageReady = loadedImage === image

  const revealState = imageReady ? 'show' : 'hidden'

  return (
    <section className={fullBleedDesktop ? 'w-full' : 'w-full md:mx-auto md:max-w-[1440px] md:px-10'}>
      <div
        className={`relative flex min-h-[calc(100svh-91px)] items-center justify-center overflow-hidden px-6 py-20 md:py-[120px] ${matchResourcesHeight ? 'md:min-h-[480px]' : 'md:min-h-[320px]'} ${fullBleedDesktop ? 'md:rounded-none' : 'md:rounded-lg'}`}
        style={{ background: '#1a1a1a' }}
      >
        <img key={image} src={image} alt="" onLoad={() => setLoadedImage(image)} onError={() => setLoadedImage(image)} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: imagePosition }} />
        <motion.div
          key={image}
          aria-hidden="true"
          className="absolute inset-0 hidden bg-[#1a1a1a] md:block"
          initial={{ x: 0 }}
          animate={imageReady ? { x: '100%' } : { x: 0 }}
          transition={{ duration: 0.62, ease: [0.23, 1, 0.32, 1] }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.35)' }} />
        <motion.div
          className="relative flex max-w-[560px] flex-col items-center gap-6 text-center text-[#f9f6f2]"
          variants={staggerContainer}
          initial="hidden"
          animate={revealState}
        >
          {eyebrow && <motion.p variants={fadeUp} className="text-[11px] font-semibold uppercase tracking-[2px] text-[#f9f6f2]/70">{eyebrow}</motion.p>}
          <motion.h1 variants={fadeUp} className="text-[44px] leading-[1.1] tracking-[-1.5px] md:text-[clamp(40px,6vw,58px)]" style={{ fontFamily: serif }}>
            {title}
          </motion.h1>
          {subtitle && <motion.p variants={fadeUp} className="body-copy max-w-[444px]">{subtitle}</motion.p>}
          {filters && <motion.div variants={fadeUp} className="mt-3 md:mt-4">{filters}</motion.div>}
        </motion.div>
      </div>
    </section>
  )
}
