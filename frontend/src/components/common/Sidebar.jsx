import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, FileText, MessageSquare,
  BarChart2, ShieldCheck, Sparkles,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documents', label: 'Documents',  icon: FileText },
  { to: '/chat',      label: 'Chat',       icon: MessageSquare },
  { to: '/analytics', label: 'Analytics',  icon: BarChart2 },
]

const adminItems = [
  { to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
]

export default function Sidebar() {
  const { user } = useAuth()

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'nav-active text-primary-600 dark:text-primary-400'
        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60'
    }`

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800/80">

      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-glow-sm">
          <Sparkles size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">RAG Chatbot</p>
          <p className="text-[10px] text-zinc-400 mt-0.5 font-medium tracking-wide uppercase">AI Powered</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          Main Menu
        </p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} end={to === '/chat'}>
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}

        {user?.is_staff && (
          <>
            <div className="my-3 border-t border-zinc-100 dark:border-zinc-800" />
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
              Administration
            </p>
            {adminItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User chip */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{user?.username}</p>
            <p className="text-[10px] text-zinc-400 truncate">{user?.is_staff ? 'Administrator' : 'Member'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
