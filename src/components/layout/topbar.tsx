"use client"

import Link from "next/link"
import { Bell, Bug, Crown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { CREDIT_TOTAL, fmt } from "@/lib/credits/data"
import { DataSourceSwitcher } from "./data-source-switcher"

interface TopbarProps {
  title: string
  /** 显示右侧操作区（积分 / 消息 / 反馈 / 升级 / 数据源切换）。默认 true。 */
  showActions?: boolean
  /** 是否显示底部分割线。默认 true。 */
  bordered?: boolean
}

export function Topbar({ title, showActions = true, bordered = true }: TopbarProps) {
  return (
    <header
      className={cn(
        "h-12 flex items-center justify-between px-6 bg-white text-[#1f2228] text-sm font-medium shrink-0",
        bordered && "border-b border-[var(--line)]"
      )}
    >
      <div>{title}</div>
      {showActions && (
        <div className="flex items-center gap-2.5">
          {/* 升级 —— 高亮入口 */}
          <Link
            href="/settings/billing"
            className="h-[28px] px-2.5 rounded-full flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#c2410c] bg-[#fff7ed] border border-[#fed7aa] hover:bg-[#ffedd5] transition-colors cursor-pointer"
          >
            <Crown size={13} strokeWidth={2.4} />
            升级
          </Link>

          {/* 积分余额 */}
          <Link
            href="/settings/credits"
            title="积分余额"
            className="h-[28px] px-3 rounded-full flex items-center gap-1.5 bg-[var(--lime-soft)] text-[#3f6212] text-[12.5px] font-extrabold tabular-nums hover:bg-[#e6ffa8] transition-colors cursor-pointer"
          >
            <Zap size={12} strokeWidth={2.6} fill="currentColor" />
            {fmt(CREDIT_TOTAL)}
          </Link>

          {/* 消息 */}
          <button
            type="button"
            title="消息"
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[#9498a2] hover:bg-[var(--soft)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <Bell size={15} strokeWidth={2} />
          </button>

          {/* 问题反馈 */}
          <button
            type="button"
            title="问题反馈"
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[#9498a2] hover:bg-[var(--soft)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <Bug size={15} strokeWidth={2} />
          </button>

          <span className="w-px h-4 bg-[var(--line)]" />

          <DataSourceSwitcher />
        </div>
      )}
    </header>
  )
}
