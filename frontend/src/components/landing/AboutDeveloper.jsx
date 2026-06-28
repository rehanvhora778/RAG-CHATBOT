import { Github, Linkedin, FileText, Mail, UserRound, GraduationCap } from 'lucide-react'
import { Section, Container, SectionHeading, SECONDARY_BTN } from './common'
import Reveal from '../ui/Reveal'
import AnimatedButton from '../ui/AnimatedButton'
import { PROFILE } from './portfolio'

const SKILLS = ['Python', 'Machine Learning', 'Deep Learning', 'Generative AI', 'RAG', 'React', 'Django', 'MongoDB']

export default function AboutDeveloper() {
  const initials = PROFILE.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Section id="about">
      <Container>
        <SectionHeading
          eyebrow="About the Developer"
          eyebrowIcon={UserRound}
          title={<>Meet the <span className="text-brand-gradient">engineer</span></>}
        />

        <Reveal>
          <div className="lp-card mx-auto mt-12 grid max-w-4xl gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:items-center">
            {/* photo placeholder: replace the inner block with an <img src="/me.jpg" .../> */}
            <div className="mx-auto">
              <div className="relative h-40 w-40 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 p-[2px] shadow-glow">
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white dark:bg-ink-900">
                  <span className="font-display text-4xl font-bold text-brand-gradient">{initials}</span>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] lp-sub">Add your photo in <code>AboutDeveloper.jsx</code></p>
            </div>

            <div className="text-center md:text-left">
              <h3 className="font-display text-2xl font-bold lp-h">{PROFILE.name}</h3>
              <p className="mt-1 font-medium text-primary-600 dark:text-primary-300">{PROFILE.role}</p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm lp-sub md:justify-start">
                <GraduationCap size={15} /> {PROFILE.university}
              </p>
              <p className="mt-4 text-sm leading-relaxed lp-sub">
                I build full-stack, production-ready GenAI applications, from document ingestion and vector retrieval to
                LLM orchestration and polished React frontends.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                {SKILLS.map(s => <span key={s} className="lp-pill">{s}</span>)}
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-2.5 md:justify-start">
                <AnimatedButton size="sm" onClick={() => window.open(PROFILE.github, '_blank', 'noopener,noreferrer')}>
                  <Github size={15} /> GitHub
                </AnimatedButton>
                <AnimatedButton size="sm" variant="secondary" className={SECONDARY_BTN} onClick={() => window.open(PROFILE.linkedin, '_blank', 'noopener,noreferrer')}>
                  <Linkedin size={15} /> LinkedIn
                </AnimatedButton>
                <AnimatedButton size="sm" variant="secondary" className={SECONDARY_BTN} onClick={() => window.open(PROFILE.resume, '_blank', 'noopener,noreferrer')}>
                  <FileText size={15} /> Resume
                </AnimatedButton>
                <AnimatedButton size="sm" variant="secondary" className={SECONDARY_BTN} onClick={() => { window.location.href = `mailto:${PROFILE.email}` }}>
                  <Mail size={15} /> Email
                </AnimatedButton>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
