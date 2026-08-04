"use client"

/**
 * 经营总览 —— 先理解经营变化，再进入商品与素材动作。
 *
 * 上半部分（指标卡 + 趋势图 + 投放操作日志）由 OverviewTrendSection 保留；
 * 下半部分按 PRD 改为「今天先处理什么」的商品诊断队列 + 右侧商品经营诊断抽屉。
 */

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Check, ChevronDown, ChevronRight, Rocket, Sparkles } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DECISION_STATUS_META,
  PRODUCTS,
  PRODUCT_DIAGNOSIS_META,
  PRODUCT_TAIL_SUMMARY,
  creativesByProduct,
  formatMoney,
  type ProductDiagnosis,
  type ProductDiagnosisType,
} from "@/lib/insights/decision-mock"
import {
  ConclusionBox,
  ContextTable,
  CreativeThumb,
  DecisionBadge,
  DecisionDrawer,
  Delta,
  DrawerStepper,
  EmptyState,
  EvidenceCard,
  FilterChip,
  PageHeader,
  ProductThumb,
  ResultCallout,
  SectionTitle,
  Surface,
  TableHead,
} from "./decision-ui"
import { OverviewTrendSection } from "./overview-trend"

const pageMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
}

const ROW_TEMPLATE = "minmax(240px,1.35fr) minmax(150px,.8fr) minmax(210px,1.05fr) minmax(230px,1.15fr) minmax(150px,.75fr)"

type ProductFilter = "all" | ProductDiagnosisType
type SortKey = "impact" | "gap" | "spend"

const SORT_OPTIONS: Array<{ id: SortKey; label: string }> = [
  { id: "impact", label: "预估 GMV 影响从高到低" },
  { id: "gap", label: "ROI 缺口从大到小" },
  { id: "spend", label: "消耗从高到低" },
]

const CALLOUT_TONE_BY_TYPE: Record<ProductDiagnosisType, "good" | "warn" | "info" | "neutral"> = {
  growth: "good",
  creative: "warn",
  product: "info",
  observe: "neutral",
}

export function BusinessOverview({
  onOpenCreative,
  onOpenDelivery,
}: {
  onOpenCreative: (productId: string) => void
  onOpenDelivery: (productId: string) => void
}) {
  const [filter, setFilter] = useState<ProductFilter>("all")
  const [sort, setSort] = useState<SortKey>("impact")
  const [selected, setSelected] = useState<ProductDiagnosis | null>(null)

  const counts = useMemo(() => {
    return PRODUCTS.reduce<Record<ProductDiagnosisType, number>>(
      (acc, product) => {
        acc[product.diagnosisType] += 1
        return acc
      },
      { growth: 0, creative: 0, product: 0, observe: 0 }
    )
  }, [])

  const rows = useMemo(() => {
    const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter((product) => product.diagnosisType === filter)
    return [...filtered].sort((a, b) => {
      if (sort === "gap") return a.roi / a.targetRoi - b.roi / b.targetRoi
      if (sort === "spend") return b.spend - a.spend
      return b.gmvImpactPerDay - a.gmvImpactPerDay
    })
  }, [filter, sort])

  const actionableCount = counts.creative + counts.growth

  return (
    <motion.div {...pageMotion} className="mx-auto w-full max-w-[1480px] p-5 lg:p-6">
      <OverviewTrendSection />

      <div className="mt-6">
        <PageHeader
          eyebrow="Diagnose first"
          title="今天先处理什么"
          description="系统已把趋势变化归因到商品，再定位到具体素材与下一步动作"
          aside={<Badge className="border-0 bg-[var(--near-black)] text-white">{actionableCount} 个商品待处理</Badge>}
        />

        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <FilterChip active={filter === "all"} label="全部商品" count={PRODUCTS.length} onClick={() => setFilter("all")} />
            {(Object.keys(PRODUCT_DIAGNOSIS_META) as ProductDiagnosisType[])
              .filter((type) => counts[type] > 0)
              .map((type) => (
                <FilterChip
                  key={type}
                  active={filter === type}
                  label={PRODUCT_DIAGNOSIS_META[type].filterLabel}
                  count={counts[type]}
                  onClick={() => setFilter(type)}
                />
              ))}
          </div>
          <SortPicker value={sort} onChange={setSort} />
        </div>

        <Surface className="overflow-hidden">
          <TableHead
            template={ROW_TEMPLATE}
            columns={["商品经营问题清单", "经营结果", "素材信号（对 Benchmark）", "系统判断", "下一步"]}
            rightAlignLast
          />
          {rows.length === 0 ? (
            <EmptyState title="该分类下暂无商品" description="切换筛选查看其他商品，或回到全部商品继续处理今日队列。" />
          ) : (
            rows.map((product) => (
              <ProductRow key={product.id} product={product} onSelect={() => setSelected(product)} />
            ))
          )}
          <div className="flex items-center justify-between gap-3 bg-[var(--soft-2)] px-4 py-3">
            <span className="text-[10.5px] text-[var(--muted)]">
              另有 {PRODUCT_TAIL_SUMMARY.total - PRODUCTS.length} 个商品未进入今日处理队列 · 其中 {PRODUCT_TAIL_SUMMARY.observing} 个待观察
            </span>
            <button type="button" className="flex cursor-pointer items-center gap-1 text-[10.5px] font-bold text-[var(--text)] hover:underline">
              查看全部商品
              <ArrowRight size={12} />
            </button>
          </div>
        </Surface>
      </div>

      <ProductDiagnosisDrawer
        product={selected}
        onClose={() => setSelected(null)}
        onOpenCreative={onOpenCreative}
        onOpenDelivery={onOpenDelivery}
      />
    </motion.div>
  )
}

