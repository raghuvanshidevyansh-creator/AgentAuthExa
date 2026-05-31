'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  delay?: string
  className?: string
}

export default function ScrollReveal({ children, delay, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in')
          obs.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const classes = ['r', className].filter(Boolean).join(' ')
  const style = delay ? { transitionDelay: delay } : undefined

  return (
    <div ref={ref} className={classes} style={style}>
      {children}
    </div>
  )
}
