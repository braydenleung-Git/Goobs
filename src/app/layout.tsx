import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Goobs — The Agent Workshop",
  description: "Learn how AI agents work by building, training, and running them.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-gray-100">{children}</body>
    </html>
  )
}
