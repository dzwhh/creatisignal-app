"use client"

/**
 * 投放中心 —— 素材决策的执行层。
 *
 * 只回答三件事：哪些素材准备投、用什么约束投、投后现在该调整什么。
 * 所有建议都展示触发条件、实时证据与 Before/After，并由 AO 确认后才执行。
 */

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Layers3,
  Play,
  Rocket,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DECISION_STATUS_META,
  DELIVERY_ADJUSTMENTS,
  DELIVERY_HEALTH,
  DELIVERY_RECOMMENDATION_META,
  LIVE_DELIVERIES,
  formatMoney,
  productById,
  type DeliveryIntent,
  type LiveDelivery,
} from "@/lib/insights/decision-mock"
import {
  CompareRow,
  ConfirmDialog,
  CreativeThumb,
  DecisionBadge,
  DecisionDrawer,
  DrawerStepper,
  EmptyState,
  EvidenceCard,
  KpiTile,
  PageHeader,
  ProductThumb,
  ResultCallout,
  SectionTitle,
  Surface,
} from "./decision-ui"

const pageMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
}

const DRAFT_TEMPLATE = "minmax(300px,1.5fr) minmax(180px,.9fr) repeat(3,minmax(96px,.5fr)) minmax(150px,.7fr) 28px"
const LIVE_TEMPLATE = "minmax(240px,1.25fr) minmax(160px,.85fr) repeat(4,minmax(80px,.45fr)) minmax(220px,1.05fr) 28px"

type DeliveryTab = "drafts" | "live" | "history"

