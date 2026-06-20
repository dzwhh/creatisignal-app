"use client"

import { Play, RefreshCw } from "lucide-react"
import { getCompetitorMaterialsByBrand, type CompetitorSort } from "@/lib/insights/mock"
import type { TrackedBrand } from "@/lib/discovery/state"

interface Props {
  brand: TrackedBrand
  sort?: CompetitorSort
  onUnfollow: () => void
}

export function BrandRow({ brand, sort = "latest", onUnfollow }: Props) {
  const materials = getCompetitorMaterialsByBrand(brand.id, 8, sort)
  const fallbackInitial = brand.name.slice(0, 2).toUpperCase()

  return (
    <article className="rounded-xl border border-[var(--line)] bg-white p-3 flex gap-3">
      {/* 左：品牌信息 */}
      <div className="w-[180px] shrink-0 flex flex-col gap-2">
        <div className="aspect-square rounded-lg border border-[var(--line)] bg-[var(--soft-2)] flex items-center justify-center overflow-hidden">
          {brand.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.avatar} alt={brand.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[24px] font-extrabold text-[var(--muted)] tracking-tight">{fallbackInitial}</span>
          )}
        </div>
        <div>
          <p className="text-[12.5px] font-extrabold text-[var(--text)] truncate">{brand.name}</p>
          <p className="text-[10.5px] text-[var(--muted)] mt-0.5">
            {brand.liveAdsCount} live ads
            {brand.stoppedCount > 0 ? ` · ${brand.stoppedCount} stopped` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onUnfollow}
          className="h-7 rounded-md border border-[var(--line)] text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center justify-center gap-1"
        >
          <RefreshCw size={10} strokeWidth={2.4} />
          Unfollow
        </button>
      </div>

      {/* 右：横向素材 */}
      <div className="flex-1 min-w-0 overflow-x-auto">
        <div className="flex gap-2">
          {materials.map((m) => (
            <div
              key={m.id}
              className="w-[100px] shrink-0 aspect-[9/14] rounded-lg overflow-hidden bg-[var(--soft)] relative cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.thumb} alt={m.id} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                <span className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow">
                  <Play size={12} className="text-[#18181b] translate-x-0.5" fill="#18181b" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
