import type { Metadata } from "next"
import "./globals.css"
import { Balsamiq_Sans, DM_Sans, JetBrains_Mono } from "next/font/google"

const display = Balsamiq_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
})

const body = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
})

const mono = JetBrains_Mono({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Goobs — The Agent Workshop",
  description: "Learn how AI agents work by building, training, and running them.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-base text-text antialiased">{children}</body>
    </html>
  )
}
