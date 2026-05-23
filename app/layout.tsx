import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Moideen Rahil Monaco | Video Editor & Performance Marketer',
  description: 'Award-winning video editor and performance marketer crafting cinematic stories that drive results. Specializing in After Effects, Premiere Pro, and creative direction.',
  keywords: ['video editor', 'performance marketer', 'motion graphics', 'After Effects', 'Premiere Pro', 'creative direction'],
  authors: [{ name: 'Moideen Rahil Monaco' }],
  openGraph: {
    title: 'Moideen Rahil Monaco | Video Editor & Performance Marketer',
    description: 'Award-winning video editor and performance marketer crafting cinematic stories that drive results.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#f6f2eb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} bg-background`}>
      <body className="overflow-x-hidden">
        <div className="noise-overlay" aria-hidden="true" />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
