"use client"

import { cn } from "@/lib/utils"
import { STATUS_META, type AccountStatus, type Material, type MaterialAction, ACTION_META } from "@/lib/insights/types"
import { Play, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

export function StatusDot({ status, size = 7 }: { status: AccountStatus; size?: number }) {
  const meta = STATUS_META[status]
  return <span className="inline-block rounded-full shrink-0" style={{ width: size, height: size, backgroundColor: meta.dot }} title={meta.label} />
}

export function StatusBadge({ status, compact = false }: { status: AccountStatus; compact?: boolean }) {
  const meta = STATUS_META[status]
  const tone: Record<string, string> = {
    ok:    "bg-[#dff9e7] text-[#16a34a]",
    info:  "bg-[#fef9c3] text-[#a16207]",
    warn:  "bg-[#fff7ed] text-[#ea580c]",
    bad:   "bg-[#fee2e2] text-[#dc2626]",
    muted: "bg-[var(--soft)] text-[var(--muted)]",
  }
  return (
    <span className={cn("h-5 rounded-md text-[11px] font-bold flex items-center gap-1 shrink-0", compact ? "px-1.5" : "px-2", tone[meta.tone])}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
      {meta.label}
    </span>
  )
}

export function ActionBadge({ action }: { action: MaterialAction }) {
  const meta = ACTION_META[action]
  const tone: Record<string, string> = {
    ok:    "bg-[#dff9e7] text-[#16a34a]",
    warn:  "bg-[#fff7ed] text-[#ea580c]",
    bad:   "bg-[#fee2e2] text-[#dc2626]",
    muted: "bg-[var(--soft)] text-[var(--muted)]",
  }
  return (
    <span className={cn("h-5 px-2 rounded-md text-[11px] font-bold inline-flex items-center shrink-0", tone[meta.tone])}>
      {meta.label}
    </span>
  )
}

export function MoneyShort({ value, decimals = 1 }: { value: number; decimals?: number }) {
  if (value >= 1_000_000) return <>${(value / 1_000_000).toFixed(decimals)}M</>
  if (value >= 1_000) return <>${(value / 1_000).toFixed(decimals)}K</>
  return <>${value.toFixed(0)}</>
}

export function NumShort({ value, decimals = 1 }: { value: number; decimals?: number }) {
  if (value >= 1_000_000) return <>{(value / 1_000_000).toFixed(decimals)}M</>
  if (value >= 1_000) return <>{(value / 1_000).toFixed(decimals)}K</>
  return <>{value.toFixed(0)}</>
}

export function Pct({ value, decimals = 2 }: { value: number; decimals?: number }) {
  return <>{(value * 100).toFixed(decimals)}%</>
}

export function MaterialThumb({
  material,
  size = 40,
  showPlay = true,
}: {
  material: Material
  size?: number
  showPlay?: boolean
}) {
  return (
    <div
      className="relative rounded-lg overflow-hidden bg-[var(--soft)] shrink-0"
      style={{ width: size, height: size }}
    >
      <img src={material.thumb} alt={material.name} className="w-full h-full object-cover" draggable={false} />
      {showPlay && size >= 36 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 hover:opacity-100 transition-opacity">
          <Play size={Math.max(10, Math.floor(size / 3))} className="text-white" fill="white" />
        </div>
      )}
    </div>
  )
}

// Mini stacked bar of per-account status
export function AccountDistBar({ material, height = 8, max = 12 }: { material: Material; height?: number; max?: number }) {
  const total = material.accountRows.length
  if (total === 0) return null
  const shown = material.accountRows.slice(0, max)
  return (
    <div className="inline-flex items-center gap-0.5" title={`${total} 个账户`}>
      <div className="flex rounded-sm overflow-hidden" style={{ height, minWidth: 60 }}>
        {shown.map((r, i) => (
          <span
            key={i}
            className="block"
            style={{ width: Math.max(4, 60 / shown.length), backgroundColor: STATUS_META[r.status].dot }}
            title={`${r.accountName}: ROI ${r.roi.toFixed(2)}`}
          />
        ))}
      </div>
      <span className="text-[10.5px] text-[var(--muted)] ml-1 font-mono">▣ {total}</span>
      {material.variance >= 1.5 && (
        <AlertTriangle size={11} className="text-[#f97316]" />
      )}
    </div>
  )
}

export function VarianceIndicator({ value }: { value: number }) {
  if (value < 0.5) return null
  const tone = value >= 1.5 ? "warn" : "info"
  const cls = tone === "warn" ? "text-[#f97316]" : "text-[#0ea5e9]"
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10.5px] font-semibold", cls)}>
      <AlertTriangle size={10} />
      Δ {value.toFixed(1)}
    </span>
  )
}

export function Sparkline({ values, color = "#18181b", w = 60, h = 20 }: { values: number[]; color?: string; w?: number; h?: number }) {
  if (values.length === 0) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = w / Math.max(values.length - 1, 1)
  const points = values.map((v, i) => `${(i * stepX).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`).join(" ")
  const last = values[values.length - 1]
  const prev = values[0]
  const trend = last - prev
  return (
    <span className="inline-flex items-center gap-1">
      <svg width={w} height={h} className="overflow-visible">
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {Math.abs(trend) > 0.05 && (
        trend > 0
          ? <TrendingUp size={11} className="text-[#16a34a]" />
          : <TrendingDown size={11} className="text-[#dc2626]" />
      )}
    </span>
  )
}
