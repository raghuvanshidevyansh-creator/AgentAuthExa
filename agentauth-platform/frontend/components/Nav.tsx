'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()
  const on = (href: string) => path === href ? 'on' : undefined

  return (
    <nav>
      <Link href="/" className="logo">AgentAuth</Link>
      <div className="nav-r">
        <Link href="/" className={on('/')}>Home</Link>
        <Link href="/thesis" className={on('/thesis')}>Thesis</Link>
        <Link href="/demo" className={on('/demo')}>Demo</Link>
      </div>
    </nav>
  )
}
