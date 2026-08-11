import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/components/LanguageProvider'
import { CartProvider } from '@/components/CartProvider'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={`${inter.className} antialiased bg-gray-50 text-gray-900`}>
        <LanguageProvider initialLanguage={initialLanguage}>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