export function DeliveryCenter({
  drafts,
  focusProductId,
  onPublish,
  onOpenCreative,
}: {
  drafts: DeliveryIntent[]
  focusProductId?: string | null
  onPublish: (intent: DeliveryIntent) => void
  onOpenCreative: (productId: string) => void
}) {
  const [tab, setTab] = useState<DeliveryTab>("drafts")
  const [draft, setDraft] = useState<DeliveryIntent | null>(null)
  const [live, setLive] = useState<LiveDelivery | null>(null)
  const [applied, setApplied] = useState<Record<string, string>>({})

  const needAttention = useMemo(
    () => LIVE_DELIVERIES.filter((item) => item.recommendation !== "hold" && !applied[item.id]).length,
    [applied]
  )
  const focusProduct = focusProductId ? productById(focusProductId) : null

  const tabs: Array<{ id: DeliveryTab; label: string }> = [
    { id: "drafts", label: `待发布 ${drafts.length}` },
    { id: "live", label: `投放中 ${LIVE_DELIVERIES.length}` },
    { id: "history", label: `调整记录 ${DELIVERY_ADJUSTMENTS.length}` },
  ]

  return (
    <motion.div {...pageMotion} className="mx-auto w-full max-w-[1480px] p-5 lg:p-6">
      <PageHeader
        eyebrow="Close the loop"
        title="投放中心"
        description="把素材结论转换成可审阅的 GMV Max 配置，并持续给出投放调整建议"
        aside={
          <Button variant="primary" asChild>
            <Link href="/ads/gmv-max">
              <Rocket size={14} />
              新建 GMV Max
            </Link>
          </Button>
        }
      />

      {focusProduct ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[11.5px]">
          <Badge className="border-0 bg-[var(--lime-soft)] text-[#5c7a00]">来自经营总览</Badge>
          <span className="text-[var(--muted)]">
            商品 <strong className="text-[var(--text)]">{focusProduct.name}</strong> 判定为非素材问题，请优先复核目标 ROI 与商品 Offer
          </span>
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile icon={FileText} label="待发布方案" value={drafts.length} hint="来自素材诊断" />
        <KpiTile icon={Play} label="投放中" value={LIVE_DELIVERIES.length} hint={`${needAttention} 个需要处理`} />
        <KpiTile
          icon={Layers3}
          label="素材覆盖健康"
          value={`${Math.round((DELIVERY_HEALTH.coverageReady / DELIVERY_HEALTH.coverageTotal) * 100)}%`}
          hint={`${DELIVERY_HEALTH.coverageReady}/${DELIVERY_HEALTH.coverageTotal} 商品充足`}
        />
        <KpiTile
          icon={TrendingUp}
          label="今日 GMV 机会"
          value={`+${formatMoney(DELIVERY_HEALTH.gmvOpportunity)}`}
          hint="按建议执行预估"
          estimated={DELIVERY_HEALTH.isEstimated}
        />
      </div>

      <div className="mb-3 flex w-fit gap-1 rounded-xl border border-[var(--line)] bg-white p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "cursor-pointer rounded-lg px-4 py-2 text-[11.5px] font-bold transition-colors",
              tab === item.id ? "bg-[var(--near-black)] text-white" : "text-[var(--muted)] hover:bg-[var(--soft)]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Surface className="overflow-hidden">
        {tab === "drafts" ? (
          drafts.length === 0 ? (
            <EmptyState
              title="暂无待发布方案"
              description="回到素材决策，从「可放量」「需迭代」「需换新」的素材生成变体后，方案会自动写回这里。"
              action={
                <Button variant="outline" onClick={() => onOpenCreative("all")}>
                  <Sparkles size={14} />
                  返回素材决策
                </Button>
              }
            />
          ) : (
            <DraftList drafts={drafts} onSelect={setDraft} />
          )
        ) : tab === "live" ? (
          <LiveList applied={applied} onSelect={setLive} />
        ) : (
          <AdjustmentHistory />
        )}
      </Surface>

      <DeliveryDraftDrawer
        key={draft?.id ?? "draft-closed"}
        draft={draft}
        onClose={() => setDraft(null)}
        onPublish={(value) => {
          onPublish(value)
          setDraft(null)
          setTab("live")
        }}
      />

      <LiveDeliveryDrawer
        key={live?.id ?? "live-closed"}
        delivery={live}
        appliedLabel={live ? applied[live.id] : undefined}
        onClose={() => setLive(null)}
        onApply={(id, label) => setApplied((prev) => ({ ...prev, [id]: label }))}
        onOpenCreative={onOpenCreative}
      />
    </motion.div>
  )
}

// ─── 待发布方案 ──────────────────────────────────────────────────────────────

function DraftList({ drafts, onSelect }: { drafts: DeliveryIntent[]; onSelect: (value: DeliveryIntent) => void }) {
  return (
    <>
      <div
        className="grid gap-3 border-b border-[var(--line)] bg-[var(--soft-2)] px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-[var(--muted)]"
        style={{ gridTemplateColumns: DRAFT_TEMPLATE }}
      >
        <span>方案</span>
        <span>商品</span>
        <span>目标 ROI</span>
        <span>日预算</span>
        <span>素材</span>
        <span>状态</span>
        <span />
      </div>
      {drafts.map((draft) => {
        const product = productById(draft.productId)
        const selectedCount = draft.creatives.filter((item) => item.selected).length
        return (
          <button
            key={draft.id}
            type="button"
            onClick={() => onSelect(draft)}
            className="group grid w-full items-center gap-3 border-b border-[var(--line)] px-4 py-4 text-left transition-colors last:border-0 hover:bg-[#fbfdf6] focus-visible:bg-[#fbfdf6] focus-visible:outline-none"
            style={{ gridTemplateColumns: DRAFT_TEMPLATE }}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--lime-soft)] text-[#5a7821]">
                <Rocket size={16} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-extrabold text-[var(--text)]">{draft.title}</span>
                <span className="mt-0.5 block truncate text-[10px] text-[var(--muted)]">
                  来源：{DECISION_STATUS_META[draft.sourceStatus].label} · {draft.createdAt}
                </span>
              </span>
            </span>
            <span className="truncate text-[11.5px] font-semibold text-[var(--text)]">{product.shortName}</span>
            <span>
              <small className="block text-[9.5px] text-[var(--muted)]">目标 ROI</small>
              <b className="text-[12px] tabular-nums">{draft.targetRoi.toFixed(2)}</b>
            </span>
            <span>
              <small className="block text-[9.5px] text-[var(--muted)]">日预算</small>
              <b className="text-[12px] tabular-nums">{formatMoney(draft.dailyBudget)}</b>
            </span>
            <span>
              <small className="block text-[9.5px] text-[var(--muted)]">素材</small>
              <b className="text-[12px] tabular-nums">{selectedCount} 条</b>
            </span>
            <Badge className="w-fit border-0 bg-amber-50 text-amber-800">等待配置确认</Badge>
            <ChevronRight size={14} className="text-[var(--muted-2)] transition-transform group-hover:translate-x-0.5" />
          </button>
        )
      })}
    </>
  )
}

