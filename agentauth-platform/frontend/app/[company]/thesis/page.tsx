import type { Metadata } from 'next'
import ThesisPage from '@/components/ThesisPage'
import { getConfig } from '@/config/company'

export const metadata: Metadata = {
  title: 'AgentAuth — The Thesis',
}

export function generateStaticParams() {
  return [
    { company: 'tavily' },
    { company: 'perplexity' },
    { company: 'cloudflare' },
  ]
}

export default function Page({ params }: { params: { company: string } }) {
  return <ThesisPage config={getConfig(params.company)} basePath={`/${params.company}`} />
}
