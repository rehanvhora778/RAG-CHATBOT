import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, Moon, Sun } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../contexts/ThemeContext'
import Reveal from '../ui/Reveal'

export const BRAND = 'Nexus RAG'

// Overrides so AnimatedButton's dark-tuned `secondary` variant stays readable
// on light surfaces (landing/auth). Spread into className with variant="secondary".
export const SECONDARY_BTN =
  'border-zinc-200 bg-white/80 text-zinc-700 hover:bg-white hover:text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10'

/* ── Brand logo (themeable) ───────────────────────────────────── */
export function Logo({ withText = true, tone = 'auto', className, markClassName }) {
  // `tone="light"` forces white text + a bright gradient for use on the
  // always-dark auth brand panel regardless of the active theme.
  const nexusCls = tone === 'light' ? 'text-white' : 'lp-h'
  const ragCls =
    tone === 'light'
      ? 'bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent'
      : 'text-brand-gradient'
  return (
    <span className={cn('flex select-none items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow-sm',
          markClassName,
        )}
      >
        <Sparkles className="h-[18px] w-[18px] text-white" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </span>
      {withText && (
        <span className={cn('font-display text-[1.05rem] font-bold tracking-tight', nexusCls)}>
          Nexus<span className={ragCls}>RAG</span>
        </span>
      )}
    </span>
  )
}

/* ── Light / dark toggle ──────────────────────────────────────── */
export function ThemeToggle({ className }) {
  const { dark, toggle } = useTheme()
  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border transition-colors',
        'border-zinc-200 bg-white/70 text-zinc-600 hover:text-zinc-900',
        'dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? 'moon' : 'sun'}
          initial={{ y: -18, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 18, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {dark ? <Moon size={17} /> : <Sun size={17} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

/* ── Section shell + container ────────────────────────────────── */
export function Section({ id, className, children }) {
  // Full-viewport, vertically-centered section. `pt-20` reserves space for the
  // fixed navbar so centered content is never hidden under it, which also means
  // nav-clicks (snap-align: start) land perfectly without a scroll-margin gap.
  return (
    <section
      id={id}
      className={cn(
        'relative flex min-h-[100dvh] snap-start snap-always flex-col justify-center px-5 pb-10 pt-20 sm:px-8',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function Container({ className, children }) {
  return <div className={cn('mx-auto w-full max-w-7xl', className)}>{children}</div>
}

/* ── Section heading (eyebrow + title + subtitle) ─────────────── */
export function SectionHeading({ eyebrow, eyebrowIcon: Icon, title, subtitle, className, align = 'center' }) {
  return (
    <div
      className={cn(
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left',
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="lp-eyebrow">
            {Icon && <Icon size={13} />}
            {eyebrow}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight lp-h sm:text-4xl md:text-[2.6rem] md:leading-[1.1]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.1}>
          <p className={cn('mt-4 text-base leading-relaxed lp-sub sm:text-lg', align === 'center' && 'mx-auto')}>
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  )
}

/* ── Scroll spy: returns the id of the section currently in view ── */
export function useScrollSpy(ids, { offset = 120 } = {}) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY + offset
      // pick the section with the greatest top that is still above the scroll
      // line — independent of the order ids are listed in.
      let current = ids[0]
      let maxTop = -Infinity
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= y && el.offsetTop > maxTop) {
          maxTop = el.offsetTop
          current = id
        }
      }
      setActive(current)
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
    }
  }, [ids, offset])

  return active
}
