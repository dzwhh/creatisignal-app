"use client"

import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { DataSourceSwitcher } from "./data-source-switcher"

interface TopbarProps {
  title: string
  /** 显示右侧操作区（时间戳 / Bell / 数据源切换）。默认 true。 */
  showActions?: boolean
  /** 是否显示底部分割线。默认 true。 */
  bordered?: boolean
}

export function Topbar({ title, showActions = true, bordered = true }: TopbarProps) {
  return (
    <header
      className={cn(
        "h-12 flex items-center justify-between px-6 bg-white text-[#1f2228] text-sm font-semibold shrink-0",
        bordered && "border-b border-[var(--line)]"
      )}
    >
      <div>{title}</div>
      {showActions && (
        <div className="flex items-center gap-[14px] text-[#9498a2] text-xs font-medium">
          <span>14h ago</span>
          <Bell size={15} strokeWidth={2} />
          <DataSourceSwitcher />
        </div>
      )}
    </header>
  )
}
