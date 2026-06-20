import { useEffect, useState, useCallback } from 'react'
import { adminAPI } from '../api/analytics'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import {
  Users, FileText, MessageSquare, ShieldCheck, Trash2,
  ToggleLeft, ToggleRight, Search, X, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, RefreshCw, Crown, UserCheck, UserX,
  MessagesSquare, Eye,
} from 'lucide-react'
import { PageLoader } from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtTime(d) {
  if (!d) return 'Never'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Badge({ children, color = 'gray' }) {
  const colors = {
    green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    red:    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500',
    gray:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color]}`}>{children}</span>
}

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{value ?? 0}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <span className="text-xs text-gray-500">Page {page} of {totalPages} ({total} total)</span>
      <div className="flex gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
          <ChevronLeft size={14} />
        </button>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        className="input-field pl-9 pr-8 py-2 text-sm w-64"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X size={13} />
        </button>
      )}
    </div>
  )
}

// ─── User Detail Modal ───────────────────────────────────────────────────────

function UserModal({ user, onClose, onUpdate }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getUser(user.id)
      .then(r => setDetail(r.data.data))
      .finally(() => setLoading(false))
  }, [user.id])

  const toggle = (field, val) => {
    adminAPI.updateUser(user.id, { [field]: val })
      .then(() => { toast.success('Updated'); onUpdate(user.id, { [field]: val }) })
      .catch(() => toast.error('Update failed'))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">User Details</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><X size={16} /></button>
        </div>

        {loading ? <div className="p-8 text-center text-gray-400">Loading…</div> : detail && (
          <div className="p-5 space-y-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
                {detail.user.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{detail.user.username}</p>
                <p className="text-sm text-gray-500">{detail.user.email || 'No email'}</p>
                <div className="flex gap-1 mt-1">
                  {detail.user.is_superuser && <Badge color="purple">Superuser</Badge>}
                  {detail.user.is_staff && !detail.user.is_superuser && <Badge color="blue">Admin</Badge>}
                  <Badge color={detail.user.is_active ? 'green' : 'red'}>{detail.user.is_active ? 'Active' : 'Disabled'}</Badge>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Documents', value: detail.stats.documents, icon: FileText },
                { label: 'Sessions', value: detail.stats.sessions, icon: MessagesSquare },
                { label: 'Queries', value: detail.stats.queries, icon: MessageSquare },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <Icon size={16} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="text-gray-900 dark:text-gray-100">{fmt(detail.user.date_joined)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last login</span>
                <span className="text-gray-900 dark:text-gray-100">{fmtTime(detail.user.last_login)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    detail.user.is_active
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30'
                  }`}
                  onClick={() => {
                    const newVal = !detail.user.is_active
                    toggle('is_active', newVal)
                    setDetail(d => ({ ...d, user: { ...d.user, is_active: newVal } }))
                  }}
                >
                  {detail.user.is_active ? <><UserX size={14} /> Disable</> : <><UserCheck size={14} /> Enable</>}
                </button>
                <button
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    detail.user.is_staff
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                  }`}
                  onClick={() => {
                    const newVal = !detail.user.is_staff
                    toggle('is_staff', newVal)
                    setDetail(d => ({ ...d, user: { ...d.user, is_staff: newVal } }))
                  }}
                >
                  <Crown size={14} /> {detail.user.is_staff ? 'Remove Admin' : 'Make Admin'}
                </button>
              </div>
            </div>

            {/* Recent docs */}
            {detail.recent_documents?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Documents</p>
                <div className="space-y-1">
                  {detail.recent_documents.map(d => (
                    <div key={d.id} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{d.original_filename}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-400">{d.file_size_display}</span>
                        <Badge color={d.status === 'completed' ? 'green' : d.status === 'failed' ? 'red' : 'yellow'}>
                          {d.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('overview')

  // Users state
  const [users,      setUsers]      = useState([])
  const [userTotal,  setUserTotal]  = useState(0)
  const [userPage,   setUserPage]   = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [userLoading, setUserLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // Documents state
  const [docs,       setDocs]       = useState([])
  const [docTotal,   setDocTotal]   = useState(0)
  const [docPage,    setDocPage]    = useState(1)
  const [docSearch,  setDocSearch]  = useState('')
  const [docStatus,  setDocStatus]  = useState('')
  const [docLoading, setDocLoading] = useState(false)

  // Chats state
  const [chats,       setChats]       = useState([])
  const [chatTotal,   setChatTotal]   = useState(0)
  const [chatPage,    setChatPage]    = useState(1)
  const [chatSearch,  setChatSearch]  = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const PAGE_SIZE = 15

  // Load stats
  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load stats.'))
      .finally(() => setLoading(false))
  }, [])

  // Load users
  const loadUsers = useCallback(() => {
    setUserLoading(true)
    adminAPI.getUsers({ page: userPage, page_size: PAGE_SIZE, search: userSearch })
      .then(r => { setUsers(r.data.data || []); setUserTotal(r.data.total || 0) })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setUserLoading(false))
  }, [userPage, userSearch])

  // Load documents
  const loadDocs = useCallback(() => {
    setDocLoading(true)
    adminAPI.getDocuments({ page: docPage, page_size: PAGE_SIZE, status: docStatus, search: docSearch })
      .then(r => { setDocs(r.data.data || []); setDocTotal(r.data.total || 0) })
      .catch(() => toast.error('Failed to load documents.'))
      .finally(() => setDocLoading(false))
  }, [docPage, docStatus, docSearch])

  // Load chats
  const loadChats = useCallback(() => {
    setChatLoading(true)
    adminAPI.getChats({ page: chatPage, page_size: PAGE_SIZE, search: chatSearch })
      .then(r => { setChats(r.data.data || []); setChatTotal(r.data.total || 0) })
      .catch(() => toast.error('Failed to load chats.'))
      .finally(() => setChatLoading(false))
  }, [chatPage, chatSearch])

  useEffect(() => { if (tab === 'users')     loadUsers() }, [tab, loadUsers])
  useEffect(() => { if (tab === 'documents') loadDocs()  }, [tab, loadDocs])
  useEffect(() => { if (tab === 'chats')     loadChats() }, [tab, loadChats])

  // Reset page on search change
  useEffect(() => setUserPage(1), [userSearch])
  useEffect(() => setDocPage(1),  [docSearch, docStatus])
  useEffect(() => setChatPage(1), [chatSearch])

  const toggleActive = async (userId, current) => {
    try {
      await adminAPI.updateUser(userId, { is_active: !current })
      setUsers(u => u.map(x => x.id === userId ? { ...x, is_active: !current } : x))
      toast.success(current ? 'User disabled.' : 'User enabled.')
    } catch { toast.error('Update failed.') }
  }

  const deleteUser = async (userId, username) => {
    if (!confirm(`Delete user "${username}" and all their data? This cannot be undone.`)) return
    try {
      await adminAPI.deleteUser(userId)
      setUsers(u => u.filter(x => x.id !== userId))
      setUserTotal(t => t - 1)
      toast.success('User deleted.')
    } catch { toast.error('Delete failed.') }
  }

  const deleteDoc = async (docId, name) => {
    if (!confirm(`Delete document "${name}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteDocument(docId)
      setDocs(d => d.filter(x => x.id !== docId))
      setDocTotal(t => t - 1)
      toast.success('Document deleted.')
    } catch { toast.error('Delete failed.') }
  }

  const deleteChat = async (chatId, title) => {
    if (!confirm(`Delete chat "${title}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteChat(chatId)
      setChats(c => c.filter(x => x.id !== chatId))
      setChatTotal(t => t - 1)
      toast.success('Chat deleted.')
    } catch { toast.error('Delete failed.') }
  }

  if (loading) return <PageLoader />

  const tabs = [
    { key: 'overview',   label: 'Overview',                icon: ShieldCheck },
    { key: 'users',      label: `Users (${stats?.users.total ?? 0})`,         icon: Users },
    { key: 'documents',  label: `Documents (${stats?.documents.total ?? 0})`, icon: FileText },
    { key: 'chats',      label: `Chats (${stats?.chat.total_sessions ?? 0})`, icon: MessagesSquare },
  ]

  const docStatusColor = s =>
    s === 'completed' ? 'green' : s === 'failed' ? 'red' : s === 'processing' ? 'blue' : 'yellow'

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">System-wide monitoring &amp; management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex gap-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Users"     value={stats.users.total}           icon={Users}         color="bg-blue-500"    sub={`${stats.users.active} active`} />
            <StatCard label="Total Documents" value={stats.documents.total}       icon={FileText}      color="bg-violet-500"  sub={`${stats.documents.completed} completed`} />
            <StatCard label="Queries (30d)"   value={stats.chat.queries_30d}      icon={MessageSquare} color="bg-emerald-500" sub={`${stats.chat.queries_7d} this week`} />
            <StatCard label="Chat Sessions"   value={stats.chat.total_sessions}   icon={MessagesSquare} color="bg-orange-500" sub={`${stats.chat.total_messages} messages`} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Daily Active Users (7 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.dau_trend} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={v => [v, 'Active Users']} />
                  <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Queries per Day (7 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats.query_trend} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={v => [v, 'Queries']} />
                  <Line type="monotone" dataKey="queries" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* System health */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">System Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Active Users',        value: stats.users.active,         total: stats.users.total,      color: 'bg-blue-500' },
                { label: 'Admin Users',         value: stats.users.admins,         total: stats.users.total,      color: 'bg-purple-500' },
                { label: 'Processed Docs',      value: stats.documents.completed,  total: stats.documents.total,  color: 'bg-green-500' },
                { label: 'Failed Docs',         value: stats.documents.failed,     total: stats.documents.total,  color: 'bg-red-500' },
                { label: 'Pending Docs',        value: stats.documents.pending,    total: stats.documents.total,  color: 'bg-yellow-500' },
                { label: 'New Users (7d)',      value: stats.users.new_7d,         total: stats.users.total,      color: 'bg-orange-500' },
              ].map(({ label, value, total, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{value} / {total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${total ? Math.min((value / total) * 100, 100) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SearchBar value={userSearch} onChange={setUserSearch} placeholder="Search username or email…" />
            <button onClick={loadUsers} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    {['User', 'Email', 'Role', 'Docs', 'Queries', 'Joined', 'Last Login', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {userLoading ? (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-400 text-sm">Loading…</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-8 text-gray-400 text-sm">No users found.</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.username[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[160px] truncate">{u.email || '—'}</td>
                      <td className="px-4 py-3">
                        {u.is_superuser ? <Badge color="purple">Superuser</Badge>
                          : u.is_staff ? <Badge color="blue">Admin</Badge>
                          : <Badge color="gray">User</Badge>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.documents}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.queries}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{fmt(u.date_joined)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{fmtTime(u.last_login)}</td>
                      <td className="px-4 py-3">
                        <Badge color={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Active' : 'Disabled'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" title="View details">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => toggleActive(u.id, u.is_active)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                            title={u.is_active ? 'Disable' : 'Enable'}>
                            {u.is_active ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                          </button>
                          <button onClick={() => deleteUser(u.id, u.username)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={userPage} total={userTotal} pageSize={PAGE_SIZE} onChange={setUserPage} />
          </div>
        </div>
      )}

      {/* ── DOCUMENTS ── */}
      {tab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <SearchBar value={docSearch} onChange={setDocSearch} placeholder="Search by filename…" />
              <select className="input-field py-2 text-sm w-40"
                value={docStatus} onChange={e => setDocStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <button onClick={loadDocs} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    {['Filename', 'Owner', 'Size', 'Pages', 'Chunks', 'Status', 'Uploaded', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {docLoading ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">Loading…</td></tr>
                  ) : docs.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">No documents found.</td></tr>
                  ) : docs.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-gray-100 max-w-[200px] truncate">{d.original_filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{d.username}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{d.file_size_display}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{d.page_count ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{d.chunk_count ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {d.status === 'completed'  && <CheckCircle size={13} className="text-green-500" />}
                          {d.status === 'failed'     && <XCircle size={13} className="text-red-500" />}
                          {d.status === 'processing' && <RefreshCw size={13} className="text-blue-500 animate-spin" />}
                          {d.status === 'pending'    && <Clock size={13} className="text-yellow-500" />}
                          <Badge color={docStatusColor(d.status)}>{d.status}</Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{fmt(d.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteDoc(d.id, d.original_filename)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={docPage} total={docTotal} pageSize={PAGE_SIZE} onChange={setDocPage} />
          </div>
        </div>
      )}

      {/* ── CHATS ── */}
      {tab === 'chats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SearchBar value={chatSearch} onChange={setChatSearch} placeholder="Search by chat title…" />
            <button onClick={loadChats} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    {['Title', 'Owner', 'Messages', 'Documents', 'Created', 'Last Active', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {chatLoading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">Loading…</td></tr>
                  ) : chats.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-sm">No chats found.</td></tr>
                  ) : chats.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MessagesSquare size={14} className="text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-gray-100 max-w-[200px] truncate">{c.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.username}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.message_count ?? 0}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[160px] truncate text-xs">
                        {c.document_names?.join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{fmt(c.created_at)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">{fmtTime(c.updated_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteChat(c.id, c.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={chatPage} total={chatTotal} pageSize={PAGE_SIZE} onChange={setChatPage} />
          </div>
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={(id, patch) => setUsers(u => u.map(x => x.id === id ? { ...x, ...patch } : x))}
        />
      )}
    </div>
  )
}
