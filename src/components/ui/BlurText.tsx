import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../../hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface BlurTextProps {
  children: ReactNode
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
}

export default function BlurText({ children, className = '', tag: Tag = 'p', delay = 0 }: BlurTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const el = containerRef.current
    const text = el.textContent || ''
    const words = text.split(/\s+/).filter(Boolean)

    // Replace content with word spans
    el.innerHTML = words
      .map((word, i) => `<span class="blur-word inline-block" style="opacity:0;filter:blur(8px);transform:translateY(20px);transition:none">${word}</span>`)
      .join(' ')

    const wordEls = el.querySelectorAll('.blur-word')

    const ctx = gsap.context(() => {
      gsap.to(wordEls, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.6,
        stagger: 0.04,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    return () => ctx.revert()
  }, [reducedMotion, delay, children])

  // Render children as-is for initial paint, GSAP will replace innerHTML
  return (
    // @ts-expect-error tag is valid
    <Tag ref={containerRef} className={className}>
      {children}
    </Tag>
  )
}
