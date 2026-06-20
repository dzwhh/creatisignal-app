"use client"

import { Bell } from "lucide-react"
import { DataSourceSwitcher } from "./data-source-switcher"

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-12 border-b border-[var(--line)] flex items-center justify-between px-6 bg-white text-[#1f2228] text-sm font-semibold shrink-0">
      <div>{title}</div>
      <div className="flex items-center gap-[14px] text-[#9498a2] text-xs font-medium">
        <span>14h ago</span>
        <Bell size={15} strokeWidth={2} />
        <DataSourceSwitcher />
      </div>
    </header>
  )
}
