"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Wand2, Send, AlertTriangle, ChevronRight, ChevronDown, Play, Tag, Zap, Ban, ArrowRight, Check, Boxes, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionBadge, MoneyShort, Pct, StatusBadge } from "./shared"
import * as Popover from "@radix-ui/react-popover"
import { LifecycleCurveSection } from "./lifecycle-curve"
import { CPO_REASONS, LIFECYCLE_META, type Material, type SelfProduct, type MatchSignal } from "@/lib/insights/types"
import { SELF_PRODUCTS, WEDDING_DRESS_FINGERPRINT, computeMatchScore, pickDefaultProduct } from "@/lib/insights/mock"

type Tab = "breakdown" | "match" | "accounts" | "reason"
type DrawerUiState = {
  fingerprint: string | null
  productSku: string
  tab: Tab
}

export function MaterialDrawer({
  material,
  onClose,
  onSendBrief,
}: {
  material: Material | null
  onClose: () => void
  onSendBrief: () => void
}) {
  const materialFingerprint = material?.fingerprint ?? null
  const defaultProductSku = useMemo(() => {
    return material ? pickDefaultProduct(material).sku : SELF_PRODUCTS[0].sku
  }, [material])
  const [uiState, setUiState] = useState<DrawerUiState>({
    fingerprint: null,
    productSku: SELF_PRODUCTS[0].sku,
    tab: "breakdown",
  })
  const hasStateForCurrentMaterial = uiState.fingerprint === materialFingerprint
  const tab = hasStateForCurrentMaterial ? uiState.tab : "breakdown"
  const productSku = hasStateForCurrentMaterial ? uiState.productSku : defaultProductSku

  function setTabForCurrentMaterial(nextTab: Tab) {
    setUiState({ fingerprint: materialFingerprint, productSku, tab: nextTab })
  }

  function setProductForCurrentMaterial(nextProductSku: string) {
    setUiState({ fingerprint: materialFingerprint, productSku: nextProductSku, tab })
  }

  const selectedProduct = useMemo<SelfProduct | null>(() => {
    if (!material) return null
    return SELF_PRODUCTS.find((p) => p.sku === productSku) ?? pickDefaultProduct(material)
  }, [material, productSku])

  const matchResult = useMemo(() => {
    if (!material || !selectedProduct) return null
    return computeMatchScore(material, selectedProduct)
  }, [material, selectedProduct])

  return (
    <Dialog.Root open={material !== null} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-[50vw] min-w-[760px] max-w-[1080px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2">
          {material && (
            <>
              <div className="px-6 pt-5 pb-4 border-b border-[var(--line)] flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Dialog.Title className="text-[18px] font-extrabold text-[var(--text)] truncate">{material.name}</Dialog.Title>
                    <ActionBadge action={material.recommendation} />
                    <LifecycleBadge phase={material.lifecyclePhase} ageDays={material.ageDays} />
                  </div>
                  <p className="text-[11.5px] text-[var(--muted)] font-mono truncate">
                    {material.fingerprint} · SKU {material.sku} · {material.format}
                  </p>
                </div>
                <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
                  <X size={18} />
                </Dialog.Close>
              </div>

              {/* Top hero —— thumb / 6 metrics 2x3 / 5 tag rows */}
              <div className="px-6 pt-5 pb-4">
                <div className="grid grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.6fr)] gap-5 items-start">
                  {/* 左：thumb */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--soft)]">
                    <img src={material.thumb} alt={material.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                      <Play size={22} className="text-white" fill="white" />
                    </div>
                  </div>

                  {/* 中：6 metrics 2 列 × 3 行 */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 content-start">
                    <HeroMetric label="综合评级" value={material.rating.toString()} />
                    <HeroMetric label="ROI"      value={material.metrics.roi.toFixed(2)} accent={material.metrics.roi >= 2 ? "ok" : material.metrics.roi >= 1.4 ? "warn" : "bad"} />
                    <HeroMetric label="CPO"      value={`$${material.metrics.cpo.toFixed(2)}`} />
                    <HeroMetric label="CTR"      value={<Pct value={material.metrics.ctr} />} />
                    <HeroMetric label="花费 (7d)" value={<MoneyShort value={material.metrics.spend} />} />
                    <HeroMetric label="账户分布"  value={`${material.accountCount} 个账户`} />
                  </div>

                  {/* 右：5 tag rows */}
                  <div className="space-y-1.5">
                    <HeroTagRow label="行业"    tags={[material.industryTag]}    tone="blue" />
                    <HeroTagRow label="视频风格" tags={[material.videoStyleTag]}  tone="violet" />
                    <HeroTagRow label="场景"    tags={material.sceneTags.slice(0, 3)}        tone="green" />
                    <HeroTagRow label="卖点"    tags={material.sellingPointTags.slice(0, 3)} tone="orange" />
                    <HeroTagRow label="结构"    tags={material.structureTags.slice(0, 3)}    tone="gray" />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-[var(--line)] flex items-center gap-1 overflow-x-auto">
                {[
                  { id: "breakdown" as Tab, label: "素材拆解" },
                  { id: "match" as Tab,     label: "复刻匹配" },
                  { id: "accounts" as Tab,  label: `账户级表现 (${material.accountCount})` },
                  { id: "reason" as Tab,    label: "高 CPO 原因" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTabForCurrentMaterial(t.id)}
                    className={cn(
                      "relative h-10 px-3 text-[13px] font-bold cursor-pointer transition-colors whitespace-nowrap",
                      tab === t.id ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    {t.label}
                    {tab === t.id && <span className="absolute left-2 right-2 bottom-[-1px] h-[2px] rounded-full bg-[var(--text)]" />}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {tab === "breakdown" && <BreakdownTab material={material} />}
                {tab === "match" && selectedProduct && matchResult && (
                  <MatchTab
                    material={material}
                    product={selectedProduct}
                    productSku={productSku}
                    onProductChange={setProductForCurrentMaterial}
                    result={matchResult}
                  />
                )}
                {tab === "accounts" && <AccountsTab material={material} />}
                {tab === "reason" && <ReasonTab material={material} />}
              </div>

              {/* Footer */}
              {selectedProduct && (
                <ReplicaFooter
                  material={material}
                  product={selectedProduct}
                  matchResult={matchResult}
                  onSendBrief={onSendBrief}
                />
              )}
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Hero metric / tag row primitives ────────────────────────────────────────

function HeroMetric({ label, value, accent }: { label: string; value: React.ReactNode; accent?: "ok" | "warn" | "bad" }) {
  const cls = accent === "ok" ? "text-[#16a34a]" : accent === "warn" ? "text-[#a16207]" : accent === "bad" ? "text-[#dc2626]" : "text-[var(--text)]"
  return (
    <div>
      <p className="text-[11.5px] font-medium text-[var(--muted)]">{label}</p>
      <p className={cn("text-[19px] font-semibold tracking-tight tabular-nums leading-tight mt-0.5", cls)}>{value}</p>
    </div>
  )
}

function HeroTagRow({ label, tags, tone }: { label: string; tags: string[]; tone: "blue" | "violet" | "green" | "orange" | "gray" }) {
  const cls: Record<string, string> = {
    blue:   "bg-[#dbeafe] text-[#1e40af]",
    violet: "bg-[#ede9fe] text-[#6d28d9]",
    green:  "bg-[#dcfce7] text-[#15803d]",
    orange: "bg-[#fff7ed] text-[#9a3412]",
    gray:   "bg-[var(--soft)] text-[var(--muted)]",
  }
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--muted)] w-[68px] shrink-0">
        <Tag size={11} strokeWidth={1.8} />
        {label}
      </span>
      <div className="flex flex-wrap gap-1 min-w-0">
        {tags.map((t) => (
          <span key={t} className={cn("h-5 px-1.5 rounded text-[11px] font-medium inline-flex items-center", cls[tone])}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}


function TagSection({ label, tags, tone }: { label: string; tags: string[]; tone: "blue" | "violet" | "green" | "orange" | "gray" }) {
  const cls: Record<string, string> = {
    blue:   "bg-[#dbeafe] text-[#1e40af]",
    violet: "bg-[#ede9fe] text-[#6d28d9]",
    green:  "bg-[#dcfce7] text-[#15803d]",
    orange: "bg-[#fff7ed] text-[#9a3412]",
    gray:   "bg-[var(--soft)] text-[var(--muted)]",
  }
  return (
    <div>
      <p className="text-[11px] font-semibold text-[var(--muted)] mb-1.5 flex items-center gap-1"><Tag size={10} /> {label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className={cn("h-6 px-2 rounded-md text-[11.5px] font-semibold inline-flex items-center", cls[tone])}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Replica Footer：基于生命周期 + match 决定主 CTA ──────────────────────────

function ReplicaFooter({
  material,
  product,
  matchResult,
  onSendBrief,
}: {
  material: Material
  product: SelfProduct
  matchResult: ReturnType<typeof computeMatchScore> | null
  onSendBrief: () => void
}) {
  const meta = LIFECYCLE_META[material.lifecyclePhase]
  const blocked = !meta.replicaAllowed || (matchResult?.blockers.length ?? 0) > 0
  const lowMatch = matchResult ? matchResult.level === "low" : false

  // 工作台 URL：携带 product sku 作为查询参数
  const replicateHref = `/replicate/${material.fingerprint}?product=${product.sku}&source=insights`

  return (
    <div className="px-6 py-3 border-t border-[var(--line)] space-y-2">
      {/* 阶段提示条 */}
      <div className={cn(
        "rounded-lg px-3 py-2 text-[11.5px] font-semibold flex items-center gap-2",
        blocked
          ? "bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]"
          : material.lifecyclePhase === "peak"
            ? "bg-[#fff7ed] text-[#9a3412] border border-[#fed7aa]"
            : "bg-[var(--soft-2)] text-[var(--muted)] border border-[var(--line)]"
      )}>
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} />
        <span className="flex-1">{meta.replicaCta}</span>
        {material.lifecyclePhase === "peak" && (
          <span className="text-[10.5px] font-bold opacity-80">{Math.max(0, 48 - material.ageDays * 4)}h 窗口</span>
        )}
      </div>

      {/* 主 CTA 行 */}
      <div className="flex items-center gap-2">
        {blocked ? (
          <button
            type="button"
            disabled
            className="flex-1 h-10 rounded-full bg-[var(--soft)] text-[var(--muted)] text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
            title={matchResult?.blockers[0] ?? meta.hint}
          >
            <Ban size={14} strokeWidth={2.2} />
            该素材不建议复刻
          </button>
        ) : (
          <Link
            href={replicateHref}
            className={cn(
              "flex-1 h-10 rounded-full text-white text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-90",
              material.lifecyclePhase === "peak" ? "bg-[#ea580c]" : "bg-[#18181b]"
            )}
          >
            {material.lifecyclePhase === "peak" ? <Zap size={14} strokeWidth={2.4} /> : <Wand2 size={14} strokeWidth={2.2} />}
            进入爆款复刻
            <ArrowRight size={13} strokeWidth={2.4} className="opacity-80" />
          </Link>
        )}
        <button
          type="button"
          onClick={onSendBrief}
          className="h-10 px-4 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)]"
        >
          <Send size={12} strokeWidth={2.2} />
          仅生成 Brief
        </button>
      </div>

      {lowMatch && !blocked && (
        <p className="text-[11px] text-[#a16207] font-semibold flex items-center gap-1 px-1">
          <AlertTriangle size={11} /> 与所选产品匹配度偏低，可在工作台切换产品或改写卖点
        </p>
      )}
    </div>
  )
}


// ─── Breakdown tab ───────────────────────────────────────────────────────────

function BreakdownTab({ material }: { material: Material }) {
  if (material.fingerprint === WEDDING_DRESS_FINGERPRINT) {
    return (
      <div className="space-y-4 text-[13px] text-[var(--text)]">
        <TagSection label="行业" tags={[material.industryTag]} tone="blue" />
        <TagSection label="视频风格" tags={[material.videoStyleTag]} tone="violet" />
        <TagSection label="场景" tags={material.sceneTags} tone="green" />
        <TagSection label="卖点" tags={material.sellingPointTags} tone="orange" />
        <TagSection label="结构" tags={material.structureTags} tone="gray" />
        <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3">
          <p className="text-[11.5px] font-bold text-[var(--muted)] mb-1.5">系统拆解</p>
          <p className="text-[12.5px] leading-relaxed">
            这条素材把暗场婚纱展厅当成天然舞台，先用远景聚光展示银白闪钻大拖尾，随后让镜头缓慢贴近胸口重工、腰线和裙摆层次。
            产品不靠口播解释，而靠灯光反射和空间留白建立“高定、显贵、适合婚礼主视觉”的第一印象。
          </p>
          <ul className="mt-2 space-y-1 text-[12px] leading-relaxed text-[var(--text)]">
            <li>• 必须保留：暗场聚光、正中心陈列、裙摆拖尾完整入镜。</li>
            <li>• 可变化：开场聚光强度、镜头推进速度、细节标注位置。</li>
            <li>• 不建议复制：过暗导致细节丢失，或快速切镜破坏奢华感。</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-[13px] text-[var(--text)]">
      {/* 生命周期趋势曲线 */}
      <LifecycleCurveSection />

      <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3">
        <p className="text-[11.5px] font-bold text-[var(--muted)] mb-1.5">系统拆解</p>
        <p className="text-[12.5px] leading-relaxed">
          素材聚焦 <span className="font-bold">{material.sceneTags[0] ?? "通用"}</span> 场景，主打
          <span className="font-bold"> {material.sellingPointTags.slice(0, 2).join(" / ")}</span>，
          结构为 <span className="font-mono text-[11.5px]">{material.structureTags.join(" · ")}</span>。
          在 {material.accountCount} 个账户跑出 ROI 区间 {material.worstAccount.roi.toFixed(2)} – {material.bestAccount.roi.toFixed(2)}。
        </p>
      </div>
    </div>
  )
}


// ─── Accounts tab ────────────────────────────────────────────────────────────

function AccountsTab({ material }: { material: Material }) {
  const sorted = [...material.accountRows].sort((a, b) => b.roi - a.roi)
  // mini distribution stats
  const rois = sorted.map((r) => r.roi)
  const max = Math.max(...rois)
  const min = Math.min(...rois)
  const median = sorted[Math.floor(sorted.length / 2)]?.roi ?? 0

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3">
        <p className="text-[11.5px] font-bold text-[var(--muted)] mb-2">ROI 分布</p>
        <div className="flex items-center gap-2 text-[11.5px] text-[var(--text)]">
          <span><span className="font-bold text-[#dc2626]">Worst {min.toFixed(2)}</span></span>
          <span className="text-[var(--muted)]">·</span>
          <span><span className="font-bold">中位 {median.toFixed(2)}</span></span>
          <span className="text-[var(--muted)]">·</span>
          <span><span className="font-bold text-[#16a34a]">Best {max.toFixed(2)}</span></span>
          {material.variance >= 1.5 && (
            <span className="ml-auto inline-flex items-center gap-1 text-[#a16207] font-bold text-[11px]">
              <AlertTriangle size={12} /> 跨账户两极
            </span>
          )}
        </div>
        <div className="mt-2 relative h-2 bg-[var(--soft)] rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#ef4444] via-[#eab308] to-[#16a34a]" style={{ width: "100%" }} />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--line)] overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-[var(--soft-2)]">
            <tr className="text-left">
              <th className="px-3 py-2 font-semibold text-[var(--muted)] text-[11px]">账户</th>
              <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px]">状态</th>
              <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px] text-right">花费</th>
              <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px] text-right">ROI</th>
              <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px] text-right">CPO</th>
              <th className="px-3 py-2 font-semibold text-[var(--muted)] text-[11px]">动作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.accountId} className="border-t border-[var(--line)] hover:bg-[var(--soft-2)]">
                <td className="px-3 py-1.5">
                  <p className="text-[12px] font-semibold text-[var(--text)] truncate max-w-[160px]">{r.accountName}</p>
                  <p className="text-[10.5px] text-[var(--muted)] font-mono">{r.accountId}</p>
                </td>
                <td className="px-2 py-1.5"><StatusBadge status={r.status} compact /></td>
                <td className="px-2 py-1.5 text-right text-[11.5px] font-semibold"><MoneyShort value={r.spend} /></td>
                <td className="px-2 py-1.5 text-right text-[11.5px] font-bold" style={{ color: r.roi >= 2 ? "#16a34a" : r.roi >= 1.4 ? "#a16207" : "#dc2626" }}>{r.roi.toFixed(2)}</td>
                <td className="px-2 py-1.5 text-right text-[11.5px]">{r.cpo > 0 ? `$${r.cpo.toFixed(2)}` : "—"}</td>
                <td className="px-3 py-1.5"><ActionBadge action={r.recommendation} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-[#fde68a] bg-[#fffbea] p-3">
        <p className="text-[11.5px] font-bold text-[#a16207] mb-1.5 flex items-center gap-1"><Wand2 size={11} /> 系统建议</p>
        <ul className="space-y-1 text-[12px] text-[var(--text)]">
          {sorted.slice(0, 2).filter((r) => r.recommendation === "scale").map((r) => (
            <li key={r.accountId} className="flex items-start gap-1.5">
              <ChevronRight size={12} className="mt-0.5 shrink-0 text-[var(--muted)]" />
              <span>在 <span className="font-bold">{r.accountName}</span> 上调预算 +15~20%</span>
            </li>
          ))}
          {sorted.filter((r) => r.recommendation === "pause").slice(0, 2).map((r) => (
            <li key={r.accountId} className="flex items-start gap-1.5">
              <ChevronRight size={12} className="mt-0.5 shrink-0 text-[var(--muted)]" />
              <span>暂停 <span className="font-bold">{r.accountName}</span> 上此素材的投放</span>
            </li>
          ))}
          {sorted.filter((r) => r.recommendation === "rewrite_hook").slice(0, 1).map((r) => (
            <li key={r.accountId} className="flex items-start gap-1.5">
              <ChevronRight size={12} className="mt-0.5 shrink-0 text-[var(--muted)]" />
              <span>改写开头后在 <span className="font-bold">{r.accountName}</span> 重投</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Reason tab ──────────────────────────────────────────────────────────────

function ReasonTab({ material }: { material: Material }) {
  if (material.fingerprint === WEDDING_DRESS_FINGERPRINT) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-4">
          <p className="text-[12px] font-bold text-[#9a3412] mb-1.5 flex items-center gap-1.5">
            <AlertTriangle size={13} /> 触发原因：高意向但决策链路偏长
          </p>
          <p className="text-[12.5px] text-[var(--text)] leading-relaxed">
            婚纱属于高客单、强审美决策品类，用户会先被视觉吸引，再反复确认款式细节、裙摆体量和镜头表现，所以 CPO 高于普通快消素材。
            当前素材的首帧聚光和整裙展示很强，但产品演示段还可以更系统地放大闪钻、腰线和拖尾证明，降低用户理解成本。
          </p>
        </div>
        <div className="space-y-1.5 text-[12.5px]">
          <p className="text-[11.5px] font-semibold text-[var(--muted)]">判断依据</p>
          <ul className="space-y-1 list-disc pl-5 text-[var(--text)]">
            <li>CTR {(material.metrics.ctr * 100).toFixed(2)}%，首帧聚光和闪钻细节能有效拉停浏览。</li>
            <li>ROI {material.metrics.roi.toFixed(2)}，说明高客单价值能覆盖较高获客成本。</li>
            <li>CPO ${material.metrics.cpo.toFixed(2)}，主要来自高客单价格敏感、细节确认成本和婚礼主纱决策周期。</li>
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3 text-[12px] text-[var(--text)]">
          <p className="font-bold mb-1.5">下一步建议</p>
          <ul className="space-y-1">
            <li>• 强聚光 Hook：保留暗场聚光和闪钻大拖尾首帧，继续放大停留优势。</li>
            <li>• 强细节 Proof：在产品演示段放大闪钻重工、腰线结构和拖尾体量。</li>
            <li>• Hook + Proof 组合：先用整裙聚光拉停，再用真实细节证明婚纱价值。</li>
          </ul>
        </div>
      </div>
    )
  }
  if (!material.cpoReason) {
    return (
      <div className="rounded-xl border border-[#dff9e7] bg-[#f0fdf4] p-4 text-[12.5px] text-[#16a34a] font-semibold">
        ✅ 该素材未触发高 CPO 原因模板，整体表现健康。
      </div>
    )
  }
  const r = CPO_REASONS[material.cpoReason]
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-4">
        <p className="text-[12px] font-bold text-[#9a3412] mb-1.5 flex items-center gap-1.5">
          <AlertTriangle size={13} /> 触发原因：{r.label}
        </p>
        <p className="text-[12.5px] text-[var(--text)] leading-relaxed">{r.advice}</p>
      </div>
      <div className="space-y-1.5 text-[12.5px]">
        <p className="text-[11.5px] font-semibold text-[var(--muted)]">判断依据</p>
        <ul className="space-y-1 list-disc pl-5 text-[var(--text)]">
          <li>CTR {(material.metrics.ctr * 100).toFixed(2)}% {material.metrics.ctr < 0.015 ? "(< 1.5% 阈值)" : ""}</li>
          <li>ROI {material.metrics.roi.toFixed(2)} {material.metrics.roi < 1.4 ? "(< 1.4 阈值)" : ""}</li>
          {material.variance >= 1.5 && <li>跨账户 ROI 方差 {material.variance.toFixed(2)} (≥ 1.5 触发逐账户调优)</li>}
        </ul>
      </div>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3 text-[12px] text-[var(--text)]">
        <p className="font-bold mb-1.5">下一步建议</p>
        <ul className="space-y-1">
          <li>• 复刻此素材结构，但替换为更强场景</li>
          <li>• 保留卖点优先级 {material.sellingPointTags.slice(0, 2).join(" / ")} 不变</li>
          <li>• 改写开头钩子，加入痛点画面或反差</li>
        </ul>
      </div>
    </div>
  )
}

// ─── Lifecycle badge & score dot ─────────────────────────────────────────────

function LifecycleBadge({ phase, ageDays }: { phase: Material["lifecyclePhase"]; ageDays: number }) {
  const m = LIFECYCLE_META[phase]
  return (
    <span
      className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-bold border"
      style={{
        backgroundColor: phase === "peak" ? "#fff7ed" : phase === "declining" ? "#fefce8" : phase === "retired" ? "#f4f4f5" : "#f0f9ff",
        borderColor: m.dot + "55",
        color: m.dot,
      }}
      title={m.hint}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.dot }} />
      {m.label} · {ageDays}d
    </span>
  )
}


// ─── Match tab：左爆款骨架 / 右自有产品 / 上方 match 评分 ────────────────────

function MatchTab({
  material,
  product,
  productSku,
  onProductChange,
  result,
}: {
  material: Material
  product: SelfProduct
  productSku: string
  onProductChange: (sku: string) => void
  result: ReturnType<typeof computeMatchScore>
}) {
  const levelMeta = {
    high: { label: "高度匹配 · 建议复刻", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    mid:  { label: "中等匹配 · 可复刻但需调整", color: "#a16207", bg: "#fffbeb", border: "#fde68a" },
    low:  { label: "匹配度偏低 · 建议改写或换产品", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
  }[result.level]

  return (
    <div className="space-y-4 text-[13px]">
      {/* 顶部 match 评分总览 */}
      <div
        className="rounded-xl p-3 border"
        style={{ backgroundColor: levelMeta.bg, borderColor: levelMeta.border }}
      >
        <div className="flex items-center gap-3">
          <ScoreRing total={result.total} color={levelMeta.color} />
          <div className="flex-1 min-w-0">
            <p className="text-[11.5px] font-semibold" style={{ color: levelMeta.color }}>匹配度评分</p>
            <p className="text-[14px] font-extrabold text-[var(--text)]">{levelMeta.label}</p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">爆款骨架 ↔ 自有产品双向匹配，决定复刻可行性</p>
          </div>
        </div>
        {result.blockers.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed flex items-start gap-1.5" style={{ borderColor: levelMeta.border }}>
            <Ban size={12} className="mt-0.5 shrink-0" style={{ color: "#b91c1c" }} />
            <p className="text-[11.5px] font-semibold text-[#b91c1c]">{result.blockers[0]}</p>
          </div>
        )}
      </div>

      {/* 左右对照 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 左：爆款骨架 */}
        <div className="rounded-xl border border-[var(--line)] p-3">
          <p className="text-[10.5px] font-bold text-[var(--muted)] mb-2 flex items-center gap-1">
            <Sparkles size={10} /> 爆款骨架
          </p>
          <div className="aspect-video rounded-lg overflow-hidden bg-[var(--soft)] mb-2 relative">
            <img src={material.thumb} alt={material.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <Play size={18} className="text-white" fill="white" />
            </div>
          </div>
          <p className="text-[12px] font-bold text-[var(--text)] truncate">{material.name}</p>
          <p className="text-[10.5px] text-[var(--muted)] mb-2">{material.industryTag} · {material.videoStyleTag}</p>
          <MiniRow label="场景" tags={material.sceneTags} tone="green" />
          <MiniRow label="卖点" tags={material.sellingPointTags} tone="orange" />
        </div>

        {/* 右：自有产品 */}
        <div className="rounded-xl border border-[var(--line)] p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10.5px] font-bold text-[var(--muted)] flex items-center gap-1">
              <Boxes size={10} /> 自有产品
            </p>
            <ProductPicker selected={productSku} onChange={onProductChange} />
          </div>
          <div className="aspect-video rounded-lg overflow-hidden bg-[var(--soft)] mb-2">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <p className="text-[12px] font-bold text-[var(--text)] truncate">{product.name}</p>
          <p className="text-[10.5px] text-[var(--muted)] mb-2">SKU {product.sku} · {product.category}</p>
          <MiniRow label="卖点" tags={product.coreSellingPoints} tone="orange" linkable />
          <MiniRow label="可配场景" tags={product.matchableSceneTags} tone="green" />
          {product.inventoryStatus !== "in_stock" && (
            <p className="mt-1.5 text-[10.5px] font-bold flex items-center gap-1" style={{ color: product.inventoryStatus === "out" ? "#dc2626" : "#a16207" }}>
              <AlertTriangle size={10} /> {product.inventoryStatus === "out" ? "已断货" : "库存偏低"}
            </p>
          )}
        </div>
      </div>

      {/* 5 项 match 信号清单 */}
      <div className="rounded-xl border border-[var(--line)] p-3">
        <p className="text-[10.5px] font-bold text-[var(--muted)] mb-2">5 项匹配信号</p>
        <div className="space-y-1.5">
          {result.signals.map((s) => <SignalRow key={s.key} signal={s} />)}
        </div>
      </div>

      {material.fingerprint === WEDDING_DRESS_FINGERPRINT && (
        <div className="rounded-xl border border-[#dff9e7] bg-[#f0fdf4] p-3 text-[12px] text-[var(--text)] leading-relaxed">
          <p className="font-extrabold text-[#15803d] mb-1.5">复刻匹配建议</p>
          <p>
            建议进入爆款复刻后围绕三条方向生成：强聚光 Hook、强细节 Proof，以及 Hook + Proof 组合。
            优先保留“暗场聚光 + 闪钻大拖尾 + 缓慢推进”的视觉骨架，不要把画面改成普通货架展示，否则会丢失高定仪式感。
          </p>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--soft-2)] p-3 text-[11.5px] text-[var(--muted)] leading-relaxed flex items-start gap-1.5">
        <ShieldCheck size={12} className="mt-0.5 shrink-0" />
        <span>下一步可进入<span className="font-bold text-[var(--text)]">爆款复刻</span>，选择只动一个变量轴生成 2–3 个变体；卖点点击可直接跳到 Brief。</span>
      </div>
    </div>
  )
}

function ScoreRing({ total, color }: { total: number; color: string }) {
  const size = 60
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (total / 100) * c
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[16px] font-extrabold" style={{ color }}>{total}</span>
      </div>
    </div>
  )
}

function MiniRow({ label, tags, tone, linkable }: { label: string; tags: string[]; tone: "green" | "orange"; linkable?: boolean }) {
  const cls = tone === "green" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fff7ed] text-[#9a3412]"
  return (
    <div className="mt-1.5">
      <p className="text-[10px] font-semibold text-[var(--muted)] mb-1">{label}</p>
      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 4).map((t) => (
          <span key={t} className={cn("h-5 px-1.5 rounded-md text-[10.5px] font-semibold inline-flex items-center gap-0.5", cls, linkable && "cursor-pointer hover:opacity-80")} title={linkable ? "点击跳转生成 Brief" : undefined}>
            {t}
            {linkable && <ChevronRight size={9} className="opacity-60" />}
          </span>
        ))}
      </div>
    </div>
  )
}

function SignalRow({ signal }: { signal: MatchSignal }) {
  const color = signal.score >= 75 ? "#16a34a" : signal.score >= 55 ? "#eab308" : "#dc2626"
  return (
    <div className="flex items-center gap-2">
      <span className="w-[68px] shrink-0 text-[11px] font-semibold text-[var(--muted)]">{signal.label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--soft)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${signal.score}%`, backgroundColor: color }} />
      </div>
      <span className="w-6 text-right text-[11px] font-extrabold" style={{ color }}>{signal.score}</span>
      <span className="w-[170px] text-[10.5px] text-[var(--muted)] truncate" title={signal.detail}>{signal.detail}</span>
    </div>
  )
}

function ProductPicker({ selected, onChange }: { selected: string; onChange: (sku: string) => void }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-6 px-2 rounded-md border border-[var(--line)] bg-white text-[10.5px] font-bold text-[var(--text)] flex items-center gap-1 cursor-pointer hover:border-[var(--line-strong)]"
        >
          切换产品
          <ChevronDown size={10} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-[60] w-[240px] p-1 bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)]"
        >
          {SELF_PRODUCTS.map((p) => (
            <Popover.Close key={p.sku} asChild>
              <button
                type="button"
                onClick={() => onChange(p.sku)}
                className={cn(
                  "w-full px-2 py-1.5 rounded-lg text-left cursor-pointer flex items-center gap-2 transition-colors",
                  selected === p.sku ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                )}
              >
                <img src={p.image} alt={p.name} className="w-8 h-8 rounded-md object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11.5px] font-bold text-[var(--text)] truncate">{p.name}</p>
                  <p className="text-[10px] text-[var(--muted)] truncate">SKU {p.sku} · {p.category.split("/")[0].trim()}</p>
                </div>
                {selected === p.sku && <Check size={12} strokeWidth={2.5} className="text-[var(--text)] shrink-0" />}
              </button>
            </Popover.Close>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