// ─── 投放中计划 ──────────────────────────────────────────────────────────────

function LiveList({ applied, onSelect }: { applied: Record<string, string>; onSelect: (value: LiveDelivery) => void }) {
  return (
    <>
      <div
        className="grid gap-3 border-b border-[var(--line)] bg-[var(--soft-2)] px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-[var(--muted)]"
        style={{ gridTemplateColumns: LIVE_TEMPLATE }}
      >
        <span>计划</span>
        <span>商品</span>
        <span>Spend</span>
        <span>GMV</span>
        <span>ROI / 目标</span>
        <span>素材</span>
        <span>调整建议</span>
        <span />
      </div>
      {LIVE_DELIVERIES.map((delivery) => {
        const product = productById(delivery.productId)
        const meta = DELIVERY_RECOMMENDATION_META[delivery.recommendation]
        const appliedLabel = applied[delivery.id]
        return (
          <button
            key={delivery.id}
            type="button"
            onClick={() => onSelect(delivery)}
            className="group grid w-full items-center gap-3 border-b border-[var(--line)] px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-[#fbfdf6] focus-visible:bg-[#fbfdf6] focus-visible:outline-none"
            style={{ gridTemplateColumns: LIVE_TEMPLATE }}
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-[12.5px] font-extrabold text-[var(--text)]">
                <i
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    delivery.status === "delivering" ? "bg-emerald-500" : delivery.status === "limited" ? "bg-amber-500" : "bg-blue-500"
                  )}
                />
                <span className="truncate">{delivery.name}</span>
              </span>
              <span className="mt-1 block truncate text-[10px] text-[var(--muted)]">
                {delivery.account} · {delivery.updatedAt}
              </span>
            </span>
            <span className="truncate text-[11px] font-semibold text-[var(--text)]">{product.shortName}</span>
            <span className="text-[11.5px] tabular-nums">{formatMoney(delivery.spend)}</span>
            <span className="text-[11.5px] tabular-nums">{formatMoney(delivery.gmv)}</span>
            <span>
              <strong className={cn("text-[12px] tabular-nums", delivery.roi >= delivery.targetRoi ? "text-emerald-600" : "text-red-500")}>
                {delivery.roi.toFixed(2)}
              </strong>
              <span className="text-[10px] text-[var(--muted)]"> / {delivery.targetRoi.toFixed(2)}</span>
            </span>
            <span className={cn("text-[11.5px] font-semibold tabular-nums", delivery.creativeCount >= 6 ? "text-[var(--text)]" : "text-amber-700")}>
              {delivery.creativeCount} 条
            </span>
            <span className="min-w-0">
              {appliedLabel ? (
                <Badge className="border-0 bg-emerald-50 text-emerald-700">
                  <Check size={10} />
                  {appliedLabel}
                </Badge>
              ) : (
                <Badge className={cn("border-0", meta.className)}>{meta.label}</Badge>
              )}
              <span className="mt-1 block truncate text-[10px] text-[var(--muted)]">{delivery.reason}</span>
            </span>
            <ChevronRight size={14} className="text-[var(--muted-2)] transition-transform group-hover:translate-x-0.5" />
          </button>
        )
      })}
    </>
  )
}

function AdjustmentHistory() {
  return (
    <div className="divide-y divide-[var(--line)]">
      <div className="grid grid-cols-[130px_minmax(200px,1fr)_minmax(180px,1fr)_100px_180px] items-center bg-[var(--soft-2)] px-5 py-3 text-[10px] font-extrabold uppercase tracking-wide text-[var(--muted)]">
        <span>时间</span>
        <span>调整内容</span>
        <span>计划</span>
        <span>操作人</span>
        <span>结果</span>
      </div>
      {DELIVERY_ADJUSTMENTS.map((row) => (
        <div key={row.id} className="grid grid-cols-[130px_minmax(200px,1fr)_minmax(180px,1fr)_100px_180px] items-center px-5 py-4">
          <span className="text-[10.5px] text-[var(--muted)]">{row.time}</span>
          <strong className="truncate text-[12px] text-[var(--text)]">{row.action}</strong>
          <span className="truncate text-[11px] text-[var(--muted)]">{row.campaign}</span>
          <span className="text-[11px] text-[var(--muted)]">{row.operator}</span>
          <Badge
            className={cn(
              "w-fit border-0",
              row.tone === "good" ? "bg-emerald-50 text-emerald-700" : row.tone === "wait" ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"
            )}
          >
            {row.result}
          </Badge>
        </div>
      ))}
    </div>
  )
}

