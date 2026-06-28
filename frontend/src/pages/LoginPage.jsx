import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AnimatedButton from '../components/ui/AnimatedButton'
import { AuthShell, Field } from '../components/landing/AuthShell'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(p => ({ ...p, [k]: undefined }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = {}
    if (!form.username.trim()) err.username = 'Username is required'
    if (!form.password) err.password = 'Password is required'
    if (Object.keys(err).length) { setErrors(err); return }

    setLoading(true)
    try {
      await login(form.username.trim(), form.password)
      toast.success('Welcome back!')
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell heading="Welcome back" subheading="Sign in to your Nexus RAG workspace.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field
          label="Username"
          icon={User}
          placeholder="your_username"
          autoComplete="username"
          value={form.username}
          onChange={set('username')}
          error={errors.username}
        />
        <Field
          label="Password"
          icon={Lock}
          type={showPwd ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          rightSlot={
            <button type="button" onClick={() => setShowPwd(v => !v)} className="text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200" aria-label="Toggle password">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <label className="flex cursor-pointer items-center gap-2 text-sm lp-sub">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-primary-600 accent-primary-600 dark:border-white/20"
          />
          Remember me
        </label>

        <AnimatedButton type="submit" loading={loading} className="w-full py-3" size="lg">
          {!loading && <>Sign In <ArrowRight size={16} /></>}
          {loading && 'Signing in…'}
        </AnimatedButton>
      </form>

      <p className="mt-7 text-center text-sm lp-sub">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
          Create one free
        </Link>
      </p>
    </AuthShell>
  )
}
