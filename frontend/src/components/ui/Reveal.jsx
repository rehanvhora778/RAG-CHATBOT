import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

/**
 * Reveal — fades/slides children up the first time they scroll into view.
 * Use to stagger sections like Perplexity/Linear marketing surfaces.
 */
export default function Reveal({ children, className, delay = 0, y = 18, once = true }) {
  const { ref, inView } = useInView({ triggerOnce: once, threshold: 0.15 })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
