"use client"

import { useState } from "react"
import { FlaskConical, Copy, Pause, ArrowRight, Calendar, CheckCircle2, AlertCircle, MoreHorizontal, ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCOUNTS, EXPERIMENTS, MATERIALS } from "@/lib/insights/mock"
import { MaterialThumb, Sparkline } from "../shared"
import { type ExperimentBatch, type ExperimentItem } from "@/lib/insights/types"

const STATUS_LABELS: Record<ExperimentItem["status"], { label: string; cls: string; dot: string }> = {
  pending:  { label: "待投放", cls: "bg-[var(--soft)] text-[var(--muted)]",        dot: "#a1a1aa" },
  learning: { label: "学习中", cls: "bg-[#fef9c3] text-[#a16207]",                dot: "#eab308" },
  scale:    { label: "可放量", cls: "bg-[#dff9e7] text-[#16a34a]",                dot: "#22c55e" },
  rewrite:  { label: "需改写", cls: "bg-[#fff7ed] text-[#ea580c]",                dot: "#f97316" },
  pause:    { label: "建议停用", cls: "bg-[#fee2e2] text-[#dc2626]",              dot: "#ef4444" },
}

export function ExperimentPage() {
  const [openBatchId, setOpenBatchId] = useState<string | null>(EXPERIMENTS[0]?.id ?? null)

  return (
    <div className="px-8 py-6 max-w-[1300px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[20px] font-extrabold text-[var(--text)] tracking-tight">实验追踪</h2>
          <p className="text-[12.5px] text-[var(--muted)] mt-1">
            {EXPERIMENTS.length} 个进行中的批次 · 3 日观察期 · 状态由 ROI / CPO 自动判定
          </p>
        </div>
        <button
          type="button"
          className="h-9 px-4 rounded-full bg-[#18181b] text-white text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90"
        >
          <Plus size={14} strokeWidth={2.5} />
          创建新实验批次
        </button>
      </div>

      <div className="space-y-3">
        {EXPERIMENTS.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            open={openBatchId === batch.id}
            onToggle={() => setOpenBatchId(openBatchId === batch.id ? null : batch.id)}
          />
        ))}
      </div>
    </div>
  )
}

function BatchCard({ batch, open, onToggle }: { batch: ExperimentBatch; open: boolean; onToggle: () => void }) {
  const counts = {
    scale: batch.items.filter((i) => i.status === "scale").length,
    learning: batch.items.filter((i) => i.status === "learning").length,
    rewrite: batch.items.filter((i) => i.status === "rewrite").length,
    pause: batch.items.filter((i) => i.status === "pause").length,
  }
  const dateStr = new Date(batch.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--soft-2)] cursor-pointer transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-[#fef9c3] flex items-center justify-center shrink-0">
          <FlaskConical size={17} strokeWidth={2.2} className="text-[#a16207]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-extrabold text-[var(--text)] truncate">{batch.name}</p>
            <span className="text-[11px] text-[var(--muted)] font-mono shrink-0">{batch.id}</span>
          </div>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5 flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar size={11} /> {dateStr}</span>
            <span>{batch.items.length} 条 × 账户</span>
            <span>运行 {batch.daysRunning}/{batch.totalDays} 天</span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <CountBadge label="可放量" count={counts.scale} dot="#22c55e" />
          <CountBadge label="学习中" count={counts.learning} dot="#eab308" />
          <CountBadge label="需改写" count={counts.rewrite} dot="#f97316" />
          <CountBadge label="停用"   count={counts.pause}   dot="#ef4444" />
        </div>
        <ChevronDown size={14} className={cn("text-[var(--muted)] transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-[var(--line)]">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead className="bg-[var(--soft-2)]">
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold text-[var(--muted)] text-[11px]">素材</th>
                  <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px]">账户</th>
                  <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px]">状态</th>
                  <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px] text-right">ROI</th>
                  <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px] text-right">CPO</th>
                  <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px]">ROI 趋势</th>
                  <th className="px-2 py-2 font-semibold text-[var(--muted)] text-[11px]">系统建议</th>
                  <th className="w-10 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {batch.items.map((it, idx) => {
                  const mat = MATERIALS.find((m) => m.fingerprint === it.materialFingerprint)
                  const acc = ACCOUNTS.find((a) => a.id === it.accountId)
                  if (!mat || !acc) return null
                  const statusMeta = STATUS_LABELS[it.status]
                  return (
                    <tr key={idx} className="border-t border-[var(--line)] hover:bg-[var(--soft-2)]">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <MaterialThumb material={mat} size={32} showPlay={false} />
                          <div className="min-w-0">
                            <p className="text-[12px] font-semibold text-[var(--text)] truncate">{mat.name}</p>
                            <p className="text-[10.5px] text-[var(--muted)] font-mono truncate">{mat.fingerprint}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <p className="text-[11.5px] font-semibold text-[var(--text)] truncate max-w-[160px]">{acc.name}</p>
                        <p className="text-[10.5px] text-[var(--muted)] font-mono truncate">{acc.id}</p>
                      </td>
                      <td className="px-2 py-2">
                        <span className={cn("h-5 px-1.5 rounded-md text-[11px] font-bold inline-flex items-center gap-1", statusMeta.cls)}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusMeta.dot }} />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className={cn("px-2 py-2 text-[12px] font-bold text-right",
                        it.roi >= 2 ? "text-[#16a34a]" : it.roi >= 1.4 ? "text-[#a16207]" : "text-[#dc2626]"
                      )}>{it.roi.toFixed(2)}</td>
                      <td className="px-2 py-2 text-[12px] text-right">{it.cpo > 0 ? `$${it.cpo.toFixed(2)}` : "—"}</td>
                      <td className="px-2 py-2">
                        <Sparkline values={it.trend} w={64} h={18} />
                      </td>
                      <td className="px-2 py-2 text-[11.5px] text-[var(--text)] max-w-[260px]">
                        {it.status === "scale" && (
                          <span className="inline-flex items-start gap-1 text-[#16a34a]">
                            <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
                            {it.suggestion}
                          </span>
                        )}
                        {it.status === "learning" && (
                          <span className="inline-flex items-start gap-1 text-[var(--muted)]">
                            {it.suggestion}
                          </span>
                        )}
                        {(it.status === "rewrite" || it.status === "pause") && (
                          <span className="inline-flex items-start gap-1 text-[#9a3412]">
                            <AlertCircle size={12} className="mt-0.5 shrink-0" />
                            {it.suggestion}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" className="w-7 h-7 rounded-md hover:bg-[var(--soft)] flex items-center justify-center text-[var(--muted)] cursor-pointer">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-[var(--line)] bg-[var(--soft-2)] flex items-center justify-end gap-2">
            <button type="button" className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-white">
              <Copy size={13} /> 复制可放量素材到其他账户
            </button>
            <button type="button" className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-white">
              <ArrowRight size={13} /> 扩展到更多账户
            </button>
            <button type="button" className="h-9 px-3 rounded-full bg-[#18181b] text-white text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90">
              生成复盘报告
            </button>
            <button type="button" className="h-9 px-3 rounded-full border border-[#fee2e2] bg-white text-[#dc2626] text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#fef2f2]">
              <Pause size={12} /> 终止批次
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

function CountBadge({ label, count, dot }: { label: string; count: number; dot: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />
      <span className="text-[11px] text-[var(--muted)]">{label}</span>
      <span className="text-[12px] font-extrabold text-[var(--text)]">{count}</span>
    </div>
  )
}
