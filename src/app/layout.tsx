// src/app/layout.tsx
import type { Metadata } from 'next'
import { Sora, DM_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Claude Island — Your Productivity Paradise',
  description: 'An ADHD-friendly AI-powered student productivity dashboard. Study smarter, grow your island.',
  keywords: ['student productivity', 'ADHD', 'study planner', 'AI assistant', 'notes', 'focus timer'],
  openGraph: {
    title: 'Claude Island',
    description: 'Your personal productivity island that grows as you study',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  themeColor: '#0a1628',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(10,22,40,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e8f4ff',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                fontFamily: 'var(--font-sora)',
                fontSize: '13px',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
