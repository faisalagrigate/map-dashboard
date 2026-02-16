import type { Metadata, Viewport } from 'next'
import { Inter, Space_Mono } from 'next/font/google'

import './globals.css'
import { LocationProvider } from '@/context/location-context'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' })

export const metadata: Metadata = {
  title: 'Astha Feeds - Agent & Dealer Management',
  description: 'Real-time agent tracking, dealer management, target monitoring, and sales analytics for Astha Feeds',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a3a2a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_spaceMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        <LocationProvider>
          {children}
        </LocationProvider>
      </body>
    </html>
  )
}
