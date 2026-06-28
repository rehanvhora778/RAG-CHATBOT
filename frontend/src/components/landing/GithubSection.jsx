import { motion } from 'framer-motion'
import { Github, BookText, Layers3, MonitorPlay } from 'lucide-react'
import AnimatedButton from '../ui/AnimatedButton'
import ParticleBackground from '../ui/ParticleBackground'
import { Section, Container } from './common'
import Reveal from '../ui/Reveal'
import { REPO_URL } from './portfolio'

const GHOST_WHITE = 'border-white/30 bg-white/10 text-white hover:bg-white/20'

export default function GithubSection() {
  const goTo = hash => { window.location.hash = hash }
  const open = url => window.open(url, '_blank', 'noopener,noreferrer')

  const LINKS = [
    { icon: BookText,    label: 'Documentation', onClick: () => open(REPO_URL) },
    { icon: Layers3,     label: 'Tech Stack',    onClick: () => goTo('#tech-stack') },
    { icon: MonitorPlay, label: 'Live Demo',     onClick: () => goTo('#demo') },
  ]

  return (
    <Section id="github">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-primary-400/20 px-6 py-16 text-center sm:px-12">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700" />
            <div className="absolute inset-0 -z-10 bg-grid opacity-20" />
            <ParticleBackground count={24} color="#ffffff" />
            <motion.div
              className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-white/20 blur-3xl"
              animate={{ x: [0, 80, 0], y: [0, 40, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />

            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Github size={13} /> Open Source
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Explore the Source Code
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
              Read the implementation, browse the architecture and see how the RAG pipeline is built end to end.
            </p>

            <div className="mt-9 flex justify-center">
              <AnimatedButton size="lg" className="bg-white text-primary-700 shadow-lg hover:shadow-xl" shine={false} onClick={() => open(REPO_URL)}>
                <Github size={18} /> View on GitHub
              </AnimatedButton>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {LINKS.map(l => (
                <AnimatedButton key={l.label} size="sm" variant="secondary" className={GHOST_WHITE} shine={false} onClick={l.onClick}>
                  <l.icon size={15} /> {l.label}
                </AnimatedButton>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
