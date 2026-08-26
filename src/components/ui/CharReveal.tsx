import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface CharRevealProps {
  children: ReactNode
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
  stagger?: number
}

export default function CharReveal({ children, className = '', tag: Tag = 'h2', delay = 0, stagger = 0.02 }: CharRevealProps) {
  const containerRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const el = containerRef.current
    const text = el.textContent || ''

    el.innerHTML = ''
    ;[...text].forEach(char => {
      const span = document.createElement('span')
      span.className = 'char-reveal inline-block'
      span.style.opacity = '0'
      span.style.transform = 'translateY(100%) rotateX(-80deg)'
      span.style.transformOrigin = 'bottom center'
      span.textContent = char === ' ' ? '\u00A0' : char
      el.appendChild(span)
    })

    const charEls = el.querySelectorAll('.char-reveal')

    const ctx = gsap.context(() => {
      gsap.to(charEls, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.5,
        stagger,
        delay,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => ctx.revert()
  }, [reducedMotion, delay, stagger, children])

  return (
    // @ts-expect-error tag is valid
    <Tag ref={containerRef} className={className} style={{ perspective: '600px' }}>
      {children}
    </Tag>
  )
}
