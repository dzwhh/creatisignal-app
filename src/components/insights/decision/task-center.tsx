"use client"

/**
 * 任务记录 —— 每次诊断如何变成素材、投放与验证结果。
 *
 * 状态机：待处理 → 已执行 → 生成中 → 待投放 → 观察中 → 验证成功/失败 → 已完成，
 * 异常状态（生成失败 / 发布失败 / 数据延迟 / 已取消）保留记录并允许重试。
 */

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Check, Clock3, Crown, RotateCcw, Rocket, Search, TrendingUp, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DECISION_STATUS_META,
  TASK_STAGE_META,
  type ClosedLoopTask,
  type TaskStage,
} from "@/lib/insights/decision-mock"
import {
  DecisionBadge,
  DecisionDrawer,
  EmptyState,
  FilterChip,
  KpiTile,
  PageHeader,
  SectionTitle,
  Surface,
  TableHead,
} from "./decision-ui"

const pageMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -5 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
}

const ROW_TEMPLATE = "minmax(260px,1.35fr) minmax(160px,.9fr) 104px minmax(160px,.8fr) minmax(240px,1.15fr) 100px"

const STAGE_ORDER: TaskStage[] = ["generating", "ready", "observing", "validated", "failed"]

export function TaskCenter({ tasks }: { tasks: ClosedLoopTask[] }) {
  const [query, setQuery] = useState("")
  const [stage, setStage] = useState<TaskStage | "all">("all")
  const [selected, setSelected] = useState<ClosedLoopTask | null>(null)

  const counts = useMemo(() => {
    return tasks.reduce<Record<TaskStage, number>>(
      (acc, task) => {
        acc[task.stage] += 1
        return acc
      },
      { generating: 0, ready: 0, observing: 0, validated: 0, failed: 0 }
    )
  }, [tasks])

  const rows = useMemo(() => {
    return tasks.filter((task) => {
      const matchStage = stage === "all" || task.stage === stage
      const matchQuery = `${task.title}${task.productName}`.toLowerCase().includes(query.toLowerCase())
      return matchStage && matchQuery
    })
  }, [tasks, stage, query])

  return (
    <motion.div {...pageMotion} className="mx-auto w-full max-w-[1480px] p-5 lg:p-6">
      <PageHeader
        eyebrow="Traceable"
        title="任务记录"
        description="记录每次诊断如何变成素材、投放与验证结果，确保闭环透明可追溯"
        aside={
          <label className="flex h-9 w-56 items-center gap-2 rounded-lg border border-[var(--line)] bg-white px-3">
            <Search size={13} className="text-[var(--muted)]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索任务或商品"
              className="min-w-0 flex-1 bg-transparent text-[11.5px] outline-none"
            />
          </label>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile icon={Clock3} label="观察中" value={counts.observing} hint="等待样本与时间双阈值" />
        <KpiTile icon={Rocket} label="待投放" value={counts.ready} hint="素材已就绪，等待发布" />
        <KpiTile icon={Check} label="已验证" value={counts.validated} hint="结果已回流并更新诊断" />
        <KpiTile icon={TrendingUp} label="本周有效动作" value="73%" hint="验证成功 / 已执行动作" estimated />
      </div>

      <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-0.5">
        <FilterChip active={stage === "all"} label="全部任务" count={tasks.length} onClick={() => setStage("all")} />
        {STAGE_ORDER.map((key) => (
          <FilterChip
            key={key}
            active={stage === key}
            label={TASK_STAGE_META[key].label}
            count={counts[key]}
            onClick={() => setStage(key)}
          />
        ))}
      </div>

      <Surface className="overflow-hidden">
        <TableHead template={ROW_TEMPLATE} columns={["任务", "商品", "来源", "闭环进度", "当前结果", "更新时间"]} />
        {rows.length === 0 ? (
          <EmptyState title="没有匹配的任务" description="换一个状态或清空搜索关键词后重试。" />
        ) : (
          rows.map((task) => {
            const meta = TASK_STAGE_META[task.stage]
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelected(task)}
                className="group grid w-full items-center gap-3 border-b border-[var(--line)] px-4 py-4 text-left transition-colors last:border-0 hover:bg-[#fbfdf6] focus-visible:bg-[#fbfdf6] focus-visible:outline-none"
                style={{ gridTemplateColumns: ROW_TEMPLATE }}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", meta.className)}>
                    {task.stage === "failed" ? <TriangleAlert size={15} /> : task.stage === "validated" ? <Check size={15} /> : <Clock3 size={15} />}
                  </span>
                  <span className="truncate text-[12px] font-extrabold text-[var(--text)]">{task.title}</span>
                </span>
                <span className="truncate text-[11px] font-semibold text-[var(--text)]">{task.productName.replace("GlowLab ", "")}</span>
                <Badge variant="outline" className="w-fit">
                  {task.source}
                </Badge>
                <span>
                  <span className="mb-1.5 flex items-center justify-between gap-2">
                    <Badge className={cn("border-0", meta.className)}>{meta.label}</Badge>
                    <small className="text-[9.5px] tabular-nums text-[var(--muted)]">{task.progress}%</small>
                  </span>
                  <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--soft)]">
                    <motion.i
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      className={cn("block h-full rounded-full", task.stage === "failed" ? "bg-red-400" : "bg-[var(--lime)]")}
                    />
                  </span>
                </span>
                <span className="truncate text-[11px] text-[var(--muted)]">{task.result}</span>
                <span className="text-[10px] text-[var(--muted)]">{task.updatedAt}</span>
              </button>
            )
          })
        )}
      </Surface>

      <TaskDetailDrawer task={selected} onClose={() => setSelected(null)} />
    </motion.div>
  )
}

