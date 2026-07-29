import type { Metadata } from "next"
import "./globals.css"
import { AppShell } from "@/components/layout/app-shell"

export const metadata: Metadata = {
  title: "CreatiSignal",
  description: "AI 驱动的创意广告工作台",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className="min-h-screen flex bg-white antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