// ─── 商品行 ──────────────────────────────────────────────────────────────────

function ProductRow({ product, onSelect }: { product: ProductDiagnosis; onSelect: () => void }) {
  const meta = PRODUCT_DIAGNOSIS_META[product.diagnosisType]
  const roiDelta = Math.round((product.roi / product.targetRoi - 1) * 100)
  const creativeIssue = product.diagnosisType !== "product"
  const pendingCount = Object.entries(product.statusCounts)
    .filter(([status]) => DECISION_STATUS_META[status as keyof typeof DECISION_STATUS_META].actionable)
    .reduce((sum, [, count]) => sum + (count ?? 0), 0)

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group grid w-full items-center gap-3 border-b border-[var(--line)] px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-[#fbfdf6] focus-visible:bg-[#fbfdf6] focus-visible:outline-none"
      style={{ gridTemplateColumns: ROW_TEMPLATE }}
    >
      <span className="flex min-w-0 items-center gap-3">
        <ProductThumb accent={product.accent} label={product.name} className="size-11" />
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-extrabold text-[var(--text)]">{product.name}</span>
          <span className="mt-0.5 block truncate text-[10px] text-[var(--muted)]">
            {product.sku} · {product.category}
          </span>
          {product.priorityTag ? (
            <Badge className="mt-1 border-0 bg-[var(--lime-soft)] text-[#5c7a00]">{product.priorityTag}</Badge>
          ) : null}
        </span>
      </span>

      <span className="min-w-0">
        <span className="block text-[10px] text-[var(--muted)]">GMV</span>
        <strong className="block text-[13px] tabular-nums text-[var(--text)]">{formatMoney(product.gmv)}</strong>
        <span className="mt-1 flex items-center gap-1.5">
          <strong className={cn("text-[12px] tabular-nums", product.roi >= product.targetRoi ? "text-emerald-600" : "text-red-500")}>
            ROI {product.roi.toFixed(2)}
          </strong>
          <Delta value={roiDelta} />
        </span>
        <span className="mt-0.5 block text-[10px] text-[var(--muted)]">目标 {product.targetRoi.toFixed(2)}</span>
      </span>

      <span className="min-w-0 space-y-0.5">
        {product.signals.map((signal) => (
          <span key={signal} className="block truncate text-[10.5px] leading-relaxed text-[var(--muted)]">
            {signal}
          </span>
        ))}
      </span>

      <span className="min-w-0">
        <Badge className={cn("border-0", meta.className)}>{meta.label}</Badge>
        <span className="mt-1.5 block truncate text-[11.5px] font-bold text-[var(--text)]">{product.headline}</span>
        <span className="mt-0.5 block truncate text-[10px] text-[var(--muted)]">{product.detail}</span>
        <span className="mt-0.5 block truncate text-[10px] text-[var(--muted)]">{product.impact}</span>
      </span>

      <span className="flex items-center justify-end gap-1.5">
        <span
          className={cn(
            "inline-flex h-9 items-center rounded-full px-3.5 text-[11.5px] font-bold transition-colors",
            creativeIssue
              ? product.diagnosisType === "growth"
                ? "bg-[var(--lime)] text-[var(--near-black)]"
                : "bg-[var(--near-black)] text-white"
              : "border border-[var(--line)] bg-white text-[var(--text)]"
          )}
        >
          {creativeIssue ? `处理 ${pendingCount} 条素材` : "查看商品问题"}
        </span>
        <ChevronRight size={14} className="text-[var(--muted-2)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text)]" />
      </span>
    </button>
  )
}

