"use client"

import { useMemo, useState } from "react"
import {
  Target,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Wand2,
  ShoppingCart,
  Wallet,
  DollarSign,
  Pin,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCOUNTS, BRAND_KPI, DIAGNOSTIC_ISSUES, INDUSTRY_RANK, MATERIALS, SCENE_MATRIX, VIDEO_STYLE_RANK } from "@/lib/insights/mock"
import { type DateRange, type DiagnosticIssue, type Material } from "@/lib/insights/types"
import { ActionBadge, MaterialThumb, MoneyShort, Pct, StatusBadge, VarianceIndicator } from "../shared"
import type { InsightsTab } from "../insights-shell"
import type { TagRankRow } from "@/lib/insights/mock"
import { MaterialDrawer } from "../material-drawer"
import { BriefDrawer } from "../brief-drawer"

export function OverviewPage({
  accountIds,
  onJumpTab,
}: {
  accountIds: string[]
  dateRange: DateRange
  onJumpTab: (tab: InsightsTab) => void
}) {
  const accountSet = useMemo(() => new Set(accountIds), [accountIds])
  const filteredAccounts = useMemo(() => ACCOUNTS.filter((a) => accountSet.has(a.id)), [accountSet])

  // Recompute KPIs from selected accounts
  const kpi = useMemo(() => {
    const totalSpend = filteredAccounts.reduce((s, a) => s + a.metrics7d.spend, 0)
    const totalOrders = filteredAccounts.reduce((s, a) => s + a.metrics7d.orders, 0)
    const roi = totalSpend > 0
      ? Number((filteredAccounts.reduce((s, a) => s + a.metrics7d.spend * a.metrics7d.roi, 0) / totalSpend).toFixed(2))
      : 0
    const cpo = totalOrders > 0 ? Number((totalSpend / totalOrders).toFixed(2)) : 0
    const dailyOrders = Number((totalOrders / 7).toFixed(1))
    return {
      spend: totalSpend,
      orders: totalOrders,
      dailyOrders,
      roi,
      cpo,
    }
  }, [filteredAccounts])

  const [briefSeed, setBriefSeed] = useState<{ scene?: string; sellingPoint?: string; tag?: string } | null>(null)
  const [drawerMaterial, setDrawerMaterial] = useState<Material | null>(null)

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto space-y-5">
      {/* KPI cards row */}
      <div className="grid grid-cols-4 gap-3.5">
        <KpiCard
          icon={ShoppingCart}
          label="日均订单"
          value={kpi.dailyOrders.toFixed(1)}
          target={`目标 ${BRAND_KPI.dailyOrdersTarget}+`}
          progress={kpi.dailyOrders / BRAND_KPI.dailyOrdersTarget}
          accent="text"
          accountIds={accountIds}
          metricKey="orders"
        />
        <KpiCard
          icon={Target}
          label="ROI"
          value={kpi.roi.toFixed(2)}
          target={`目标 ${BRAND_KPI.roiTarget}+`}
          progress={kpi.roi / BRAND_KPI.roiTarget}
          accent="text"
          accountIds={accountIds}
          metricKey="roi"
        />
        <KpiCard
          icon={DollarSign}
          label="CPO"
          value={`$${kpi.cpo.toFixed(2)}`}
          target={`目标 $${BRAND_KPI.cpoTargetLow}-$${BRAND_KPI.cpoTargetHigh}`}
          progress={Math.min(1, BRAND_KPI.cpoTargetHigh / Math.max(kpi.cpo, 1))}
          accent="text"
          inverted
          accountIds={accountIds}
          metricKey="cpo"
        />
        <KpiCard
          icon={Wallet}
          label="总 Spend (7d)"
          value={<MoneyShort value={kpi.spend} />}
          target={`${filteredAccounts.length} 个账户`}
          progress={1}
          accent="text"
          accountIds={accountIds}
          metricKey="spend"
        />
      </div>

      {/* Diagnosis conclusion card */}
      <DiagnosisCard
        issues={DIAGNOSTIC_ISSUES}
        onGenerateBrief={() => setBriefSeed({})}
        onJumpDiagnose={() => onJumpTab("diagnose")}
        onJumpReport={() => onJumpTab("diagnose")}
      />

      {/* Tag split-view */}
      <TagSplitView onGenerateBriefForTag={(t) => setBriefSeed({ tag: t })} />

      {/* Scene × selling point matrix */}
      <SceneMatrix onCellClick={(s, p) => setBriefSeed({ scene: s, sellingPoint: p })} />

      {/* Top / Bottom materials */}
      <TopBottomMaterials onOpenMaterial={setDrawerMaterial} />

      {/* Drawers */}
      <MaterialDrawer material={drawerMaterial} onClose={() => setDrawerMaterial(null)} onSendBrief={() => setBriefSeed({})} />
      <BriefDrawer seed={briefSeed} onClose={() => setBriefSeed(null)} />
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  target,
  progress,
  inverted,
  accountIds,
  metricKey,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  value: React.ReactNode
  target: string
  progress: number
  accent: "text"
  inverted?: boolean
  accountIds: string[]
  metricKey: "orders" | "roi" | "cpo" | "spend"
}) {
  const [expanded, setExpanded] = useState(false)
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const onTrack = inverted ? progress >= 0.9 : progress >= 0.8
  const filteredAccounts = ACCOUNTS.filter((a) => accountIds.includes(a.id))
  // sort by underperformance vs target
  const sorted = [...filteredAccounts].sort((a, b) => {
    if (metricKey === "roi") return a.metrics7d.roi - b.metrics7d.roi
    if (metricKey === "cpo") return b.metrics7d.cpo - a.metrics7d.cpo
    if (metricKey === "orders") return a.metrics7d.orders - b.metrics7d.orders
    return b.metrics7d.spend - a.metrics7d.spend
  })

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted)]">
            <Icon size={13} strokeWidth={2} />
            {label}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer flex items-center gap-0.5"
          >
            按账户拆分
            <ChevronDown size={11} className={cn("transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <div className="text-[26px] font-extrabold text-[var(--text)] leading-none">{value}</div>
          <div className="text-[11px] text-[var(--muted)] font-semibold">{target}</div>
        </div>
        <div className="h-1.5 w-full bg-[var(--soft)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${clampedProgress * 100}%`,
              backgroundColor: onTrack ? "#22c55e" : clampedProgress >= 0.5 ? "#eab308" : "#ef4444",
            }}
          />
        </div>
      </div>
      {expanded && (
        <div className="border-t border-[var(--line)] bg-[var(--soft-2)] max-h-[180px] overflow-y-auto">
          {sorted.slice(0, 8).map((a) => (
            <div key={a.id} className="px-4 py-1.5 flex items-center justify-between border-b border-[var(--line)] last:border-b-0">
              <div className="min-w-0 flex items-center gap-2">
                <StatusBadge status={a.status} compact />
                <span className="text-[11.5px] font-semibold text-[var(--text)] truncate">{a.name}</span>
              </div>
              <span className="text-[11.5px] font-bold text-[var(--text)] shrink-0">
                {metricKey === "roi" && a.metrics7d.roi.toFixed(2)}
                {metricKey === "cpo" && `$${a.metrics7d.cpo.toFixed(2)}`}
                {metricKey === "orders" && a.metrics7d.orders}
                {metricKey === "spend" && <MoneyShort value={a.metrics7d.spend} />}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Diagnosis Conclusion Card ───────────────────────────────────────────────

function DiagnosisCard({
  issues,
  onGenerateBrief,
  onJumpDiagnose,
  onJumpReport,
}: {
  issues: DiagnosticIssue[]
  onGenerateBrief: () => void
  onJumpDiagnose: () => void
  onJumpReport: () => void
}) {
  return (
    <div className="rounded-2xl border border-[#fde68a] bg-[#fffbea] p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#fde68a] flex items-center justify-center shrink-0">
          <Sparkles size={17} strokeWidth={2.2} className="text-[#a16207]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-extrabold text-[var(--text)] mb-1">诊断结论</h3>
          <p className="text-[13px] text-[var(--text)] leading-relaxed mb-3">
            {BRAND_KPI.conclusion}
          </p>
          <div className="space-y-2 mb-4">
            {issues.map((iss) => (
              <div key={iss.id} className="flex items-start gap-2 text-[12.5px] text-[var(--text)] leading-relaxed">
                <span
                  className={cn(
                    "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                    iss.severity === "high" ? "bg-[#dc2626]" : iss.severity === "medium" ? "bg-[#f97316]" : "bg-[#eab308]"
                  )}
                />
                <div className="min-w-0">
                  <span className="font-bold">{iss.title}</span>
                  <span className="text-[var(--muted)]"> — {iss.detail}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onGenerateBrief}
              className="h-9 px-4 rounded-full bg-[#18181b] text-white text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Wand2 size={14} strokeWidth={2.2} />
              生成下一轮素材 Brief
            </button>
            <button
              type="button"
              onClick={onJumpDiagnose}
              className="h-9 px-4 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)] transition-colors"
            >
              查看高 CPO 原因
              <ArrowRight size={13} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={onJumpReport}
              className="h-9 px-4 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)] transition-colors"
            >
              查看完整报告
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tag Split-View ──────────────────────────────────────────────────────────

function TagSplitView({ onGenerateBriefForTag }: { onGenerateBriefForTag: (tag: string) => void }) {
  const [side, setSide] = useState<"industry" | "videoStyle">("industry")
  const rank = side === "industry" ? INDUSTRY_RANK : VIDEO_STYLE_RANK
  const [activeTag, setActiveTag] = useState<string>(rank[0]?.tag ?? "")
  const active = rank.find((r) => r.tag === activeTag) ?? rank[0]

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="text-[15px] font-extrabold text-[var(--text)] flex items-center gap-1.5">
          <Pin size={14} className="text-[var(--muted)]" />
          标签排行
        </h3>
        <div className="h-8 p-0.5 rounded-full bg-[var(--soft)] flex items-center">
          {(["industry", "videoStyle"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSide(s)
                const first = (s === "industry" ? INDUSTRY_RANK : VIDEO_STYLE_RANK)[0]
                if (first) setActiveTag(first.tag)
              }}
              className={cn(
                "h-7 px-3 rounded-full text-[12px] font-bold cursor-pointer transition-colors",
                side === s ? "bg-white text-[var(--text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              {s === "industry" ? "行业标签" : "视频风格"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-0 border-t border-[var(--line)]">
        {/* LEFT: bar list */}
        <div className="border-r border-[var(--line)] p-4 max-h-[480px] overflow-y-auto">
          <div className="space-y-1">
            {rank.map((row) => (
              <TagBar
                key={row.tag}
                row={row}
                maxCount={rank[0]?.count ?? 1}
                isActive={row.tag === activeTag}
                onClick={() => setActiveTag(row.tag)}
              />
            ))}
          </div>
        </div>
        {/* RIGHT: context panel */}
        <div className="p-5 bg-[var(--soft-2)]">
          {active && (
            <TagContextPanel
              row={active}
              onGenerateBrief={() => onGenerateBriefForTag(active.tag)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function TagBar({
  row,
  maxCount,
  isActive,
  onClick,
}: {
  row: TagRankRow
  maxCount: number
  isActive: boolean
  onClick: () => void
}) {
  const width = (row.count / maxCount) * 100
  // Color by ROI vs average (>=2 green, 1.5-2 yellow, <1.5 red)
  const barColor = row.roi >= 2 ? "#22c55e" : row.roi >= 1.5 ? "#eab308" : "#ef4444"
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full grid grid-cols-[112px_1fr_auto] items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer text-left transition-colors",
        isActive ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
      )}
    >
      <div className="min-w-0 flex items-center gap-1.5">
        <span className="text-[12.5px] font-semibold text-[var(--text)] truncate">{row.tag}</span>
        {row.roi < 1.5 && <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" title="ROI 低于均值" />}
      </div>
      <div className="relative h-3 bg-[var(--soft)] rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${width}%`, backgroundColor: barColor, opacity: isActive ? 1 : 0.85 }}
        />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {/* mini thumb avatars */}
        <span className="flex -space-x-1.5">
          {row.topMaterials.slice(0, 3).map((m) => (
            <span key={m.fingerprint} className="w-5 h-5 rounded-full border border-white overflow-hidden bg-[var(--soft)]">
              <img src={m.thumb} alt="" className="w-full h-full object-cover" />
            </span>
          ))}
        </span>
        <span className="text-[11px] font-bold text-[var(--text)] w-7 text-right">{row.count}</span>
      </div>
    </button>
  )
}

function TagContextPanel({
  row,
  onGenerateBrief,
}: {
  row: TagRankRow
  onGenerateBrief: () => void
}) {
  const weak = row.roi < 1.5
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-[16px] font-extrabold text-[var(--text)]">{row.tag}</h4>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5 font-semibold">
            {row.count} 个素材 · {row.accountCount} 个账户在投 · 总花费 <MoneyShort value={row.spend} />
          </p>
        </div>
        <div className="text-right">
          <p className={cn("text-[18px] font-extrabold", row.roi >= 2 ? "text-[#16a34a]" : row.roi >= 1.5 ? "text-[#a16207]" : "text-[#dc2626]")}>
            ROI {row.roi.toFixed(2)}
          </p>
          <p className="text-[11px] text-[var(--muted)]">CPO ${row.cpo.toFixed(2)}</p>
        </div>
      </div>
      {weak && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[#fff7ed] border border-[#fed7aa] text-[12px] text-[#9a3412] mb-3">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span>ROI 低于均值，重点诊断对象</span>
        </div>
      )}

      <p className="text-[11.5px] font-semibold text-[var(--muted)] mb-2">🏆 Top 5 素材</p>
      <div className="space-y-1.5 mb-4">
        {row.topMaterials.map((m) => (
          <div key={m.fingerprint} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-[var(--line)]">
            <MaterialThumb material={m} size={32} showPlay={false} />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-[var(--text)] truncate">{m.name}</p>
              <p className="text-[10.5px] text-[var(--muted)] truncate font-mono">
                ROI {m.metrics.roi.toFixed(2)} · CPO ${m.metrics.cpo.toFixed(2)} · ▣ {m.accountCount}
              </p>
            </div>
            <ActionBadge action={m.recommendation} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onGenerateBrief}
          className="h-9 rounded-full bg-[#18181b] text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Wand2 size={13} strokeWidth={2.2} />
          为该标签生成下一轮 Brief
        </button>
        <button
          type="button"
          className="h-9 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[12.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)] transition-colors"
        >
          查看全部 {row.count} 条素材
          <ArrowRight size={12} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

// ─── Scene × Selling Point Matrix ────────────────────────────────────────────

function SceneMatrix({ onCellClick }: { onCellClick: (scene: string, sellingPoint: string) => void }) {
  const scenes = Array.from(new Set(SCENE_MATRIX.map((c) => c.scene)))
  const points = Array.from(new Set(SCENE_MATRIX.map((c) => c.sellingPoint)))
  const cellByKey = new Map(SCENE_MATRIX.map((c) => [c.scene + "::" + c.sellingPoint, c]))

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-extrabold text-[var(--text)] flex items-center gap-1.5">
          <Target size={14} className="text-[var(--muted)]" />
          场景 × 卖点矩阵
        </h3>
        <span className="text-[11.5px] text-[var(--muted)]">颜色 = 最佳 ROI · 数字 = 素材数 · 点击格子生成 Brief</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr>
              <th className="text-left py-1.5 pr-3 text-[11px] font-semibold text-[var(--muted)] w-[110px]">场景 \ 卖点</th>
              {points.map((p) => (
                <th key={p} className="text-center py-1.5 px-1 text-[11px] font-semibold text-[var(--muted)] whitespace-nowrap">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenes.map((sc) => (
              <tr key={sc}>
                <td className="py-1 pr-3 text-[12px] font-semibold text-[var(--text)]">{sc}</td>
                {points.map((p) => {
                  const cell = cellByKey.get(sc + "::" + p)
                  return (
                    <td key={p} className="p-0.5">
                      <MatrixCell cell={cell} onClick={() => onCellClick(sc, p)} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MatrixCell({ cell, onClick }: { cell: { scene: string; sellingPoint: string; bestRoi: number; materialCount: number; totalSpend: number } | undefined; onClick: () => void }) {
  if (!cell || cell.materialCount === 0) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full h-12 rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] text-[var(--muted-2)] flex items-center justify-center text-[11px] cursor-pointer hover:border-[var(--muted)] hover:text-[var(--text)] transition-colors"
        title="该组合尚无素材 — 创意机会"
      >
        +
      </button>
    )
  }
  const roi = cell.bestRoi
  const bg =
    roi >= 2.5 ? "#16a34a"
    : roi >= 2 ? "#22c55e"
    : roi >= 1.5 ? "#eab308"
    : roi >= 1 ? "#f97316"
    : "#ef4444"
  const intensity = Math.min(1, roi / 3)
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-12 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-[var(--text)] transition-all"
      style={{ backgroundColor: bg, opacity: 0.55 + intensity * 0.45 }}
      title={`${cell.scene} × ${cell.sellingPoint} · ROI ${roi.toFixed(2)} · ${cell.materialCount} 条素材`}
    >
      <span className="text-[11.5px] font-extrabold text-white drop-shadow-sm">{roi.toFixed(1)}</span>
      <span className="text-[10px] text-white/90 font-semibold">{cell.materialCount} 条</span>
    </button>
  )
}

// ─── Top / Bottom Materials ──────────────────────────────────────────────────

function TopBottomMaterials({ onOpenMaterial }: { onOpenMaterial: (m: Material) => void }) {
  const sorted = [...MATERIALS].sort((a, b) => b.metrics.roi * b.metrics.spend - a.metrics.roi * a.metrics.spend)
  const top = sorted.slice(0, 5)
  const bottom = [...MATERIALS].sort((a, b) => a.metrics.roi - b.metrics.roi).slice(0, 5)

  return (
    <div className="grid grid-cols-2 gap-3.5">
      <MaterialBucket title="🏆 Top 5 素材" tone="ok" materials={top} onOpenMaterial={onOpenMaterial} />
      <MaterialBucket title="⚠️ 低效素材" tone="bad" materials={bottom} onOpenMaterial={onOpenMaterial} />
    </div>
  )
}

function MaterialBucket({
  title,
  materials,
  onOpenMaterial,
}: {
  title: string
  tone: "ok" | "bad"
  materials: Material[]
  onOpenMaterial: (m: Material) => void
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-extrabold text-[var(--text)]">{title}</h3>
        <button
          type="button"
          className="text-[11.5px] font-semibold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer flex items-center gap-0.5"
        >
          <Eye size={11} />
          全部
        </button>
      </div>
      <div className="space-y-2">
        {materials.map((m) => (
          <button
            key={m.fingerprint}
            type="button"
            onClick={() => onOpenMaterial(m)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--soft-2)] cursor-pointer transition-colors text-left"
          >
            <MaterialThumb material={m} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-bold text-[var(--text)] truncate">{m.name}</p>
              <p className="text-[11px] text-[var(--muted)] truncate font-mono">
                ROI {m.metrics.roi.toFixed(2)} · CTR <Pct value={m.metrics.ctr} /> · ▣ {m.accountCount}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-0.5">
              <ActionBadge action={m.recommendation} />
              <VarianceIndicator value={m.variance} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
