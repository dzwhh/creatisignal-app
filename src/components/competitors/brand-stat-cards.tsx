import { ArrowDown, ArrowUp, Flame, Layers, Radar, Users, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { LIST_STATS } from "@/lib/competitors/mock"

const ICONS: Record<(typeof LIST_STATS)[number]["key"], LucideIcon> = {
  total: Layers,
  hot: Flame,
  avg: Radar,
  brands: Users,
}

export function BrandStatCards() {
  return (
    <section className="grid grid-cols-4 gap-4">
      {LIST_STATS.map((s, idx) => {
        const Icon = ICONS[s.key]
        const up = s.delta > 0
        const flat = s.delta === 0
        const dark = idx === 0
        return (
          <div
            key={s.key}
            className={cn(
              "relative overflow-hidden rounded-2xl p-4 transition-colors",
              dark
                ? "bg-[#131316] shadow-[0_12px_32px_rgba(9,9,11,0.16)]"
                : "border border-[var(--line)] bg-white hover:border-[var(--line-strong)]"
            )}
          >
            {dark && (
              <div className="pointer-events-none absolute -right-14 -top-16 h-[190px] w-[190px] rounded-full bg-[radial-gradient(closest-side,rgba(201,255,41,0.2),transparent)]" />
            )}
            <div className="relative flex items-center justify-between">
              <span
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  dark ? "bg-white/[0.08] text-[var(--lime)]" : "bg-[var(--lime-soft)] text-[#5a7821]"
                )}
              >
                <Icon size={15} strokeWidth={1.8} />
              </span>
              {!flat && (
                <span
                  className={cn(
                    "h-[20px] px-1.5 rounded-full text-[11px] font-bold flex items-center gap-0.5 tabular-nums",
                    up
                      ? dark
                        ? "bg-[var(--lime)]/15 text-[var(--lime)]"
                        : "bg-emerald-50 text-emerald-600"
                      : dark
                        ? "bg-white/[0.08] text-red-400"
                        : "bg-red-50 text-red-500"
                  )}
                >
                  {up ? <ArrowUp size={10} strokeWidth={2.4} /> : <ArrowDown size={10} strokeWidth={2.4} />}
                  {up ? "+" : ""}{s.delta}%
                </span>
              )}
            </div>
            <p className={cn("relative text-xs mt-3", dark ? "text-white/45" : "text-[var(--muted)]")}>{s.label}</p>
            <p
              className={cn(
                "relative text-[26px] font-extrabold tracking-tight mt-1 leading-none tabular-nums",
                dark ? "text-[var(--lime)]" : "text-[var(--text)]"
              )}
            >
              {s.value}
            </p>
            <p className={cn("relative text-[11px] mt-2", dark ? "text-white/30" : "text-[var(--muted-2)]")}>{s.hint}</p>
          </div>
        )
      })}
    </section>
  )
}
