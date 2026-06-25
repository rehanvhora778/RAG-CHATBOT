import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * GlassCard — frosted glass surface with optional hover lift + glow.
 */
export default function GlassCard({ children, className, hover = false, glow = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn(
        'relative rounded-2xl border border-white/[0.07] bg-ink-800/60 backdrop-blur-2xl shadow-card',
        hover && 'transition-shadow duration-300 hover:border-white/15 hover:shadow-card-hover',
        glow && 'shadow-glow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
