"use client"

import { useCallback, useSyncExternalStore } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdPlatform = "tiktok_ads" | "meta_ads" | "google_ads" | "snap_ads"

export const AD_PLATFORM_META: Record<AdPlatform, { label: string; desc: string; color: string }> = {
  tiktok_ads: { label: "TikTok Ads",   desc: "GMV Max · Manual · Live Shopping", color: "#000000" },
  meta_ads:   { label: "Meta Ads",     desc: "Facebook · Instagram Ads",          color: "#0866ff" },
  google_ads: { label: "Google Ads",   desc: "Search · Display · YouTube",        color: "#fbbc04" },
  snap_ads:   { label: "Snap Ads",     desc: "Snapchat Story Ads",                color: "#fffc00" },
}

export type MarketCategory =
  | "tools_outdoor"
  | "home_decor"
  | "beauty_personal"
  | "tech_3c"
  | "fashion_accessory"
  | "sports_fitness"

export const MARKET_CATEGORY_META: Record<MarketCategory, { label: string }> = {
  tools_outdoor:     { label: "工具户外" },
  home_decor:        { label: "家居装饰" },
  beauty_personal:   { label: "美妆个护" },
  tech_3c:           { label: "3C 数码" },
  fashion_accessory: { label: "服饰配饰" },
  sports_fitness:    { label: "运动健身" },
}

export type TrackedBrand = {
  id: string
  name: string
  homepage: string
  avatar?: string         // 头像 URL（可选）
  addedAt: string
  liveAdsCount: number
  stoppedCount: number
}

export type DiscoveryState = {
  ownAds: {
    authorized: boolean
    platforms: AdPlatform[]
    grantedAt?: string
  }
  marketPrefs: {
    configured: boolean
    countries: string[]            // 国家码 (US/UK/...)
    categories: MarketCategory[]
    description?: string
    setAt?: string
  }
  trackedBrands: TrackedBrand[]    // 数组顺序即 UI 显示顺序
}

function defaultState(): DiscoveryState {
  return {
    ownAds:        { authorized: false, platforms: [] },
    marketPrefs:   { configured: false, countries: [], categories: [] },
    trackedBrands: [],
  }
}

// ─── Store（session-only：刷新即回到首次 gated 状态） ───────────────────────

let cached: DiscoveryState | null = null
const listeners = new Set<() => void>()

function read(): DiscoveryState {
  if (typeof window === "undefined") return SERVER_SNAPSHOT
  if (cached) return cached
  cached = defaultState()
  return cached
}

function set(updater: (prev: DiscoveryState) => DiscoveryState) {
  const prev = read()
  const next = updater(prev)
  if (next === prev) return
  cached = next
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

const SERVER_SNAPSHOT: DiscoveryState = defaultState()
function getServerSnapshot(): DiscoveryState { return SERVER_SNAPSHOT }

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDiscoveryState() {
  const state = useSyncExternalStore(subscribe, read, getServerSnapshot)

  const grantPlatforms = useCallback((platforms: AdPlatform[]) => {
    set((s) => ({
      ...s,
      ownAds: { authorized: platforms.length > 0, platforms, grantedAt: new Date().toISOString() },
    }))
  }, [])

  const setMarketPrefs = useCallback((prefs: { countries: string[]; categories: MarketCategory[]; description?: string }) => {
    set((s) => ({
      ...s,
      marketPrefs: {
        configured: prefs.countries.length > 0 || prefs.categories.length > 0,
        ...prefs,
        setAt: new Date().toISOString(),
      },
    }))
  }, [])

  const addBrand = useCallback((b: Omit<TrackedBrand, "id" | "addedAt" | "liveAdsCount" | "stoppedCount">) => {
    set((s) => {
      const seed = b.name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now().toString(36)
      const hashSeed = b.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
      const liveAdsCount = 120 + (hashSeed * 7) % 240
      const stoppedCount = (hashSeed * 3) % 30
      const newBrand: TrackedBrand = {
        ...b,
        id: seed,
        addedAt: new Date().toISOString(),
        liveAdsCount,
        stoppedCount,
      }
      if (s.trackedBrands.some((x) => x.name.toLowerCase() === b.name.toLowerCase())) return s
      return { ...s, trackedBrands: [...s.trackedBrands, newBrand] }
    })
  }, [])

  const removeBrand = useCallback((id: string) => {
    set((s) => ({ ...s, trackedBrands: s.trackedBrands.filter((b) => b.id !== id) }))
  }, [])

  const reset = useCallback(() => {
    cached = defaultState()
    listeners.forEach((l) => l())
  }, [])

  return { state, grantPlatforms, setMarketPrefs, addBrand, removeBrand, reset }
}

// ─── DEV helpers ─────────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  ;(window as unknown as Record<string, unknown>).__cs_resetDiscovery = () => {
    cached = defaultState()
    listeners.forEach((l) => l())
    // eslint-disable-next-line no-console
    console.info("[CS] discovery reset →", cached)
  }
}
