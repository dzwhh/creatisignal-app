"use client"

import { useMemo } from "react"
import { useDiscoveryState, type TrackedBrand } from "@/lib/discovery/state"
import { BRANDS, type BrandProfile } from "./mock"
import { hashSeed, type CollectionState } from "./collection"
import type { BrandDetailData } from "./mock"

const LOGO_POOL = [
  "linear-gradient(135deg,#84cc16,#3f6212)",
  "linear-gradient(135deg,#c9ff29,#5a7821)",
  "linear-gradient(135deg,#ecfccb,#84cc16)",
  "linear-gradient(135deg,#a3e635,#365314)",
]

/**
 * 把 session 新增的 TrackedBrand 适配成 BrandProfile。
 * 数值字段全是 0 —— 这是刻意的：采集中的卡片布局根本不显示这些槽位，
 * 显示 0 / — 恰恰是我们要消灭的「这产品没数据」印象。
 */
export function toBrandProfile(t: TrackedBrand): BrandProfile {
  const seed = hashSeed(t.id)
  return {
    id: t.id,
    name: t.name,
    category: "新追踪",
    logoBg: LOGO_POOL[seed % LOGO_POOL.length],
    platforms: ["tiktok"],
    engagementScore: 0,
    materialCount: 0,
    lastAdDate: "—",
    weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
    active: true,
  }
}

/** 列表页唯一数据源：静态演示品牌 + session 新增品牌 */
export function useTrackedBrands(): BrandProfile[] {
  const { state } = useDiscoveryState()
  return useMemo(
    () => [...BRANDS, ...state.trackedBrands.map(toBrandProfile)],
    [state.trackedBrands]
  )
}

/**
 * 按采集覆盖度截断详情数据。
 * 图表保住完整 x 轴（补零），只是未采集区间为空 —— 由图表自己画斜线区。
 */
export function scaleDetail(detail: BrandDetailData, col: CollectionState): BrandDetailData {
  if (col.phase === "live") return detail

  const ratio = col.daysCollected / col.daysTarget
  const timeline = detail.dailyTimeline.map((v, i) => (i < col.daysCollected ? v : 0))
  const countryCount = Math.max(3, Math.round(10 * ratio))

  return {
    ...detail,
    profile: { ...detail.profile, materialCount: col.itemsCollected },
    dailyTimeline: timeline,
    countryTop: detail.countryTop.slice(0, countryCount).map((c) => ({
      ...c,
      value: Math.max(1, Math.round(c.value * ratio)),
    })),
    creativeTypes: detail.creativeTypes.map((t) => ({
      ...t,
      count: Math.max(1, Math.round(t.count * ratio)),
    })),
    recent30: {
      newMaterials: Math.round(detail.recent30.newMaterials * ratio),
      recentEngagement: Math.round(detail.recent30.recentEngagement * ratio),
      avgScore: Math.round(detail.recent30.avgScore * ratio),
    },
  }
}
