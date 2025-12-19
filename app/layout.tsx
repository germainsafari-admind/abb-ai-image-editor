import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const abbVoice = localFont({
  src: [
    {
      path: '../public/WOFF/ABBvoice_W_Lt.woff',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/WOFF/ABBvoice_W_Rg.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/WOFF/ABBvoice_W_Md.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/WOFF/ABBvoice_W_Bd.woff',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-abb-voice',
  display: 'swap',
})

const abbVoiceDisplay = localFont({
  src: [
    {
      path: '../public/WOFF/ABBvoiceDisplay_W_SBd.woff',
      weight: '600',
      style: 'normal',
    },
  ],
  variable: '--font-abb-voice-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ABB AI Image Editor',
  description: 'Professional AI-powered image editing for ABB',
  generator: 'ABB AI Image Editor',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${abbVoice.variable} ${abbVoiceDisplay.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
