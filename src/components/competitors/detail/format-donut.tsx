import { Donut } from "../charts"
import type { FormatSlice } from "@/lib/competitors/mock"

export function FormatDonut({
  slices, total, collecting = false,
}: { slices: FormatSlice[]; total: number; collecting?: boolean }) {
  const sum = slices.reduce((a, s) => a + s.value, 0) || 1
  const lowSample = collecting && total < 20
  return (
    <div className="h-full rounded-2xl border border-[var(--line)] bg-white p-5 flex flex-col transition-colors hover:border-[var(--line-strong)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-extrabold text-[var(--text)]">格式分布</h2>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
            {collecting ? "样本随采集持续更新" : "按素材格式统计"}
          </p>
        </div>
        {lowSample && (
          <span className="h-[19px] px-2 rounded-full bg-[var(--soft)] text-[10px] font-extrabold text-[var(--muted)] flex items-center shrink-0">
            样本量偏小
          </span>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center mt-2">
        <Donut slices={slices} size={158} centerTitle={String(total)} centerSub={collecting ? "已采集" : "总计"} />
      </div>
      <ul className="mt-3 space-y-2">
        {slices.map((s) => {
          const pct = Math.round((s.value / sum) * 100)
          return (
            <li key={s.label} className="flex items-center gap-2.5 text-[12px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[var(--muted)] w-8 shrink-0">{s.label}</span>
              <div className="flex-1 h-[5px] rounded-full bg-[var(--soft)] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
              </div>
              <span className="w-9 text-right font-extrabold text-[var(--text)] tabular-nums shrink-0">{pct}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
