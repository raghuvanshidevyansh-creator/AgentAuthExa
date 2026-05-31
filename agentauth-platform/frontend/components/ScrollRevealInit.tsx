'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollRevealInit() {
  const pathname = usePathname()

  useEffect(() => {
    let obs: IntersectionObserver | null = null

    function setup() {
      if (obs) obs.disconnect()
      obs = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('in')
              obs?.unobserve(e.target)
            }
          })
        },
        { threshold: 0.05 }
      )
      document.querySelectorAll('.r:not(.in)').forEach(el => obs!.observe(el))
    }

    // Run immediately, then again at 150ms and 500ms to catch
    // elements that Next.js commits to DOM after navigation
    setup()
    const t1 = setTimeout(setup, 150)
    const t2 = setTimeout(setup, 500)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      obs?.disconnect()
    }
  }, [pathname])

  return null
}
