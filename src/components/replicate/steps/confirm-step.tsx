"use client"

import { useEffect, useState } from "react"
import { BarChart3, CheckCircle2, ChevronDown, ChevronUp, Clock3, Loader2, RefreshCw, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  GENERATION_STAGE_META,
  REJECTION_REASON_META,
  type GenerationStage,
  type GenerationTask,
  type RejectionReason,
  type ReplicaDirectionV2,
} from "@/lib/insights/types"
import { OutcomeCard } from "../outcome-card"

interface Props {
  tasks: GenerationTask[]                                // 新任务排前
  directions: ReplicaDirectionV2[]
  stageProgress: Record<GenerationStage, number>
  hasRunningTask: boolean                                 // 是否还有任务在跑
  onAdopt: (outcomeId: string) => void
  onReject: (outcomeId: string, reason: RejectionReason) => void
  onEdit: (outcomeId: string) => void
  onRegenerate: () => void
}

const STAGES: GenerationStage[] = ["script_lock", "shot_gen", "subtitle", "safety_check"]

export function ConfirmStep({
  tasks,
  directions,
  stageProgress,
  hasRunningTask,
  onAdopt,
  onReject,
  onEdit,
  onRegenerate,
}: Props) {
  // 派生
  const allOutcomes = tasks.flatMap((t) => t.outcomes)
  const total = allOutcomes.length || 3
  const adopted = allOutcomes.filter((o) => o.status === "adopted").length
  const rejected = allOutcomes.filter((o) => o.status === "rejected").length
  const generating = allOutcomes.filter((o) => o.status === "generating").length

  // 不采纳原因分布
  const rejectionDistribution: Record<string, number> = {}
  for (const o of allOutcomes) {
    if (o.rejectionReason) rejectionDistribution[o.rejectionReason] = (rejectionDistribution[o.rejectionReason] ?? 0) + 1
  }

  const dirById = (id: string) => directions.find((d) => d.id === id)!

  return (
    <div className="grid grid-cols-[1fr_260px] gap-6">
      <main className="space-y-4">
        <div>
          <h2 className="text-[19px] font-extrabold text-[var(--text)] mb-1">生成结果</h2>
          <p className="text-[12.5px] text-[var(--muted)]">
            每次"再生成一次"会新增一个任务（含 3 个变体）；新任务排在前面。每个结果可单独采纳 / 不采纳 / 编辑
          </p>
        </div>

        {/* 收窄的生成流水线 — 仅在有任务跑时显示 */}
        {hasRunningTask && <PipelineStrip stageProgress={stageProgress} />}

        {/* 任务批次 */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskGroup
              key={task.id}
              task={task}
              directions={directions}
              defaultExpanded={task.index === tasks.length}  // 最新（task.index 最大）默认展开
              onAdopt={onAdopt}
              onReject={onReject}
              onEdit={onEdit}
              dirById={dirById}
            />
          ))}
        </div>
      </main>

      {/* 右侧：结果统计 + 再生成 */}
      <aside className="sticky top-3 self-start max-h-[calc(100vh-180px)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-white p-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <BarChart3 size={14} className="text-[var(--muted)]" />
          <h3 className="text-[13.5px] font-extrabold text-[var(--text)]">结果统计</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatBlock label="已采纳" value={`${adopted} / ${total}`} accent="ok" />
          <StatBlock label="不采纳" value={`${rejected} / ${total}`} accent={rejected > 0 ? "warn" : "muted"} />
        </div>

        <div>
          <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">不采纳原因分布</p>
          {Object.keys(rejectionDistribution).length === 0 ? (
            <p className="text-[11.5px] text-[var(--muted-2)]">暂无</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(rejectionDistribution).map(([reason, count]) => (
                <li key={reason} className="flex items-center justify-between text-[11.5px]">
                  <span className="text-[var(--text)]">{REJECTION_REASON_META[reason as RejectionReason].label}</span>
                  <span className="font-extrabold text-[#dc2626]">×{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 再生成一次 主按钮 */}
        <button
          type="button"
          onClick={onRegenerate}
          disabled={hasRunningTask}
          className={cn(
            "w-full h-10 rounded-xl text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-opacity border",
            hasRunningTask
              ? "bg-[var(--soft)] text-[var(--muted-2)] border-[var(--line)] cursor-not-allowed"
              : "bg-[var(--lime)] text-[#1a2010] border-[#cdf066] cursor-pointer hover:shadow-[0_6px_18px_rgba(201,255,41,0.4)]"
          )}
        >
          {hasRunningTask ? (
            <>
              <Loader2 size={12} strokeWidth={2.6} className="animate-spin" />
              正在生成…
            </>
          ) : (
            <>
              <RefreshCw size={12} strokeWidth={2.6} />
              再生成一次
            </>
          )}
        </button>
        <p className="text-[10.5px] text-[var(--muted-2)] text-center -mt-1">
          会新增 3 个变体作为新任务
        </p>

        <div className="rounded-lg bg-[var(--soft-2)] border border-dashed border-[var(--line)] p-2.5 text-[11px] text-[var(--muted)] leading-relaxed">
          采纳和不采纳数据会回流到客户 / 品类专属{" "}
          <span className="font-extrabold text-[var(--text)]">Hook、Proof、CTA 胜率榜</span>，用于下一轮素材推荐。
        </div>
      </aside>
    </div>
  )
}

// ─── 任务批次（折叠组） ─────────────────────────────────────────────────────

function TaskGroup({
  task,
  defaultExpanded,
  onAdopt,
  onReject,
  onEdit,
  dirById,
}: {
  task: GenerationTask
  directions: ReplicaDirectionV2[]
  defaultExpanded: boolean
  onAdopt: (id: string) => void
  onReject: (id: string, r: RejectionReason) => void
  onEdit: (id: string) => void
  dirById: (id: string) => ReplicaDirectionV2
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  // 新任务出现时自动展开它（只在 defaultExpanded 由 false→true 切换时）
  useEffect(() => { if (defaultExpanded) setExpanded(true) }, [defaultExpanded])

  const adopted = task.outcomes.filter((o) => o.status === "adopted").length
  const rejected = task.outcomes.filter((o) => o.status === "rejected").length
  const generating = task.outcomes.filter((o) => o.status === "generating").length
  const done = task.outcomes.filter((o) => o.status === "done").length

  const statusChip = generating > 0 ? { label: `生成中 ${generating}/3`, tone: "warn" as const }
    : adopted > 0 ? { label: `已采纳 ${adopted}`, tone: "ok" as const }
    : { label: `已完成`, tone: "muted" as const }
  const chipColor = statusChip.tone === "ok" ? { bg: "#dcfce7", text: "#15803d" }
    : statusChip.tone === "warn" ? { bg: "#fef3c7", text: "#a16207" }
    : { bg: "#f4f4f5", text: "#71717a" }

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-3 flex items-center gap-3 cursor-pointer hover:bg-[var(--soft-2)] text-left"
      >
        <span className="w-7 h-7 rounded-full bg-[var(--near-black)] text-white text-[12px] font-extrabold flex items-center justify-center shrink-0">
          {task.index}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-extrabold text-[var(--text)] leading-snug">任务 {task.index}</p>
          <p className="text-[10.5px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
            <Clock3 size={9} /> {relativeTime(task.createdAt)} · 3 个变体
          </p>
        </div>
        <span
          className="inline-flex items-center h-5 px-2 rounded-md text-[10.5px] font-extrabold shrink-0"
          style={{ backgroundColor: chipColor.bg, color: chipColor.text }}
        >
          {statusChip.label}
        </span>
        <span className={cn("text-[var(--muted)] transition-transform shrink-0", expanded && "rotate-180")}>
          <ChevronDown size={14} />
        </span>
      </button>

      {expanded && (
        <div className="p-3 pt-0 border-t border-[var(--line)]">
          <div className="grid grid-cols-3 gap-3 pt-3">
            {task.outcomes.map((o) => (
              <OutcomeCard
                key={o.id}
                outcome={o}
                direction={dirById(o.directionId)}
                onAdopt={() => onAdopt(o.id)}
                onReject={(r) => onReject(o.id, r)}
                onEdit={() => onEdit(o.id)}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

// ─── 收窄的生成流水线 ───────────────────────────────────────────────────────

function PipelineStrip({ stageProgress }: { stageProgress: Record<GenerationStage, number> }) {
  return (
    <section className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 flex items-center gap-2 max-w-[640px]">
      <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide shrink-0">
        <Sparkles size={10} />
        流水线
      </span>
      <div className="flex-1 flex items-center gap-1.5">
        {STAGES.map((s, i) => {
          const p = stageProgress[s] ?? 0
          const done = p >= 100
          const active = p > 0 && !done
          return (
            <div key={s} className="flex items-center gap-1.5 flex-1 min-w-0">
              <span
                className={cn(
                  "shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold",
                  done ? "bg-[#dcfce7] text-[#16a34a]" :
                  active ? "bg-[#fef3c7] text-[#a16207]" :
                  "bg-[var(--soft)] text-[var(--muted-2)]"
                )}
              >
                {done ? <CheckCircle2 size={11} /> : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[var(--text)] truncate">{GENERATION_STAGE_META[s].label}</p>
                <div className="h-1 rounded-full bg-[var(--soft)] overflow-hidden mt-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${p}%`, backgroundColor: done ? "#16a34a" : "#eab308" }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── helpers ────────────────────────────────────────────────────────────────

function StatBlock({ label, value, accent }: { label: string; value: string; accent: "ok" | "warn" | "muted" }) {
  const color = accent === "ok" ? "#15803d" : accent === "warn" ? "#a16207" : "var(--muted)"
  return (
    <div className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] px-2.5 py-2">
      <p className="text-[10px] font-bold text-[var(--muted-2)] uppercase tracking-wide">{label}</p>
      <p className="text-[16px] font-extrabold mt-0.5" style={{ color }}>{value}</p>
    </div>
  )
}

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000) return "刚刚"
  const min = Math.floor(ms / 60_000)
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  return `${hr} 小时前`
}
