"use client"

import { usePathname } from "next/navigation"
import { IconRail } from "./icon-rail"
import { Sidebar } from "./sidebar"

// ─── 应用外壳：登录页不渲染侧栏导航 ──────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/login") {
    return <div className="flex-1 flex flex-col min-w-0">{children}</div>
  }

  return (
    <>
      <IconRail />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </>
  )
}
