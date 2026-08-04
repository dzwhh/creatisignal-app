"use client"

/**
 * 素材诊断 —— 唯一的素材操作入口。
 *
 * 每条 Product × Creative 只有一个 active 诊断结果、一组证据和一个主动作，
 * 抽屉里按「结论 → 依据 → 建议 → 执行」四段推进，不跳出页面。
 */

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  Info,
  Target,
} from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  BENCHMARK_SCOPE,
  CREATIVES,
  DECISION_ACTIONABLE_ORDER,
  DECISION_FILTER_ORDER,
  DECISION_PASSIVE_ORDER,
  DECISION_STATUS_META,
  DECISION_SUMMARY,
  PRODUCTS,
  countByStatus,
  ctrIndex,
  cvrIndex,
  formatMoney,
  indexDelta,
  roiIndex,
  type CreativeDiagnosis,
  type DecisionStatus,
  type DeliveryIntent,
} from "@/lib/insights/decision-mock"
import {
  CreativeThumb,
  DecisionBadge,
  Delta,
  EmptyState,
  FilterChip,
  PageHeader,
  Surface,
} from "./decision-ui"
import { CreativeDiagnosisDrawer } from "./creative-diagnosis-drawer"
import { ProductPicker } from "./product-picker"

const pageMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
}

const ROW_TEMPLATE = "minmax(260px,1.4fr) minmax(210px,1fr) minmax(250px,1.2fr) minmax(150px,.72fr)"

type StatusFilter = "pending" | "all" | DecisionStatus

