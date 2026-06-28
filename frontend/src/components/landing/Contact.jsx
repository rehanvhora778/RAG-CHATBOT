import { Mail, Github, Linkedin, Globe, AtSign } from 'lucide-react'
import { Section, Container, SectionHeading } from './common'
import Reveal from '../ui/Reveal'
import SiteFooter from './SiteFooter'
import { PROFILE } from './portfolio'

export default function Contact() {
  const CARDS = [
    { icon: Mail,     label: 'Email',     value: PROFILE.email,                                 href: `mailto:${PROFILE.email}`, external: false },
    { icon: Github,   label: 'GitHub',    value: PROFILE.github.replace(/^https?:\/\//, ''),    href: PROFILE.github,    external: true },
    { icon: Linkedin, label: 'LinkedIn',  value: PROFILE.linkedin.replace(/^https?:\/\//, ''),  href: PROFILE.linkedin,  external: true },
    { icon: Globe,    label: 'Portfolio', value: PROFILE.portfolio.replace(/^https?:\/\//, ''), href: PROFILE.portfolio, external: true },
  ]

  return (
    <Section id="contact" className="justify-between pb-0">
      <div className="flex w-full flex-1 flex-col justify-center">
        <Container>
          <SectionHeading
            eyebrow="Contact"
            eyebrowIcon={AtSign}
            title={<>Let's <span className="text-brand-gradient">connect</span></>}
            subtitle="Open to AI/ML internship and new-grad opportunities."
          />

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((c, i) => (
              <Reveal key={c.label} delay={i * 0.06}>
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="lp-card lp-card-hover group flex h-full flex-col items-center gap-3 p-6 text-center"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-glow-sm transition-transform duration-300 group-hover:scale-110">
                    <c.icon size={20} />
                  </span>
                  <span className="font-display text-base font-semibold lp-h">{c.label}</span>
                  <span className="break-all text-xs lp-sub">{c.value}</span>
                </a>
              </Reveal>
            ))}
          </div>
        </Container>
      </div>

      {/* footer lives in the last viewport; break out of the section's x-padding */}
      <div className="-mx-5 sm:-mx-8">
        <SiteFooter />
      </div>
    </Section>
  )
}
