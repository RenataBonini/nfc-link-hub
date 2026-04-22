import './global.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NFC Link Hub Builder',
  description: 'Create link landing pages for NFC-enabled small businesses.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}