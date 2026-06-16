"use client"

import { useState } from "react"
import { FileText, BarChart2, BookOpen, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { ReportMode } from "./modes/report-mode"
import { AnalysisMode } from "./modes/analysis-mode"
import { BriefMode } from "./modes/brief-mode"
import { GenerateMode } from "./modes/generate-mode"

const modes = [
  { id: "report", label: "创意Report", icon: FileText },
  { id: "analysis", label: "创意分析", icon: BarChart2 },
  { id: "brief", label: "创意 brief", icon: BookOpen },
  { id: "generate", label: "创意生成", icon: Sparkles },
] as const

export type ModeId = (typeof modes)[number]["id"]

export interface ChatPrefill {
  report?: string
  analysis?: string
  brief?: string
  generate?: string
}

interface Props {
  /** Controlled mode (if omitted, falls back to internal state) */
  mode?: ModeId
  onModeChange?: (m: ModeId) => void
  /** Pre-fill input for each mode */
  prefill?: ChatPrefill
  /** Called when a mode reaches a "first generate" action — used to fire First-Win */
  onFirstWin?: (kind: "report" | "video" | "brief" | "analysis") => void
  /** Show send-button spinner during simulated generation */
  submitting?: boolean
}

export function AssistantChat({ mode: controlledMode, onModeChange, prefill, onFirstWin, submitting }: Props = {}) {
  const [internalMode, setInternalMode] = useState<ModeId>("report")
  const mode = controlledMode ?? internalMode
  const setMode = (m: ModeId) => {
    if (controlledMode === undefined) setInternalMode(m)
    onModeChange?.(m)
  }

  return (
    <div className="flex flex-col items-center gap-[14px] w-full max-w-[760px] mx-auto">
      {/* Tab selector */}
      <div className="w-[520px] max-w-full border border-[var(--line)] rounded-xl bg-[var(--soft)] p-1">
        <div className="grid grid-cols-4 gap-[3px]">
          {modes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={cn(
                "h-[30px] rounded-[7px] text-[12px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors",
                mode === id
                  ? "bg-white text-[#09090b] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                  : "bg-transparent text-[#71717a]"
              )}
            >
              <Icon size={14} strokeWidth={2} className="shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat box */}
      <div className="relative w-full min-h-[134px] border border-[var(--line)] rounded-[20px] bg-white p-[18px] flex flex-col gap-7 shadow-[0_1px_2px_rgba(9,9,11,0.04),0_12px_28px_rgba(9,9,11,0.06)]">
        {mode === "report" && (
          <ReportMode
            initialUrl={prefill?.report}
            onSubmit={() => onFirstWin?.("report")}
            submitting={submitting}
          />
        )}
        {mode === "analysis" && (
          <AnalysisMode
            initialPrompt={prefill?.analysis}
            onSubmit={() => onFirstWin?.("analysis")}
            submitting={submitting}
          />
        )}
        {mode === "brief" && (
          <BriefMode
            initialPrompt={prefill?.brief}
            onSubmit={() => onFirstWin?.("brief")}
            submitting={submitting}
          />
        )}
        {mode === "generate" && (
          <GenerateMode
            initialPrompt={prefill?.generate}
            onSubmit={() => onFirstWin?.("video")}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  )
}
