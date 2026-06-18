"use client"

import { useState } from "react"
import { Check, FileText, History, Play, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GenerationOutcome, ReplicaDirectionV2, RejectionReason } from "@/lib/insights/types"
import { REJECTION_REASON_META } from "@/lib/insights/types"
import { RejectionReasonPicker } from "./rejection-reason-picker"
import { OutcomeDetailDrawer } from "./outcome-detail-drawer"

interface Props {
  outcome: GenerationOutcome
  direction: ReplicaDirectionV2
  onAdopt: () => void
  onReject: (reason: RejectionReason, customText?: string) => void
  onAddVersion: (storyboardEdits: Record<string, string>) => void
  onSwitchVersion: (versionId: string) => void
}

export function OutcomeCard({ outcome, direction, onAdopt, onReject, onAddVersion, onSwitchVersion }: Props) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const status = outcome.status

  const isGenerating = status === "pending" || status === "generating"
  const isAdopted = status === "adopted"
  const isRejected = status === "rejected"
  const versionCount = outcome.versions?.length ?? 1

  return (
    <>
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

              {/* 完成 / 采纳 / 不采纳 状态徽章 */}
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
              {!isAdopted && !isRejected && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-white/95 text-[#15803d] text-[10.5px] font-extrabold shadow-sm">
                  <Check size={10} strokeWidth={3} />
                  已完成
                </span>
              )}

              {/* 历史版本计数（如果有 > 1） */}
              {versionCount > 1 && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-black/65 text-white text-[10px] font-extrabold">
                  <History size={9} strokeWidth={2.6} />
                  V{versionCount}
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
            <p className="text-[10.5px] text-[#dc2626] font-bold mt-1.5 line-clamp-2">
              原因：{outcome.rejectionReason === "custom" && outcome.rejectionReasonText
                ? outcome.rejectionReasonText
                : REJECTION_REASON_META[outcome.rejectionReason].label}
            </p>
          )}
        </div>

        {/* 3 action: 采纳 / 不采纳 / 详情 */}
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
              onClick={() => setDetailOpen(true)}
              className="h-8 rounded-full border border-[var(--line)] text-[var(--text)] text-[11.5px] font-extrabold flex items-center justify-center gap-1 cursor-pointer hover:bg-[var(--soft-2)]"
            >
              <FileText size={11} strokeWidth={2.4} />
              详情
            </button>
          </div>
        )}
      </article>

      {/* 详情抽屉 */}
      {!isGenerating && (
        <OutcomeDetailDrawer
          outcome={outcome}
          direction={direction}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          onRegenerate={onAddVersion}
          onSwitchVersion={onSwitchVersion}
        />
      )}
    </>
  )
}
