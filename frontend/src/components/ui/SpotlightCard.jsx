import { useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * SpotlightCard — Cursor-style card where a soft radial light follows the
 * cursor inside the card. Tracks pointer via CSS vars (--mx/--my) consumed by
 * the `.spotlight-card` rule in index.css.
 */
export default function SpotlightCard({ children, className, hover = true, ...props }) {
  const ref = useRef(null)

  const onMove = e => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn(
        'spotlight-card rounded-2xl border border-white/[0.07] bg-ink-800/60 backdrop-blur-2xl shadow-card transition-colors hover:border-primary-500/30',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
