import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Sparkles, ArrowRight, Lock, User } from 'lucide-react'
import AuroraBackground from '../components/ui/AuroraBackground'
import ParticleBackground from '../components/ui/ParticleBackground'
import AnimatedInput from '../components/ui/AnimatedInput'
import AnimatedButton from '../components/ui/AnimatedButton'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.username || !form.password) { toast.error('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 p-4">
      <AuroraBackground />
      <ParticleBackground count={26} />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo + heading */}
        <motion.div variants={item} className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
            className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={28} className="text-white" />
            </motion.div>
          </motion.div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to your <span className="text-gradient font-semibold">Nexus RAG</span> workspace</p>
        </motion.div>

        {/* Glass card */}
        <motion.div variants={item} className="glass rounded-2xl p-6 shadow-glow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatedInput
              label="Username"
              icon={User}
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoComplete="username"
            />
            <AnimatedInput
              label="Password"
              icon={Lock}
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              autoComplete="current-password"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <AnimatedButton type="submit" loading={loading} className="mt-2 w-full py-3">
              {!loading && (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
              {loading && 'Signing in'}
            </AnimatedButton>
          </form>

          <div className="mt-5 border-t border-white/[0.06] pt-5 text-center">
            <p className="text-sm text-zinc-400">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-400 underline-offset-2 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.p variants={item} className="mt-6 text-center text-xs text-zinc-600">
          AI RAG Multi-Document Chatbot
        </motion.p>
      </motion.div>
    </div>
  )
}
