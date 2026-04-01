import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zelte Docs - Zero-Config API Testing',
  description: 'Developer documentation for Zelte - the simplest way to test your APIs',
  keywords: ['API testing', 'CLI', 'developer tools', 'testing', 'REST', 'GraphQL'],
  authors: [{ name: 'Calistus Umeh' }],
  openGraph: {
    title: 'Zelte Docs - Zero-Config API Testing',
    description: 'Developer documentation for Zelte - the simplest way to test your APIs',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="antialiased min-h-screen bg-background text-text-primary">
        {children}
      </body>
    </html>
  )
}