// ─── 方案配置抽屉 ────────────────────────────────────────────────────────────

function NumberField({
  label,
  value,
  prefix,
  suffix,
  step,
  invalid,
  onChange,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  step?: number
  invalid?: boolean
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-bold text-[var(--muted)]">{label}</span>
      <span
        className={cn(
          "flex h-10 items-center rounded-lg border bg-white px-3 transition-colors focus-within:border-[var(--near-black)]",
          invalid ? "border-red-300" : "border-[var(--line)]"
        )}
      >
        {prefix ? <span className="mr-1 text-[12px] text-[var(--muted)]">{prefix}</span> : null}
        <input
          type="number"
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent text-[12.5px] font-bold tabular-nums outline-none"
        />
        {suffix ? <span className="ml-1 text-[11px] text-[var(--muted)]">{suffix}</span> : null}
      </span>
    </label>
  )
}

function DeliveryDraftDrawer({
  draft,
  onClose,
  onPublish,
}: {
  draft: DeliveryIntent | null
  onClose: () => void
  onPublish: (value: DeliveryIntent) => void
}) {
  const [form, setForm] = useState<DeliveryIntent | null>(draft)
  const [saved, setSaved] = useState(false)

  const value = form ?? draft
  if (!draft || !value) return null

  const product = productById(value.productId)
  const update = (patch: Partial<DeliveryIntent>) => {
    setForm({ ...value, ...patch })
    setSaved(false)
  }

  const selectedCount = value.creatives.filter((item) => item.selected).length
  const stopRoiInvalid = value.stopRoi <= 0 || value.stopRoi >= value.targetRoi
  const errors = [
    selectedCount === 0 ? "至少选择 1 条素材" : null,
    value.targetRoi <= 0 ? "目标 ROI 必须大于 0" : null,
    value.dailyBudget <= 0 ? "日预算必须大于 0" : null,
    value.observationHours <= 0 ? "观察时长必须大于 0" : null,
    value.winOrders <= 0 ? "赢家订单线必须大于 0" : null,
    stopRoiInvalid ? "止损 ROI 必须大于 0 且低于目标 ROI" : null,
  ].filter(Boolean) as string[]
  const valid = errors.length === 0

  return (
    <DecisionDrawer
      open
      title={value.title}
      description="GMV Max 投放方案 · 发布前可审阅"
      onOpenChange={(open) => !open && onClose()}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className={cn("text-[10.5px]", valid ? "text-[var(--muted)]" : "font-semibold text-red-500")}>
            {valid ? "确认发布前不会修改 TikTok 广告账户" : errors[0]}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSaved(true)}>
              {saved ? <Check size={14} /> : null}
              {saved ? "已保存草稿" : "保存草稿"}
            </Button>
            <Button variant="primary" disabled={!valid} onClick={() => onPublish(value)}>
              <Rocket size={14} />
              确认并发布
            </Button>
          </div>
        </div>
      }
    >
      <DrawerStepper steps={["素材诊断", "生成素材", "配置投放", "结果回收"]} current={2} />

      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[var(--soft-2)] p-4">
        <ProductThumb accent={product.accent} label={product.name} className="size-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-extrabold text-[var(--text)]">{product.name}</p>
          <p className="mt-0.5 truncate text-[10.5px] text-[var(--muted)]">
            {product.sku} · 来源素材 {value.sourceCreativeId}
          </p>
        </div>
        <DecisionBadge status={value.sourceStatus} />
      </div>

      <SectionTitle>目标与预算</SectionTitle>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <NumberField label="目标 ROI" value={value.targetRoi} step={0.05} invalid={value.targetRoi <= 0} onChange={(targetRoi) => update({ targetRoi })} />
        <NumberField label="每日预算" value={value.dailyBudget} prefix="$" step={100} invalid={value.dailyBudget <= 0} onChange={(dailyBudget) => update({ dailyBudget })} />
      </div>

      <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">已选 {selectedCount} 条</span>}>投放素材</SectionTitle>
      <div className="mb-5 space-y-2">
        {value.creatives.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              update({
                creatives: value.creatives.map((entry) => (entry.id === item.id ? { ...entry, selected: !entry.selected } : entry)),
              })
            }
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
              item.selected ? "border-[var(--near-black)] bg-[var(--soft-2)]" : "border-[var(--line)] hover:bg-[var(--soft-2)]"
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-md border",
                item.selected ? "border-[var(--near-black)] bg-[var(--near-black)] text-white" : "border-[var(--line-strong)]"
              )}
            >
              {item.selected ? <Check size={12} strokeWidth={3} /> : null}
            </span>
            <CreativeThumb accent={index === 0 ? "from-fuchsia-950 to-rose-400" : "from-zinc-900 to-lime-300"} className="h-11 w-8" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-bold text-[var(--text)]">{item.label}</span>
              <span className="mt-0.5 block truncate font-mono text-[10px] text-[var(--muted)]">{item.id}</span>
            </span>
            <Badge className={cn("border-0", item.kind === "origin" ? "bg-zinc-100 text-zinc-700" : "bg-[var(--lime-soft)] text-[#5c7a00]")}>
              {item.kind === "origin" ? "原素材" : "新变体"}
            </Badge>
          </button>
        ))}
      </div>

      <SectionTitle>观察与止损规则</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <NumberField label="首轮观察" value={value.observationHours} suffix="小时" step={12} invalid={value.observationHours <= 0} onChange={(observationHours) => update({ observationHours })} />
        <NumberField label="赢家订单线" value={value.winOrders} suffix="单" invalid={value.winOrders <= 0} onChange={(winOrders) => update({ winOrders })} />
        <NumberField label="止损 ROI" value={value.stopRoi} step={0.05} invalid={stopRoiInvalid} onChange={(stopRoi) => update({ stopRoi })} />
      </div>

      {errors.length > 0 ? (
        <div className="mt-4 flex gap-2 rounded-xl border border-red-100 bg-red-50/70 p-3">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
          <div className="text-[10.5px] leading-relaxed text-red-700">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-[10.5px] leading-relaxed text-blue-800">
          首轮观察期间系统只做监控；达到订单线后判断赢家，连续两个窗口低于止损 ROI 时提醒调整，不会自动关停。
        </p>
      )}
    </DecisionDrawer>
  )
}

