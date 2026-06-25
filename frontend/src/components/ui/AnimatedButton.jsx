import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium overflow-hidden select-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 focus:ring-offset-ink-950 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:   'bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-glow-sm hover:shadow-glow',
        secondary: 'bg-white/5 text-zinc-200 border border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm',
        ghost:     'text-zinc-400 hover:bg-white/5 hover:text-zinc-100',
        danger:    'bg-red-500/90 text-white hover:bg-red-500',
        success:   'bg-gradient-to-br from-success-500 to-success-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.3)]',
      },
      size: {
        sm:   'px-3 py-2 text-xs',
        md:   'px-4 py-2.5 text-sm',
        lg:   'px-6 py-3 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

/**
 * AnimatedButton — variant-driven button with hover scale, tap spring and a
 * sweeping "shine" highlight on hover. Drop-in for <button>.
 */
const AnimatedButton = forwardRef(function AnimatedButton(
  { className, variant = 'primary', size, children, loading = false, shine = true, disabled, ...props },
  ref,
) {
  const isInert = disabled || loading
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: isInert ? 1 : 1.025 }}
      whileTap={{ scale: isInert ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(buttonVariants({ variant, size }), 'group', className)}
      disabled={isInert}
      {...props}
    >
      {shine && variant !== 'ghost' && (
        <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-none group-hover:animate-shine" />
      )}
      {loading && <span className="h-4 w-4 shrink-0 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
      {children}
    </motion.button>
  )
})

export default AnimatedButton
export { buttonVariants }
