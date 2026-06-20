"use client"

import * as React from "react"
import {
  Brain,
  Database,
  Filter,
  Globe,
  Image as ImageIcon,
  Loader2,
  BarChart3,
  Sparkles,
  Wand2,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReasoningStep } from "@/lib/agent/state"

const ICONS = {
  brain:    Brain,
  globe:    Globe,
  database: Database,
  barchart: BarChart3,
  image:    ImageIcon,
  sparkles: Sparkles,
  filter:   Filter,
  wand:     Wand2,
} as const

interface Props {
  steps: ReasoningStep[]
}

export function ReasoningTrace({ steps }: Props) {
  const allDone = steps.every((s) => s.status === "done")
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            allDone ? "bg-[var(--lime-soft)] text-[#5a7821]" : "bg-[#f5f3ff] text-[#7c3aed]"
          )}>
            {allDone ? <Check size={14} strokeWidth={2.6} /> : <Sparkles size={14} strokeWidth={2.4} className="animate-pulse" />}
          </span>
          <div>
            <p className="text-[12.5px] font-extrabold text-[var(--text)]">
              {allDone ? "推理完成" : "正在推理…"}
            </p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              {steps.filter((s) => s.status === "done").length} / {steps.length} 步
            </p>
          </div>
        </div>
      </div>

      <ol className="relative">
        {/* 竖向连线 */}
        <span aria-hidden className="absolute left-[14px] top-1 bottom-1 w-px bg-[var(--line)]" />
        {steps.map((step, i) => {
          const Icon = ICONS[step.iconName] ?? Brain
          const isDone     = step.status === "done"
          const isRunning  = step.status === "running"
          return (
            <li key={step.id} className={cn("relative flex items-start gap-3", i > 0 && "mt-3")}>
              <span
                className={cn(
                  "relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 transition-colors",
                  isDone
                    ? "bg-[var(--lime-soft)] text-[#5a7821] border-2 border-[#cdf066]"
                    : isRunning
                      ? "bg-[#f5f3ff] text-[#7c3aed] border-2 border-[#c4b5fd]"
                      : "bg-white text-[var(--muted-2)] border-2 border-[var(--line)]"
                )}
              >
                {isRunning
                  ? <Loader2 size={13} className="animate-spin" />
                  : isDone
                    ? <Check size={13} strokeWidth={2.8} />
                    : <Icon size={13} strokeWidth={2.2} />}
              </span>
              <div className={cn(
                "flex-1 pt-0.5 transition-opacity",
                step.status === "pending" ? "opacity-50" : "opacity-100"
              )}>
                <div className="flex items-center gap-1.5">
                  <Icon size={11} className={cn("shrink-0", isDone ? "text-[#5a7821]" : isRunning ? "text-[#7c3aed]" : "text-[var(--muted-2)]")} strokeWidth={2.2} />
                  <p className={cn(
                    "text-[12.5px] font-extrabold",
                    isDone ? "text-[var(--text)]" : isRunning ? "text-[var(--text)]" : "text-[var(--muted)]"
                  )}>
                    {step.label}
                  </p>
                  {isRunning && (
                    <span className="inline-flex items-center h-4 px-1.5 rounded-md bg-[#ede9fe] text-[#6d28d9] text-[9.5px] font-extrabold ml-1">
                      RUN
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">{step.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
