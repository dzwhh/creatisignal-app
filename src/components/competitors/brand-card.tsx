"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLATFORM_META, formatScore, type BrandProfile } from "@/lib/competitors/mock"
import { useCollection, formatEtaShort } from "@/lib/competitors/collection"
import { Sparkline } from "./charts"
import { CollectionPill, CollectionProgressBar } from "./collection-pill"

export function BrandCard({ brand, isNew = false }: { brand: BrandProfile; isNew?: boolean }) {
  const col = useCollection(brand.id)
  const collecting = col.phase !== "live"

  return (
    <Link
      href={`/discover/brands/${brand.id}`}
      className={cn(
        "group block rounded-2xl border border-[var(--line)] bg-white overflow-hidden transition-all duration-300 hover:border-[#84cc16] hover:shadow-[0_12px_32px_rgba(132,204,22,0.14)] hover:-translate-y-0.5",
        isNew && "dh-fade-in picker-glow"
      )}
    >
      {/* 头部:logo + 品牌名 + 类目 + 采集/投放状态 */}
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
            <CollectionPill col={col} active={brand.active} />
          </div>
        </div>
      </div>

      {/* 中部:同一套骨架 —— 采集中换成进度语义，避免出现 0 / — 这类「没数据」印象 */}
      <div className="px-4 mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] text-[var(--muted)]">{collecting ? "已采集素材" : "互动评分"}</p>
          <p className="mt-0.5 inline-flex items-baseline gap-1 rounded-md bg-[var(--lime-soft)] px-2 py-0.5">
            <span className="text-[22px] font-extrabold tracking-tight text-[#3f6212] tabular-nums leading-none">
              {collecting ? col.itemsCollected.toLocaleString() : formatScore(brand.engagementScore)}
            </span>
          </p>
        </div>
        <div className="flex gap-4 pb-0.5">
          <div className="text-right">
            <p className="text-[11px] text-[var(--muted)]">{collecting ? "已覆盖" : "素材数"}</p>
            <p className="text-[14px] font-extrabold text-[var(--text)] tabular-nums mt-0.5">
              {collecting ? `${col.daysCollected}/${col.daysTarget} 天` : brand.materialCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[var(--muted)]">{collecting ? "预计完成" : "最新投放"}</p>
            <p className="text-[14px] font-extrabold text-[var(--text)] tabular-nums mt-0.5">
              {collecting ? formatEtaShort(col.etaMinutes) : brand.lastAdDate}
            </p>
          </div>
        </div>
      </div>

      {/* 进度轨:两个 phase 都渲染,否则采集中的卡会把整排撑高 */}
      <div className="px-4 mt-2.5">
        <CollectionProgressBar col={col} />
      </div>

      {/* 底部:平台 + 趋势/实况 + CTA */}
      <div className="mt-3 px-4 py-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {brand.platforms.map((p) => (
            <span
              key={p}
              className="h-[20px] px-2 rounded-full border border-[var(--line)] text-[10.5px] font-bold text-[var(--muted)] flex items-center shrink-0"
            >
              {PLATFORM_META[p].label}
            </span>
          ))}
          {collecting ? (
            <span className="flex items-center gap-1.5 min-w-0 text-[10.5px] text-[var(--muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse shrink-0" />
              <span className="truncate">{col.feed[0]?.text ?? "正在采集"}</span>
            </span>
          ) : (
            <Sparkline data={brand.weeklyTrend} width={72} height={22} />
          )}
        </div>
        <span className="text-[12px] font-extrabold text-[var(--muted)] group-hover:text-[#5a7821] flex items-center gap-1 transition-colors shrink-0">
          {collecting ? "查看采集进度" : "查看详情"}
          <ArrowRight size={12} strokeWidth={2.4} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
