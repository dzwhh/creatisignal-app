"use client"

import { useState } from "react"
import { Check, Edit3, FileText, Film, Play, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GenerationOutcome, ReplicaDirectionV2, RejectionReason } from "@/lib/insights/types"
import { REJECTION_REASON_META } from "@/lib/insights/types"
import { ScriptStoryboardPair } from "./script-storyboard-pair"
import { RejectionReasonPicker } from "./rejection-reason-picker"

interface Props {
  outcome: GenerationOutcome
  direction: ReplicaDirectionV2
  onAdopt: () => void
  onReject: (reason: RejectionReason) => void
  onEdit: () => void
}

export function OutcomeCard({ outcome, direction, onAdopt, onReject, onEdit }: Props) {
  const [tab, setTab] = useState<"script" | "storyboard">("script")
  const [rejectOpen, setRejectOpen] = useState(false)
  const status = outcome.status

  const isGenerating = status === "pending" || status === "generating"
  const isAdopted = status === "adopted"
  const isRejected = status === "rejected"

  return (
    <article className={cn(
      "rounded-2xl border bg-white overflow-hidden flex flex-col transition-all",
      isAdopted ? "border-[#16a34a] shadow-[0_0_0_3px_rgba(22,163,74,0.18)]" :
      isRejected ? "border-[#dc2626] opacity-70" :
      "border-[var(--line)]"
    )}>
      {/* 9:16 缩略图 */}
      <div className="relative aspect-[9/16] bg-[var(--soft)] max-h-[280px] overflow-hidden">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--soft)]">
            <div className="w-12 h-12 rounded-full border-3 border-[var(--line-strong)] border-t-[var(--near-black)] animate-spin" />
            <p className="text-[12px] font-bold text-[var(--muted)]">生成中 {outcome.progress}%</p>
          </div>
        ) : (
          <>
            <img src={outcome.thumb} alt={direction.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/15">
              <span className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                <Play size={18} className="text-[#18181b] translate-x-0.5" fill="#18181b" />
              </span>
            </div>
            <span className="absolute bottom-2 right-2 inline-flex items-center h-5 px-1.5 rounded-md bg-black/65 text-white text-[10.5px] font-bold">
              {outcome.durationSec}s
            </span>
            {isAdopted && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-[#16a34a] text-white text-[10.5px] font-extrabold">
                <Check size={10} strokeWidth={3} />
                已采纳
              </span>
            )}
            {isRejected && (
              <span className="absolute top-2 left-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-[#dc2626] text-white text-[10.5px] font-extrabold">
                <X size={10} strokeWidth={3} />
                不采纳
              </span>
            )}
          </>
        )}
      </div>

      {/* 方向信息 */}
      <div className="p-3 border-b border-[var(--line)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-[var(--near-black)] text-white text-[11px] font-extrabold flex items-center justify-center">
            {direction.id}
          </span>
          <h3 className="text-[12.5px] font-extrabold text-[var(--text)] leading-snug truncate flex-1">{direction.title}</h3>
        </div>
        <p className="text-[10.5px] text-[var(--muted)] leading-relaxed line-clamp-2">{direction.expectedDelta}</p>
        {outcome.rejectionReason && (
          <p className="text-[10.5px] text-[#dc2626] font-bold mt-1.5">
            原因：{REJECTION_REASON_META[outcome.rejectionReason].label}
          </p>
        )}
      </div>

      {/* 脚本/分镜叠加 tab */}
      {!isGenerating && (
        <div className="p-3 border-b border-[var(--line)]">
          <div className="flex items-center gap-1 mb-2">
            <button
              type="button"
              onClick={() => setTab("script")}
              className={cn(
                "h-6 px-2 rounded-full text-[10.5px] font-bold flex items-center gap-1 cursor-pointer",
                tab === "script" ? "bg-[var(--near-black)] text-white" : "text-[var(--muted)] hover:bg-[var(--soft-2)]"
              )}
            >
              <FileText size={9} strokeWidth={2.4} />
              内容脚本
            </button>
            <button
              type="button"
              onClick={() => setTab("storyboard")}
              className={cn(
                "h-6 px-2 rounded-full text-[10.5px] font-bold flex items-center gap-1 cursor-pointer",
                tab === "storyboard" ? "bg-[var(--near-black)] text-white" : "text-[var(--muted)] hover:bg-[var(--soft-2)]"
              )}
            >
              <Film size={9} strokeWidth={2.4} />
              分镜脚本
            </button>
          </div>

          <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1">
            {tab === "script" && direction.script.map((s) => (
              <div key={s.timeRange} className="text-[10.5px]">
                <span className="font-extrabold text-[var(--muted-2)] mr-1">{s.timeRange}</span>
                <span className="text-[var(--text)]">{s.voiceover}</span>
              </div>
            ))}
            {tab === "storyboard" && direction.storyboard.map((s) => (
              <div key={s.timeRange} className="text-[10.5px]">
                <span className="font-extrabold text-[var(--muted-2)] mr-1">{s.timeRange}</span>
                <span className="text-[var(--text)]">{s.shot}</span>
                <span className="text-[var(--muted)]"> · {s.framing}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 action: 采纳 / 不采纳 / 编辑 */}
      {!isGenerating && (
        <div className="p-3 grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={onAdopt}
            disabled={isAdopted}
            className={cn(
              "h-8 rounded-full text-[11.5px] font-extrabold flex items-center justify-center gap-1 transition-colors",
              isAdopted
                ? "bg-[#16a34a] text-white cursor-default"
                : "bg-[#dcfce7] text-[#15803d] hover:bg-[#bbf7d0] cursor-pointer"
            )}
          >
            <Check size={11} strokeWidth={3} />
            采纳
          </button>
          <RejectionReasonPicker
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            onPick={onReject}
            trigger={
              <button
                type="button"
                disabled={isRejected}
                className={cn(
                  "h-8 rounded-full text-[11.5px] font-extrabold flex items-center justify-center gap-1 transition-colors",
                  isRejected
                    ? "bg-[#fef2f2] text-[#b91c1c] cursor-default"
                    : "border border-[var(--line)] text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
                )}
              >
                <X size={11} strokeWidth={3} />
                不采纳
              </button>
            }
          />
          <button
            type="button"
            onClick={onEdit}
            className="h-8 rounded-full border border-[var(--line)] text-[var(--text)] text-[11.5px] font-extrabold flex items-center justify-center gap-1 cursor-pointer hover:bg-[var(--soft-2)]"
          >
            <Edit3 size={11} strokeWidth={2.4} />
            编辑
          </button>
        </div>
      )}
    </article>
  )
}
