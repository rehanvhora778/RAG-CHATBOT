import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileUp, FileText, Boxes, Database, Cpu, Quote } from 'lucide-react'
import { cn } from '../../lib/utils'

const STEPS = [
  { icon: FileUp,   label: 'Upload PDF' },
  { icon: FileText, label: 'Extract & Chunk' },
  { icon: Boxes,    label: 'Embeddings', pulse: true },
  { icon: Database, label: 'FAISS Retrieve' },
  { icon: Cpu,      label: 'Llama 3.3 · Groq' },
  { icon: Quote,    label: 'Cited Answer' },
]

/**
 * RagPipeline — compact, self-running RAG flow. The "current" index walks down
 * the steps (plus one all-lit tick) and loops, so lines fill, the active node
 * glows, and a data dot travels between nodes.
 */
export default function RagPipeline({ className }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % (STEPS.length + 1)), 800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={cn('lp-card relative overflow-hidden p-4 shadow-[0_24px_80px_-24px_rgba(76,29,149,0.35)]', className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-sm font-semibold lp-h">RAG Pipeline</span>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> live
        </span>
      </div>

      <div>
        {STEPS.map((s, i) => {
          const lit = i <= active
          const isActive = i === active
          return (
            <div key={s.label}>
              <motion.div
                className={cn(
                  'relative z-10 flex items-center gap-3 rounded-xl border px-3 py-1.5 transition-colors duration-300',
                  lit
                    ? 'border-primary-400/50 bg-primary-500/10'
                    : 'border-zinc-200/70 bg-white/50 dark:border-white/10 dark:bg-white/[0.02]',
                )}
                animate={isActive ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300',
                    lit
                      ? 'bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-glow-sm'
                      : 'bg-zinc-100 text-zinc-400 dark:bg-white/10 dark:text-zinc-500',
                  )}
                >
                  <s.icon size={14} />
                </span>
                <span className={cn('text-[13px] font-medium transition-colors', lit ? 'lp-h' : 'lp-sub')}>
                  {s.label}
                </span>
                {s.pulse && isActive && (
                  <span className="ml-auto flex gap-1">
                    {[0, 1, 2].map(d => (
                      <motion.span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-primary-400"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                      />
                    ))}
                  </span>
                )}
              </motion.div>

              {i < STEPS.length - 1 && (
                <div className="relative ml-[25px] h-3 w-px bg-zinc-200 dark:bg-white/10">
                  <motion.div
                    className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-primary-500 to-accent-500"
                    initial={false}
                    animate={{ scaleY: i < active ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  {isActive && (
                    <motion.span
                      className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary-400 shadow-glow"
                      animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeIn' }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
