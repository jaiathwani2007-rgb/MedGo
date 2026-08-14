import type { Metadata } from 'next'
import { Hind, Martel } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'
import { CartProvider } from '@/components/CartProvider'
import { cookies } from 'next/headers'

const hind = Hind({ 
  subsets: ['latin', 'devanagari'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind'
})

const martel = Martel({ 
  subsets: ['latin', 'devanagari'], 
  weight: ['400', '700', '900'],
  variable: '--font-martel'
})

export const metadata: Metadata = {
  title: 'MedGo Pharmacy',
  description: 'Your local pharmacy, online.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const initialLanguage = (cookieStore.get('medgo_lang')?.value as 'en' | 'hi') || 'en'

  return (
    <html lang={initialLanguage}>
      <body className={`${hind.variable} ${martel.variable} font-sans antialiased bg-parchment text-ink`}>
        <LanguageProvider initialLanguage={initialLanguage}>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
