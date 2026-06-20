import { useEffect, useState } from 'react'
import { analyticsAPI } from '../api/analytics'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { FileText, MessageSquare, Download, TrendingUp } from 'lucide-react'
import { PageLoader } from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']

function StatCard({ label, value, icon: Icon, gradient, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${gradient}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{value ?? 0}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 shadow-lg text-xs">
      <p className="text-zinc-500 mb-1">{label}</p>
      <p className="font-bold text-zinc-900 dark:text-zinc-100">{payload[0].value} queries</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getUserAnalytics()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />
  if (!data) return null

  const pieData = Object.entries(data.documents.by_type || {}).map(([name, value]) => ({ name: name.toUpperCase(), value }))

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

      <div>
        <h2 className="page-title">Analytics</h2>
        <p className="page-subtitle">Your usage statistics and activity overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Documents" value={data.documents.total}              icon={FileText}      gradient="bg-gradient-to-br from-primary-500 to-violet-600"  sub={`${data.documents.this_week} this week`} />
        <StatCard label="Chat Sessions"   value={data.chat.total_sessions}          icon={MessageSquare} gradient="bg-gradient-to-br from-violet-500 to-purple-600"    sub={`${data.chat.active_sessions} active`} />
        <StatCard label="Queries (30d)"   value={data.activity.queries_last_30d}    icon={TrendingUp}    gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard label="Exports (30d)"   value={data.activity.exports_last_30d}    icon={Download}      gradient="bg-gradient-to-br from-orange-500 to-rose-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-5">Daily Queries — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={data.daily_query_trend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a1a1aa' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
              <Bar dataKey="queries" fill="#7c3aed" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-5">Documents by Type</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">No documents yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" nameKey="name">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [v, name]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Document summary */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Document Processing</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Completed', value: data.documents.completed, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Failed',    value: data.documents.failed,    color: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'This Week', value: data.documents.this_week, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`text-center p-5 rounded-2xl ${bg}`}>
              <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
