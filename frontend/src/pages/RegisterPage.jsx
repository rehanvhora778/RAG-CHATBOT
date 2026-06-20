import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.password2) { toast.error('Passwords do not match.'); return }
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created!')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors && typeof errors === 'object') {
        Object.values(errors).flat().forEach(msg => toast.error(msg))
      } else {
        toast.error(err.response?.data?.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg dark:auth-bg flex items-center justify-center p-4">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-gradient-to-br from-primary-500 to-violet-600 shadow-glow mb-4">
            <Sparkles className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Create account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Join AI RAG Chatbot today</p>
        </div>

        <div className="card p-6 shadow-xl dark:shadow-black/30">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input className="input-field" placeholder="First name" value={form.first_name} onChange={set('first_name')} />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input-field" placeholder="Last name" value={form.last_name} onChange={set('last_name')} />
              </div>
            </div>

            <div>
              <label className="label">Username</label>
              <input className="input-field" placeholder="Choose a username" value={form.username}
                onChange={set('username')} autoComplete="username" />
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={set('email')} />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} className="input-field pr-11"
                  placeholder="Min. 8 characters" value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input-field" placeholder="Repeat password"
                value={form.password2} onChange={set('password2')} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-6">
          AI RAG Multi-Document Chatbot · Final Year Project
        </p>
      </div>
    </div>
  )
}
