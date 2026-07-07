import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLATFORM_META, formatScore, type BrandProfile } from "@/lib/competitors/mock"
import { Sparkline } from "./charts"

export function BrandCard({ brand }: { brand: BrandProfile }) {
  return (
    <Link
      href={`/discover/brands/${brand.id}`}
      className="group block rounded-2xl border border-[var(--line)] bg-white overflow-hidden transition-all duration-300 hover:border-[#84cc16] hover:shadow-[0_12px_32px_rgba(132,204,22,0.14)] hover:-translate-y-0.5"
    >
      {/* 头部:logo + 品牌名 + 类目(只出现一次) */}
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <span
          className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white text-[14px] font-extrabold"
          style={{ background: brand.logoBg }}
        >
          {brand.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold text-[var(--text)] truncate">{brand.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-[var(--muted)]">{brand.category}</span>
            <span
              className={cn(
                "h-[16px] px-1.5 rounded-full text-[10px] font-extrabold flex items-center",
                brand.active
                  ? "bg-[var(--green)] text-[var(--green-text)]"
                  : "bg-[#f4f4f5] text-[var(--muted-2)]"
              )}
            >
              {brand.active ? "活跃" : "暂停"}
            </span>
          </div>
        </div>
      </div>

      {/* 中部:互动评分大数字 + 素材数 + 最新投放 */}
      <div className="px-4 mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-[var(--muted)]">互动评分</p>
          <p className="mt-0.5 inline-flex items-baseline gap-1 rounded-md bg-[var(--lime-soft)] px-2 py-0.5">
            <span className="text-[22px] font-extrabold tracking-tight text-[#3f6212] tabular-nums leading-none">
              {formatScore(brand.engagementScore)}
            </span>
          </p>
        </div>
        <div className="flex gap-4 pb-0.5">
          <div className="text-right">
            <p className="text-[11px] text-[var(--muted)]">素材数</p>
            <p className="text-[14px] font-extrabold text-[var(--text)] tabular-nums mt-0.5">{brand.materialCount}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[var(--muted)]">最新投放</p>
            <p className="text-[14px] font-extrabold text-[var(--text)] tabular-nums mt-0.5">{brand.lastAdDate}</p>
          </div>
        </div>
      </div>

      {/* 底部:平台 + 7 天趋势 + 查看详情 */}
      <div className="mt-4 px-4 py-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {brand.platforms.map((p) => (
            <span
              key={p}
              className="h-[20px] px-2 rounded-full border border-[var(--line)] text-[10.5px] font-bold text-[var(--muted)] flex items-center"
            >
              {PLATFORM_META[p].label}
            </span>
          ))}
          <Sparkline data={brand.weeklyTrend} width={72} height={22} />
        </div>
        <span className="text-[12px] font-extrabold text-[var(--muted)] group-hover:text-[#5a7821] flex items-center gap-1 transition-colors">
          查看详情
          <ArrowRight size={12} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
