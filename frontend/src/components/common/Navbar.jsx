import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const pageTitles = {
  '/dashboard': { title: 'Dashboard',   sub: 'Your AI workspace overview' },
  '/documents': { title: 'Documents',   sub: 'Manage your knowledge base' },
  '/chat':      { title: 'Chat',         sub: 'AI-powered conversations' },
  '/analytics': { title: 'Analytics',    sub: 'Usage insights' },
  '/profile':   { title: 'Profile',      sub: 'Manage your account' },
  '/admin':     { title: 'Admin Panel',  sub: 'System management' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await logout() }
    catch { toast.error('Logout failed.') }
    finally { setLoggingOut(false) }
  }

  const page =
    Object.entries(pageTitles).find(
      ([path]) => location.pathname === path || location.pathname.startsWith(path + '/'),
    )?.[1] || { title: 'Nexus RAG', sub: '' }

  return (
    <header className="z-10 flex h-[60px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-ink-950/60 px-6 backdrop-blur-xl">
      <div>
        <h1 className="font-display text-sm font-semibold leading-none text-white">{page.title}</h1>
        {page.sub && <p className="mt-1 text-xs text-zinc-500">{page.sub}</p>}
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          to="/profile"
          title="View profile"
          className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1 pr-2 transition-colors hover:bg-white/[0.06]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-600 text-xs font-bold text-white shadow-glow-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-none text-zinc-200">{user?.username}</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">{user?.is_staff ? 'Admin' : 'Member'}</p>
          </div>
        </Link>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleLogout}
          disabled={loggingOut}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
        >
          <LogOut size={16} />
        </motion.button>
      </div>
    </header>
  )
}
