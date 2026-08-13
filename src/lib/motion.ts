/* ---------------------------------------------------------------
   Shared motion language.
   A single editorial vocabulary — restrained fade-ups, no bounce,
   no overshoot — reused by every reveal across the site.
----------------------------------------------------------------*/
import type { Variants } from 'motion/react'

/** Signature easing — a smooth, symmetric editorial curve. */
export const EASE = [0.25, 0.1, 0.25, 1] as const

/** Default reveal: fade + rise. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.72, ease: EASE } },
}

/** Container that reveals its children in sequence. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

/** Standard whileInView viewport config used across the site. */
export const viewportOnce = { once: true, margin: '-60px' } as const
