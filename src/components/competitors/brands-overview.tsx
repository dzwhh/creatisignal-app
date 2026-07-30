"use client"

import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDiscoveryState } from "@/lib/discovery/state"
import { AddBrandDialog } from "@/components/assistant/discovery/add-brand-dialog"
import { BRAND_LIMIT } from "@/lib/competitors/mock"
import { useTrackedBrands } from "@/lib/competitors/tracked"
import { startCollection, useCollectionMap } from "@/lib/competitors/collection"
import { BrandStatCards } from "./brand-stat-cards"
import { BrandCard } from "./brand-card"

type SortKey = "score" | "latest" | "materials"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "score", label: "互动评分" },
  { key: "latest", label: "最新投放" },
  { key: "materials", label: "素材数" },
]

export function BrandsOverview() {
  const [sortBy, setSortBy] = useState<SortKey>("score")
  const [search, setSearch] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const { addBrand } = useDiscoveryState()
  const allBrands = useTrackedBrands()
  const colMap = useCollectionMap()

  const trackedCount = allBrands.length
  const atLimit = trackedCount >= BRAND_LIMIT
  const collectingCount = allBrands.filter((b) => {
    const p = colMap[b.id]?.phase
    return p !== undefined && p !== "live"
  }).length

  const brands = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? allBrands.filter((b) => b.name.toLowerCase().includes(q) || b.category.includes(q))
      : allBrands
    return [...filtered].sort((a, b) => {
      // 采集中的品牌置顶 —— 用户刚添加的品牌不用滚动就能看到
      const aCollecting = colMap[a.id] && colMap[a.id].phase !== "live" ? 1 : 0
      const bCollecting = colMap[b.id] && colMap[b.id].phase !== "live" ? 1 : 0
      if (aCollecting !== bCollecting) return bCollecting - aCollecting
      if (sortBy === "score") return b.engagementScore - a.engagementScore
      if (sortBy === "materials") return b.materialCount - a.materialCount
      return b.lastAdDate.localeCompare(a.lastAdDate)
    })
  }, [search, sortBy, allBrands, colMap])

  function handleAdd(b: { name: string; homepage: string; avatar?: string }) {
    const created = addBrand(b)
    if (created) {
      startCollection(created.id)
      setJustAddedId(created.id)
    }
  }

  return (
    <>
      {/* 页头 */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-[850] leading-snug text-[var(--text)]">品牌追踪</h1>
          <p className="mt-1.5 text-[14px] text-[var(--muted)]">
            追踪竞品品牌的素材动态、投放节奏与创意打法
            {collectingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#5a7821]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse" />
                {collectingCount} 个采集中
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[12px] font-bold text-[var(--muted-2)] tabular-nums">
            {trackedCount}/{BRAND_LIMIT}
          </span>
          <button
            type="button"
            disabled={atLimit}
            onClick={() => setAddOpen(true)}
            title={atLimit ? `已达 ${BRAND_LIMIT}/${BRAND_LIMIT} 追踪上限` : undefined}
            className={cn(
              "h-[34px] rounded-full px-[18px] text-[13px] font-extrabold flex items-center gap-1.5 transition-opacity",
              atLimit
                ? "bg-[#f4f4f5] text-[var(--muted-2)] cursor-not-allowed"
                : "bg-[var(--lime)] text-[#20251a] cursor-pointer hover:opacity-90"
            )}
          >
            <Plus size={14} strokeWidth={2.5} />
            {atLimit ? "已达上限" : "添加品牌"}
          </button>
        </div>
      </div>

      <BrandStatCards />

      {/* 工具条 */}
      <div className="flex items-center justify-between gap-4 mt-7 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] font-extrabold text-[var(--text)]">本周竞品动态</h2>
          <span className="text-[12px] text-[var(--muted-2)]">基于已追踪品牌</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-[3px] border border-[var(--line)] rounded-full bg-[#f5f5f6] p-[3px]">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSortBy(opt.key)}
                className={cn(
                  "border rounded-full h-[26px] px-3 text-[12px] font-extrabold cursor-pointer whitespace-nowrap transition-colors",
                  sortBy === opt.key
                    ? "border-white bg-white text-[#181b20] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    : "border-transparent bg-transparent text-[#777b83]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="h-[34px] w-[200px] border border-[var(--line)] rounded-lg bg-white px-[11px] flex items-center gap-1.5 text-[13px] text-[var(--muted-2)]">
            <Search size={14} strokeWidth={2} className="shrink-0" />
            <input
              className="flex-1 outline-none border-0 bg-transparent text-[13px] placeholder:text-[var(--muted-2)]"
              placeholder="搜索品牌或类目..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 品牌卡 grid */}
      {brands.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {brands.map((b) => (
            <BrandCard key={b.id} brand={b} isNew={b.id === justAddedId} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--line-strong)] py-14 text-center text-[13px] text-[var(--muted-2)]">
          没有匹配「{search}」的品牌
        </div>
      )}

      <AddBrandDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />
    </>
  )
}
