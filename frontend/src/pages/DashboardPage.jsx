import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { analyticsAPI } from '../api/analytics'
import { useAuth } from '../contexts/AuthContext'
import { FileText, MessageSquare, Search, Upload, ArrowUpRight, Zap } from 'lucide-react'
import { PageLoader } from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const statusStyle = {
  completed:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  processing: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  pending:    'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  failed:     'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

function StatCard({ label, value, icon: Icon, gradient }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${gradient}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums mt-0.5">{value ?? 0}</p>
      </div>
    </div>
  )
}

function DocRow({ doc }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
          <FileText size={13} className="text-primary-500" />
        </div>
        <span className="text-sm text-zinc-800 dark:text-zinc-200 truncate">{doc.original_filename}</span>
      </div>
      <span className={`badge ml-3 shrink-0 ${statusStyle[doc.status] || ''}`}>
        {doc.status}
      </span>
    </div>
  )
}

function SessionRow({ session }) {
  return (
    <Link to={`/chat/${session.id}`}
      className="flex items-center gap-3 py-2.5 group transition-colors">
      <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center shrink-0">
        <MessageSquare size={13} className="text-violet-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-zinc-800 dark:text-zinc-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {session.title}
        </p>
        <p className="text-xs text-zinc-400">{session.message_count} messages</p>
      </div>
      <ArrowUpRight size={13} className="text-zinc-300 dark:text-zinc-600 shrink-0 group-hover:text-primary-400 transition-colors" />
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* Welcome banner */}
      <div className="card p-6 flex items-center justify-between gap-4 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 100% at 90% 50%, rgba(124,58,237,0.06) 0%, transparent 70%)' }} />
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Welcome back, {user?.first_name || user?.username}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Here's an overview of your AI workspace.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow-sm shrink-0">
          <Zap size={22} className="text-white" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Documents" value={data?.stats?.total_documents} icon={FileText}       gradient="bg-gradient-to-br from-primary-500 to-violet-600" />
        <StatCard label="Chat Sessions"   value={data?.stats?.total_sessions}  icon={MessageSquare}  gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard label="Total Queries"   value={data?.stats?.total_queries}   icon={Search}         gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/documents"
          className="card p-5 flex items-center gap-4 group hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 hover:shadow-card-hover">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
            <Upload size={18} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Upload Document</p>
            <p className="text-xs text-zinc-500 mt-0.5">PDF, DOCX, or TXT</p>
          </div>
        </Link>
        <Link to="/chat"
          className="card p-5 flex items-center gap-4 group hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200 hover:shadow-card-hover">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 transition-colors">
            <MessageSquare size={18} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Start New Chat</p>
            <p className="text-xs text-zinc-500 mt-0.5">Ask anything</p>
          </div>
        </Link>
      </div>

      {/* Recent rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Recent Documents</h3>
            <Link to="/documents" className="text-xs text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 font-medium">View all</Link>
          </div>
          {data?.recent_documents?.length ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.recent_documents.map(d => <DocRow key={d.id} doc={d} />)}
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText size={28} className="text-zinc-200 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No documents yet. Upload one!</p>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Recent Chats</h3>
            <Link to="/chat" className="text-xs text-primary-600 dark:text-primary-400 hover:underline underline-offset-2 font-medium">View all</Link>
          </div>
          {data?.recent_sessions?.length ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.recent_sessions.map(s => <SessionRow key={s.id} session={s} />)}
            </div>
          ) : (
            <div className="py-8 text-center">
              <MessageSquare size={28} className="text-zinc-200 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No chats yet. Start one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
