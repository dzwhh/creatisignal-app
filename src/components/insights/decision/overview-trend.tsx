"use client"

/**
 * 经营总览上半部分 —— 指标卡 + 双指标趋势图 + 投放操作日志。
 *
 * 这一段是重构中明确保留的交互：
 * - 指标卡多选，直接切换趋势图里的曲线
 * - 趋势图 hover 出十字线、tooltip，并汇总当日操作
 * - 图表下方事件轴每个标记对应一天的投放操作日志，点击打开日志抽屉（可增删改）
 */

import { useMemo, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  DollarSign,
  MousePointerClick,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ActivityLogDrawer } from "@/components/insights/activity-log-drawer"
import { ACTIVITY_KIND_META, SEED_ACTIVITY_LOGS, type ActivityLog } from "@/lib/insights/activity-log"

// ─── 指标定义 ────────────────────────────────────────────────────────────────

type MetricKey = "spend" | "ctr" | "cvr" | "orders" | "revenue" | "roi"

type MetricMeta = {
  label: string
  short: string
  value: string
  delta: number
  color: string
  icon: LucideIcon
  trend: number[]
  unit: string
  format: (n: number) => string
}

const TREND_LEN = 14

function genTrend(seed: number, base: number, amp: number): number[] {
  return Array.from({ length: TREND_LEN }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.7) * amp + i * amp * 0.04
    return Math.max(0, Math.round((base + wave) * 100) / 100)
  })
}

const METRIC_META: Record<MetricKey, MetricMeta> = {
  spend:   { label: "Spend",         short: "Spend",  value: "$324.8K", delta: +12.4, color: "#3b82f6", icon: DollarSign,        unit: "USD", trend: genTrend(1, 22000, 3800),   format: (n) => `$${(n / 1000).toFixed(1)}K` },
  ctr:     { label: "CTR",           short: "CTR",    value: "4.82%",   delta: +0.6,  color: "#84cc16", icon: MousePointerClick, unit: "%",   trend: genTrend(2, 4.7, 0.55),     format: (n) => `${n.toFixed(2)}%` },
  cvr:     { label: "CVR",           short: "CVR",    value: "3.14%",   delta: -0.2,  color: "#06b6d4", icon: TrendingUp,        unit: "%",   trend: genTrend(3, 3.0, 0.4),      format: (n) => `${n.toFixed(2)}%` },
  orders:  { label: "Orders",        short: "Orders", value: "12,486",  delta: +18.2, color: "#f59e0b", icon: ShoppingCart,      unit: "单",  trend: genTrend(4, 820, 130),      format: (n) => Math.round(n).toLocaleString() },
  revenue: { label: "Gross revenue", short: "GMV",    value: "$1.84M",  delta: +22.1, color: "#ec4899", icon: BarChart3,         unit: "USD", trend: genTrend(5, 120000, 22000), format: (n) => `$${(n / 1000).toFixed(0)}K` },
  roi:     { label: "ROI",           short: "ROI",    value: "5.67",    delta: +0.42, color: "#8b5cf6", icon: Sparkles,          unit: "x",   trend: genTrend(6, 5.4, 0.8),      format: (n) => n.toFixed(2) },
}

const METRIC_ORDER: MetricKey[] = ["spend", "ctr", "cvr", "orders", "revenue", "roi"]

function buildDayLabels(): string[] {
  const labels: string[] = []
  const now = new Date()
  for (let i = TREND_LEN - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    labels.push(`${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`)
  }
  return labels
}
const DAY_LABELS = buildDayLabels()

// ─── 对外组件 ────────────────────────────────────────────────────────────────

