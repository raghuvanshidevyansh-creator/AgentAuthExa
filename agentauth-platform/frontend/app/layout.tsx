import type { Metadata } from 'next'
import { Syne, JetBrains_Mono, Lora } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import ScrollRevealInit from '@/components/ScrollRevealInit'
import { Analytics } from '@vercel/analytics/react'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-d',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-m',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-b',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AgentAuth',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable} ${lora.variable}`}>
      <body>
        <Nav />
        <ScrollRevealInit />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
