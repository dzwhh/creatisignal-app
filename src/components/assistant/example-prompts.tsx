"use client"

import { BarChart2, FileText, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export type ExampleMode = "report" | "generate" | "analysis" | "brief"
export type ExamplePick = { mode: ExampleMode; value: string }

const examples: { mode: ExampleMode; icon: React.ElementType; label: string; value: string }[] = [
  {
    mode: "report",
    icon: FileText,
    label: "粘贴 TikTok 链接",
    value: "https://tiktok.com/@hotligh/video/7234567890",
  },
  {
    mode: "generate",
    icon: Sparkles,
    label: "30s 磁吸车载灯演示",
    value: "Hotligh ZF7899 磁吸车载灯防水演示",
  },
  {
    mode: "analysis",
    icon: BarChart2,
    label: "分析 fp_001 表现",
    value: "分析 fp_001 在 US 账户的表现",
  },
]

interface Props {
  onPick: (pick: ExamplePick) => void
  className?: string
}

export function ExamplePrompts({ onPick, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <p className="text-[11.5px] text-[var(--muted-2)] font-semibold">试试这些示例</p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {examples.map(({ mode, icon: Icon, label, value }) => (
          <button
            key={mode + label}
            type="button"
            onClick={() => onPick({ mode, value })}
            className="h-8 px-3 rounded-full bg-[var(--lime-soft)] border border-[#cdf066] text-[#2f3d12] text-[12px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#e7f9a6] transition-colors"
          >
            <Icon size={12} strokeWidth={2.2} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
