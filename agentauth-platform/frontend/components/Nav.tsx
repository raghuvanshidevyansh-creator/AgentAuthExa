'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const KNOWN_COMPANIES = ['tavily', 'perplexity', 'cloudflare']

export default function Nav() {
  const path = usePathname()
  const segments = path.split('/').filter(Boolean)
  const company = KNOWN_COMPANIES.includes(segments[0]) ? segments[0] : null

  const homeHref = company ? `/${company}` : '/'
  const thesisHref = company ? `/${company}/thesis` : '/thesis'

  const on = (href: string) => path === href ? 'on' : undefined

  return (
    <nav>
      <Link href={homeHref} className="logo">AgentAuth</Link>
      <div className="nav-r">
        <Link href={homeHref} className={on(homeHref)}>Home</Link>
        <Link href={thesisHref} className={on(thesisHref)}>Thesis</Link>
        <Link href="/demo" className={on('/demo')}>Demo</Link>
      </div>
    </nav>
  )
}
