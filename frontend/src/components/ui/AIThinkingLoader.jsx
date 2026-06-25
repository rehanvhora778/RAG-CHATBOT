import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * AIThinkingLoader — pulsing AI orb + bouncing dots, used while the model
 * is generating a response.
 */
export default function AIThinkingLoader({ label = 'Thinking', className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative h-7 w-7 shrink-0">
        <motion.span
          className="absolute inset-0 rounded-full bg-primary-500/60 blur-md"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={13} className="text-white" />
        </motion.div>
      </div>

      <div className="flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary-400"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {label && <span className="text-xs font-medium text-zinc-400">{label}…</span>}
    </div>
  )
}