export function CreativeDecision({
  productId,
  onCreateDelivery,
  onOpenDelivery,
}: {
  productId?: string | null
  onCreateDelivery: (intent: DeliveryIntent) => void
  onOpenDelivery: (productId: string) => void
}) {
  const [status, setStatus] = useState<StatusFilter>("pending")
  const [product, setProduct] = useState<string>(productId ?? "all")
  const [selected, setSelected] = useState<CreativeDiagnosis | null>(null)
  const [handled, setHandled] = useState<Record<string, string>>({})

  const scoped = useMemo(
    () => (product === "all" ? CREATIVES : CREATIVES.filter((creative) => creative.productId === product)),
    [product]
  )
  const counts = useMemo(() => countByStatus(scoped), [scoped])
  const pendingTotal = DECISION_ACTIONABLE_ORDER.reduce((sum, key) => sum + counts[key], 0)
  const passiveTotal = DECISION_PASSIVE_ORDER.reduce((sum, key) => sum + counts[key], 0)

  const rows = useMemo(() => {
    if (status === "all") return scoped
    if (status === "pending") return scoped.filter((creative) => DECISION_STATUS_META[creative.status].actionable)
    return scoped.filter((creative) => creative.status === status)
  }, [scoped, status])

  const grouped = useMemo(() => {
    return PRODUCTS.map((item) => ({ product: item, creatives: rows.filter((creative) => creative.productId === item.id) })).filter(
      (group) => group.creatives.length > 0
    )
  }, [rows])

  return (
    <motion.div {...pageMotion} className="mx-auto w-full max-w-[1480px] p-5 lg:p-6">
      <PageHeader
        eyebrow="Action first"
        title="素材诊断"
        description="每条素材只有一个诊断结果、一个原因和一个可执行动作"
        aside={<BenchmarkPill />}
      />

      <DecisionSummary
        counts={counts}
        pendingTotal={pendingTotal}
        passiveTotal={passiveTotal}
        active={status}
        onPick={setStatus}
      />

      {/* 左侧状态 chip 可横向滚动，右侧商品选择器固定不滚走 */}
      <div className="mb-3 mt-4 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5">
          <FilterChip active={status === "pending"} label="全部待处理" count={pendingTotal} onClick={() => setStatus("pending")} />
          <FilterChip active={status === "all"} label="全部" count={scoped.length} onClick={() => setStatus("all")} />
          <span className="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" />
          {DECISION_FILTER_ORDER.map((key) => (
            <FilterChip
              key={key}
              active={status === key}
              label={DECISION_STATUS_META[key].label}
              count={counts[key]}
              tone={key === "scale" ? "lime" : "dark"}
              onClick={() => setStatus(key)}
            />
          ))}
        </div>
        <ProductPicker value={product} onChange={setProduct} fromOverview={Boolean(productId) && product === productId} />
      </div>

      {grouped.length === 0 ? (
        <Surface>
          <EmptyState
            title="该状态下暂无素材"
            description="换一个状态筛选，或回到「全部待处理」继续今天的诊断队列。"
            action={
              <Button variant="outline" onClick={() => setStatus("pending")}>
                回到全部待处理
              </Button>
            }
          />
        </Surface>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ product: item, creatives }) => (
            <Surface key={item.id} className="overflow-hidden">
              <header className="flex items-end justify-between gap-4 border-b border-[var(--line)] bg-[var(--soft-2)] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-extrabold text-[var(--text)]">
                    商品：{item.name}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-[var(--muted)]">
                    SKU {item.sku} · {item.country} · 目标 ROI {item.targetRoi.toFixed(2)} · 当前 ROI {item.roi.toFixed(2)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className={cn("border-0", item.roi >= item.targetRoi ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800")}>
                    {item.roi >= item.targetRoi ? "当前商品可放量" : "当前商品未达目标"}
                  </Badge>
                  <span className="text-[10.5px] tabular-nums text-[var(--muted)]">{creatives.length} 条</span>
                </div>
              </header>
              <div
                className="grid gap-3 border-b border-[var(--line)] px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--muted)]"
                style={{ gridTemplateColumns: ROW_TEMPLATE }}
              >
                <span>素材</span>
                <span>核心结果（对 Benchmark）</span>
                <span>诊断结果与依据</span>
                <span className="text-right">下一步</span>
              </div>
              <AnimatePresence mode="popLayout">
                {creatives.map((creative) => (
                  <CreativeRow
                    key={creative.id}
                    creative={creative}
                    handledLabel={handled[creative.id]}
                    onSelect={() => setSelected(creative)}
                  />
                ))}
              </AnimatePresence>
            </Surface>
          ))}
        </div>
      )}

      <CreativeDiagnosisDrawer
        key={selected?.id ?? "closed"}
        creative={selected}
        onClose={() => setSelected(null)}
        onCreateDelivery={(intent) => {
          setHandled((prev) => ({ ...prev, [intent.sourceCreativeId]: "已执行 · 待发布" }))
          onCreateDelivery(intent)
        }}
        onMarkHandled={(id, label) => setHandled((prev) => ({ ...prev, [id]: label }))}
        onOpenDelivery={onOpenDelivery}
      />
    </motion.div>
  )
}

// ─── 今日诊断摘要 ────────────────────────────────────────────────────────────

