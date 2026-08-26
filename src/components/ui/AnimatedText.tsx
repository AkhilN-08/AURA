import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'

interface AnimatedTextProps {
  children: ReactNode
  className?: string
  delay?: number
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

export default function AnimatedText({ children, className = '', delay = 0, tag: Tag = 'p' }: AnimatedTextProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }

    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power3.out',
      }
    )
  }, [delay])

  return (
    // @ts-expect-error Tag is a valid HTML element
    <Tag ref={ref} className={`${className}`} style={{ opacity: 0 }}>
      {children}
    </Tag>
  )
}
