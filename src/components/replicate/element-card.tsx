"use client"

import { Ban, CheckCircle2, Edit3 } from "lucide-react"
import { ELEMENT_META, LIFECYCLE_META, type ElementBreakdown } from "@/lib/insights/types"

interface Props {
  item: ElementBreakdown
}

export function ElementCard({ item }: Props) {
  const meta = ELEMENT_META[item.key]
  const lcMeta = LIFECYCLE_META[item.lifecyclePhase]

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[18px] leading-none">{meta.icon}</span>
          <div className="min-w-0">
            <h3 className="text-[13.5px] font-extrabold text-[var(--text)] leading-snug">{meta.label}</h3>
            <p className="text-[10.5px] text-[var(--muted-2)] font-semibold">{meta.question}</p>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-extrabold border shrink-0"
          style={{
            backgroundColor: lcMeta.dot + "15",
            borderColor: lcMeta.dot + "55",
            color: lcMeta.dot,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lcMeta.dot }} />
          {lcMeta.short}
        </span>
      </div>

      {/* 拆解结论 */}
      <div>
        <p className="text-[10.5px] font-bold text-[var(--muted-2)] uppercase tracking-wide mb-1">拆解结论</p>
        <p className="text-[12.5px] font-semibold text-[var(--text)] leading-relaxed">{item.conclusion}</p>
      </div>

      {/* 数据支撑 */}
      <div>
        <p className="text-[10.5px] font-bold text-[var(--muted-2)] uppercase tracking-wide mb-1">数据支撑</p>
        <p className="text-[11.5px] text-[var(--muted)] leading-relaxed">{item.dataSupport}</p>
      </div>

      {/* 三色边界压缩版 */}
      <div className="space-y-1.5">
        <BoundaryRow tone="keep"    icon={<CheckCircle2 size={11} />} label="必须保留" items={item.mustKeep} />
        <BoundaryRow tone="change"  icon={<Edit3 size={11} />}        label="可以变化" items={item.canVary} />
        <BoundaryRow tone="ban"     icon={<Ban size={11} />}          label="禁止复制" items={item.forbidden} />
      </div>
    </article>
  )
}

function BoundaryRow({ tone, icon, label, items }: {
  tone: "keep" | "change" | "ban"
  icon: React.ReactNode
  label: string
  items: string[]
}) {
  const meta = {
    keep:   { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d" },
    change: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    ban:    { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
  }[tone]
  return (
    <div className="rounded-lg border p-2" style={{ backgroundColor: meta.bg, borderColor: meta.border }}>
      <div className="flex items-center gap-1 mb-1 text-[10px] font-extrabold uppercase tracking-wide" style={{ color: meta.color }}>
        {icon}{label}
      </div>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it} className="text-[11px] text-[var(--text)] leading-relaxed flex items-start gap-1">
            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: meta.color }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
