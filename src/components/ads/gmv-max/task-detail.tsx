"use client"

import { BarChart3, Check, ClipboardList, Film, LayoutGrid, Link2, Package, Rocket, Search, Send, Store, Target, TrendingUp, Video, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GmvMaxTask } from "@/lib/ads/gmv-max-types"

// ─── 任务展开详情：执行流程时间线 + 资源信息（mock 数据由任务派生）──────────

interface StepDef {
  icon: LucideIcon
  label: string
  dur: string
  /** 相对创建时间的偏移秒数 */
  offset: number
}

const STEP_DEFS: StepDef[] = [
  { icon: Video, label: "上传视频", dur: "6.7s", offset: 7 },
  { icon: Target, label: "创建推广系列", dur: "796ms", offset: 8 },
  { icon: BarChart3, label: "创建广告组", dur: "3.6s", offset: 11 },
  { icon: Send, label: "创建广告", dur: "3.8s", offset: 15 },
  { icon: Search, label: "轮询帖子ID", dur: "20m4s", offset: 1220 },
  { icon: Rocket, label: "创建 GMV Max", dur: "10.5s", offset: 1230 },
]

/** createdAt 格式 "MM-DD HH:mm:ss"，加偏移秒后再格式化 */
function shiftTimestamp(createdAt: string, offsetSec: number): string {
  const m = createdAt.match(/^(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/)
  if (!m) return createdAt
  const [, mo, d, h, mi, s] = m.map(Number)
  const date = new Date(2026, mo - 1, d, h, mi, s + offsetSec)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** 从任务 id 派生稳定的 mock 资源 ID */
function rid(task: GmvMaxTask, prefix: string): string {
  return `${prefix}${String(task.id).padStart(3, "0")}${String((task.id * 733) % 1000000).padStart(6, "0")}`
}

export function TaskDetail({ task }: { task: GmvMaxTask }) {
  const failed = task.status === "failed"
  // 失败位置：视频已上传则失败在最后一步，否则失败在第一步
  const failIndex = failed ? (task.hasVideoLink ? STEP_DEFS.length - 1 : 0) : -1
  const steps = failed ? STEP_DEFS.slice(0, failIndex + 1) : STEP_DEFS

  const resources: { icon: LucideIcon; label: string; value: string; link?: boolean }[] = [
    { icon: TrendingUp, label: "计划名称", value: task.name },
    { icon: TrendingUp, label: "GMV Max ID", value: task.hasGmvMaxLink ? rid(task, "1868155849") : "--", link: task.hasGmvMaxLink },
    { icon: LayoutGrid, label: "TikTok 帖子", value: task.hasVideoLink ? rid(task, "7651966405") : "--", link: task.hasVideoLink },
    { icon: Film, label: "TikTok 视频ID", value: task.hasVideoLink ? `v10033g50000d8ojkr7og65maf0p6mbg` : "--" },
    { icon: Target, label: "Spark Campaign", value: task.hasVideoLink ? rid(task, "1868154565") : "--" },
    { icon: BarChart3, label: "Spark AdGroup", value: task.hasVideoLink ? rid(task, "1868154549") : "--" },
    { icon: Send, label: "Spark Ad", value: task.hasVideoLink ? rid(task, "1868154634") : "--" },
    { icon: Store, label: "店铺 ID", value: rid(task, "7494361678") },
    { icon: Package, label: "商品 SPU", value: `["${rid(task, "1732443216")}"]` },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* 左：执行流程时间线 */}
      <div className="rounded-xl border border-[var(--line)] bg-white p-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <ClipboardList size={15} strokeWidth={2} className="text-[var(--muted)]" /> 执行流程
        </h4>
        <ol className="mt-4">
          {steps.map((step, i) => {
            const isFail = i === failIndex
            const isLast = i === steps.length - 1
            const StepIcon = step.icon
            return (
              <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
                {/* 竖向连接线 */}
                {!isLast && (
                  <span className="absolute left-[13px] top-7 bottom-0 w-px bg-[var(--line)]" aria-hidden />
                )}
                <span
                  className={cn(
                    "w-[27px] h-[27px] rounded-full flex items-center justify-center shrink-0 z-10",
                    isFail ? "bg-red-500" : "bg-emerald-500"
                  )}
                >
                  {isFail ? (
                    <X size={14} strokeWidth={3} className="text-white" />
                  ) : (
                    <Check size={14} strokeWidth={3} className="text-white" />
                  )}
                </span>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text)]">
                      <StepIcon size={13} strokeWidth={2} className="text-[var(--muted)]" /> {step.label}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-[var(--soft)] text-[11px] font-mono text-[var(--muted)]">
                      {step.dur}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted-2)]">
                    {shiftTimestamp(task.createdAt, step.offset)}
                  </p>
                  {isFail && task.failReason && (
                    <p className="mt-1 text-xs text-red-500">{task.failReason}</p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* 右：资源信息 */}
      <div className="rounded-xl border border-[var(--line)] bg-white p-5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Link2 size={15} strokeWidth={2} className="text-[var(--muted)]" /> 资源信息
        </h4>
        <dl className="mt-4 space-y-1">
          {resources.map(({ icon: ResIcon, label, value, link }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg bg-[var(--soft-2)] px-3 py-2.5"
            >
              <dt className="flex items-center gap-2 w-[130px] shrink-0 text-[13px] text-[var(--text)]">
                <ResIcon size={13} strokeWidth={2} className="text-[var(--muted)] shrink-0" /> {label}
              </dt>
              <dd
                className={cn(
                  "flex-1 min-w-0 truncate font-mono text-xs",
                  link ? "text-indigo-600 cursor-pointer hover:underline" : "text-[var(--text)]"
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
