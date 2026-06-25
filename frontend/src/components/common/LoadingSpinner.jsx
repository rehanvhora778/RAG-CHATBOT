import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10', xl: 'h-16 w-16' }
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-white/10 border-t-primary-500',
        sizes[size],
        className,
      )}
    />
  )
}

export function PageLoader({ label = 'Loading workspace' }) {
  return (
    <div className="flex h-full items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <motion.span
            className="absolute inset-0 rounded-2xl bg-primary-500/40 blur-xl"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow"
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles size={24} className="text-white" />
          </motion.div>
        </div>
        <p className="animate-pulse text-xs font-medium text-zinc-500">{label}…</p>
      </div>
    </div>
  )
}
