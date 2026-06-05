import type { Metadata } from 'next'
import ThesisPage from '@/components/ThesisPage'
import { AGNOSTIC_CONFIG } from '@/config/company'

export const metadata: Metadata = {
  title: 'AgentAuth — The Thesis',
}

export default function Page() {
  return <ThesisPage config={AGNOSTIC_CONFIG} basePath="" />
}
