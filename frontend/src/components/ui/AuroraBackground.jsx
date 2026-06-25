import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const blobs = [
  { color: '#8b5cf6', className: '-top-1/4 -left-1/4', anim: { x: [0, 120, -40, 0], y: [0, -80, 60, 0], scale: [1, 1.25, 0.95, 1] }, dur: 20 },
  { color: '#6366f1', className: 'top-1/4 -right-1/4',  anim: { x: [0, -100, 40, 0], y: [0, 60, -80, 0], scale: [1, 1.15, 1.3, 1] }, dur: 24 },
  { color: '#10b981', className: '-bottom-1/3 left-1/3', anim: { x: [0, 60, -90, 0], y: [0, -40, 30, 0], scale: [1, 1.3, 1, 1] }, dur: 28 },
]

/**
 * AuroraBackground — slow-drifting colored light blobs behind a section.
 * Place inside a `relative` container; it fills and stays non-interactive.
 */
export default function AuroraBackground({ className }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={cn('absolute h-[55vmax] w-[55vmax] rounded-full opacity-40 blur-[110px]', b.className)}
          style={{ background: `radial-gradient(circle, ${b.color}, transparent 60%)` }}
          animate={b.anim}
          transition={{ duration: b.dur, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute inset-0 bg-grid opacity-[0.4] mask-fade-b" />
    </div>
  )
}
