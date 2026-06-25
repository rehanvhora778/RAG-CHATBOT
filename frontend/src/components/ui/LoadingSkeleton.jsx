import { cn } from '../../lib/utils'

/**
 * LoadingSkeleton — shimmer placeholder block. Compose with width/height utils.
 */
export default function LoadingSkeleton({ className }) {
  return <div className={cn('relative overflow-hidden rounded-lg bg-white/[0.05] shimmer', className)} />
}

/* ── Ready-made presets ── */

export function SkeletonStatCard() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <LoadingSkeleton className="h-3 w-24" />
          <LoadingSkeleton className="h-7 w-16" />
        </div>
        <LoadingSkeleton className="h-12 w-12 rounded-2xl" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <LoadingSkeleton className="h-8 w-8 rounded-lg" />
      <div className="flex-1 space-y-2">
        <LoadingSkeleton className="h-3 w-1/2" />
        <LoadingSkeleton className="h-2.5 w-1/4" />
      </div>
    </div>
  )
}

export function SkeletonCardGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="card p-5">
      <LoadingSkeleton className="mb-5 h-4 w-40" />
      <LoadingSkeleton className="h-[190px] w-full rounded-xl" />
    </div>
  )
}

export function SkeletonDocCard() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <LoadingSkeleton className="h-11 w-11 rounded-xl" />
        <LoadingSkeleton className="h-5 w-20 rounded-full" />
      </div>
      <LoadingSkeleton className="mt-4 h-4 w-3/4" />
      <LoadingSkeleton className="mt-2 h-3 w-1/2" />
      <LoadingSkeleton className="mt-4 h-7 w-full rounded-lg" />
    </div>
  )
}