export function OverviewTrendSection() {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(() => new Set(["spend", "revenue"]))
  const [logs, setLogs] = useState<ActivityLog[]>(SEED_ACTIVITY_LOGS)
  const [logDrawerOpen, setLogDrawerOpen] = useState(false)
  const [logDayIndex, setLogDayIndex] = useState<number | null>(null)

  function toggleMetric(key: MetricKey) {
    setSelectedMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return next
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function openLogDrawer(dayIndex: number) {
    setLogDayIndex(dayIndex)
    setLogDrawerOpen(true)
  }

  return (
    <>
      {/* 六张经营指标卡 —— 点击切换趋势图主指标 */}
      <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-6">
        {METRIC_ORDER.map((key) => {
          const meta = METRIC_META[key]
          const selected = selectedMetrics.has(key)
          const up = meta.delta >= 0
          const Icon = meta.icon
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleMetric(key)}
              aria-pressed={selected}
              className={cn(
                "relative rounded-xl border bg-white p-3.5 text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-sm",
                selected ? "border-[#84cc16] ring-1 ring-[#84cc16]/20" : "border-[var(--line)] hover:border-[var(--line-strong)]"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md transition-colors",
                    selected ? "bg-[var(--lime-soft)] text-[#5a7821]" : "bg-[var(--soft)] text-[var(--muted)]"
                  )}
                >
                  <Icon size={14} strokeWidth={1.9} />
                </span>
                {selected ? <Check size={12} strokeWidth={2.4} className="text-[#5a7821]" /> : null}
              </div>
              <p className="mt-3 text-[10.5px] font-semibold text-[var(--muted)]">{meta.label}</p>
              <p className="mt-0.5 text-[21px] font-extrabold leading-none tracking-tight tabular-nums text-[var(--text)]">
                {meta.value}
              </p>
              <p className={cn("mt-2 flex items-center gap-0.5 text-[10px] font-semibold tabular-nums", up ? "text-emerald-600" : "text-red-500")}>
                {up ? <ArrowUp size={10} strokeWidth={2.2} /> : <ArrowDown size={10} strokeWidth={2.2} />}
                {up ? "+" : ""}
                {meta.delta}%
                <span className="ml-1 font-medium text-[var(--muted)]">较上期</span>
              </p>
            </button>
          )
        })}
      </section>

      {/* 指标趋势 —— 事件轴与诊断事件共用时间轴 */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
        <header className="flex items-start justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="text-[15px] font-extrabold tracking-tight text-[var(--text)]">指标趋势</h2>
            <p className="mt-1 text-[11.5px] text-[var(--muted)]">
              点击上方指标卡切换曲线 · 点击图表下方事件标记查看当日投放操作日志
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span className="inline-flex h-6 items-center rounded-full border border-[var(--line)] px-2 text-[10.5px] font-semibold text-[var(--muted)]">
              近 14 日
            </span>
            {METRIC_ORDER.filter((key) => selectedMetrics.has(key)).map((key) => {
              const meta = METRIC_META[key]
              return (
                <span key={key} className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[var(--soft)] px-2 text-[10.5px] font-semibold text-[var(--text)]">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.short}
                </span>
              )
            })}
          </div>
        </header>
        <div className="px-5 pb-5">
          <AreaChart selectedMetrics={Array.from(selectedMetrics)} logs={logs} onOpenLog={openLogDrawer} />
        </div>
      </section>

      <ActivityLogDrawer
        open={logDrawerOpen}
        onOpenChange={setLogDrawerOpen}
        dayIndex={logDayIndex}
        dayLabel={logDayIndex !== null ? DAY_LABELS[logDayIndex] : ""}
        logs={logs}
        onAdd={(log) => setLogs((prev) => [{ ...log, id: `u${prev.length}-${log.dayIndex}-${log.title}` }, ...prev])}
        onUpdate={(id, patch) => setLogs((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))}
        onDelete={(id) => setLogs((prev) => prev.filter((item) => item.id !== id))}
      />
    </>
  )
}

// ─── 平滑面积图 ──────────────────────────────────────────────────────────────

function smoothPath(points: Array<{ x: number; y: number }>, tension = 0.5): string {
  if (points.length < 2) return ""
  const t = (1 - tension) / 6
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) * t
    const cp1y = p1.y + (p2.y - p0.y) * t
    const cp2x = p2.x - (p3.x - p1.x) * t
    const cp2y = p2.y - (p3.y - p1.y) * t
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

