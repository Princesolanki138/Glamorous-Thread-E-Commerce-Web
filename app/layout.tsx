import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { getSession } from '@/lib/auth/session'
import { SessionProvider } from '@/component/auth/SessionProvider'
import { Toaster } from 'react-hot-toast'
import WhatsAppButton from '@/component/lib/WhatsAppButton'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const BRAND = 'Glamorous Thread'
const SITE_URL = "https://www.glamorousthread.com"
const DESCRIPTION =
  'Premium 100% human hair wigs, extensions & toppers. Clinically comfortable, designed for daily wear. Loved by 200,000+ women across India.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} | Premium Human Hair Extensions & Wigs`,
    template: `%s | ${BRAND}`,
  },
  description: DESCRIPTION,
  keywords: [
    'hair extensions',
    'human hair wigs',
    'hair toppers',
    'clip-in extensions',
    'hair patches',
    'hair volumizer',
    'glamorous thread',
    'premium hair',
    'Indian hair extensions',
  ],
  authors: [{ name: BRAND }],
  creator: BRAND,
  publisher: BRAND,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: BRAND,
    title: `${BRAND} | Premium Human Hair Extensions & Wigs`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND} | Premium Human Hair Extensions & Wigs`,
    description: DESCRIPTION,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession()

  return (
    <SessionProvider
      user={
        session
          ? { id: session.userId, phoneNumber: session.phoneNumber, isAdmin: session.isAdmin }
          : null
      }
    >
      <html
        lang="en"
        className={`${cormorant.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-brand-bg text-brand-text">
          {children}
          <WhatsAppButton />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#F5F5F5',
                border: '1px solid #2A2A2A',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              },
            }}
          />
        </body>
      </html>
    </SessionProvider>
  )
}
