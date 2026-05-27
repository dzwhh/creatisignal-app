"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Wand2, Send, AlertTriangle, ChevronRight, Sparkles, Play, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionBadge, MaterialThumb, MoneyShort, Pct, StatusBadge } from "./shared"
import { CPO_REASONS, type Material } from "@/lib/insights/types"

type Tab = "breakdown" | "accounts" | "reason"

export function MaterialDrawer({
  material,
  onClose,
  onSendBrief,
}: {
  material: Material | null
  onClose: () => void
  onSendBrief: () => void
}) {
  const [tab, setTab] = useState<Tab>("breakdown")

  return (
    <Dialog.Root open={material !== null} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-[560px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2">
          {material && (
            <>
              <div className="px-6 pt-5 pb-4 border-b border-[var(--line)] flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Dialog.Title className="text-[18px] font-extrabold text-[var(--text)] truncate">{material.name}</Dialog.Title>
                    <ActionBadge action={material.recommendation} />
                  </div>
                  <p className="text-[11.5px] text-[var(--muted)] font-mono truncate">
                    {material.fingerprint} · SKU {material.sku} · {material.format}
                  </p>
                </div>
                <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
                  <X size={18} />
                </Dialog.Close>
              </div>

              {/* Top summary */}
              <div className="px-6 pt-4 pb-3">
                <div className="flex gap-4">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-[var(--soft)] shrink-0">
                    <img src={material.thumb} alt={material.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                      <Play size={20} className="text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-y-2 gap-x-3 content-start">
                    <Metric label="综合评级" value={material.rating.toString()} />
                    <Metric label="ROI" value={material.metrics.roi.toFixed(2)} accent={material.metrics.roi >= 2 ? "ok" : material.metrics.roi >= 1.4 ? "warn" : "bad"} />
                    <Metric label="CPO" value={`$${material.metrics.cpo.toFixed(2)}`} />
                    <Metric label="CTR" value={<Pct value={material.metrics.ctr} />} />
                    <Metric label="花费 (7d)" value={<MoneyShort value={material.metrics.spend} />} />
                    <Metric label="账户分布" value={`${material.accountCount} 个账户`} />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="px-6 border-b border-[var(--line)] flex items-center gap-1">
                {[
                  { id: "breakdown" as Tab, label: "素材拆解" },
                  { id: "accounts" as Tab, label: `账户级表现 (${material.accountCount})` },
                  { id: "reason" as Tab, label: "高 CPO 原因" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "relative h-10 px-3 text-[13px] font-bold cursor-pointer transition-colors",
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
                {tab === "accounts" && <AccountsTab material={material} />}
                {tab === "reason" && <ReasonTab material={material} />}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-[var(--line)] flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSendBrief}
                  className="flex-1 h-10 rounded-full bg-[#18181b] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Wand2 size={14} strokeWidth={2.2} />
                  复刻为 Brief
                </button>
                <button
                  type="button"
                  className="flex-1 h-10 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)]"
                >
                  <Send size={13} strokeWidth={2.2} />
                  发送到视频创作
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Metric({ label, value, accent }: { label: string; value: React.ReactNode; accent?: "ok" | "warn" | "bad" }) {
  const cls = accent === "ok" ? "text-[#16a34a]" : accent === "warn" ? "text-[#a16207]" : accent === "bad" ? "text-[#dc2626]" : "text-[var(--text)]"
  return (
    <div>
      <p className="text-[10.5px] font-semibold text-[var(--muted)]">{label}</p>
      <p className={cn("text-[15px] font-extrabold", cls)}>{value}</p>
    </div>
  )
}

// ─── Breakdown tab ───────────────────────────────────────────────────────────

function BreakdownTab({ material }: { material: Material }) {
  return (
    <div className="space-y-4 text-[13px] text-[var(--text)]">
      <TagSection label="行业" tags={[material.industryTag]} tone="blue" />
      <TagSection label="视频风格" tags={[material.videoStyleTag]} tone="violet" />
      <TagSection label="场景" tags={material.sceneTags} tone="green" />
      <TagSection label="卖点" tags={material.sellingPointTags} tone="orange" />
      <TagSection label="结构" tags={material.structureTags} tone="gray" />
      <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3">
        <p className="text-[11.5px] font-bold text-[var(--muted)] mb-1.5">📝 系统拆解</p>
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
        <p className="text-[11.5px] font-bold text-[#a16207] mb-1.5 flex items-center gap-1"><Sparkles size={11} /> 系统建议</p>
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