function AreaChart({
  selectedMetrics,
  logs,
  onOpenLog,
}: {
  selectedMetrics: MetricKey[]
  logs: ActivityLog[]
  onOpenLog: (dayIndex: number) => void
}) {
  const W = 1080
  const H = 280
  const PAD = { l: 56, r: 16, t: 24, b: 36 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b

  const primary = selectedMetrics[0]
  const primaryMeta = primary ? METRIC_META[primary] : null

  const yLabelTicks = useMemo(() => {
    if (!primaryMeta) return []
    const min = Math.min(...primaryMeta.trend)
    const max = Math.max(...primaryMeta.trend)
    const span = Math.max(max - min, 0.0001)
    const step = span / 4
    return [0, 1, 2, 3, 4].map((i) => primaryMeta.format(max - step * i))
  }, [primaryMeta])

  const series = selectedMetrics.map((key) => {
    const meta = METRIC_META[key]
    const min = Math.min(...meta.trend)
    const max = Math.max(...meta.trend)
    const span = Math.max(max - min, 0.0001)
    const stepX = innerW / (meta.trend.length - 1)
    const points = meta.trend.map((v, i) => ({
      x: PAD.l + i * stepX,
      y: PAD.t + innerH * (1 - (v - min) / span),
      v,
    }))
    const linePath = smoothPath(points, 0.45)
    const last = points[points.length - 1]
    const first = points[0]
    const areaPath = `${linePath} L ${last.x.toFixed(2)} ${PAD.t + innerH} L ${first.x.toFixed(2)} ${PAD.t + innerH} Z`
    return { key, meta, points, linePath, areaPath }
  })

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((event.clientX - rect.left) / rect.width) * W
    const stepX = innerW / (TREND_LEN - 1)
    const idx = Math.max(0, Math.min(TREND_LEN - 1, Math.round((px - PAD.l) / stepX)))
    setHoverIdx(idx)
  }

  const hoverX = hoverIdx !== null ? PAD.l + hoverIdx * (innerW / (TREND_LEN - 1)) : null
  const tooltipLeftPct = hoverX !== null ? (hoverX / W) * 100 : 0
  const tooltipAnchorRight = tooltipLeftPct > 70

  const logCountByDay = useMemo(() => {
    const counts = new Array<number>(TREND_LEN).fill(0)
    for (const log of logs) {
      if (log.dayIndex >= 0 && log.dayIndex < TREND_LEN) counts[log.dayIndex]++
    }
    return counts
  }, [logs])

  const hoverLogs = hoverIdx !== null ? logs.filter((log) => log.dayIndex === hoverIdx) : []

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-[280px] w-full select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
        aria-label="近 14 日指标趋势"
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={`g-${s.key}`} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.meta.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={s.meta.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {primaryMeta ? (
          <text x={PAD.l - 8} y={14} fontSize="11" fill="#71717a" textAnchor="end" fontWeight="500">
            {primaryMeta.short}({primaryMeta.unit})
          </text>
        ) : null}

        {yLabelTicks.map((label, i) => {
          const y = PAD.t + (innerH / 4) * i
          return (
            <g key={label + i}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#e4e4e7" strokeDasharray="3 4" strokeWidth={1} />
              <text x={PAD.l - 8} y={y + 3} fontSize="10" fill="#a1a1aa" textAnchor="end">
                {label}
              </text>
            </g>
          )
        })}

        {DAY_LABELS.map((label, i) => {
          if (i % 2 !== 0) return null
          const x = PAD.l + (innerW / (TREND_LEN - 1)) * i
          return (
            <text key={label} x={x} y={H - 8} textAnchor="middle" fontSize="10" fill="#a1a1aa">
              {label}
            </text>
          )
        })}

        {series.map((s) => (
          <g key={s.key}>
            <path d={s.areaPath} fill={`url(#g-${s.key})`} />
            <path d={s.linePath} fill="none" stroke={s.meta.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}

        {hoverIdx !== null && hoverX !== null ? (
          <g>
            <line x1={hoverX} y1={PAD.t} x2={hoverX} y2={PAD.t + innerH} stroke="#a1a1aa" strokeDasharray="2 3" strokeWidth={1} />
            {series.map((s) => {
              const point = s.points[hoverIdx]
              return <circle key={`d-${s.key}`} cx={point.x} cy={point.y} r={3.5} fill="white" stroke={s.meta.color} strokeWidth={1.8} />
            })}
          </g>
        ) : null}
      </svg>

      {hoverIdx !== null ? (
        <div
          className="pointer-events-none absolute min-w-[150px] rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[11px] shadow-md"
          style={{
            top: 8,
            left: tooltipAnchorRight ? "auto" : `calc(${tooltipLeftPct}% + 8px)`,
            right: tooltipAnchorRight ? `calc(${100 - tooltipLeftPct}% + 8px)` : "auto",
          }}
        >
          <p className="mb-1.5 tabular-nums text-[var(--muted)]">{DAY_LABELS[hoverIdx]}</p>
          <ul className="space-y-1">
            {series.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[var(--muted)]">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: s.meta.color }} />
                  {s.meta.short}
                </span>
                <span className="font-bold tabular-nums text-[var(--text)]">{s.meta.format(s.points[hoverIdx].v)}</span>
              </li>
            ))}
          </ul>
          {hoverLogs.length > 0 ? (
            <div className="mt-2 border-t border-[var(--line)] pt-2">
              <p className="mb-1 text-[var(--muted)]">当日操作 {hoverLogs.length} 条</p>
              <ul className="space-y-0.5">
                {hoverLogs.slice(0, 3).map((log) => (
                  <li key={log.id} className="flex items-center gap-1.5">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: ACTIVITY_KIND_META[log.kind].color }} />
                    <span className="truncate text-[var(--text)]">{log.title}</span>
                  </li>
                ))}
                {hoverLogs.length > 3 ? <li className="text-[var(--muted-2)]">还有 {hoverLogs.length - 3} 条…</li> : null}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 事件轴 —— 每个标记 = 当日投放操作日志入口 */}
      <div className="relative mt-0.5 h-9">
        <span
          className="absolute top-1/2 -translate-y-1/2 text-[11px] font-medium text-[var(--muted-2)]"
          style={{ left: 0, width: `${((PAD.l - 8) / W) * 100}%`, textAlign: "right" }}
        >
          事件
        </span>
        {logCountByDay.map((count, i) => {
          if (count === 0) return null
          const leftPct = ((PAD.l + i * (innerW / (TREND_LEN - 1))) / W) * 100
          const dayLogs = logs.filter((log) => log.dayIndex === i)
          const meta = ACTIVITY_KIND_META[dayLogs[0].kind]
          return (
            <button
              key={DAY_LABELS[i]}
              type="button"
              onClick={() => onOpenLog(i)}
              onMouseEnter={() => setHoverIdx(i)}
              title={`${DAY_LABELS[i]} · ${count} 条操作日志`}
              className={cn(
                "absolute top-1/2 flex h-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-md border bg-white px-2 text-[11px] font-medium tabular-nums transition",
                hoverIdx === i ? "border-[var(--line-strong)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]" : "border-[var(--line)] hover:border-[var(--line-strong)]"
              )}
              style={{ left: `${leftPct}%` }}
            >
              <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} />
              <span className="text-[var(--text)]">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
