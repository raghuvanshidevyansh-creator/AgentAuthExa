import type { Metadata } from 'next'
import LandingPage from '@/components/LandingPage'
import { getConfig } from '@/config/company'

export const metadata: Metadata = {
  title: 'AgentAuth — Discovery and Trust for the Agent Web',
}

export function generateStaticParams() {
  return [
    { company: 'tavily' },
    { company: 'perplexity' },
    { company: 'cloudflare' },
  ]
}

export default function Page({ params }: { params: { company: string } }) {
  return <LandingPage config={getConfig(params.company)} basePath={`/${params.company}`} />
}
