import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * ParticleBackground — drifting AI "dust" particles. Non-interactive overlay.
 */
export default function ParticleBackground({ count = 30, className, color = '#a78bfa' }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 9 + 6,
        delay: Math.random() * 6,
        opacity: Math.random() * 0.4 + 0.08,
        drift: Math.random() * 40 - 20,
      })),
    [count],
  )

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
          animate={{ y: [0, -40, 0], x: [0, p.drift, 0], opacity: [p.opacity, p.opacity * 2.5, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