function DecisionSummary({
  counts,
  pendingTotal,
  passiveTotal,
  active,
  onPick,
}: {
  counts: Record<DecisionStatus, number>
  pendingTotal: number
  passiveTotal: number
  active: StatusFilter
  onPick: (status: StatusFilter) => void
}) {
  if (pendingTotal === 0) {
    return (
      <Surface className="border-emerald-100 bg-emerald-50/50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[15px] font-extrabold text-[var(--text)]">今天无需处理</p>
            <p className="mt-1 text-[11.5px] text-[var(--muted)]">
              当前筛选下所有素材都在稳定投放或待观察，系统会在指标越界时自动生成新的待处理任务。
            </p>
          </div>
          <Button variant="outline" onClick={() => onPick("observe")}>
            <Eye size={14} />
            查看观察中任务
          </Button>
        </div>
      </Surface>
    )
  }

  return (
    <Surface className="border-[#e5f4b8] bg-gradient-to-br from-[#f7ffe4] to-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[17px] font-extrabold tracking-tight text-[var(--text)]">
            今天有 {pendingTotal} 条素材需要处理
          </h3>
          <p className="mt-1 text-[11.5px] text-[var(--muted)]">
            系统已按影响优先级排序 · 处理后预计减少无效消耗 {formatMoney(DECISION_SUMMARY.riskSpendPerDay)} / 日
            {DECISION_SUMMARY.isEstimated ? (
              <span className="ml-1.5 rounded border border-[var(--line)] px-1 text-[9px] font-bold text-[var(--muted-2)]">Mock 预估</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-stretch gap-2.5">
        {DECISION_ACTIONABLE_ORDER.map((key) => {
          const meta = DECISION_STATUS_META[key]
          const selected = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onPick(selected ? "pending" : key)}
              aria-pressed={selected}
              className={cn(
                "flex min-w-[168px] flex-1 cursor-pointer items-center gap-3 rounded-xl border bg-white px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
                selected ? "border-[var(--near-black)] ring-1 ring-[var(--near-black)]/10" : "border-[var(--line)]"
              )}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${meta.dot}1f` }}>
                <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.dot }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10.5px] font-semibold text-[var(--muted)]">{meta.label}</span>
                <span className="mt-0.5 block text-[20px] font-extrabold leading-none tabular-nums text-[var(--text)]">
                  {counts[key]}
                  <span className="ml-0.5 text-[11px] font-bold text-[var(--muted)]">条</span>
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-[var(--soft)] px-2 py-1 text-[10px] font-bold text-[var(--muted)]">
                {meta.shortAction}
              </span>
            </button>
          )
        })}

        <div className="flex min-w-[176px] flex-col justify-center rounded-xl border border-dashed border-[var(--line-strong)] bg-white/60 px-3.5 py-3">
          <span className="text-[10.5px] font-semibold text-[var(--muted)]">无需立即处理</span>
          <span className="mt-1 text-[11.5px] font-bold text-[var(--text)]">
            稳定投放 {counts.stable} · 待观察 {counts.observe}
          </span>
          <button
            type="button"
            onClick={() => onPick("stable")}
            className="mt-1.5 flex cursor-pointer items-center gap-1 text-[10.5px] font-bold text-[var(--muted)] hover:text-[var(--text)]"
          >
            查看 {passiveTotal} 条
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </Surface>
  )
}

// ─── Benchmark 口径 ──────────────────────────────────────────────────────────

function BenchmarkPill() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-3.5 text-[11px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--line-strong)]"
        >
          <Target size={12} className="text-[var(--muted)]" />
          <span className="text-[var(--muted)]">Benchmark</span>
          {BENCHMARK_SCOPE.label}
          <Info size={11} className="text-[var(--muted-2)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[320px] rounded-[14px] border border-[var(--line)] bg-white p-4 shadow-[0_18px_42px_rgba(9,9,11,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <p className="text-[12.5px] font-extrabold text-[var(--text)]">Benchmark 口径</p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--muted)]">
            默认使用同商品、同国家、近 7 日成熟素材的去极值均值。第一版不开放自定义权重。
          </p>
          <dl className="mt-3 space-y-2 text-[10.5px]">
            {[
              ["样本数", `${BENCHMARK_SCOPE.sampleSize} 条${BENCHMARK_SCOPE.excludeSelf ? "（已排除当前素材）" : ""}`],
              ["回退层级", BENCHMARK_SCOPE.fallbackLevel],
              ["更新时间", BENCHMARK_SCOPE.updatedAt],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <dt className="text-[var(--muted)]">{label}</dt>
                <dd className="text-right font-bold text-[var(--text)]">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 rounded-lg bg-[var(--soft-2)] px-2.5 py-2 text-[10px] leading-relaxed text-[var(--muted)]">
            {BENCHMARK_SCOPE.note}
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── 素材诊断行 ──────────────────────────────────────────────────────────────

function CreativeRow({
  creative,
  handledLabel,
  onSelect,
}: {
  creative: CreativeDiagnosis
  handledLabel?: string
  onSelect: () => void
}) {
  const meta = DECISION_STATUS_META[creative.status]
  const roiDelta = indexDelta(roiIndex(creative))
  const ordersDelta = Math.round((creative.orders / Math.max(creative.benchmarkOrders, 1) - 1) * 100)
  const ctrDelta = indexDelta(ctrIndex(creative))
  const cvrDelta = indexDelta(cvrIndex(creative))

  return (
    <motion.button
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      type="button"
      onClick={onSelect}
      className="group grid w-full items-center gap-3 border-b border-[var(--line)] px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-[#fbfdf6] focus-visible:bg-[#fbfdf6] focus-visible:outline-none"
      style={{ gridTemplateColumns: ROW_TEMPLATE }}
    >
      <span className="flex min-w-0 items-center gap-3">
        <CreativeThumb accent={creative.accent} className="h-14 w-10" />
        <span className="min-w-0">
          <span className="block truncate font-mono text-[12px] font-extrabold text-[var(--text)]">{creative.id}</span>
          <span className="mt-0.5 block truncate text-[10.5px] text-[var(--muted)]">
            {creative.title} · {creative.format}
          </span>
          <span className="mt-0.5 block truncate text-[10px] text-[var(--muted-2)]">
            {creative.sample}样本 · 投放 {creative.ageDays} 天
          </span>
          <Badge className="mt-1 border-0 bg-[var(--soft)] text-[var(--muted)]">{creative.issueTag}</Badge>
        </span>
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-3">
          <span className="min-w-0">
            <span className="block text-[9.5px] text-[var(--muted)]">ROI</span>
            <span className="flex items-center gap-1.5">
              <strong className={cn("text-[15px] tabular-nums", creative.roi >= creative.targetRoi ? "text-emerald-600" : "text-red-500")}>
                {creative.roi.toFixed(2)}
              </strong>
              <Delta value={roiDelta} />
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-[9.5px] text-[var(--muted)]">订单</span>
            <span className="flex items-center gap-1.5">
              <strong className="text-[15px] tabular-nums text-[var(--text)]">{creative.orders}</strong>
              <Delta value={ordersDelta} />
            </span>
          </span>
        </span>
        <span className="mt-1.5 block text-[10.5px] tabular-nums text-[var(--muted)]">
          CTR {creative.ctr.toFixed(2)}% {ctrDelta === 0 ? "≈ 均值" : `${ctrDelta > 0 ? "↑" : "↓"}${Math.abs(ctrDelta)}%`}
          {" · "}
          CVR {creative.cvr.toFixed(2)}% {cvrDelta === 0 ? "≈ 均值" : `${cvrDelta > 0 ? "↑" : "↓"}${Math.abs(cvrDelta)}%`}
        </span>
        <span className="mt-0.5 block text-[10px] text-[var(--muted-2)]">
          消耗 {formatMoney(creative.spend)} · GMV {formatMoney(creative.gmv)}
        </span>
      </span>

      <span className="min-w-0">
        {creative.protection ? (
          <Badge className="border-0 bg-zinc-100 text-zinc-700">素材链路正常</Badge>
        ) : (
          <DecisionBadge status={creative.status} />
        )}
        <span className="mt-1.5 block truncate text-[11.5px] font-bold text-[var(--text)]">{creative.reason}</span>
        <span className="mt-0.5 block truncate text-[10.5px] text-[var(--muted)]">{creative.evidence}</span>
      </span>

      <span className="flex items-center justify-end gap-1.5">
        {handledLabel ? (
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 text-[11.5px] font-bold text-emerald-700">
            <Check size={13} strokeWidth={2.6} />
            {handledLabel}
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex h-9 items-center rounded-full px-3.5 text-[11.5px] font-bold transition-colors",
              creative.protection
                ? "border border-[var(--line)] bg-white text-[var(--muted)]"
                : creative.status === "scale"
                  ? "bg-[var(--lime)] text-[var(--near-black)]"
                  : creative.status === "stop"
                    ? "border border-red-200 bg-red-50 text-red-600"
                    : meta.actionable
                      ? "bg-[var(--near-black)] text-white"
                      : "border border-[var(--line)] bg-white text-[var(--text)]"
            )}
          >
            {creative.protection ? "查看商品诊断" : meta.action}
          </span>
        )}
        <ChevronRight size={14} className="text-[var(--muted-2)] transition-transform group-hover:translate-x-0.5" />
      </span>
    </motion.button>
  )
}
