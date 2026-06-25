import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, FileText, MessageSquare,
  BarChart2, ShieldCheck, Sparkles, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/chat',      label: 'Chat',      icon: MessageSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
]

const adminItems = [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck }]

function NavItem({ to, label, icon: Icon, active, collapsed }) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'text-white' : 'text-zinc-400 hover:text-zinc-100',
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="absolute inset-0 rounded-xl border border-primary-500/30 bg-gradient-to-r from-primary-500/25 to-accent-500/10 shadow-glow-sm"
        />
      )}
      <motion.span
        whileHover={{ scale: 1.15, rotate: active ? 0 : -6 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative z-10 shrink-0"
      >
        <Icon size={18} className={cn(active ? 'text-primary-300' : 'text-zinc-500 group-hover:text-zinc-200')} />
      </motion.span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

export default function Sidebar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === '1')

  const isActive = to => pathname === to || pathname.startsWith(to + '/')

  const toggle = () => {
    setCollapsed(c => {
      localStorage.setItem('sidebar_collapsed', c ? '0' : '1')
      return !c
    })
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative z-20 flex shrink-0 flex-col border-r border-white/[0.06] bg-ink-900/80 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex h-[60px] items-center gap-3 px-5">
        <motion.div
          whileHover={{ rotate: 12, scale: 1.08 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow-sm"
        >
          <Sparkles size={17} className="text-white" />
        </motion.div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="overflow-hidden"
            >
              <p className="font-display text-sm font-bold leading-none text-white">Nexus RAG</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">AI Workspace</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        {!collapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Main</p>
        )}
        {navItems.map(item => (
          <NavItem key={item.to} {...item} active={isActive(item.to)} collapsed={collapsed} />
        ))}

        {user?.is_staff && (
          <>
            <div className="my-3 h-px bg-white/[0.06]" />
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Admin</p>
            )}
            {adminItems.map(item => (
              <NavItem key={item.to} {...item} active={isActive(item.to)} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {/* User chip */}
      <div className="border-t border-white/[0.06] p-3">
        <div className={cn('flex items-center gap-3 rounded-xl bg-white/[0.03] p-2.5', collapsed && 'justify-center')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600 text-xs font-bold text-white">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-zinc-200">{user?.username}</p>
              <p className="truncate text-[10px] text-zinc-500">{user?.is_staff ? 'Administrator' : 'Member'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        title={collapsed ? 'Expand' : 'Collapse'}
        className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-ink-700 text-zinc-300 shadow-md transition-colors hover:bg-ink-600 hover:text-white"
      >
        {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
      </button>
    </motion.aside>
  )
}
