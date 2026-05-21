"use client"

import { Bell, Plus } from "lucide-react"

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
        <button
          type="button"
          className="h-[30px] border border-[var(--line-strong)] rounded-lg bg-white text-[#2c2f35] px-[11px] flex items-center gap-[6px] font-bold cursor-pointer text-xs"
        >
          <Plus size={13} strokeWidth={2.5} />
          添加账户
        </button>
      </div>
    </header>
  )
}
