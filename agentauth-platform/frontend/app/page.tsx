import type { Metadata } from 'next'
import LandingPage from '@/components/LandingPage'
import { AGNOSTIC_CONFIG } from '@/config/company'

export const metadata: Metadata = {
  title: 'AgentAuth — Discovery and Trust for the Agent Web',
}

export default function Page() {
  return <LandingPage config={AGNOSTIC_CONFIG} basePath="" />
}
