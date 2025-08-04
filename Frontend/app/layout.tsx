import type { Metadata } from 'next'
import './globals.css'

export const metadata = {
  title: 'Al-Mursalaat | Learn Quran Online with Expert Tutors',
  description: 'Join Al-Mursalaat Online Islamic Academy for personalized one-on-one Quran learning, Nazra, Hifz, and Islamic studies for all ages. Start your free trial today.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
