import { cn } from "@/lib/utils"
import type { CountryStat } from "@/lib/competitors/mock"

export function CountryBars({ countries }: { countries: CountryStat[] }) {
  const max = Math.max(...countries.map((c) => c.value), 1)
  return (
    <div className="h-full rounded-2xl border border-[var(--line)] bg-white p-5 flex flex-col transition-colors hover:border-[var(--line-strong)]">
      <h2 className="text-[15px] font-extrabold text-[var(--text)]">投放国家 TOP10</h2>
      <p className="text-[11.5px] text-[var(--muted)] mt-0.5">按素材数量</p>
      <ul className="flex-1 mt-4 flex flex-col justify-between gap-1.5">
        {countries.map((c, i) => {
          const top3 = i < 3
          return (
            <li
              key={`${c.name}-${i}`}
              className="group flex items-center gap-2.5 rounded-lg px-1.5 py-[3px] -mx-1.5 transition-colors hover:bg-[var(--soft-2)]"
            >
              <span
                className={cn(
                  "w-[18px] h-[18px] rounded-md text-[10px] font-extrabold tabular-nums flex items-center justify-center shrink-0",
                  top3 ? "bg-[#18181b] text-[var(--lime)]" : "bg-[var(--soft)] text-[var(--muted)]"
                )}
              >
                {i + 1}
              </span>
              <span className="w-12 text-[12px] font-bold text-[var(--text)] truncate shrink-0">{c.name}</span>
              <div className="flex-1 h-[7px] rounded-full bg-[var(--soft)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max((c.value / max) * 100, 3)}%`,
                    background: top3 ? "linear-gradient(90deg,#c9ff29,#84cc16)" : "#d9f99d",
                  }}
                />
              </div>
              <span className="w-9 text-right text-[12px] font-extrabold text-[var(--text)] tabular-nums shrink-0">
                {c.value}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