// ─── 排序控件 ────────────────────────────────────────────────────────────────

function SortPicker({ value, onChange }: { value: SortKey; onChange: (value: SortKey) => void }) {
  const current = SORT_OPTIONS.find((option) => option.id === value) ?? SORT_OPTIONS[0]
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] bg-white px-3.5 text-[11.5px] font-semibold text-[var(--text)] transition-colors hover:border-[var(--line-strong)] data-[state=open]:border-[var(--line-strong)]"
        >
          <span className="text-[var(--muted)]">排序</span>
          {current.label}
          <ChevronDown size={12} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[240px] rounded-[14px] border border-[var(--line)] bg-white p-1.5 shadow-[0_18px_42px_rgba(9,9,11,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {SORT_OPTIONS.map((option) => (
            <Popover.Close key={option.id} asChild>
              <button
                type="button"
                onClick={() => onChange(option.id)}
                className={cn(
                  "flex h-9 w-full cursor-pointer items-center gap-2 rounded-[9px] px-2.5 text-left text-[12px] transition-colors",
                  option.id === value ? "bg-[var(--soft)] font-bold text-[var(--text)]" : "text-[var(--muted)] hover:bg-[var(--soft-2)] hover:text-[var(--text)]"
                )}
              >
                <span className="flex-1">{option.label}</span>
                {option.id === value ? <Check size={12} strokeWidth={2.6} /> : null}
              </button>
            </Popover.Close>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── 商品经营诊断抽屉 ────────────────────────────────────────────────────────

function ProductDiagnosisDrawer({
  product,
  onClose,
  onOpenCreative,
  onOpenDelivery,
}: {
  product: ProductDiagnosis | null
  onClose: () => void
  onOpenCreative: (productId: string) => void
  onOpenDelivery: (productId: string) => void
}) {
  if (!product) return null

  const meta = PRODUCT_DIAGNOSIS_META[product.diagnosisType]
  const creatives = creativesByProduct(product.id)
  const actionable = creatives.filter((creative) => DECISION_STATUS_META[creative.status].actionable)
  const ctrDelta = Math.round((product.ctr / product.benchmarkCtr - 1) * 100)
  const cvrDelta = Math.round((product.cvr / product.benchmarkCvr - 1) * 100)
  const aovDelta = Math.round((product.aov / product.benchmarkAov - 1) * 100)
  const isCreativeIssue = product.diagnosisType !== "product"
  const preview = actionable.slice(0, 3)

  return (
    <DecisionDrawer
      open
      title="商品经营诊断"
      description={`${product.name} · ${product.sku}`}
      onOpenChange={(open) => !open && onClose()}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10.5px] text-[var(--muted)]">
            {isCreativeIssue ? "跳转后自动保留商品、国家与日期筛选" : "素材动作已禁用，避免用换素材解释非素材问题"}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              稍后处理
            </Button>
            {isCreativeIssue ? (
              <Button
                variant="primary"
                onClick={() => {
                  onClose()
                  onOpenCreative(product.id)
                }}
              >
                <Sparkles size={14} />
                查看 {actionable.length} 条素材诊断
                <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onClose()
                  onOpenDelivery(product.id)
                }}
              >
                <Rocket size={14} />
                查看商品与投放诊断
              </Button>
            )}
          </div>
        </div>
      }
    >
      <DrawerStepper steps={["经营判断", "素材诊断", "执行动作", "结果回流"]} current={1} />

      <ResultCallout
        tone={CALLOUT_TONE_BY_TYPE[product.diagnosisType]}
        badge={<Badge className={cn("border-0", meta.className)}>{meta.label}</Badge>}
        headline={product.headline}
        lines={[
          `商品 ROI ${product.roi.toFixed(2)}，目标 ${product.targetRoi.toFixed(2)} · ${product.impact}`,
          product.detail,
        ]}
      />

      <SectionTitle>系统为什么这样判断</SectionTitle>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <EvidenceCard
          label="CTR"
          value={`${product.ctr.toFixed(2)}%`}
          hint={`均值 ${product.benchmarkCtr.toFixed(2)}% · ${ctrDelta >= 0 ? "+" : ""}${ctrDelta}%`}
          tone={ctrDelta >= -10 ? "good" : "bad"}
        />
        <EvidenceCard
          label="CVR"
          value={`${product.cvr.toFixed(2)}%`}
          hint={`均值 ${product.benchmarkCvr.toFixed(2)}% · ${cvrDelta >= 0 ? "+" : ""}${cvrDelta}%`}
          tone={cvrDelta >= -10 ? "good" : "bad"}
        />
        <EvidenceCard
          label="AOV"
          value={`$${product.aov.toFixed(1)}`}
          hint={`均值 $${product.benchmarkAov.toFixed(1)} · ${aovDelta >= 0 ? "+" : ""}${aovDelta}%`}
          tone={aovDelta >= -10 ? "good" : "bad"}
        />
      </div>

      <div className="mb-5">
        <ConclusionBox
          tone={isCreativeIssue ? "neutral" : "info"}
          title={product.attribution.conclusion}
          detail={product.attribution.detail}
        />
      </div>

      <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">共 {creatives.length} 条</span>}>
        受影响素材
      </SectionTitle>
      <div className="mb-5 space-y-2">
        {preview.length === 0 ? (
          <p className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] px-3.5 py-3 text-[11px] leading-relaxed text-[var(--muted)]">
            该商品下所有素材均为稳定投放或待观察，系统不会给出素材动作。
          </p>
        ) : (
          preview.map((creative) => (
            <div key={creative.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-2.5">
              <CreativeThumb accent={creative.accent} className="h-11 w-8" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] font-bold text-[var(--text)]">素材 {creative.id.slice(0, 6)}…</span>
                <span className="mt-0.5 block truncate text-[10px] text-[var(--muted)]">
                  CTR {creative.ctr.toFixed(2)}% · CVR {creative.cvr.toFixed(2)}%
                </span>
              </span>
              <DecisionBadge status={creative.status} />
            </div>
          ))
        )}
        {actionable.length > preview.length ? (
          <p className="px-1 text-[10.5px] text-[var(--muted)]">
            另有 {actionable.length - preview.length} 条待处理 · {creatives.length - actionable.length} 条稳定或待观察
          </p>
        ) : null}
      </div>

      <SectionTitle>{isCreativeIssue ? "进入素材诊断后自动带入" : "建议改为检查的对象"}</SectionTitle>
      <ContextTable
        rows={
          isCreativeIssue
            ? [
                { label: "商品", value: product.name, hint: product.sku },
                { label: "国家 / 账户", value: `${product.country} · 全部账户`, hint: "与当前经营总览筛选保持一致" },
                { label: "日期窗口", value: "近 7 天", hint: "Benchmark 使用同商品同国家近 7 日成熟素材" },
                {
                  label: "默认状态",
                  value: Object.entries(product.statusCounts)
                    .map(([status, count]) => `${DECISION_STATUS_META[status as keyof typeof DECISION_STATUS_META].label} ${count}`)
                    .join(" · "),
                },
              ]
            : [
                { label: "价格 / Offer", value: `AOV $${product.aov.toFixed(1)}`, hint: `低于均值 ${Math.abs(aovDelta)}%，折扣结束后客单下降` },
                { label: "素材链路", value: "正常，无需更换", hint: "CTR、CVR 均在基准线上" },
                { label: "投放设置", value: "建议复核目标 ROI 与毛利安全线", hint: "在投放中心确认调整后再观察" },
              ]
        }
      />
    </DecisionDrawer>
  )
}
