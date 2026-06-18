"use client"

import { useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Popover from "@radix-ui/react-popover"
import {
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Film,
  History,
  Loader2,
  Play,
  RefreshCw,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  MAX_VERSIONS_PER_OUTCOME,
  type GenerationOutcome,
  type OutcomeVersion,
  type ReplicaDirectionV2,
} from "@/lib/insights/types"

interface Props {
  outcome: GenerationOutcome
  direction: ReplicaDirectionV2
  open: boolean
  onClose: () => void
  /** 用户点"再次生成"：追加一个新版本（workspace 端做 FIFO 限制 5） */
  onRegenerate: (storyboardEdits: Record<string, string>) => void
  /** 用户切换历史版本 */
  onSwitchVersion: (versionId: string) => void
}

export function OutcomeDetailDrawer({
  outcome,
  direction,
  open,
  onClose,
  onRegenerate,
  onSwitchVersion,
}: Props) {
  // 合并 outcome.versions + 默认 V1（如果没有 versions）
  const versions: OutcomeVersion[] = useMemo(() => {
    if (outcome.versions && outcome.versions.length > 0) return outcome.versions
    return [
      {
        id: `${outcome.id}_v1`,
        index: 1,
        createdAt: new Date().toISOString(),
        storyboardEdits: {},
        thumb: outcome.thumb,
      },
    ]
  }, [outcome.versions, outcome.id, outcome.thumb])

  const currentVersionId = outcome.currentVersionId ?? versions[0].id
  const currentVersion = versions.find((v) => v.id === currentVersionId) ?? versions[0]

  // 分镜编辑 state：基于 direction.storyboard + 当前 version 的 edits
  const [edits, setEdits] = useState<Record<string, string>>(currentVersion.storyboardEdits)
  const [editingTime, setEditingTime] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const [regenerating, setRegenerating] = useState(false)

  // 切换版本时刷新 edits
  useEffect(() => {
    setEdits(currentVersion.storyboardEdits)
    setEditingTime(null)
  }, [currentVersion.id])

  // 抽屉打开时重置（外部 outcome 变化）
  useEffect(() => {
    if (!open) {
      setEditingTime(null)
      setRegenerating(false)
    }
  }, [open])

  function resolvedShot(timeRange: string, defaultShot: string): string {
    return edits[timeRange] ?? defaultShot
  }

  function startEdit(timeRange: string, currentShot: string) {
    setEditDraft(currentShot)
    setEditingTime(timeRange)
  }
  function saveEdit() {
    if (!editingTime) return
    setEdits((prev) => ({ ...prev, [editingTime]: editDraft }))
    setEditingTime(null)
  }
  function cancelEdit() {
    setEditingTime(null)
  }

  function handleRegenerate() {
    if (regenerating) return
    setRegenerating(true)
    window.setTimeout(() => {
      onRegenerate(edits)
      setRegenerating(false)
    }, 1200)
  }

  const totalDuration = direction.storyboard.reduce((sum, s) => {
    const [start, end] = s.timeRange.replace("s", "").split("-").map(Number)
    return Math.max(sum, end)
  }, 0)

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/45 z-[80] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed right-3 top-3 bottom-3 z-[85] w-[min(620px,calc(100vw-24px))]",
            "rounded-2xl bg-white shadow-[0_28px_72px_rgba(9,9,11,0.28)] flex flex-col overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2"
          )}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-[var(--near-black)] text-white text-[12px] font-extrabold flex items-center justify-center shrink-0">
              {direction.id}
            </span>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-[14px] font-extrabold text-[var(--text)] leading-snug truncate">{direction.title}</Dialog.Title>
              <p className="text-[10.5px] text-[var(--muted)] mt-0.5 truncate">{direction.expectedDelta}</p>
            </div>
            <VersionPicker versions={versions} currentVersionId={currentVersion.id} onSwitch={onSwitchVersion} />
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 视频 + 时间轴 */}
            <section className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
              <div className="relative bg-black aspect-[9/16] max-h-[320px] mx-auto w-full flex items-center justify-center">
                <img src={currentVersion.thumb} alt={direction.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                  <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                    <Play size={20} className="text-[#18181b] translate-x-0.5" fill="#18181b" />
                  </span>
                </div>
                <span className="absolute bottom-2 right-2 inline-flex items-center h-5 px-1.5 rounded-md bg-black/65 text-white text-[10.5px] font-bold">
                  {outcome.durationSec}s
                </span>
              </div>

              {/* 时间轴 — 按 storyboard 段分 */}
              <div className="p-3 space-y-1.5 border-t border-[var(--line)]">
                <div className="flex items-center justify-between text-[10px] font-bold text-[var(--muted-2)]">
                  <span>0:00</span>
                  <span>{direction.storyboard.length} 段 · {totalDuration}s</span>
                  <span>0:{totalDuration.toString().padStart(2, "0")}</span>
                </div>
                <div className="relative h-7 rounded-md overflow-hidden bg-[var(--soft)] flex shadow-[inset_0_0_0_1px_var(--line)]">
                  {direction.storyboard.map((shot, i) => {
                    const [start, end] = shot.timeRange.replace("s", "").split("-").map(Number)
                    const widthPct = ((end - start) / totalDuration) * 100
                    return (
                      <div
                        key={shot.timeRange}
                        className="relative h-full flex items-center justify-center text-[9.5px] font-extrabold text-[var(--muted)] border-r border-white last:border-r-0 bg-[var(--soft-2)] hover:bg-[var(--soft)] transition-colors"
                        style={{ width: `${widthPct}%` }}
                        title={`${shot.timeRange} · ${shot.framing}`}
                      >
                        <span className="truncate px-1">{shot.timeRange}</span>
                        <span
                          className="absolute left-0 right-0 bottom-0 h-[2.5px]"
                          style={{ backgroundColor: "var(--muted-2)" }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* 分镜脚本（可编辑） */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Film size={12} className="text-[var(--muted)]" />
                  <h3 className="text-[12px] font-extrabold text-[var(--text)]">分镜脚本</h3>
                  <span className="text-[10.5px] text-[var(--muted-2)] font-bold">点击右下编辑按钮修改</span>
                </div>
              </div>

              <div className="space-y-2">
                {direction.storyboard.map((shot) => {
                  const shotText = resolvedShot(shot.timeRange, shot.shot)
                  const isEditingThis = editingTime === shot.timeRange
                  const isEdited = edits[shot.timeRange] !== undefined
                  return (
                    <div
                      key={shot.timeRange}
                      className={cn(
                        "rounded-lg border p-2.5 relative group transition-all",
                        isEdited && !isEditingThis
                          ? "border-[#cdf066] bg-[var(--lime-soft)]"
                          : "border-[var(--line)] bg-[var(--soft-2)]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold text-[var(--muted-2)]">{shot.timeRange}</span>
                          <span className="text-[10px] font-bold text-[var(--muted)]">· {shot.framing}</span>
                          {isEdited && (
                            <span className="inline-flex items-center h-4 px-1 rounded bg-[#cdf066] text-[#1a2010] text-[9px] font-extrabold">
                              已编辑
                            </span>
                          )}
                        </div>
                      </div>

                      {isEditingThis ? (
                        <>
                          <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            rows={3}
                            autoFocus
                            onKeyDown={(e) => {
                              if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                                e.preventDefault()
                                saveEdit()
                              } else if (e.key === "Escape") {
                                cancelEdit()
                              }
                            }}
                            className="w-full rounded-md border-2 border-[#cdf066] bg-white p-2 text-[11.5px] outline-none resize-none focus:border-[var(--lime)] focus:shadow-[0_0_0_3px_rgba(201,255,41,0.28)]"
                          />
                          <div className="flex items-center justify-end gap-1 mt-1.5">
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="h-6 px-2 rounded-md border border-[var(--line)] text-[10.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-white cursor-pointer flex items-center gap-1"
                            >
                              <X size={9} /> 取消
                            </button>
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="h-6 px-2 rounded-md bg-[var(--near-black)] text-white text-[10.5px] font-extrabold cursor-pointer hover:opacity-90 flex items-center gap-1"
                            >
                              <Check size={9} strokeWidth={2.6} /> 保存
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-[11.5px] font-semibold text-[var(--text)] leading-relaxed">{shotText}</p>
                          <p className="text-[10.5px] text-[var(--muted)] mt-0.5">素材：{shot.materials.join(" · ")}</p>
                          <button
                            type="button"
                            onClick={() => startEdit(shot.timeRange, shotText)}
                            title="编辑这段分镜"
                            className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-md bg-white border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 size={11} strokeWidth={2.2} />
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 历史版本列表（顶部下拉已经有，这里展示总计） */}
            <section className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--soft-2)] p-3 flex items-start gap-2">
              <History size={12} className="text-[var(--muted)] mt-0.5 shrink-0" />
              <div className="flex-1 text-[10.5px] text-[var(--muted)] leading-relaxed">
                历史版本 <span className="font-extrabold text-[var(--text)]">{versions.length} / {MAX_VERSIONS_PER_OUTCOME}</span>
                · 「再次生成」会基于当前编辑创建新版本，超过 {MAX_VERSIONS_PER_OUTCOME} 个时最早的版本会被自动清理
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
            <span className="text-[10.5px] text-[var(--muted-2)] font-semibold">
              {Object.keys(edits).length > 0 ? `${Object.keys(edits).length} 处分镜被编辑` : "尚未编辑"}
            </span>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className={cn(
                "h-10 px-5 rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 transition-opacity border",
                regenerating
                  ? "bg-[var(--soft)] text-[var(--muted-2)] border-[var(--line)] cursor-not-allowed"
                  : "bg-[var(--lime)] text-[#1a2010] border-[#cdf066] cursor-pointer hover:shadow-[0_6px_18px_rgba(201,255,41,0.4)]"
              )}
            >
              {regenerating ? (
                <>
                  <Loader2 size={13} strokeWidth={2.6} className="animate-spin" />
                  生成中…
                </>
              ) : (
                <>
                  <RefreshCw size={13} strokeWidth={2.6} />
                  再次生成（V{versions.length + 1}）
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── 历史版本下拉 ─────────────────────────────────────────────────────────

function VersionPicker({ versions, currentVersionId, onSwitch }: {
  versions: OutcomeVersion[]
  currentVersionId: string
  onSwitch: (versionId: string) => void
}) {
  const current = versions.find((v) => v.id === currentVersionId) ?? versions[0]
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-7 px-2 rounded-md border border-[var(--line)] bg-white text-[11px] font-extrabold text-[var(--text)] flex items-center gap-1 cursor-pointer hover:border-[var(--line-strong)]"
          title="切换历史版本"
        >
          <History size={10} className="text-[var(--muted)]" />
          V{current.index}
          <ChevronDown size={10} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-[95] w-[200px] p-1 bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)]"
        >
          <p className="px-2 pt-1.5 pb-1 text-[10px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">历史版本</p>
          {versions.map((v) => {
            const isCurrent = v.id === currentVersionId
            return (
              <Popover.Close key={v.id} asChild>
                <button
                  type="button"
                  onClick={() => onSwitch(v.id)}
                  className={cn(
                    "w-full px-2 py-1.5 rounded-md text-left flex items-center gap-2 cursor-pointer transition-colors",
                    isCurrent ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                  )}
                >
                  <span className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                    isCurrent ? "border-[var(--near-black)] bg-[var(--near-black)]" : "border-[var(--line-strong)] bg-white"
                  )}>
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11.5px] font-extrabold text-[var(--text)]">V{v.index}</p>
                    <p className="text-[10px] text-[var(--muted)] flex items-center gap-0.5">
                      <Clock3 size={9} />
                      {relativeTime(v.createdAt)}
                      {Object.keys(v.storyboardEdits).length > 0 && (
                        <span className="ml-1 inline-flex items-center px-1 h-3.5 rounded bg-[var(--lime-soft)] text-[#3a4b1f] text-[9px] font-extrabold border border-[#cdf066]">编辑</span>
                      )}
                    </p>
                  </div>
                </button>
              </Popover.Close>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000) return "刚刚"
  const min = Math.floor(ms / 60_000)
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  return `${hr} 小时前`
}
