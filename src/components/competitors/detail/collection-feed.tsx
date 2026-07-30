"use client"

import { useState } from "react"
import {
  Check, RefreshCw, Search, Layers, Radio, Sparkles, ChevronDown,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMounted } from "@/lib/use-mounted"
import {
  CADENCE_TEXT,
  formatEta,
  type CollectionEvent,
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

function cycleLabel(idx: number): string {
  if (idx === 0) return "最近一次更新"
  return `${idx} 小时前更新`
}

export function CollectionFeed({ col }: { col: CollectionState }) {
  const mounted = useMounted()
  const collecting = col.phase !== "live"
  // 采集中默认展开（此时它是页面最重要的对象）；稳态默认折叠，把版面还给图表
  const [open, setOpen] = useState(collecting)

  const activeIdx = STAGES.findIndex((s) => s.phase === col.phase)

  const stats = collecting
    ? [
        { label: "已采集素材", value: col.itemsCollected.toLocaleString() },
        { label: "已覆盖天数", value: `${col.daysCollected}/${col.daysTarget}` },
        { label: "命中投放账户", value: String(col.accountsFound) },
        { label: "预计完成", value: formatEta(col.etaMinutes).replace("预计 ", "").replace("后完成", "") },
      ]
    : [
        { label: "已追踪素材", value: col.itemsCollected.toLocaleString() },
        { label: "覆盖天数", value: `${col.daysCollected}/${col.daysTarget}` },
        { label: "命中投放账户", value: String(col.accountsFound) },
        { label: "下次更新", value: `${col.nextSyncMinutes} 分钟后` },
      ]

  // live 时按更新轮次分组，让「每一次更新的过程」成组可读
  const groups = groupByCycle(col.feed, collecting)

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white">
      {/* Header —— 整条可点，折叠开关 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 p-5 text-left cursor-pointer"
      >
        <div className="min-w-0">
          <h2 className="text-[16px] font-extrabold text-[var(--text)] flex items-center gap-2">
            追踪实况
            <span
              className={cn(
                "h-[19px] px-2 rounded-full text-[10px] font-extrabold flex items-center gap-1",
                collecting
                  ? "bg-[var(--lime-soft)] text-[#3f6212]"
                  : "bg-[var(--green)] text-[var(--green-text)]"
              )}
            >
              <span
                className="w-1 h-1 rounded-full animate-pulse"
                style={{ backgroundColor: collecting ? "#84cc16" : "#37a46a" }}
              />
              {collecting ? "采集中" : "实时追踪中"}
            </span>
          </h2>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            {collecting
              ? "正在从公开广告库抓取该品牌的投放素材"
              : `每次增量更新的完整过程都会记录在这里 · ${CADENCE_TEXT}`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* 折叠时把关键数字提到 header,不展开也知道在动 */}
          {!open && (
            <span className="text-[12px] font-bold text-[var(--muted)] tabular-nums hidden sm:block">
              {collecting
                ? `${col.progress}% · ${col.itemsCollected.toLocaleString()} 条`
                : `上次更新 ${col.lastSyncMinAgo} 分钟前`}
            </span>
          )}
          <span className="w-7 h-7 rounded-lg bg-[var(--soft)] text-[var(--muted)] flex items-center justify-center">
            <ChevronDown
              size={14}
              strokeWidth={2.4}
              className={cn("transition-transform duration-200", open && "rotate-180")}
            />
          </span>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          {/* 阶段 pipeline */}
          <div className="flex items-center gap-1.5 mb-4">
            {STAGES.map((s, i) => {
              const done = i < activeIdx
              const active = i === activeIdx
              return (
                <div key={s.phase} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors shrink-0",
                        done && "bg-[#84cc16] text-white",
                        active && "bg-[var(--lime)] text-[#20251a]",
                        !done && !active && "bg-[var(--soft)] text-[var(--muted-2)]"
                      )}
                    >
                      {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-bold whitespace-nowrap",
                        active ? "text-[var(--text)]" : "text-[var(--muted-2)]"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <span
                      className={cn(
                        "w-6 h-[2px] rounded-full transition-colors",
                        done ? "bg-[#84cc16]" : "bg-[var(--line)]"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] px-3.5 py-3">
                <p className="text-[11px] text-[var(--muted)]">{s.label}</p>
                <p className="mt-1 text-[18px] font-extrabold text-[var(--text)] tabular-nums leading-none">{s.value}</p>
              </div>
            ))}
          </div>

          {/* 采集中才需要「别以为没数据」这句;稳态不需要 */}
          {collecting && (
            <div className="rounded-lg bg-[var(--lime-soft)] px-3 py-2 mb-4">
              <p className="text-[12px] font-bold text-[#3f5416] leading-relaxed">
                数据正在持续入库 — 当前看到的是已采集部分，采集完成前所有指标会继续上升。
                <span className="ml-1 font-medium text-[#4a5c28]">{CADENCE_TEXT}</span>
              </p>
            </div>
          )}

          {/* 事件流:live 按更新轮次分组 */}
          <div className="max-h-[240px] overflow-y-auto pr-1 space-y-3">
            {groups.map((g, gi) => (
              <div key={g.key}>
                {g.label && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={cn(
                        "text-[11px] font-extrabold",
                        gi === 0 ? "text-[#3f6212]" : "text-[var(--muted-2)]"
                      )}
                    >
                      {g.label}
                    </span>
                    <span className="flex-1 h-px bg-[var(--line)]" />
                    {typeof g.total === "number" && g.total > 0 && (
                      <span className="text-[11px] font-extrabold text-[#5a7821] tabular-nums">
                        新增 {g.total} 条
                      </span>
                    )}
                  </div>
                )}
                <ul className="space-y-1">
                  {g.events.map((e, i) => {
                    const Icon = KIND_ICON[e.kind]
                    const newest = gi === 0 && i === 0
                    return (
                      <li
                        key={e.id}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px]",
                          newest
                            ? "bg-[var(--soft-2)] border-l-2 border-[var(--lime)] dh-fade-in"
                            : "border-l-2 border-transparent"
                        )}
                      >
                        <span className="w-5 h-5 rounded-md bg-[var(--soft)] text-[var(--muted)] flex items-center justify-center shrink-0">
                          <Icon size={11} strokeWidth={2} />
                        </span>
                        <span className="flex-1 min-w-0 truncate text-[var(--text)]">{e.text}</span>
                        {typeof e.count === "number" && (
                          <span className="text-[11px] font-extrabold text-[#5a7821] tabular-nums shrink-0">
                            +{e.count}
                          </span>
                        )}
                        <span className="text-[11px] text-[var(--muted-2)] tabular-nums shrink-0 w-[46px] text-right">
                          {mounted ? relTime(e.atMs, col.feed[0].atMs) : "—"}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

type Group = { key: string; label: string | null; events: CollectionEvent[]; total?: number }

/** 采集中:单列不分组。live:按 cycleIdx 分组,每组即一次更新的完整过程 */
function groupByCycle(feed: CollectionEvent[], collecting: boolean): Group[] {
  if (collecting) return [{ key: "all", label: null, events: feed }]

  const byIdx = new Map<number, CollectionEvent[]>()
  for (const e of feed) {
    const idx = e.cycleIdx ?? 0
    const list = byIdx.get(idx)
    if (list) list.push(e)
    else byIdx.set(idx, [e])
  }
  return [...byIdx.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([idx, events]) => ({
      key: `c${idx}`,
      label: cycleLabel(idx),
      events,
      total: events.reduce((sum, e) => sum + (e.count ?? 0), 0),
    }))
}

function relTime(atMs: number, newestMs: number): string {
  const delta = Math.max(0, Math.round((newestMs - atMs) / 1000))
  if (delta < 5) return "刚刚"
  if (delta < 60) return `${delta}s 前`
  return `${Math.round(delta / 60)}m 前`
}
