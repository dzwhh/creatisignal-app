import type { Metadata } from "next"
import "./globals.css"
import { IconRail } from "@/components/layout/icon-rail"
import { Sidebar } from "@/components/layout/sidebar"

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
        <IconRail />
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </body>
    </html>
  )
}
