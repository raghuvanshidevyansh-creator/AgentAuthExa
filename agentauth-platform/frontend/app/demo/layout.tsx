import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AgentAuth — Demo',
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
