import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * GradientBorderCard — card framed by a gradient ring that lights up on hover.
 * Inner surface is opaque so only the 1px frame shows the gradient.
 */
export default function GradientBorderCard({ children, className, innerClassName, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn(
        'group relative rounded-2xl p-[1px] transition-all duration-300',
        'bg-gradient-to-br from-white/12 via-white/[0.04] to-white/12',
        hover && 'hover:from-primary-500/60 hover:via-accent-500/30 hover:to-primary-500/60',
        className,
      )}
      {...props}
    >
      {hover && (
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-40"
             style={{ background: 'linear-gradient(120deg, #8b5cf6, #6366f1)' }} />
      )}
      <div className={cn('relative h-full rounded-2xl bg-ink-800/95 backdrop-blur-xl', innerClassName)}>
        {children}
      </div>
    </motion.div>
  )
}
