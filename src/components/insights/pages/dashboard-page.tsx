"use client"

import { useMemo, useRef, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  ChevronDown,
  Crown,
  DollarSign,
  ExternalLink,
  Globe2,
  Layers,
  MousePointerClick,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { MATERIALS } from "@/lib/insights/mock"
import { type DateRange } from "@/lib/insights/types"

// ─── Metrics ────────────────────────────────────────────────────────────────

type MetricKey = "spend" | "ctr" | "cvr" | "orders" | "revenue" | "roi"

type MetricMeta = {
  label: string
  short: string
  value: string
  delta: number
  color: string
  icon: LucideIcon
  trend: number[]
  unit: string                      // 纵坐标 title 用
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
  spend:   { label: "Spend",          short: "Spend",   value: "$324.8K",  delta: +12.4, color: "#3b82f6", icon: DollarSign,         unit: "USD",    trend: genTrend(1, 22000, 3800),   format: (n) => `$${(n / 1000).toFixed(1)}K` },
  ctr:     { label: "CTR",            short: "CTR",     value: "4.82%",    delta: +0.6,  color: "#84cc16", icon: MousePointerClick,  unit: "%",      trend: genTrend(2, 4.7, 0.55),     format: (n) => `${n.toFixed(2)}%` },
  cvr:     { label: "CVR",            short: "CVR",     value: "3.14%",    delta: -0.2,  color: "#06b6d4", icon: TrendingUp,         unit: "%",      trend: genTrend(3, 3.0, 0.4),      format: (n) => `${n.toFixed(2)}%` },
  orders:  { label: "Orders",         short: "Orders",  value: "12,486",   delta: +18.2, color: "#f59e0b", icon: ShoppingCart,       unit: "单",     trend: genTrend(4, 820, 130),      format: (n) => Math.round(n).toLocaleString() },
  revenue: { label: "Gross revenue",  short: "GMV",     value: "$1.84M",   delta: +22.1, color: "#ec4899", icon: BarChart3,          unit: "USD",    trend: genTrend(5, 120000, 22000), format: (n) => `$${(n / 1000).toFixed(0)}K` },
  roi:     { label: "ROI",            short: "ROI",     value: "5.67",     delta: +0.42, color: "#8b5cf6", icon: Sparkles,           unit: "x",      trend: genTrend(6, 5.4, 0.8),      format: (n) => n.toFixed(2) },
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

// ─── Distribution dimensions（行业 / 视频元素） ─────────────────────────────

type DimensionKind = "industry" | "element"

type DimItem = {
  code: string
  name: string
  spend: number
  orders: number
  revenue: number
  roi: number
}

const INDUSTRIES: DimItem[] = [
  { code: "tools",   name: "工具户外",     spend: 86400, orders: 3820, revenue: 498000, roi: 5.76 },
  { code: "beauty",  name: "美妆个护",     spend: 64200, orders: 2960, revenue: 372000, roi: 5.80 },
  { code: "tech",    name: "3C 数码",      spend: 58400, orders: 2240, revenue: 316000, roi: 5.41 },
  { code: "home",    name: "家居装饰",     spend: 42800, orders: 1880, revenue: 248000, roi: 5.79 },
  { code: "fashion", name: "服饰配饰",     spend: 38400, orders: 1620, revenue: 218000, roi: 5.68 },
  { code: "fitness", name: "运动健身",     spend: 26400, orders: 1120, revenue: 152000, roi: 5.76 },
  { code: "food",    name: "食品饮料",     spend: 21600, orders:  960, revenue: 118000, roi: 5.46 },
  { code: "baby",    name: "母婴亲子",     spend: 15600, orders:  680, revenue:  86000, roi: 5.51 },
]

const ELEMENTS: DimItem[] = [
  { code: "hook_q",     name: "Hook · 痛点反问",   spend: 72400, orders: 3240, revenue: 418000, roi: 5.77 },
  { code: "hook_c",     name: "Hook · 强反差",     spend: 58200, orders: 2680, revenue: 342000, roi: 5.88 },
  { code: "scene_out",  name: "场景 · 户外通勤",   spend: 48400, orders: 2120, revenue: 276000, roi: 5.70 },
  { code: "demo_cmp",   name: "Demo · 对比演示",   spend: 41600, orders: 1880, revenue: 242000, roi: 5.82 },
  { code: "cta_qr",     name: "CTA · 二维码下载",  spend: 36800, orders: 1620, revenue: 208000, roi: 5.65 },
  { code: "ugc_rev",    name: "UGC · 测评开箱",    spend: 32400, orders: 1480, revenue: 188000, roi: 5.80 },
  { code: "scene_kit",  name: "场景 · 厨房日常",   spend: 21600, orders:  920, revenue: 124000, roi: 5.74 },
  { code: "cta_link",   name: "CTA · 下方链接",    spend: 15600, orders:  720, revenue:  90000, roi: 5.77 },
]

function pickDim(d: DimItem, key: MetricKey): number {
  switch (key) {
    case "spend":   return d.spend
    case "orders":  return d.orders
    case "revenue": return d.revenue
    case "roi":     return d.roi
    case "ctr":     return (d.orders / Math.max(d.spend / 25, 1)) * 100
    case "cvr":     return (d.orders / Math.max(d.spend / 12, 1)) * 100
  }
}

function formatDimValue(value: number, key: MetricKey): string {
  switch (key) {
    case "spend":
    case "revenue": return `$${(value / 1000).toFixed(1)}K`
    case "orders":  return value.toLocaleString()
    case "roi":     return `${value.toFixed(2)}x`
    case "ctr":
    case "cvr":     return `${value.toFixed(2)}%`
  }
}

// 通过 fingerprint hash 把 materials 稳定分配到 industry / element
function materialDimCode(fp: string, kind: DimensionKind): string {
  let h = 0
  for (let i = 0; i < fp.length; i++) h = (h * 31 + fp.charCodeAt(i)) >>> 0
  if (kind === "industry") return INDUSTRIES[h % INDUSTRIES.length].code
  return ELEMENTS[(h + 7) % ELEMENTS.length].code
}

// 给每条素材稳定派生一个时长 label（用于 top 列表预览角标）
function materialDuration(fp: string): string {
  let h = 0
  for (let i = 0; i < fp.length; i++) h = (h * 17 + fp.charCodeAt(i)) >>> 0
  const sec = 10 + (h % 26)  // 10-35s
  return `00:${String(sec).padStart(2, "0")}`
}

interface Props {
  accountIds: string[]
  dateRange: DateRange
}

export function DashboardPage(_: Props) {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(() => new Set(["spend", "revenue"]))
  const [rankMetric, setRankMetric] = useState<MetricKey>("orders")
  const [distMetric, setDistMetric] = useState<MetricKey>("spend")
  const [dimKind, setDimKind] = useState<DimensionKind>("industry")

  function toggleMetric(k: MetricKey) {
    setSelectedMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(k)) {
        if (next.size === 1) return next
        next.delete(k)
      } else {
        next.add(k)
      }
      return next
    })
  }

  const topMaterials = useMemo(() => {
    return [...MATERIALS]
      .sort((a, b) => pickMaterialMetric(b, rankMetric) - pickMaterialMetric(a, rankMetric))
      .slice(0, 8)
  }, [rankMetric])

  const dimItems = dimKind === "industry" ? INDUSTRIES : ELEMENTS
  const sortedDim = useMemo(() => {
    return [...dimItems].sort((a, b) => pickDim(b, distMetric) - pickDim(a, distMetric))
  }, [dimItems, distMetric])

  const [selectedDim, setSelectedDim] = useState<string>(INDUSTRIES[0].code)

  // tab 切换时默认选第一名
  function switchDimKind(k: DimensionKind) {
    setDimKind(k)
    const list = k === "industry" ? INDUSTRIES : ELEMENTS
    const sorted = [...list].sort((a, b) => pickDim(b, distMetric) - pickDim(a, distMetric))
    setSelectedDim(sorted[0]?.code ?? "")
  }

  const dimMaterials = useMemo(() => {
    const filtered = MATERIALS.filter((m) => materialDimCode(m.fingerprint, dimKind) === selectedDim)
    return [...filtered]
      .sort((a, b) => pickMaterialMetric(b, distMetric) - pickMaterialMetric(a, distMetric))
      .slice(0, 6)
  }, [selectedDim, distMetric, dimKind])

  return (
    <div className="px-8 py-6 space-y-5 max-w-[1400px] mx-auto">
      {/* KPI 指标牌 */}
      <section className="grid grid-cols-6 gap-3">
        {METRIC_ORDER.map((k) => {
          const meta = METRIC_META[k]
          const selected = selectedMetrics.has(k)
          const up = meta.delta >= 0
          const Icon = meta.icon
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggleMetric(k)}
              aria-pressed={selected}
              className={cn(
                "rounded-lg bg-white p-4 text-left cursor-pointer transition-all relative border",
                selected
                  ? "border-[#84cc16] ring-1 ring-[#84cc16]/15"
                  : "border-[var(--line)] hover:border-[var(--line-strong)]"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                    selected
                      ? "bg-[var(--lime-soft)] text-[#5a7821]"
                      : "bg-transparent text-[var(--muted)]"
                  )}
                >
                  <Icon size={15} strokeWidth={1.8} />
                </span>
                {selected && <Check size={11} strokeWidth={2.4} className="text-[var(--near-black)]" />}
              </div>
              <p className="text-xs text-[var(--muted)] mt-3">{meta.label}</p>
              <p className="text-2xl font-semibold tracking-tight text-[var(--text)] mt-1 leading-none tabular-nums">{meta.value}</p>
              <p
                className={cn(
                  "text-xs mt-2 font-medium flex items-center gap-0.5 tabular-nums",
                  up ? "text-emerald-600" : "text-red-600"
                )}
              >
                {up ? <ArrowUp size={11} strokeWidth={2} /> : <ArrowDown size={11} strokeWidth={2} />}
                {up ? "+" : ""}{meta.delta}%
                <span className="text-[var(--muted)] font-normal ml-1">较上期</span>
              </p>
            </button>
          )
        })}
      </section>

      {/* 趋势图 — 去除 header 下划线 + 加 Y 轴 title */}
      <section className="rounded-lg border border-[var(--line)] bg-white overflow-hidden">
        <header className="px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">指标趋势</h2>
            <p className="text-xs text-[var(--muted)] mt-1">点击上方指标牌切换，多选叠加趋势线</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {METRIC_ORDER.filter((k) => selectedMetrics.has(k)).map((k) => {
              const meta = METRIC_META[k]
              return (
                <span
                  key={k}
                  className="inline-flex items-center gap-1.5 h-6 px-2 rounded text-xs font-medium bg-[var(--soft)] text-[var(--text)]"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.short}
                </span>
              )
            })}
          </div>
        </header>
        <div className="px-5 pb-5">
          <AreaChart selectedMetrics={Array.from(selectedMetrics)} />
        </div>
      </section>

      {/* 投放分布 — 行业 / 视频元素 tabs */}
      <section className="rounded-lg border border-[var(--line)] bg-white overflow-hidden">
        <header className="px-5 py-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-md flex items-center justify-center bg-[var(--soft)] text-[var(--text)] shrink-0">
              {dimKind === "industry" ? <Globe2 size={14} strokeWidth={1.8} /> : <Layers size={14} strokeWidth={1.8} />}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[var(--text)]">投放分布</h2>
              <p className="text-xs text-[var(--muted)] mt-1">点击左侧排行联动右侧 Top 素材</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* shadcn-style segmented tabs */}
            <div className="inline-flex h-9 items-center rounded-md bg-[var(--soft)] p-1">
              {([
                { id: "industry", label: "行业" },
                { id: "element",  label: "视频元素" },
              ] as { id: DimensionKind; label: string }[]).map((t) => {
                const active = dimKind === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => switchDimKind(t.id)}
                    data-state={active ? "active" : "inactive"}
                    className={cn(
                      "h-7 px-3 rounded text-xs font-medium transition cursor-pointer",
                      active
                        ? "bg-white text-[var(--text)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
            <MetricSelector value={distMetric} onChange={setDistMetric} />
          </div>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] divide-x divide-[var(--line)] border-t border-[var(--line)]">
          <div className="p-5">
            <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide mb-3">
              {dimKind === "industry" ? "行业排行" : "视频元素排行"} · {METRIC_META[distMetric].label}
            </p>
            <ol className="space-y-1">
              {sortedDim.map((c, i) => {
                const value = pickDim(c, distMetric)
                const max = pickDim(sortedDim[0], distMetric)
                const widthPct = Math.max(6, (value / max) * 100)
                const active = c.code === selectedDim
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => setSelectedDim(c.code)}
                      className={cn(
                        "w-full rounded-md px-2.5 py-2 text-left transition-colors cursor-pointer",
                        active ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]/60"
                      )}
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-xs text-[var(--muted)] tabular-nums w-4">{i + 1}</span>
                        <span className="text-[var(--text)] flex-1 truncate font-medium">{c.name}</span>
                        <span className="tabular-nums text-[var(--text)] text-sm">
                          {formatDimValue(value, distMetric)}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-[var(--soft-2)] overflow-hidden mt-2 ml-6">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${widthPct}%`, backgroundColor: METRIC_META[distMetric].color }}
                        />
                      </div>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="p-5 bg-[var(--soft-2)]/30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
                Top 素材 · <span className="text-[var(--text)]">{dimItems.find((c) => c.code === selectedDim)?.name}</span>
              </p>
              <span className="text-xs text-[var(--muted)] tabular-nums">{dimMaterials.length} 条</span>
            </div>
            {dimMaterials.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-xs text-[var(--muted)]">
                该项暂无素材
              </div>
            ) : (
              <ol className="space-y-2">
                {dimMaterials.map((m, i) => (
                  <li
                    key={m.fingerprint}
                    className="flex items-center gap-2.5 rounded-md bg-white border border-[var(--line)] p-2"
                  >
                    <span className="w-5 h-5 rounded bg-[var(--soft)] text-xs font-medium text-[var(--muted)] flex items-center justify-center shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="w-8 h-10 rounded overflow-hidden bg-[var(--soft)] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.thumb} alt={m.name} className="w-full h-full object-cover" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text)] truncate">{m.name}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5 tabular-nums">
                        ROI {m.metrics.roi.toFixed(2)}x · {m.metrics.orders.toLocaleString()} orders
                      </p>
                    </div>
                    <span className="text-sm tabular-nums text-[var(--text)] font-medium">
                      {formatMaterialMetricValue(m, distMetric)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      {/* Top 素材榜（重新设计） */}
      <section className="rounded-lg border border-[var(--line)] bg-white overflow-hidden">
        <header className="px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">
              Top 素材（按 {METRIC_META[rankMetric].label}）
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">切换排序指标查看不同视角的爆款</p>
          </div>
          <MetricSelector value={rankMetric} onChange={setRankMetric} />
        </header>
        <div className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--soft-2)]/70">
                  <th className="text-left whitespace-nowrap px-4 py-2.5 text-xs font-medium text-[var(--muted)] rounded-l-md">排名</th>
                  <th className="text-left whitespace-nowrap px-3 py-2.5 text-xs font-medium text-[var(--muted)]">素材预览</th>
                  <th className="text-left whitespace-nowrap px-3 py-2.5 text-xs font-medium text-[var(--muted)]">素材名称</th>
                  <th className="text-right whitespace-nowrap px-3 py-2.5 text-xs font-medium text-[var(--muted)]">消耗(USD)</th>
                  <th className="text-right whitespace-nowrap px-3 py-2.5 text-xs font-medium text-[var(--muted)]">GMV(USD)</th>
                  <th className="text-right whitespace-nowrap px-3 py-2.5 text-xs font-medium text-[var(--muted)]">ROI</th>
                  <th className="text-right whitespace-nowrap px-3 py-2.5 text-xs font-medium text-[var(--muted)]">CTR</th>
                  <th className="text-right whitespace-nowrap px-3 py-2.5 text-xs font-medium text-[var(--muted)]">CVR</th>
                  <th className="text-right whitespace-nowrap px-4 py-2.5 text-xs font-medium text-[var(--muted)] rounded-r-md">操作</th>
                </tr>
              </thead>
              <tbody>
                {topMaterials.map((m, i) => (
                  <tr key={m.fingerprint} className="border-b border-[var(--line)] last:border-b-0 hover:bg-[var(--soft-2)]/40 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3">
                      <RankBadge rank={i + 1} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="relative w-16 h-10 rounded-md overflow-hidden bg-[var(--soft)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.thumb} alt={m.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 inline-flex items-center h-3.5 px-1 rounded text-[9px] font-medium bg-black/70 text-white tabular-nums">
                          {materialDuration(m.fingerprint)}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[var(--text)] font-medium">{m.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-[var(--text)]">{m.metrics.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-[var(--text)]">{Math.round(m.metrics.spend * m.metrics.roi).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums font-medium text-[#5a7821]">{m.metrics.roi.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-[var(--text)]">{(m.metrics.ctr * 100).toFixed(2)}%</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-[var(--text)]">{((m.metrics.cvr ?? 0) * 100).toFixed(2)}%</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        aria-label="查看详情"
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer transition"
                      >
                        <ExternalLink size={12} strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              className="h-8 px-4 rounded-md border border-[var(--line)] text-xs font-medium text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer transition"
            >
              查看更多
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Rank badge ─────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#fef3c7]">
        <Crown size={14} className="text-[#d97706]" fill="#f59e0b" strokeWidth={1.6} />
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f1f5f9]">
        <Crown size={14} className="text-[#64748b]" fill="#94a3b8" strokeWidth={1.6} />
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#fde6d3]">
        <Crown size={14} className="text-[#c2410c]" fill="#ea580c" strokeWidth={1.6} />
      </span>
    )
  }
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 text-sm text-[var(--muted)] tabular-nums font-medium">
      {rank}
    </span>
  )
}

// ─── helpers ────────────────────────────────────────────────────────────────

function pickMaterialMetric(m: typeof MATERIALS[number], key: MetricKey): number {
  switch (key) {
    case "spend":   return m.metrics.spend
    case "ctr":     return m.metrics.ctr
    case "cvr":     return m.metrics.cvr ?? 0
    case "orders":  return m.metrics.orders
    case "revenue": return m.metrics.spend * m.metrics.roi
    case "roi":     return m.metrics.roi
  }
}

function formatMaterialMetricValue(m: typeof MATERIALS[number], key: MetricKey): string {
  const v = pickMaterialMetric(m, key)
  switch (key) {
    case "spend":   return `$${v.toLocaleString()}`
    case "revenue": return `$${Math.round(v).toLocaleString()}`
    case "orders":  return v.toLocaleString()
    case "roi":     return `${v.toFixed(2)}x`
    case "ctr":
    case "cvr":     return `${(v * 100).toFixed(2)}%`
  }
}

// ─── Shadcn-style smooth area chart with Y-axis title ──────────────────────

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

function AreaChart({ selectedMetrics }: { selectedMetrics: MetricKey[] }) {
  const W = 1080
  const H = 280
  const PAD = { l: 56, r: 16, t: 24, b: 36 }
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b

  // 主指标（用于 Y 轴 title）
  const primary = selectedMetrics[0]
  const primaryMeta = primary ? METRIC_META[primary] : null

  // 全局 [min, max]（基于主指标，给 Y 轴刻度用）
  const yLabelTicks = useMemo(() => {
    if (!primaryMeta) return []
    const min = Math.min(...primaryMeta.trend)
    const max = Math.max(...primaryMeta.trend)
    const span = Math.max(max - min, 0.0001)
    const step = span / 4
    return [0, 1, 2, 3, 4].map((i) => primaryMeta.format(max - step * i))
  }, [primaryMeta])

  const series = selectedMetrics.map((k) => {
    const meta = METRIC_META[k]
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
    return { key: k, meta, points, linePath, areaPath }
  })

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = ((e.clientX - rect.left) / rect.width) * W
    const stepX = innerW / (TREND_LEN - 1)
    const idx = Math.max(0, Math.min(TREND_LEN - 1, Math.round((px - PAD.l) / stepX)))
    setHoverIdx(idx)
  }

  const hoverX = hoverIdx !== null ? PAD.l + hoverIdx * (innerW / (TREND_LEN - 1)) : null
  const tooltipLeftPct = hoverX !== null ? (hoverX / W) * 100 : 0
  const tooltipAnchorRight = tooltipLeftPct > 70

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[280px] select-none"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={`g-${s.key}`} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={s.meta.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={s.meta.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Y 轴 title（左上） */}
        {primaryMeta && (
          <text x={PAD.l - 8} y={14} fontSize="11" fill="#71717a" textAnchor="end" fontWeight="500">
            {primaryMeta.short}({primaryMeta.unit})
          </text>
        )}

        {/* Y 轴刻度 + 横虚线 */}
        {yLabelTicks.map((label, i) => {
          const y = PAD.t + (innerH / 4) * i
          return (
            <g key={i}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#e4e4e7" strokeDasharray="3 4" strokeWidth={1} />
              <text x={PAD.l - 8} y={y + 3} fontSize="10" fill="#a1a1aa" textAnchor="end" fontWeight="400">
                {label}
              </text>
            </g>
          )
        })}

        {/* X 轴日期 */}
        {DAY_LABELS.map((label, i) => {
          if (i % 2 !== 0) return null
          const x = PAD.l + (innerW / (TREND_LEN - 1)) * i
          return (
            <text key={i} x={x} y={H - 8} textAnchor="middle" fontSize="10" fill="#a1a1aa">
              {label}
            </text>
          )
        })}

        {/* 每条线 area + stroke */}
        {series.map((s) => (
          <g key={s.key}>
            <path d={s.areaPath} fill={`url(#g-${s.key})`} />
            <path d={s.linePath} fill="none" stroke={s.meta.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}

        {/* hover crosshair + dots */}
        {hoverIdx !== null && hoverX !== null && (
          <g>
            <line x1={hoverX} y1={PAD.t} x2={hoverX} y2={PAD.t + innerH} stroke="#a1a1aa" strokeDasharray="2 3" strokeWidth={1} />
            {series.map((s) => {
              const p = s.points[hoverIdx]
              return (
                <circle key={`d-${s.key}`} cx={p.x} cy={p.y} r={3.5} fill="white" stroke={s.meta.color} strokeWidth={1.8} />
              )
            })}
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          className="absolute pointer-events-none rounded-md border border-[var(--line)] bg-white shadow-md px-3 py-2 text-xs min-w-[140px]"
          style={{
            top: 8,
            left: tooltipAnchorRight ? "auto" : `calc(${tooltipLeftPct}% + 8px)`,
            right: tooltipAnchorRight ? `calc(${100 - tooltipLeftPct}% + 8px)` : "auto",
          }}
        >
          <p className="text-[var(--muted)] mb-1.5 tabular-nums">{DAY_LABELS[hoverIdx]}</p>
          <ul className="space-y-1">
            {series.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[var(--muted)]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.meta.color }} />
                  {s.meta.short}
                </span>
                <span className="font-medium text-[var(--text)] tabular-nums">
                  {s.meta.format(s.points[hoverIdx].v)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Metric selector ────────────────────────────────────────────────────────

function MetricSelector({ value, onChange }: { value: MetricKey; onChange: (k: MetricKey) => void }) {
  const meta = METRIC_META[value]
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-md border border-[var(--line)] bg-white text-sm font-medium text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)] shrink-0 transition"
        >
          <span className="text-[var(--muted)] font-normal">排序</span>
          <span>{meta.label}</span>
          <ChevronDown size={12} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[200px] p-1 bg-white border border-[var(--line)] rounded-md shadow-md"
        >
          {METRIC_ORDER.map((k) => {
            const m = METRIC_META[k]
            const active = k === value
            return (
              <Popover.Close key={k} asChild>
                <button
                  type="button"
                  onClick={() => onChange(k)}
                  className={cn(
                    "w-full h-8 px-2.5 rounded text-sm text-left cursor-pointer flex items-center gap-2 transition-colors",
                    active ? "bg-[var(--soft)] font-medium" : "hover:bg-[var(--soft-2)]"
                  )}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="flex-1 text-[var(--text)]">{m.label}</span>
                  {active && <Check size={12} strokeWidth={2} className="text-[var(--text)]" />}
                </button>
              </Popover.Close>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
