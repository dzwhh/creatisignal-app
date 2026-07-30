"use client"

import { ProgressRing } from "@/components/ui/progress-ring"
import { PHASE_META, formatEta, CADENCE_TEXT, type CollectionState } from "@/lib/competitors/collection"

/** 采集中时占据 hero glass strip —— 复用外壳，不新增 section */
export function CollectionStrip({ col }: { col: CollectionState }) {
  const meta = PHASE_META[col.phase]
  return (
    <div className="relative mt-4 rounded-xl bg-white/[0.04] backdrop-blur border border-white/[0.06] px-4 py-3.5 flex items-center gap-5">
      {/* 左:阶段 */}
      <div className="min-w-0 shrink-0">
        <p className="flex items-center gap-1.5 text-[12px] font-extrabold text-[var(--lime)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)] animate-pulse" />
          {meta.label}
        </p>
        <p className="mt-1 text-[11px] text-white/40">正在从公开广告库抓取</p>
      </div>

      {/* 中:进度条 + 覆盖度 */}
      <div className="flex-1 min-w-0">
        <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden relative">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#c9ff29,#84cc16)] transition-[width] duration-700 ease-out"
            style={{ width: `${col.progress}%` }}
          />
          <span className="absolute inset-y-0 w-10 cs-sweep bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)]" />
        </div>
        <p className="mt-2 text-[11px] text-white/45 tabular-nums">
          已采集 {col.daysCollected}/{col.daysTarget} 天 · {col.itemsCollected.toLocaleString()} 条素材
          <span className="ml-2 text-white/25">{CADENCE_TEXT}</span>
        </p>
      </div>

      {/* 右:进度环 + ETA */}
      <div className="shrink-0 flex items-center gap-3">
        <div className="text-right">
          <p className="text-[12px] font-extrabold text-white tabular-nums">{formatEta(col.etaMinutes)}</p>
          <p className="mt-1 text-[11px] text-white/35 tabular-nums">已进行 {col.elapsedMinutes} 分钟</p>
        </div>
        <ProgressRing
          progress={col.progress}
          size={40}
          track="rgba(255,255,255,0.12)"
          stroke="var(--lime)"
          textColor="#ffffff"
        />
      </div>
    </div>
  )
}
