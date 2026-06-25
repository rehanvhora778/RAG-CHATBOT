import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, User, Mail, Lock, UserCircle, Check } from 'lucide-react'
import AuroraBackground from '../components/ui/AuroraBackground'
import ParticleBackground from '../components/ui/ParticleBackground'
import AnimatedInput from '../components/ui/AnimatedInput'
import AnimatedButton from '../components/ui/AnimatedButton'

const STEPS = ['Your details', 'Secure account']

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
  })
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState({})

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const validateStep1 = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (validateStep1()) setStep(1) }

  const handleSubmit = async e => {
    e.preventDefault()
    const fieldErr = {}
    if (form.password.length < 8) fieldErr.password = 'Min. 8 characters'
    if (form.password !== form.password2) fieldErr.password2 = 'Passwords do not match'
    if (Object.keys(fieldErr).length) { setErrors(fieldErr); return }

    setLoading(true)
    try {
      await register(form)
      toast.success('Account created!')
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors && typeof apiErrors === 'object') {
        Object.values(apiErrors).flat().forEach(msg => toast.error(msg))
      } else {
        toast.error(err.response?.data?.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 p-4">
      <AuroraBackground />
      <ParticleBackground count={26} />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-7 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow"
          >
            <Sparkles size={24} className="text-white" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Create your account</h1>
          <p className="mt-1.5 text-sm text-zinc-400">Join the <span className="text-gradient font-semibold">Nexus RAG</span> workspace</p>
        </div>

        {/* Glass form */}
        <div className="glass rounded-2xl p-6 shadow-glow-sm">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-medium">
              <span className={step >= 0 ? 'text-primary-300' : 'text-zinc-500'}>
                {step > 0 ? <Check size={12} className="mr-1 inline" /> : '1. '}{STEPS[0]}
              </span>
              <span className={step >= 1 ? 'text-primary-300' : 'text-zinc-500'}>2. {STEPS[1]}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait" initial={false}>
              {step === 0 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <AnimatedInput label="First name" icon={UserCircle} value={form.first_name} onChange={set('first_name')} />
                    <AnimatedInput label="Last name" value={form.last_name} onChange={set('last_name')} />
                  </div>
                  <AnimatedInput label="Username" icon={User} value={form.username} onChange={set('username')} error={errors.username} autoComplete="username" />
                  <AnimatedInput label="Email" icon={Mail} type="email" value={form.email} onChange={set('email')} error={errors.email} />

                  <AnimatedButton type="button" onClick={next} className="w-full py-3">
                    Continue <ArrowRight size={15} />
                  </AnimatedButton>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <AnimatedInput
                    label="Password"
                    icon={Lock}
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    error={errors.password}
                    rightSlot={
                      <button type="button" onClick={() => setShowPwd(v => !v)} className="text-zinc-500 transition-colors hover:text-zinc-300">
                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  <AnimatedInput label="Confirm password" icon={Lock} type="password" value={form.password2} onChange={set('password2')} error={errors.password2} />

                  <div className="flex gap-3">
                    <AnimatedButton type="button" variant="secondary" onClick={() => setStep(0)} className="py-3">
                      <ArrowLeft size={15} />
                    </AnimatedButton>
                    <AnimatedButton type="submit" loading={loading} className="flex-1 py-3">
                      {!loading && (<>Create Account <ArrowRight size={15} /></>)}
                      {loading && 'Creating account'}
                    </AnimatedButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-5 border-t border-white/[0.06] pt-5 text-center">
            <p className="text-sm text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-400 underline-offset-2 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