// ─── 任务时间线抽屉 ──────────────────────────────────────────────────────────

function TaskDetailDrawer({ task, onClose }: { task: ClosedLoopTask | null; onClose: () => void }) {
  if (!task) return null
  const meta = TASK_STAGE_META[task.stage]

  return (
    <DecisionDrawer
      open
      title={task.title}
      description={`${task.productName} · 来源：${task.source}`}
      onOpenChange={(open) => !open && onClose()}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10.5px] text-[var(--muted)]">所有人工修改都记录操作者与时间</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
            {task.stage === "failed" ? (
              <Button variant="primary">
                <RotateCcw size={14} />
                修复后重试
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-[var(--soft-2)] p-4">
        <div className="min-w-0">
          <Badge className={cn("border-0", meta.className)}>{meta.label}</Badge>
          <p className="mt-2 text-[14px] font-extrabold text-[var(--text)]">{task.result}</p>
          <p className="mt-1 text-[10.5px] text-[var(--muted)]">更新于 {task.updatedAt}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[24px] font-extrabold tabular-nums text-[var(--text)]">{task.progress}%</p>
          <p className="text-[10px] text-[var(--muted)]">闭环进度</p>
        </div>
      </div>

      {task.blocker ? (
        <div className="mb-5 flex gap-2 rounded-xl border border-red-100 bg-red-50/70 p-3">
          <TriangleAlert size={14} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="text-[11.5px] font-extrabold text-red-700">任务被阻塞</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-red-700">{task.blocker}</p>
          </div>
        </div>
      ) : null}

      <SectionTitle>全过程时间线</SectionTitle>
      <ol className="mb-5 space-y-0">
        {task.timeline.map((item, index) => (
          <li key={`${item.time}-${item.label}`} className="grid grid-cols-[20px_1fr] gap-3">
            <span className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full",
                  item.state === "done"
                    ? "bg-[var(--near-black)] text-white"
                    : item.state === "current"
                      ? "bg-[var(--lime)]"
                      : item.state === "error"
                        ? "bg-red-500 text-white"
                        : "border border-[var(--line-strong)] bg-white"
                )}
              >
                {item.state === "done" ? <Check size={9} strokeWidth={3.4} /> : item.state === "error" ? <TriangleAlert size={9} /> : null}
              </span>
              {index < task.timeline.length - 1 ? <span className="my-1 w-px flex-1 bg-[var(--line)]" /> : null}
            </span>
            <span className="pb-4">
              <span className="block text-[11.5px] font-extrabold text-[var(--text)]">{item.label}</span>
              <span className="mt-0.5 block text-[10.5px] leading-relaxed text-[var(--muted)]">{item.detail}</span>
              <span className="mt-0.5 block font-mono text-[9.5px] text-[var(--muted-2)]">{item.time}</span>
            </span>
          </li>
        ))}
      </ol>

      {task.comparison ? (
        <>
          <SectionTitle action={<span className="text-[10.5px] text-[var(--muted)]">同口径比较</span>}>原素材 vs 变体</SectionTitle>
          <div className="overflow-hidden rounded-xl border border-[var(--line)]">
            <div className="grid grid-cols-[1.5fr_58px_58px_50px_84px] gap-2 bg-[var(--soft-2)] px-3 py-2 text-[9.5px] font-extrabold uppercase text-[var(--muted)]">
              <span>素材</span>
              <span className="text-right">ROI</span>
              <span className="text-right">CTR</span>
              <span className="text-right">订单</span>
              <span className="text-right">下一轮</span>
            </div>
            {task.comparison.map((row) => (
              <div
                key={row.name}
                className={cn(
                  "grid grid-cols-[1.5fr_58px_58px_50px_84px] items-center gap-2 border-t border-[var(--line)] px-3 py-2.5",
                  row.winner && "bg-emerald-50/50"
                )}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  {row.winner ? <Crown size={12} className="shrink-0 text-amber-500" /> : null}
                  <span className="truncate text-[11px] font-bold text-[var(--text)]">{row.name}</span>
                </span>
                <strong className="text-right text-[11.5px] tabular-nums text-[var(--text)]">{row.roi.toFixed(2)}</strong>
                <span className="text-right text-[11px] tabular-nums text-[var(--muted)]">{row.ctr.toFixed(2)}%</span>
                <span className="text-right text-[11px] tabular-nums text-[var(--muted)]">{row.orders}</span>
                <span className="flex justify-end">
                  <DecisionBadge status={row.nextStatus} />
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
            时间与样本同时满足才验收：胜出素材更新为
            {DECISION_STATUS_META.scale.label}或{DECISION_STATUS_META.stable.label}，未通过的重新进入
            {DECISION_STATUS_META.iterate.label}／{DECISION_STATUS_META.stop.label}。
          </p>
        </>
      ) : null}
    </DecisionDrawer>
  )
}
