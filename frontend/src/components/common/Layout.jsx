import { useState, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  const location = useLocation()
  const [glow, setGlow] = useState({ x: -1000, y: -1000 })

  const onMove = useCallback(e => setGlow({ x: e.clientX, y: e.clientY }), [])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar />

        <main onMouseMove={onMove} className="relative flex-1 overflow-y-auto p-6">
          {/* mouse-tracking glow */}
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background: `radial-gradient(600px circle at ${glow.x}px ${glow.y}px, rgba(139,92,246,0.07), transparent 60%)`,
            }}
          />

          <div className="relative z-10 h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname.startsWith('/chat') ? '/chat' : location.pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
