import { Github, Linkedin, Mail } from 'lucide-react'
import { Logo } from './common'
import { PROFILE } from './portfolio'

const SOCIAL = [
  { icon: Github,   label: 'GitHub',   href: PROFILE.github,            external: true },
  { icon: Linkedin, label: 'LinkedIn', href: PROFILE.linkedin,          external: true },
  { icon: Mail,     label: 'Email',    href: `mailto:${PROFILE.email}`, external: false },
]

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/80 px-5 py-8 dark:border-white/10 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Logo />

        <p className="text-xs lp-sub">
          © {new Date().getFullYear()} {PROFILE.name}. Built with React, FAISS &amp; Groq.
        </p>

        <div className="flex items-center gap-2">
          {SOCIAL.map(s => (
            <a
              key={s.label}
              href={s.href}
              {...(s.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              aria-label={s.label}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white/70 lp-sub transition-colors hover:text-primary-600 dark:border-white/10 dark:bg-white/5 dark:hover:text-primary-300"
            >
              <s.icon size={16} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
