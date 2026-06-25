import { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

/**
 * AnimatedInput — floating-label input with focus glow + inline validation.
 * Controlled: pass `value` + `onChange`. `rightSlot` for a trailing button
 * (e.g. password reveal). `error` shows a red message + ring.
 */
const AnimatedInput = forwardRef(function AnimatedInput(
  { label, icon: Icon, type = 'text', value = '', onChange, error, rightSlot, className, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false)
  const floating = focused || (value !== undefined && String(value).length > 0)

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative rounded-xl border bg-white/[0.03] backdrop-blur-sm transition-all duration-200',
          focused ? 'border-primary-500/60 shadow-glow-sm' : 'border-white/10 hover:border-white/20',
          error && 'border-red-500/60',
          className,
        )}
      >
        {Icon && (
          <Icon
            size={16}
            className={cn(
              'pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors',
              focused ? 'text-primary-400' : 'text-zinc-500',
            )}
          />
        )}

        {label && (
          <motion.label
            initial={false}
            animate={{
              top: floating ? '0.45rem' : '50%',
              translateY: floating ? '0%' : '-50%',
              fontSize: floating ? '0.62rem' : '0.875rem',
              color: error ? '#f87171' : focused ? '#a78bfa' : '#71717a',
            }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={cn(
              'pointer-events-none absolute font-semibold uppercase tracking-wider',
              Icon ? 'left-10' : 'left-3.5',
            )}
          >
            {label}
          </motion.label>
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full bg-transparent text-sm font-medium text-zinc-100 outline-none placeholder-zinc-600',
            label ? 'pt-5 pb-2' : 'py-3',
            Icon ? 'pl-10' : 'pl-3.5',
            rightSlot ? 'pr-11' : 'pr-3.5',
          )}
          {...props}
        />

        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 pl-1 text-xs font-medium text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
})

export default AnimatedInput
