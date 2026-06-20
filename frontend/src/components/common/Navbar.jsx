import { useTheme } from '../../contexts/ThemeContext'
import { useAuth }  from '../../contexts/AuthContext'
import { Sun, Moon, LogOut, Bell } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const pageTitles = {
  '/dashboard':  { title: 'Dashboard',   sub: 'Welcome back' },
  '/documents':  { title: 'Documents',   sub: 'Manage your files' },
  '/chat':       { title: 'Chat',        sub: 'AI-powered conversations' },
  '/analytics':  { title: 'Analytics',   sub: 'Usage insights' },
  '/admin':      { title: 'Admin Panel', sub: 'System management' },
}

export default function Navbar() {
  const { dark, toggle }  = useTheme()
  const { user, logout }  = useAuth()
  const location          = useLocation()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await logout() }
    catch (_) { toast.error('Logout failed.') }
    finally { setLoggingOut(false) }
  }

  const page = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || { title: 'RAG Chatbot', sub: '' }

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-6
                       bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md
                       border-b border-zinc-100 dark:border-zinc-800/80 z-10">

      {/* Page title */}
      <div>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{page.title}</h1>
        {page.sub && <p className="text-xs text-zinc-400 mt-0.5">{page.sub}</p>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">

        {/* Theme toggle */}
        <button onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400
                     hover:text-zinc-700 hover:bg-zinc-100
                     dark:hover:text-zinc-200 dark:hover:bg-zinc-800
                     transition-all duration-150">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notification bell (cosmetic) */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400
                           hover:text-zinc-700 hover:bg-zinc-100
                           dark:hover:text-zinc-200 dark:hover:bg-zinc-800
                           transition-all duration-150 relative">
          <Bell size={17} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-500" />
        </button>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

        {/* User avatar + name */}
        <div className="flex items-center gap-2.5 pl-1 pr-2 py-1.5 rounded-xl
                        hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-150 cursor-default">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-600
                          flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-none">{user?.username}</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{user?.is_staff ? 'Admin' : 'Member'}</p>
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} disabled={loggingOut} title="Sign out"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400
                     hover:text-red-500 hover:bg-red-50
                     dark:hover:text-red-400 dark:hover:bg-red-950/40
                     transition-all duration-150 disabled:opacity-40">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
