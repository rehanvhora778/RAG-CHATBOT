import clsx from 'clsx'

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10', xl: 'h-16 w-16' }
  return (
    <div className={clsx(
      'animate-spin rounded-full border-2 border-zinc-200 border-t-primary-600 dark:border-zinc-700 dark:border-t-primary-500',
      sizes[size], className
    )} />
  )
}

export function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-zinc-400 font-medium animate-pulse">Loading…</p>
      </div>
    </div>
  )
}
