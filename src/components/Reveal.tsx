import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeUp, staggerContainer, viewportOnce } from '../lib/motion'

type Tag = 'div' | 'section' | 'ul' | 'li' | 'span' | 'h2' | 'h3' | 'p'

/**
 * Scroll-reveal wrapper. Fades + rises into view once, when its top
 * crosses the viewport margin. Use `<Reveal>` for a single element and
 * `<Stagger>` + `<RevealItem>` for a group that cascades.
 */
export function Reveal({
  children,
  as = 'div',
  className,
  delay = 0,
}: {
  children: ReactNode
  as?: Tag
  className?: string
  delay?: number
}) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={delay ? { duration: 0.72, ease: [0.25, 0.1, 0.25, 1], delay } : undefined}
    >
      {children}
    </Comp>
  )
}

/** Staggering container — reveals `RevealItem` children at 0.12s intervals. */
export function Stagger({
  children,
  as = 'div',
  className,
}: {
  children: ReactNode
  as?: Tag
  className?: string
}) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </Comp>
  )
}

/** A single fade-up child inside a `Stagger`. */
export function RevealItem({
  children,
  as = 'div',
  className,
}: {
  children: ReactNode
  as?: Tag
  className?: string
}) {
  const Comp = motion[as]
  return (
    <Comp className={className} variants={fadeUp}>
      {children}
    </Comp>
  )
}
