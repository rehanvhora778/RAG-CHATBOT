import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  User, AtSign, Mail, Lock, Eye, EyeOff, KeyRound, Save,
  ShieldCheck, Crown, Calendar, Clock, Hash, Sparkles,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../api/auth'
import GlassCard from '../components/ui/GlassCard'
import AnimatedInput from '../components/ui/AnimatedInput'
import AnimatedButton from '../components/ui/AnimatedButton'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }

const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['bg-zinc-600', 'bg-red-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500']

function scorePassword(pw) {
  if (!pw || pw.length < 8) return 0
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const fmtDate = v => (v ? new Date(v).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—')
const fmtDateTime = v =>
  v ? new Date(v).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'

/** Map a DRF-style { message, errors } payload onto field errors + toasts. */
function applyApiErrors(err, setErrors, fallback) {
  const data = err.response?.data
  const apiErrors = data?.errors
  if (apiErrors && typeof apiErrors === 'object') {
    const mapped = {}
    Object.entries(apiErrors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : String(v) })
    setErrors(prev => ({ ...prev, ...mapped }))
    Object.values(apiErrors).flat().forEach(msg => toast.error(String(msg)))
  } else {
    toast.error(data?.message || fallback)
  }
}

function MetaRow({ icon: Icon, label, value, accent = 'text-primary-400' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
        <Icon size={16} className={accent} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="truncate text-sm font-semibold text-zinc-200">{value}</p>
      </div>
    </div>
  )
}

function PwToggle({ shown, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Toggle password visibility"
      className="text-zinc-500 transition-colors hover:text-zinc-200">
      {shown ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )
}

export default function ProfilePage() {
  const { user, setUser } = useAuth()

  /* ── Personal information ──────────────────────────────── */
  const [info, setInfo] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  })
  const [infoErrors, setInfoErrors] = useState({})
  const [savingInfo, setSavingInfo] = useState(false)

  const infoDirty = useMemo(
    () =>
      info.first_name !== (user?.first_name || '') ||
      info.last_name !== (user?.last_name || '') ||
      info.email !== (user?.email || ''),
    [info, user],
  )

  const setInfoField = k => e => {
    const val = e.target.value
    setInfo(f => ({ ...f, [k]: val }))
    if (infoErrors[k]) setInfoErrors(p => ({ ...p, [k]: undefined }))
  }

  const saveInfo = async e => {
    e.preventDefault()
    const errs = {}
    if (!info.first_name.trim()) errs.first_name = 'First name is required'
    if (!info.last_name.trim()) errs.last_name = 'Last name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim())) errs.email = 'Enter a valid email'
    if (Object.keys(errs).length) { setInfoErrors(errs); return }

    setSavingInfo(true)
    try {
      const res = await authAPI.updateProfile({
        first_name: info.first_name.trim(),
        last_name: info.last_name.trim(),
        email: info.email.trim(),
      })
      setUser(res.data.data)
      toast.success('Profile updated.')
    } catch (err) {
      applyApiErrors(err, setInfoErrors, 'Could not update profile.')
    } finally {
      setSavingInfo(false)
    }
  }

  /* ── Change password ───────────────────────────────────── */
  const [pwd, setPwd] = useState({ old_password: '', new_password: '', new_password2: '' })
  const [pwdErrors, setPwdErrors] = useState({})
  const [savingPwd, setSavingPwd] = useState(false)
  const [show, setShow] = useState({ old: false, neu: false, confirm: false })
  const strength = scorePassword(pwd.new_password)

  const setPwdField = k => e => {
    const val = e.target.value
    setPwd(f => ({ ...f, [k]: val }))
    if (pwdErrors[k]) setPwdErrors(p => ({ ...p, [k]: undefined }))
  }

  const savePwd = async e => {
    e.preventDefault()
    const errs = {}
    if (!pwd.old_password) errs.old_password = 'Enter your current password'
    if (pwd.new_password.length < 8) errs.new_password = 'At least 8 characters'
    if (pwd.new_password !== pwd.new_password2) errs.new_password2 = 'Passwords do not match'
    if (Object.keys(errs).length) { setPwdErrors(errs); return }

    setSavingPwd(true)
    try {
      await authAPI.changePassword(pwd)
      toast.success('Password changed successfully.')
      setPwd({ old_password: '', new_password: '', new_password2: '' })
    } catch (err) {
      const msg = err.response?.data?.message
      if (!err.response?.data?.errors && msg && /current password/i.test(msg)) {
        setPwdErrors({ old_password: 'Current password is incorrect' })
        toast.error(msg)
      } else {
        applyApiErrors(err, setPwdErrors, 'Could not change password.')
      }
    } finally {
      setSavingPwd(false)
    }
  }

  const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username
  const initial = (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()
  const isAdmin = !!user?.is_staff

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-5xl space-y-6">
      {/* ── Identity header ── */}
      <motion.div variants={item}>
        <GlassCard className="relative overflow-hidden p-6 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 50% 140% at 80% 0%, rgba(139,92,246,0.16), transparent 70%)' }}
          />
          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 14 }}
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-accent-600 font-display text-4xl font-bold text-white shadow-glow"
            >
              {initial}
            </motion.div>
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                <h2 className="font-display text-2xl font-bold text-white">{fullName}</h2>
                <span className={`badge ${isAdmin ? 'bg-amber-500/15 text-amber-300' : 'bg-primary-500/15 text-primary-300'}`}>
                  {isAdmin ? <Crown size={12} /> : <ShieldCheck size={12} />}
                  {isAdmin ? 'Administrator' : 'Member'}
                </span>
              </div>
              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-zinc-400 sm:justify-start">
                <AtSign size={14} className="text-zinc-500" /> {user?.username}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-zinc-400 sm:justify-start">
                <Mail size={14} className="text-zinc-500" /> {user?.email}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Personal information ── */}
        <motion.div variants={item}>
          <GlassCard className="h-full p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10">
                <User size={16} className="text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Personal information</h3>
                <p className="text-xs text-zinc-500">Update your name and email</p>
              </div>
            </div>

            <form onSubmit={saveInfo} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AnimatedInput label="First name" icon={User} value={info.first_name} onChange={setInfoField('first_name')} error={infoErrors.first_name} autoComplete="given-name" />
                <AnimatedInput label="Last name" icon={User} value={info.last_name} onChange={setInfoField('last_name')} error={infoErrors.last_name} autoComplete="family-name" />
              </div>
              <AnimatedInput label="Email" icon={Mail} type="email" value={info.email} onChange={setInfoField('email')} error={infoErrors.email} autoComplete="email" />

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2.5 text-sm text-zinc-500">
                <AtSign size={15} /> <span className="font-medium text-zinc-400">{user?.username}</span>
                <span className="ml-auto text-[11px] uppercase tracking-wider">Username · locked</span>
              </div>

              <AnimatedButton type="submit" loading={savingInfo} disabled={!infoDirty} className="w-full" size="lg">
                {!savingInfo && <><Save size={16} /> Save changes</>}
                {savingInfo && 'Saving…'}
              </AnimatedButton>
            </form>
          </GlassCard>
        </motion.div>

        {/* ── Change password ── */}
        <motion.div variants={item}>
          <GlassCard className="h-full p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/10">
                <KeyRound size={16} className="text-accent-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Change password</h3>
                <p className="text-xs text-zinc-500">Keep your account secure</p>
              </div>
            </div>

            <form onSubmit={savePwd} className="space-y-4" noValidate>
              <AnimatedInput
                label="Current password" icon={Lock}
                type={show.old ? 'text' : 'password'}
                value={pwd.old_password} onChange={setPwdField('old_password')} error={pwdErrors.old_password}
                autoComplete="current-password"
                rightSlot={<PwToggle shown={show.old} onClick={() => setShow(s => ({ ...s, old: !s.old }))} />}
              />
              <div>
                <AnimatedInput
                  label="New password" icon={Lock}
                  type={show.neu ? 'text' : 'password'}
                  value={pwd.new_password} onChange={setPwdField('new_password')} error={pwdErrors.new_password}
                  autoComplete="new-password"
                  rightSlot={<PwToggle shown={show.neu} onClick={() => setShow(s => ({ ...s, neu: !s.neu }))} />}
                />
                {pwd.new_password && (
                  <div className="mt-2">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map(i => (
                        <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < strength ? STRENGTH_COLOR[strength] : 'bg-white/10'}`} />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">Strength: <span className="font-semibold text-zinc-300">{STRENGTH[strength]}</span></p>
                  </div>
                )}
              </div>
              <AnimatedInput
                label="Confirm new password" icon={Lock}
                type={show.confirm ? 'text' : 'password'}
                value={pwd.new_password2} onChange={setPwdField('new_password2')} error={pwdErrors.new_password2}
                autoComplete="new-password"
                rightSlot={<PwToggle shown={show.confirm} onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} />}
              />

              <AnimatedButton type="submit" loading={savingPwd} className="w-full" size="lg">
                {!savingPwd && <><KeyRound size={16} /> Update password</>}
                {savingPwd && 'Updating…'}
              </AnimatedButton>
            </form>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Account details (read-only) ── */}
      <motion.div variants={item}>
        <GlassCard className="p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success-500/10">
              <Sparkles size={16} className="text-success-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Account details</h3>
              <p className="text-xs text-zinc-500">Read-only information about your account</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetaRow icon={Hash} label="Account ID" value={`#${user?.id}`} accent="text-zinc-400" />
            <MetaRow icon={isAdmin ? Crown : ShieldCheck} label="Role" value={isAdmin ? 'Administrator' : 'Member'} accent={isAdmin ? 'text-amber-400' : 'text-primary-400'} />
            <MetaRow icon={Calendar} label="Member since" value={fmtDate(user?.date_joined)} accent="text-accent-400" />
            <MetaRow icon={Clock} label="Last login" value={fmtDateTime(user?.last_login)} accent="text-success-400" />
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}
