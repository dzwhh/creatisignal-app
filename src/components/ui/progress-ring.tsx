"use client"

import { cn } from "@/lib/utils"

interface Props {
  progress: number
  /** 外框边长 px */
  size?: number
  /** 轨道色 */
  track?: string
  /** 进度色 */
  stroke?: string
  /** 中心文字色 */
  textColor?: string
  className?: string
}

export function ProgressRing({
  progress,
  size = 44,
  track = "var(--line)",
  stroke = "var(--near-black)",
  textColor = "var(--text)",
  className,
}: Props) {
  const R = 16
  const C = 2 * Math.PI * R
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx="20" cy="20" r={R} fill="none" stroke={track} strokeWidth="3" />
        <circle
          cx="20" cy="20" r={R} fill="none" stroke={stroke} strokeWidth="3"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress / 100)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[10px] font-black tabular-nums"
        style={{ color: textColor }}
      >
        {Math.round(progress)}%
      </span>
    </div>
  )
}
