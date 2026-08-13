import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { logoWordmark } from '../lib/assets'
import { EASE } from '../lib/motion'

const CREAM = '#F9F6F2'

/**
 * Homepage load-in. A cream preloader (brand icon → wordmark) sits over a
 * cream curtain; the preloader fades away and the curtain lifts to reveal
 * the page. Purely presentational + self-timed — it unmounts when done.
 * Timings match the editorial sequence spec exactly.
 */
export default function HomeIntro() {
  const [hidePreloader, setHidePreloader] = useState(false)
  const [curtainUp, setCurtainUp] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setHidePreloader(true), 3200)
    const t2 = setTimeout(() => setCurtainUp(true), 3300)
    const t3 = setTimeout(() => setDone(true), 4400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  if (done) return null

  return (
    <>
      {/* curtain — lifts up to reveal the page */}
      <motion.div
        className="fixed inset-0 z-[9998]"
        style={{ background: CREAM }}
        initial={{ y: '0%' }}
        animate={{ y: curtainUp ? '-100%' : '0%' }}
        transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* preloader — the header wordmark fades in and rises, then fades away */}
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: CREAM, pointerEvents: hidePreloader ? 'none' : 'auto' }}
        initial={{ opacity: 1 }}
        animate={{ opacity: hidePreloader ? 0 : 1 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.img
          src={logoWordmark}
          alt="Ring Society"
          className="h-[26px] w-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        />
      </motion.div>
    </>
  )
}