// ─── 投放调整抽屉 ────────────────────────────────────────────────────────────

function LiveDeliveryDrawer({
  delivery,
  appliedLabel,
  onClose,
  onApply,
  onOpenCreative,
}: {
  delivery: LiveDelivery | null
  appliedLabel?: string
  onClose: () => void
  onApply: (id: string, label: string) => void
  onOpenCreative: (productId: string) => void
}) {
  const [confirmStop, setConfirmStop] = useState(false)
  const [scaleRatio, setScaleRatio] = useState(25)

  if (!delivery) return null

  const product = productById(delivery.productId)
  const meta = DELIVERY_RECOMMENDATION_META[delivery.recommendation]
  const isSupply = delivery.recommendation === "supply"
  const isStop = delivery.recommendation === "stop"
  const done = Boolean(appliedLabel)

  const changes =
    delivery.recommendation === "scale"
      ? [
          { label: "每日预算", before: formatMoney(delivery.dailyBudget), after: formatMoney(delivery.dailyBudget * (1 + scaleRatio / 100)) },
          { label: "目标 ROI", before: delivery.targetRoi.toFixed(2), after: `${delivery.targetRoi.toFixed(2)}（不变）` },
        ]
      : delivery.changes

  return (
    <>
      <DecisionDrawer
        open
        title={delivery.name}
        description={`${delivery.account} · 投放调整`}
        onOpenChange={(open) => !open && onClose()}
        footer={
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10.5px] text-[var(--muted)]">
              {isStop ? "止损需要二次确认，执行记录可审计" : "所有调整都需 AO 确认，不做静默自动执行"}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                暂不调整
              </Button>
              {isSupply ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    onClose()
                    onOpenCreative(delivery.productId)
                  }}
                >
                  <Sparkles size={14} />
                  去补充素材
                  <ArrowRight size={14} />
                </Button>
              ) : isStop ? (
                <Button variant="destructive" disabled={done} onClick={() => setConfirmStop(true)}>
                  {done ? <Check size={14} /> : <AlertTriangle size={14} />}
                  {done ? appliedLabel : "确认止损"}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  disabled={done}
                  onClick={() => onApply(delivery.id, "调整已提交")}
                >
                  {done ? <Check size={14} /> : <Rocket size={14} />}
                  {done ? appliedLabel : meta.action}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <DrawerStepper steps={["监控结果", "生成建议", "确认调整", "继续观察"]} current={done ? 3 : 1} />

        <ResultCallout
          tone={meta.tone === "danger" ? "danger" : meta.tone === "warn" ? "warn" : meta.tone === "good" ? "good" : "info"}
          badge={<Badge className={cn("border-0", meta.className)}>{meta.label}</Badge>}
          headline={delivery.reason}
          lines={[`触发条件：${delivery.trigger}`]}
        />

        <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">近 3 日 vs 前 3 日</span>}>实时证据</SectionTitle>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {delivery.evidences.map((evidence) => (
            <EvidenceCard key={evidence.label} label={evidence.label} value={evidence.value} hint={evidence.hint} tone={evidence.tone} />
          ))}
        </div>

        {delivery.recommendation === "scale" ? (
          <div className="mb-5">
            <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">单次最大 +30%</span>}>放量幅度</SectionTitle>
            <div className="rounded-xl border border-[var(--line)] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold text-[var(--muted)]">每日预算上调</span>
                <strong className="text-[16px] font-extrabold tabular-nums text-[var(--text)]">+{scaleRatio}%</strong>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={scaleRatio}
                onChange={(event) => setScaleRatio(Number(event.target.value))}
                className="mt-3 w-full accent-[var(--near-black)]"
                aria-label="放量幅度"
              />
              <p className="mt-2 text-[10px] text-[var(--muted)]">提交后进入 24h 观察，期间不会重复给出放量建议。</p>
            </div>
          </div>
        ) : null}

        <SectionTitle>调整预览</SectionTitle>
        <div className="space-y-2 rounded-xl border border-[var(--line)] p-4">
          {changes.map((change) => (
            <CompareRow key={change.label} label={change.label} before={change.before} after={change.after} />
          ))}
        </div>

        {delivery.constraint ? (
          <p className="mt-3 rounded-xl bg-[var(--soft-2)] px-3.5 py-3 text-[10.5px] leading-relaxed text-[var(--muted)]">
            {delivery.constraint}
          </p>
        ) : null}

        {isSupply ? (
          <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50/70 px-3.5 py-3 text-[10.5px] leading-relaxed text-amber-800">
            点击「去补充素材」会带着商品 <strong>{product.name}</strong> 的上下文跳转到素材决策；
            生成的方案会写回投放中心的待发布列表，变体发布前本计划保持原设置。
          </p>
        ) : null}

        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3"
          >
            <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-[11.5px] font-extrabold text-emerald-800">调整已进入执行队列</p>
              <p className="mt-0.5 text-[10px] text-emerald-700">系统将在下一诊断窗口自动回收结果并更新建议</p>
            </div>
          </motion.div>
        ) : null}
      </DecisionDrawer>

      <ConfirmDialog
        open={confirmStop}
        onOpenChange={setConfirmStop}
        title="确认暂停这个投放计划？"
        description="暂停后计划停止消耗，已确认无效的素材会移出素材池；素材资产与计划配置都会保留。"
        impacts={[
          { label: "计划", value: delivery.name },
          { label: "关联商品", value: product.name },
          { label: "触发窗口", value: "连续 2 个诊断窗口低于止损线" },
          { label: "当前消耗", value: `${formatMoney(delivery.spend)} · ${delivery.orders} 单` },
        ]}
        recoverHint="若新素材正在生成，也可以选择「暂不调整」，等素材上线后再决定是否止损。"
        confirmLabel="确认止损"
        onConfirm={() => {
          setConfirmStop(false)
          onApply(delivery.id, "已暂停")
        }}
      />
    </>
  )
}
