"use client"

import { cn } from "@/lib/utils"
import { PHASE_META, type CollectionState } from "@/lib/competitors/collection"

interface Props {
  col: CollectionState
  /** 品牌自身的投放状态 —— 与「我们是否在采集」是两件事 */
  active: boolean
  variant?: "light" | "dark"
  className?: string
}

/**
 * 采集状态 pill。
 * - 采集中 → 显示阶段 + 进度百分比，脉动圆点
 * - live   → 退回今天的 活跃/暂停 绿灰 pill，稳态品牌视觉零变化
 */
export function CollectionPill({ col, active, variant = "light", className }: Props) {
  const collecting = col.phase !== "live"
  const key = collecting ? col.phase : active ? "live" : "paused"
  const meta = PHASE_META[key]

  const label = collecting
    ? `${meta.short} ${col.progress}%`
    : variant === "dark"
      ? active ? "活跃投放中" : "投放暂停"
      : active ? "活跃" : "暂停"

  if (variant === "dark") {
    return (
      <span
        className={cn(
          "h-[19px] px-2 rounded-full text-[10.5px] font-extrabold flex items-center gap-1 shrink-0",
          collecting
            ? "bg-[var(--lime)]/15 text-[var(--lime)]"
            : active
              ? "bg-[var(--lime)] text-[#20251a]"
              : "bg-white/[0.08] text-white/45",
          className
        )}
      >
        {meta.pulse && (
          <span
            className="w-1 h-1 rounded-full animate-pulse"
            style={{ backgroundColor: collecting ? "var(--lime)" : active ? "#20251a" : "rgba(255,255,255,.45)" }}
          />
        )}
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "h-[16px] px-1.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shrink-0 tabular-nums",
        className
      )}
      style={{ backgroundColor: meta.bg, color: meta.text }}
    >
      {meta.pulse && (
        <span className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: meta.dot }} />
      )}
      {label}
    </span>
  )
}

/**
 * 3px 进度轨。两个 phase 都渲染 —— 条件渲染会让采集中的卡片
 * 在 grid-cols-3 里比同排高 9px。
 */
export function CollectionProgressBar({ col }: { col: CollectionState }) {
  const collecting = col.phase !== "live"
  return (
    <div className="h-[3px] rounded-full bg-[var(--soft)] overflow-hidden relative">
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${collecting ? col.progress : 100}%`,
          background: collecting ? "linear-gradient(90deg,#c9ff29,#84cc16)" : "var(--lime-soft)",
        }}
      />
      {collecting && (
        <span className="absolute inset-y-0 w-8 cs-sweep bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)]" />
      )}
    </div>
  )
}
