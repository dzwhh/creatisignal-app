"use client"

import * as React from "react"
import {
  ArrowRight,
  Bookmark,
  Copy,
  GitBranch,
  Lightbulb,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { ChartView } from "./mock-charts"
import type { AgentAnswer, AnswerActionKind } from "@/lib/agent/state"

const ACTION_META: Record<AnswerActionKind, { label: string; icon: typeof Bookmark; primary?: boolean }> = {
  save_to_library: { label: "保存到资产库", icon: Bookmark },
  next_brief:      { label: "生成下一轮 Brief", icon: Sparkles, primary: true },
  go_replicate:    { label: "进入爆款复刻", icon: GitBranch },
}

const SUGGESTION_TONE: Record<"violet" | "amber" | "blue" | "green", { bg: string; color: string }> = {
  violet: { bg: "#f5f3ff", color: "#6d28d9" },
  amber:  { bg: "#fffbeb", color: "#a16207" },
  blue:   { bg: "#eff6ff", color: "#1d4ed8" },
  green:  { bg: "#f0fdf4", color: "#15803d" },
}

const KPI_TONE: Record<"violet" | "amber" | "blue" | "green", { bg: string; color: string }> = SUGGESTION_TONE

interface Props {
  answer: AgentAnswer
}

export function AnswerCard({ answer }: Props) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      {/* Intro */}
      <div className="px-5 pt-4 pb-3 border-b border-[var(--line)]">
        <p className="text-[13px] text-[var(--text)] leading-relaxed">{answer.intro}</p>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* KPI strip */}
        {answer.kpis && answer.kpis.length > 0 && (
          <div className={cn(
            "grid gap-2",
            answer.kpis.length === 3 ? "grid-cols-3" : "grid-cols-4"
          )}>
            {answer.kpis.map((k) => {
              const tone = KPI_TONE[k.tone ?? "blue"]
              return (
                <div key={k.label} className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: tone.color }}>{k.label}</p>
                  <p className="text-[18px] font-extrabold text-[var(--text)] mt-1 leading-none tabular-nums">{k.value}</p>
                  {k.sub && <p className="text-[10px] text-[var(--muted)] mt-1 font-bold">{k.sub}</p>}
                </div>
              )
            })}
          </div>
        )}

        {/* Charts */}
        {answer.charts && answer.charts.length > 0 && (
          <div className="space-y-3">
            {answer.charts.map((c, i) => (
              <figure key={i} className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-4">
                <figcaption className="mb-3">
                  <p className="text-[12.5px] font-extrabold text-[var(--text)]">{c.title}</p>
                  {c.caption && <p className="text-[10.5px] text-[var(--muted)] mt-0.5">{c.caption}</p>}
                </figcaption>
                <ChartView block={c} />
              </figure>
            ))}
          </div>
        )}

        {/* Table */}
        {answer.table && (
          <figure className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
            {answer.table.title && (
              <p className="px-4 py-2.5 border-b border-[var(--line)] text-[12px] font-extrabold text-[var(--text)]">{answer.table.title}</p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[10.5px] font-extrabold uppercase tracking-wide">
                    {answer.table.columns.map((c) => (
                      <th key={c} className="text-left px-4 py-2">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {answer.table.rows.map((row, i) => (
                    <tr key={i} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                      {row.map((cell, j) => (
                        <td key={j} className={cn(
                          "px-4 py-2",
                          j === 0 ? "font-extrabold text-[var(--text)]" : "text-[var(--muted)] tabular-nums"
                        )}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        )}

        {/* Highlights */}
        {answer.highlights && answer.highlights.length > 0 && (
          <div className="rounded-xl border border-[#cdf066] bg-[var(--lime-soft)] p-4">
            <p className="text-[11px] font-extrabold text-[#3a4b1f] uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Lightbulb size={11} strokeWidth={2.6} />
              Key Findings
            </p>
            <ul className="space-y-1.5">
              {answer.highlights.map((h, i) => (
                <li key={i} className="text-[12px] text-[#3a4b1f] leading-relaxed flex gap-2">
                  <span className="font-extrabold shrink-0">{i + 1}.</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {answer.suggestions && answer.suggestions.length > 0 && (
          <div>
            <p className="text-[10.5px] font-extrabold text-[var(--muted)] uppercase tracking-wide mb-2">建议</p>
            <div className="flex flex-wrap gap-1.5">
              {answer.suggestions.map((s, i) => {
                const tone = SUGGESTION_TONE[s.tone]
                return (
                  <button
                    key={i}
                    type="button"
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-bold cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: tone.bg, color: tone.color }}
                  >
                    {s.label}
                    <ArrowRight size={10} strokeWidth={2.4} />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action row */}
      {answer.actions && answer.actions.length > 0 && (
        <footer className="px-5 py-3 border-t border-[var(--line)] bg-[var(--soft-2)] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <IconBtn icon={ThumbsUp} label="有帮助" />
            <IconBtn icon={ThumbsDown} label="无帮助" />
            <IconBtn icon={Copy} label="复制结果" />
          </div>
          <div className="flex items-center gap-2">
            {answer.actions.map((a) => {
              const meta = ACTION_META[a]
              if (meta.primary) {
                return (
                  <RainbowButton key={a} type="button" className="h-9 px-3.5 rounded-xl text-[12px]">
                    <meta.icon size={12} strokeWidth={2.4} className="mr-1.5" />
                    {meta.label}
                  </RainbowButton>
                )
              }
              return (
                <button
                  key={a}
                  type="button"
                  className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[12px] font-bold text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer flex items-center gap-1.5"
                >
                  <meta.icon size={11} strokeWidth={2.4} />
                  {meta.label}
                </button>
              )
            })}
          </div>
        </footer>
      )}
    </section>
  )
}

function IconBtn({ icon: Icon, label }: { icon: typeof Bookmark; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer"
    >
      <Icon size={12} strokeWidth={2.4} />
    </button>
  )
}
