"use client"

import { Check, RefreshCw, Search, Layers, Radio, Sparkles, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMounted } from "@/lib/use-mounted"
import {
  CADENCE_TEXT,
  formatEta,
  type CollectionEventKind,
  type CollectionPhase,
  type CollectionState,
} from "@/lib/competitors/collection"

const STAGES: { phase: CollectionPhase; label: string }[] = [
  { phase: "queued",   label: "排队" },
  { phase: "initial",  label: "首次采集" },
  { phase: "backfill", label: "历史回溯" },
  { phase: "live",     label: "实时追踪" },
]

const KIND_ICON: Record<CollectionEventKind, LucideIcon> = {
  queued: Layers,
  connect: Radio,
  page: Search,
  dedupe: Layers,
  backfill: RefreshCw,
  parse: Sparkles,
  done: Check,
  refresh: RefreshCw,
}

/** 事件时间戳只在 mount 后渲染 —— 避免 SSR/CSR hydration mismatch */
export function CollectionFeed({ col }: { col: CollectionState }) {
  const mounted = useMounted()
  const activeIdx = STAGES.findIndex((s) => s.phase === col.phase)

  const stats = [
    { label: "已采集素材", value: col.itemsCollected.toLocaleString() },
    { label: "已覆盖天数", value: `${col.daysCollected}/${col.daysTarget}` },
    { label: "命中投放账户", value: String(col.accountsFound) },
    { label: "预计完成", value: formatEta(col.etaMinutes).replace("预计 ", "").replace("后完成", "") },
  ]

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[16px] font-extrabold text-[var(--text)]">采集实况</h2>
          <p className="mt-1 text-[12px] text-[var(--muted)]">正在从公开广告库抓取该品牌的投放素材</p>
        </div>
        {/* 阶段 pipeline */}
        <div className="flex items-center gap-1.5 shrink-0">
          {STAGES.map((s, i) => {
            const done = i < activeIdx
            const active = i === activeIdx
            return (
              <div key={s.phase} className="flex items-center gap-1.5">
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors",
                      done && "bg-[#84cc16] text-white",
                      active && "bg-[var(--lime)] text-[#20251a]",
                      !done && !active && "bg-[var(--soft)] text-[var(--muted-2)]"
                    )}
                  >
                    {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold whitespace-nowrap",
                      active ? "text-[var(--text)]" : "text-[var(--muted-2)]"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <span
                    className={cn(
                      "w-5 h-[2px] rounded-full mb-4 transition-colors",
                      done ? "bg-[#84cc16]" : "bg-[var(--line)]"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </header>

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] px-3.5 py-3">
            <p className="text-[11px] text-[var(--muted)]">{s.label}</p>
            <p className="mt-1 text-[18px] font-extrabold text-[var(--text)] tabular-nums leading-none">{s.value}</p>
          </div>
        ))}
      </div>

      {/* 反「没数据」核心句 */}
      <div className="rounded-lg bg-[var(--lime-soft)] px-3 py-2 mb-4">
        <p className="text-[12px] font-bold text-[#3f5416] leading-relaxed">
          数据正在持续入库 — 当前看到的是已采集部分，采集完成前所有指标会继续上升。
          <span className="ml-1 font-medium text-[#4a5c28]">{CADENCE_TEXT}</span>
        </p>
      </div>

      {/* 事件流 */}
      <ul className="max-h-[176px] overflow-y-auto space-y-1 pr-1">
        {col.feed.map((e, i) => {
          const Icon = KIND_ICON[e.kind]
          return (
            <li
              key={e.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px]",
                i === 0
                  ? "bg-[var(--soft-2)] border-l-2 border-[var(--lime)] dh-fade-in"
                  : "border-l-2 border-transparent"
              )}
            >
              <span className="w-5 h-5 rounded-md bg-[var(--soft)] text-[var(--muted)] flex items-center justify-center shrink-0">
                <Icon size={11} strokeWidth={2} />
              </span>
              <span className="flex-1 min-w-0 truncate text-[var(--text)]">{e.text}</span>
              {typeof e.count === "number" && (
                <span className="text-[11px] font-extrabold text-[#5a7821] tabular-nums shrink-0">+{e.count}</span>
              )}
              <span className="text-[11px] text-[var(--muted-2)] tabular-nums shrink-0 w-[46px] text-right">
                {mounted ? relTime(e.atMs, col.feed[0].atMs) : "—"}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function relTime(atMs: number, newestMs: number): string {
  const delta = Math.max(0, Math.round((newestMs - atMs) / 1000))
  if (delta < 5) return "刚刚"
  if (delta < 60) return `${delta}s 前`
  return `${Math.round(delta / 60)}m 前`
}
