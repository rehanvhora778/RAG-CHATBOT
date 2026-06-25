import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { analyticsAPI } from '../api/analytics'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { FileText, MessageSquare, Download, TrendingUp } from 'lucide-react'
import GradientBorderCard from '../components/ui/GradientBorderCard'
import GlassCard from '../components/ui/GlassCard'
import LoadingSkeleton, { SkeletonStatCard, SkeletonChart } from '../components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'

const COLORS = ['#8b5cf6', '#6366f1', '#10b981', '#f59e0b', '#ef4444']
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }

function StatCard({ label, value, icon: Icon, gradient, sub }) {
  return (
    <motion.div variants={item}>
      <GradientBorderCard innerClassName="p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${gradient} shadow-glow-sm`}>
            <Icon size={15} className="text-white" />
          </div>
        </div>
        <p className="font-display text-2xl font-bold tabular-nums text-white">
          <CountUp end={value ?? 0} duration={1.4} separator="," />
        </p>
        {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
      </GradientBorderCard>
    </motion.div>
  )
}

const ChartTooltip = ({ active, payload, label, unit = 'queries' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-ink-850/95 px-3 py-2 text-xs shadow-glow-sm backdrop-blur-xl">
      <p className="mb-1 text-zinc-500">{label}</p>
      <p className="font-bold text-white">{payload[0].value} {unit}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getUserAnalytics()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <LoadingSkeleton className="h-7 w-40" />
          <LoadingSkeleton className="h-3 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map(i => <SkeletonStatCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    )
  }
  if (!data) return null

  const pieData = Object.entries(data.documents.by_type || {}).map(([name, value]) => ({ name: name.toUpperCase(), value }))

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="mx-auto max-w-5xl space-y-6">
      <motion.div variants={item}>
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Your usage statistics and activity overview</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Documents"     value={data.documents.total}           icon={FileText}      gradient="bg-gradient-to-br from-primary-500 to-accent-600" sub={`${data.documents.this_week} this week`} />
        <StatCard label="Chat Sessions" value={data.chat.total_sessions}       icon={MessageSquare} gradient="bg-gradient-to-br from-accent-500 to-violet-600"  sub={`${data.chat.active_sessions} active`} />
        <StatCard label="Queries (30d)" value={data.activity.queries_last_30d}  icon={TrendingUp}    gradient="bg-gradient-to-br from-success-500 to-teal-600" />
        <StatCard label="Exports (30d)" value={data.activity.exports_last_30d}  icon={Download}      gradient="bg-gradient-to-br from-orange-500 to-rose-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h3 className="mb-5 text-sm font-semibold text-white">Daily Queries — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data.daily_query_trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139,92,246,0.08)' }} />
                <Bar dataKey="queries" fill="url(#barFill)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        <motion.div variants={item}>
          <GlassCard className="p-5">
            <h3 className="mb-5 text-sm font-semibold text-white">Documents by Type</h3>
            {pieData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-zinc-500">No documents yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" nameKey="name" stroke="none">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip unit="docs" />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Document processing */}
      <motion.div variants={item}>
        <GlassCard className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Document Processing</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Completed', value: data.documents.completed, color: 'text-success-400', bg: 'bg-success-500/10' },
              { label: 'Failed',    value: data.documents.failed,    color: 'text-red-400',     bg: 'bg-red-500/10' },
              { label: 'This Week', value: data.documents.this_week, color: 'text-primary-300', bg: 'bg-primary-500/10' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-2xl ${bg} p-5 text-center`}>
                <p className={`font-display text-3xl font-bold tabular-nums ${color}`}>
                  <CountUp end={value ?? 0} duration={1.2} />
                </p>
                <p className="mt-1 text-xs font-medium text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
