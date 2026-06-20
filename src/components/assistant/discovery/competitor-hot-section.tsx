"use client"

import { useMemo, useState } from "react"
import { Crosshair, Plus } from "lucide-react"
import { useDiscoveryState, type TrackedBrand } from "@/lib/discovery/state"
import type { CompetitorSort } from "@/lib/insights/mock"
import { SectionShell } from "./section-shell"
import { GatedEmptyState } from "./gated-empty-state"
import { AddBrandDialog } from "./add-brand-dialog"
import { BrandRow } from "./brand-row"
import { TabStrip } from "./tab-strip"

const COMPETITOR_TABS = [
  { id: "latest",    label: "最新投放" },
  { id: "played",    label: "播放最多" },
  { id: "engaged",   label: "互动最高" },
  { id: "sustained", label: "持续投放" },
] as const

function sortBrands(brands: TrackedBrand[], sort: CompetitorSort): TrackedBrand[] {
  const copy = brands.slice()
  switch (sort) {
    case "latest":
      copy.sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt))
      break
    case "played":
      copy.sort((a, b) => b.liveAdsCount - a.liveAdsCount)
      break
    case "engaged":
      // mock engagement = liveAds + stopped*2（让 stopped 多的反而靠前）
      copy.sort((a, b) => (b.liveAdsCount + b.stoppedCount * 2) - (a.liveAdsCount + a.stoppedCount * 2))
      break
    case "sustained":
      // sustained = 持续在跑：liveAds 比例越高越前（低 stopped 比例优先）
      copy.sort((a, b) => {
        const ra = a.liveAdsCount / Math.max(1, a.liveAdsCount + a.stoppedCount)
        const rb = b.liveAdsCount / Math.max(1, b.liveAdsCount + b.stoppedCount)
        return rb - ra
      })
      break
  }
  return copy
}

export function CompetitorHotSection() {
  const { state, addBrand, removeBrand } = useDiscoveryState()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<CompetitorSort>("latest")
  const hasBrands = state.trackedBrands.length > 0
  const sortedBrands = useMemo(() => sortBrands(state.trackedBrands, tab), [state.trackedBrands, tab])

  return (
    <>
      <SectionShell
        title="竞对爆款"
        subtitle="最近竞对表现好的素材"
        actions={
          hasBrands ? (
            <>
              <TabStrip<CompetitorSort> tabs={COMPETITOR_TABS} value={tab} onChange={setTab} />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="h-8 px-3 rounded-full border border-[var(--line)] text-[11.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
              >
                <Plus size={11} strokeWidth={2.4} />
                添加品牌
              </button>
            </>
          ) : null
        }
      >
        {hasBrands ? (
          <div className="space-y-3">
            {sortedBrands.map((b) => (
              <BrandRow key={b.id} brand={b} sort={tab} onUnfollow={() => removeBrand(b.id)} />
            ))}
          </div>
        ) : (
          <GatedEmptyState
            icon={<Crosshair size={22} strokeWidth={2.2} />}
            headline="添加要追踪的竞品品牌，跟进它们的爆量素材"
            subline="添加后系统每日抓取该品牌正在投放的素材，按 live ads 数排序。"
            ctaLabel="添加追踪品牌"
            onCta={() => setOpen(true)}
          />
        )}
      </SectionShell>

      <AddBrandDialog open={open} onOpenChange={setOpen} onAdd={addBrand} />
    </>
  )
}
