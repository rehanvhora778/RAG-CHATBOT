import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { analyticsAPI } from '../api/analytics'
import { useAuth } from '../contexts/AuthContext'
import { FileText, MessageSquare, Search, Upload, ArrowUpRight, Zap, Sparkles } from 'lucide-react'
import GradientBorderCard from '../components/ui/GradientBorderCard'
import GlassCard from '../components/ui/GlassCard'
import SpotlightCard from '../components/ui/SpotlightCard'
import ParticleBackground from '../components/ui/ParticleBackground'
import Reveal from '../components/ui/Reveal'
import { SkeletonStatCard } from '../components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="card h-28 shimmer relative overflow-hidden" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map(i => <SkeletonStatCard key={i} />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card h-20 shimmer relative overflow-hidden" />
        <div className="card h-20 shimmer relative overflow-hidden" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="card h-48 shimmer relative overflow-hidden" />
        <div className="card h-48 shimmer relative overflow-hidden" />
      </div>
    </div>
  )
}

const statusStyle = {
  completed:  'bg-success-500/15 text-success-400',
  processing: 'bg-amber-500/15 text-amber-400',
  pending:    'bg-white/5 text-zinc-400',
  failed:     'bg-red-500/15 text-red-400',
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }

function StatCard({ label, value, icon: Icon, gradient }) {
  return (
    <motion.div variants={item}>
      <GradientBorderCard innerClassName="p-5">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${gradient} shadow-glow-sm`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-white">
              <CountUp end={value ?? 0} duration={1.4} separator="," />
            </p>
          </div>
        </div>
      </GradientBorderCard>
    </motion.div>
  )
}

function DocRow({ doc }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
          <FileText size={13} className="text-primary-400" />
        </div>
        <span className="truncate text-sm text-zinc-300">{doc.original_filename}</span>
      </div>
      <span className={`badge ml-3 shrink-0 ${statusStyle[doc.status] || ''}`}>{doc.status}</span>
    </div>
  )
}

function SessionRow({ session }) {
  return (
    <Link to={`/chat/${session.id}`} className="group flex items-center gap-3 py-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-500/10">
        <MessageSquare size={13} className="text-accent-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-zinc-300 transition-colors group-hover:text-primary-300">{session.title}</p>
        <p className="text-xs text-zinc-600">{session.message_count} messages</p>
      </div>
      <ArrowUpRight size={13} className="shrink-0 text-zinc-700 transition-colors group-hover:text-primary-400" />
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-5xl space-y-6">
      {/* Welcome banner */}
      <motion.div variants={item}>
        <GlassCard className="relative flex items-center justify-between gap-4 overflow-hidden p-6">
          <ParticleBackground count={14} className="opacity-70" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 120% at 85% 50%, rgba(139,92,246,0.14), transparent 70%)' }}
          />
          <div className="relative">
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-2.5 py-0.5 text-[11px] font-medium text-primary-300">
              <Sparkles size={11} /> AI Workspace
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              Welcome back, <span className="text-gradient-animated">{user?.first_name || user?.username}</span>
            </h2>
            <p className="mt-1 text-sm text-zinc-400">Here&apos;s an overview of your knowledge base.</p>
          </div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow"
          >
            <Zap size={24} className="text-white" />
          </motion.div>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Documents" value={data?.stats?.total_documents} icon={FileText}      gradient="bg-gradient-to-br from-primary-500 to-accent-600" />
        <StatCard label="Chat Sessions"   value={data?.stats?.total_sessions}  icon={MessageSquare} gradient="bg-gradient-to-br from-accent-500 to-violet-600" />
        <StatCard label="Total Queries"   value={data?.stats?.total_queries}   icon={Search}        gradient="bg-gradient-to-br from-success-500 to-teal-600" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { to: '/documents', icon: Upload, iconWrap: 'bg-primary-500/10', iconColor: 'text-primary-400', title: 'Upload Document', sub: 'PDF, DOCX, or TXT' },
          { to: '/chat', icon: MessageSquare, iconWrap: 'bg-accent-500/10', iconColor: 'text-accent-400', title: 'Start New Chat', sub: 'Ask anything' },
        ].map(({ to, icon: Icon, iconWrap, iconColor, title, sub }) => (
          <motion.div variants={item} key={to}>
            <Link to={to}>
              <SpotlightCard className="flex items-center gap-4 p-5">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconWrap}`}
                >
                  <Icon size={18} className={iconColor} />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>
                </div>
                <ArrowUpRight size={16} className="ml-auto text-zinc-600 transition-colors group-hover:text-primary-400" />
              </SpotlightCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Reveal>
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Documents</h3>
              <Link to="/documents" className="text-xs font-medium text-primary-400 hover:underline">View all</Link>
            </div>
            {data?.recent_documents?.length ? (
              <div className="divide-y divide-white/[0.05]">
                {data.recent_documents.map(d => <DocRow key={d.id} doc={d} />)}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileText size={28} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-sm text-zinc-500">No documents yet. Upload one!</p>
              </div>
            )}
          </GlassCard>
        </Reveal>

        <Reveal delay={0.08}>
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Chats</h3>
              <Link to="/chat" className="text-xs font-medium text-primary-400 hover:underline">View all</Link>
            </div>
            {data?.recent_sessions?.length ? (
              <div className="divide-y divide-white/[0.05]">
                {data.recent_sessions.map(s => <SessionRow key={s.id} session={s} />)}
              </div>
            ) : (
              <div className="py-8 text-center">
                <MessageSquare size={28} className="mx-auto mb-2 text-zinc-700" />
                <p className="text-sm text-zinc-500">No chats yet. Start one!</p>
              </div>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </motion.div>
  )
}
