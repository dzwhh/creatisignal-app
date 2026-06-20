"use client"

import { useCallback, useSyncExternalStore } from "react"
import { ASSETS_BY_TAB, type AssetItem, type AssetTab } from "./mock"

// ─── State shape ───────────────────────────────────────────────────────────

type AssetsState = {
  /** 用户运行时新增的素材；按 tab 分桶，新增项排在桶前面 */
  added: Record<AssetTab, AssetItem[]>
}

function defaultState(): AssetsState {
  return {
    added: { generated: [], uploaded: [], avatars: [], products: [], trash: [] },
  }
}

// ─── Store ─────────────────────────────────────────────────────────────────

let cached: AssetsState | null = null
const listeners = new Set<() => void>()

function read(): AssetsState {
  if (typeof window === "undefined") return SERVER_SNAPSHOT
  if (!cached) cached = defaultState()
  return cached
}

function set(updater: (prev: AssetsState) => AssetsState) {
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

const SERVER_SNAPSHOT: AssetsState = defaultState()
function getServerSnapshot(): AssetsState { return SERVER_SNAPSHOT }

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAssetsState() {
  const state = useSyncExternalStore(subscribe, read, getServerSnapshot)

  /** 取 tab 完整素材：用户新增（在前） + base mock */
  const getItems = useCallback(
    (tab: AssetTab): AssetItem[] => [...state.added[tab], ...ASSETS_BY_TAB[tab]],
    [state]
  )

  /** 把一个素材追加到 tab 的最前面 */
  const addAsset = useCallback((tab: AssetTab, item: AssetItem) => {
    set((s) => ({
      ...s,
      added: { ...s.added, [tab]: [item, ...s.added[tab]] },
    }))
  }, [])

  const reset = useCallback(() => {
    cached = defaultState()
    listeners.forEach((l) => l())
  }, [])

  return { state, getItems, addAsset, reset }
}

// ─── DEV helpers ───────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  ;(window as unknown as Record<string, unknown>).__cs_resetAssets = () => {
    cached = defaultState()
    listeners.forEach((l) => l())
    // eslint-disable-next-line no-console
    console.info("[CS] assets reset")
  }
}
