"use client"

import { useMemo } from "react"
import { Ban, CheckCircle2, Edit3, ShieldCheck } from "lucide-react"
import type { ElementBreakdown } from "@/lib/insights/types"
import { ElementCard } from "../element-card"

interface Props {
  items: ElementBreakdown[]
}

export function BreakdownStep({ items }: Props) {
  // 聚合三色边界给右侧 sticky 摘要
  const summary = useMemo(() => {
    const mustKeep = items.flatMap((i) => i.mustKeep).slice(0, 8)
    const canVary  = items.flatMap((i) => i.canVary).slice(0, 8)
    const forbidden = items.flatMap((i) => i.forbidden).slice(0, 6)
    return { mustKeep, canVary, forbidden }
  }, [items])

  return (
    <div className="grid grid-cols-[1fr_300px] gap-6">
      <main className="space-y-4">
        <div>
          <h2 className="text-[19px] font-extrabold text-[var(--text)] mb-1">这条素材到底哪里有效？</h2>
          <p className="text-[12.5px] text-[var(--muted)]">按电商内容元素拆分 — 每个元素都告诉你「保留 / 可变 / 禁止」</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {items.map((it) => <ElementCard key={it.key} item={it} />)}
        </div>
      </main>

      {/* 右侧 sticky 复刻边界摘要 */}
      <aside className="sticky top-3 self-start max-h-[calc(100vh-180px)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-white p-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[var(--muted)]" />
          <h3 className="text-[13.5px] font-extrabold text-[var(--text)]">复刻边界（摘要）</h3>
        </div>

        <SummaryBlock
          tone="keep"
          icon={<CheckCircle2 size={11} />}
          label={`生成时必须保留（${summary.mustKeep.length}）`}
          items={summary.mustKeep}
        />
        <SummaryBlock
          tone="change"
          icon={<Edit3 size={11} />}
          label={`可以改（${summary.canVary.length}）`}
          items={summary.canVary}
        />
        <SummaryBlock
          tone="ban"
          icon={<Ban size={11} />}
          label={`不能碰（${summary.forbidden.length}）`}
          items={summary.forbidden}
        />
      </aside>
    </div>
  )
}

function SummaryBlock({ tone, icon, label, items }: {
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
    <div className="rounded-xl p-3 border" style={{ backgroundColor: meta.bg, borderColor: meta.border }}>
      <div className="flex items-center gap-1 mb-1.5 text-[10.5px] font-extrabold uppercase tracking-wide" style={{ color: meta.color }}>
        {icon}{label}
      </div>
      <ul className="space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="text-[11px] text-[var(--text)] leading-relaxed flex items-start gap-1">
            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: meta.color }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
