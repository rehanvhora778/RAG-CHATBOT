import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  UploadCloud, FileText, Boxes, Search, Layers, Sparkles, Check, Quote, FileSearch,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const STAGES = [
  { key: 'upload',   label: 'Uploading document',     icon: UploadCloud, dur: 2200 },
  { key: 'index',    label: 'Indexing & chunking',    icon: FileText,    dur: 1700 },
  { key: 'embed',    label: 'Generating embeddings',  icon: Boxes,       dur: 2000 },
  { key: 'search',   label: 'Semantic search',        icon: Search,      dur: 1800 },
  { key: 'retrieve', label: 'Retrieving top chunks',  icon: Layers,      dur: 1900 },
  { key: 'generate', label: 'Generating answer',      icon: Sparkles,    dur: 1400 },
  { key: 'answer',   label: 'Answer ready',           icon: Check,       dur: 4600 },
]
const ORDER = STAGES.map(s => s.key)
const ANSWER =
  'The paper introduces the Transformer — a model built entirely on self-attention, removing recurrence and convolutions. This enables far greater parallelization and state-of-the-art translation quality.'

const CHUNKS = [
  { p: 3, score: 0.94, text: '“…dispensing with recurrence and convolutions entirely…”' },
  { p: 5, score: 0.89, text: '“…the Transformer allows for significantly more parallelization…”' },
  { p: 8, score: 0.81, text: '“…achieves 28.4 BLEU on WMT 2014 English-to-German…”' },
]

export default function AnimatedPreview({ size = 'default', className }) {
  const [idx, setIdx] = useState(0)
  const stage = STAGES[idx].key
  const reached = key => ORDER.indexOf(stage) >= ORDER.indexOf(key)
  const lg = size === 'lg'

  // stage machine (loops)
  useEffect(() => {
    const t = setTimeout(() => setIdx(i => (i + 1) % STAGES.length), STAGES[idx].dur)
    return () => clearTimeout(t)
  }, [idx])

  // typewriter for the final answer
  const [typed, setTyped] = useState('')
  useEffect(() => {
    if (stage !== 'answer') { setTyped(''); return }
    let i = 0
    const id = setInterval(() => {
      i += 1
      setTyped(ANSWER.slice(0, i))
      if (i >= ANSWER.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [stage])

  const StageIcon = STAGES[idx].icon
  const showChunks = reached('retrieve')
  const uploadPct = stage === 'upload' ? 100 : reached('index') ? 100 : 0

  return (
    <div
      className={cn(
        'lp-card overflow-hidden p-0 shadow-[0_24px_80px_-20px_rgba(76,29,149,0.35)]',
        className,
      )}
    >
      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-zinc-200/70 px-4 py-3 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        </div>
        <span className="font-display text-xs font-semibold lp-sub">Nexus RAG · Workspace</span>
        <span className="flex items-center gap-1.5 rounded-full border border-primary-500/20 bg-primary-500/10 px-2.5 py-1 text-[11px] font-semibold text-primary-600 dark:text-primary-300">
          <AnimatePresence mode="wait">
            <motion.span
              key={stage}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="flex items-center"
            >
              {stage === 'answer'
                ? <Check size={12} />
                : <StageIcon size={12} className="animate-pulse" />}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={STAGES[idx].label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {STAGES[idx].label}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <div className={cn('space-y-3', lg ? 'p-5' : 'p-4')}>
        {/* source document chip */}
        <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white">
              <FileText size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold lp-h">Attention-Is-All-You-Need.pdf</p>
              <p className="text-[11px] lp-sub">
                {reached('index') ? '12 pages · 48 chunks indexed' : 'Uploading…'}
              </p>
            </div>
            {reached('index') && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"
              >
                <Check size={12} />
              </motion.span>
            )}
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
              initial={false}
              animate={{ width: `${uploadPct}%` }}
              transition={{ duration: stage === 'upload' ? 2 : 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* vector field — activates during embed / search */}
        <VectorField active={stage === 'embed' || stage === 'search'} sweeping={stage === 'search'} />

        {/* conversation */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-primary-500 to-accent-600 px-3.5 py-2 text-[13px] font-medium text-white shadow-glow-sm">
            Summarize the key findings of this paper.
          </div>
        </div>

        {/* retrieved chunks */}
        <AnimatePresence>
          {showChunks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider lp-sub">
                <FileSearch size={12} /> Retrieved context
              </p>
              {CHUNKS.map((c, i) => (
                <motion.div
                  key={c.p}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200/70 bg-white/60 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {(c.score * 100).toFixed(0)}%
                  </span>
                  <span className="truncate text-[11px] italic lp-sub">{c.text}</span>
                  <span className="ml-auto shrink-0 text-[10px] font-medium lp-sub">p.{c.p}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* assistant answer */}
        <div className="flex gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-glow-sm">
            <Sparkles size={14} />
          </div>
          <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-zinc-200/80 bg-white/70 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
            {stage === 'answer' ? (
              <>
                <p className="text-[13px] leading-relaxed lp-h">
                  {typed}
                  {typed.length < ANSWER.length && (
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] -translate-y-px animate-blink bg-primary-500 align-middle" />
                  )}
                </p>
                {typed.length >= ANSWER.length && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary-500/25 bg-primary-500/10 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:text-primary-300"
                  >
                    <Quote size={10} /> Attention-Is-All-You-Need.pdf · p.3
                  </motion.span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 py-0.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-primary-400"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
                <span className="ml-1 text-[11px] lp-sub">{STAGES[idx].label}…</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── animated vector lattice ──────────────────────────────────── */
function VectorField({ active, sweeping }) {
  const dots = useMemo(
    () => Array.from({ length: 11 * 4 }, (_, i) => ({ i, hot: [9, 14, 22, 31].includes(i) })),
    [],
  )
  const ref = useRef(null)
  return (
    <div
      ref={ref}
      className="relative grid grid-cols-11 gap-1.5 overflow-hidden rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]"
    >
      {dots.map(d => (
        <motion.span
          key={d.i}
          className="aspect-square rounded-[3px]"
          initial={false}
          animate={{
            backgroundColor: active
              ? d.hot
                ? 'rgba(16,185,129,0.9)'
                : 'rgba(139,92,246,0.55)'
              : 'rgba(139,92,246,0.12)',
            scale: active && d.hot ? [1, 1.25, 1] : 1,
          }}
          transition={{ duration: 0.5, delay: active ? (d.i % 11) * 0.03 : 0, repeat: active && d.hot ? Infinity : 0, repeatDelay: 0.6 }}
        />
      ))}
      {sweeping && (
        <motion.span
          className="pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-primary-400/40 to-transparent"
          initial={{ left: '-20%' }}
          animate={{ left: '110%' }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  )
}
