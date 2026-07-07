import { ArrowRight, Sparkles } from "lucide-react"
import type { CreativeInsight, CreativeType } from "@/lib/competitors/mock"

const STEPS = [
  { key: "hook", label: "Hook · 开场" },
  { key: "middle", label: "Middle · 展开" },
  { key: "ending", label: "Ending · 收尾" },
] as const

const FACETS = [
  { key: "tactics", label: "核心打法" },
  { key: "visualStyle", label: "视觉风格" },
  { key: "palette", label: "配色" },
] as const

export function CreativeInsightCard({ insight, types }: { insight: CreativeInsight; types: CreativeType[] }) {
  const maxPct = Math.max(...types.map((t) => t.pct), 1)
  return (
    <div className="h-full rounded-2xl border border-[var(--line)] bg-white p-5 flex flex-col transition-colors hover:border-[var(--line-strong)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold text-[var(--text)]">竞品创意速览</h2>
        <span className="h-[22px] px-2.5 rounded-full bg-[#18181b] text-[10.5px] font-extrabold text-[var(--lime)] flex items-center gap-1">
          <Sparkles size={10} strokeWidth={2.4} />
          AI 基于 Top 素材浓缩分析
        </span>
      </div>

      {/* Hook → Middle → Ending 三段公式 */}
      <div className="mt-4 flex items-stretch gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-stretch gap-1.5 flex-1 min-w-0">
            <div className="flex-1 min-w-0 rounded-xl bg-[var(--soft-2)] border border-[var(--line)] p-3">
              <p className="text-[10.5px] font-extrabold text-[#5a7821] flex items-center gap-1.5">
                <span className="w-[17px] h-[17px] rounded-full bg-[#18181b] text-[var(--lime)] flex items-center justify-center text-[9.5px] tabular-nums">
                  {i + 1}
                </span>
                {s.label}
              </p>
              <p className="text-[12px] text-[var(--text)] leading-relaxed mt-2">{insight.formula[s.key]}</p>
            </div>
            {i < STEPS.length - 1 && (
              <span className="self-center shrink-0 text-[var(--muted-2)]">
                <ArrowRight size={13} strokeWidth={2.2} />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 打法 / 风格 / 配色 三列 */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        {FACETS.map((f) => (
          <div key={f.key}>
            <p className="text-[10.5px] font-extrabold uppercase tracking-wide text-[var(--muted-2)]">{f.label}</p>
            <p className="text-[12px] text-[var(--text)] leading-relaxed mt-1">{insight[f.key]}</p>
          </div>
        ))}
      </div>

      {/* 关键元素 */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-[var(--muted-2)]">关键元素</span>
        {insight.keyElements.map((el) => (
          <span
            key={el}
            className="h-[22px] px-2.5 rounded-full bg-[var(--lime-soft)] text-[#3f6212] text-[11px] font-bold flex items-center"
          >
            {el}
          </span>
        ))}
      </div>

      {/* 创意类型聚合 */}
      <div className="mt-auto pt-4 border-t border-[var(--line)]">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11.5px] font-extrabold text-[var(--muted)]">创意类型聚合</p>
          <span className="text-[10.5px] text-[var(--muted-2)]">按创意手法归类</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {types.map((t) => (
            <div key={t.label} className="flex items-center gap-2.5 text-[12px]">
              <span className="w-16 text-[var(--text)] font-bold truncate shrink-0">{t.label}</span>
              <div className="flex-1 h-[5px] rounded-full bg-[var(--soft)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max((t.pct / maxPct) * 100, 4)}%`, background: "linear-gradient(90deg,#c9ff29,#84cc16)" }}
                />
              </div>
              <span className="shrink-0 tabular-nums font-extrabold text-[#3f6212]">{t.count}</span>
              <span className="w-10 shrink-0 text-right tabular-nums text-[var(--muted-2)]">{t.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
