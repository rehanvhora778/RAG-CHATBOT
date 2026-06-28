import { MonitorPlay } from 'lucide-react'
import { Section, Container, SectionHeading } from './common'
import Reveal from '../ui/Reveal'
import AnimatedPreview from './AnimatedPreview'

export default function LiveDemo() {
  return (
    <Section id="demo">
      <Container>
        <SectionHeading
          eyebrow="Live Demo Preview"
          eyebrowIcon={MonitorPlay}
          title={<>A real query, <span className="text-brand-gradient">end to end</span></>}
          subtitle="Upload, index, retrieve, generate, cite — the actual flow, animated."
        />
        <Reveal>
          <div className="relative mx-auto mt-8 max-w-xl">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary-500/15 via-accent-500/10 to-emerald-500/10 blur-2xl" />
            <AnimatedPreview />
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}
