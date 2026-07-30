"use client"

import { useSyncExternalStore } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

export type CollectionPhase = "queued" | "initial" | "backfill" | "live"

export type CollectionEventKind =
  | "queued" | "connect" | "page" | "dedupe" | "backfill" | "parse" | "done" | "refresh"

export type CollectionEvent = {
  id: string
  atMs: number              // 相对 startedAt 的偏移，渲染时才转绝对时间
  kind: CollectionEventKind
  text: string
  count?: number            // 本次入库素材数
}

export type CollectionState = {
  brandId: string
  phase: CollectionPhase
  progress: number          // 0..100 单调递增
  daysCollected: number     // 0..180
  daysTarget: number
  itemsCollected: number
  itemsEstimated: number
  accountsFound: number
  etaMinutes: number        // 剩余；live 时 0
  elapsedMinutes: number
  lastSyncMinAgo: number    // live 稳态
  nextSyncMinutes: number   // live 稳态
  feed: CollectionEvent[]   // newest-first，上限 14
}

// ─── 对外口径 vs 演示时钟 ────────────────────────────────────────────────────
// ETA 必须是可信的产品数字（30 分钟），但演示不能等 30 分钟 —— 两者解耦。

export const COLLECTION_PLAN = {
  daysTarget: 180,
  nominalTotalMin: 30,       // 对外：首次采集 ≈ 30 分钟
  refreshIntervalHours: 1,   // 对外：完成后每小时增量更新
  demoDurationMs: 150_000,   // 演示：150 秒跑完全程
  tickMs: 1_200,
  feedCap: 14,
}

export const PHASE_META: Record<CollectionPhase | "paused", {
  label: string; short: string; dot: string; bg: string; text: string; pulse: boolean
}> = {
  queued:   { label: "已排队",     short: "排队中", dot: "#a1a1aa", bg: "#f4f4f5",          text: "#52525b",           pulse: false },
  initial:  { label: "首次采集中", short: "采集中", dot: "#84cc16", bg: "var(--lime-soft)", text: "#3f6212",           pulse: true  },
  backfill: { label: "历史回溯中", short: "回溯中", dot: "#84cc16", bg: "var(--lime-soft)", text: "#3f6212",           pulse: true  },
  live:     { label: "实时追踪中", short: "追踪中", dot: "#37a46a", bg: "var(--green)",     text: "var(--green-text)", pulse: true  },
  // paused 描述「品牌」而非「我们」，故不是 CollectionPhase
  paused:   { label: "投放暂停",   short: "暂停",   dot: "#a1a1aa", bg: "#f4f4f5",          text: "var(--muted-2)",    pulse: false },
}

export function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// ─── ETA / 节奏 文案 ─────────────────────────────────────────────────────────

export function formatEta(min: number): string {
  if (min < 2) return "即将完成"
  if (min < 60) return `预计 ${min} 分钟后完成`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `预计 ${h} 小时后完成` : `预计 ${h} 小时 ${m} 分钟后完成`
}

export function formatEtaShort(min: number): string {
  if (min < 2) return "即将完成"
  if (min < 60) return `约 ${min} 分钟`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `约 ${h} 小时` : `约 ${h} 小时 ${m} 分`
}

export const CADENCE_TEXT = `完成后每小时增量更新 · 每日 ${24 / COLLECTION_PLAN.refreshIntervalHours} 次`
export const CADENCE_SHORT = "每小时增量更新"

export function isCollecting(phase: CollectionPhase): boolean {
  return phase !== "live"
}

// ─── 阶段时间表 ──────────────────────────────────────────────────────────────

const SCHEDULE: { phase: CollectionPhase; from: number; to: number; p0: number; p1: number; d0: number; d1: number }[] = [
  { phase: "queued",   from: 0,    to: 0.04, p0: 0,  p1: 3,   d0: 0, d1: 0   },
  { phase: "initial",  from: 0.04, to: 0.30, p0: 3,  p1: 32,  d0: 0, d1: 7   },
  { phase: "backfill", from: 0.30, to: 1.0,  p0: 32, p1: 100, d0: 7, d1: 180 },
]

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 2.2) }

const PLATFORM_LABEL = ["TikTok", "Meta"]

/** 按进度产出事件脚本 —— 用 brandId 播种，两个品牌不重样 */
function eventAt(seed: number, phase: CollectionPhase, step: number, days: number, total: number): CollectionEvent {
  const k = (n: number) => (seed + step * 7 + n) % 100
  const id = `${phase}-${step}`
  switch (phase) {
    case "queued":
      return { id, atMs: 0, kind: "queued", text: "已加入采集队列 · 等待调度" }
    case "initial": {
      if (step === 0) {
        const plat = PLATFORM_LABEL[seed % 2]
        return { id, atMs: 0, kind: "connect", text: `已连接 ${plat} 广告库 · 命中 ${3 + (seed % 6)} 个投放账户` }
      }
      if (step % 2 === 1) {
        return { id, atMs: 0, kind: "page", text: `抓取在投素材 第 ${Math.ceil(step / 2)} 页`, count: 18 + (k(3) % 34) }
      }
      return { id, atMs: 0, kind: "dedupe", text: "去重与指纹比对完成 · 有效素材", count: 12 + (k(5) % 28) }
    }
    case "backfill": {
      if (step % 3 === 2) {
        return { id, atMs: 0, kind: "parse", text: "解析创意结构（Hook / 场景 / CTA）", count: 9 + (k(7) % 22) }
      }
      const d1 = Math.max(1, days)
      const d0 = Math.max(0, d1 - (8 + (k(2) % 12)))
      return { id, atMs: 0, kind: "backfill", text: `回溯历史投放 ${d0}–${d1} 天`, count: 20 + (k(11) % 40) }
    }
    case "live":
      return { id, atMs: 0, kind: "done", text: `首次采集完成 · 共 ${total.toLocaleString()} 条素材入库` }
  }
}

// ─── Store（module-level 单例；扛住客户端导航） ──────────────────────────────

type Runtime = { startedAtMs: number | null }

let cached: Record<string, CollectionState> | null = null
const runtimes = new Map<string, Runtime>()
const listeners = new Set<() => void>()
let ticker: ReturnType<typeof setInterval> | null = null

function seedLive(brandId: string, lastSyncMinAgo: number): CollectionState {
  const seed = hashSeed(brandId)
  const items = 400 + (seed % 1600)
  return {
    brandId,
    phase: "live",
    progress: 100,
    daysCollected: COLLECTION_PLAN.daysTarget,
    daysTarget: COLLECTION_PLAN.daysTarget,
    itemsCollected: items,
    itemsEstimated: items,
    accountsFound: 3 + (seed % 6),
    etaMinutes: 0,
    elapsedMinutes: COLLECTION_PLAN.nominalTotalMin,
    lastSyncMinAgo,
    nextSyncMinutes: Math.max(1, 60 - lastSyncMinAgo),
    feed: [{ id: "refresh-0", atMs: 0, kind: "refresh", text: "增量更新完成", count: 4 + (seed % 12) }],
  }
}

/** 冻结在飞行中的品牌：渲染出采集中处理，但不会在你没看的时候跑完 */
function seedFrozen(brandId: string, progress: number): CollectionState {
  const seed = hashSeed(brandId)
  const itemsEstimated = 1200 + (seed % 900)
  const days = Math.round(lerp(7, 180, (progress - 32) / 68))
  const itemsCollected = Math.round(itemsEstimated * easeOut(progress / 100))
  const feed: CollectionEvent[] = []
  for (let i = 5; i >= 0; i--) {
    const e = eventAt(seed, "backfill", i, Math.max(1, days - i * 9), itemsEstimated)
    feed.push({ ...e, id: `frozen-${i}`, atMs: -i * 6_000 })
  }
  return {
    brandId,
    phase: "backfill",
    progress,
    daysCollected: days,
    daysTarget: COLLECTION_PLAN.daysTarget,
    itemsCollected,
    itemsEstimated,
    accountsFound: 3 + (seed % 6),
    etaMinutes: Math.ceil(COLLECTION_PLAN.nominalTotalMin * (1 - progress / 100)),
    elapsedMinutes: Math.floor(COLLECTION_PLAN.nominalTotalMin * (progress / 100)),
    lastSyncMinAgo: 0,
    nextSyncMinutes: 0,
    feed,
  }
}

/** 5 个静态演示品牌的种子状态 —— 不能全是 live，否则功能首屏不可见 */
function defaultStates(): Record<string, CollectionState> {
  return {
    "wuben":         seedLive("wuben", 12),
    "waterdrop":     seedLive("waterdrop", 41),
    "mobilfox":      seedLive("mobilfox", 8),
    "fisher-price":  seedFrozen("fisher-price", 62),
    "toys-arabic":   seedLive("toys-arabic", 27),
  }
}

const SERVER_SNAPSHOT: Record<string, CollectionState> = defaultStates()
function getServerSnapshot() { return SERVER_SNAPSHOT }

function read(): Record<string, CollectionState> {
  if (typeof window === "undefined") return SERVER_SNAPSHOT
  if (cached) return cached
  cached = defaultStates()
  return cached
}

function emit() { listeners.forEach((l) => l()) }

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

// ─── 推进逻辑 ────────────────────────────────────────────────────────────────

function advance(prev: CollectionState, elapsedMs: number): CollectionState {
  const t = Math.min(1, elapsedMs / COLLECTION_PLAN.demoDurationMs)
  const seed = hashSeed(prev.brandId)

  if (t >= 1) {
    const feed = prev.phase === "live"
      ? prev.feed
      : [eventAt(seed, "live", 0, 180, prev.itemsEstimated), ...prev.feed].slice(0, COLLECTION_PLAN.feedCap)
    return {
      ...prev,
      phase: "live",
      progress: 100,
      daysCollected: COLLECTION_PLAN.daysTarget,
      itemsCollected: prev.itemsEstimated,
      etaMinutes: 0,
      elapsedMinutes: COLLECTION_PLAN.nominalTotalMin,
      lastSyncMinAgo: 0,
      nextSyncMinutes: 60,
      feed,
    }
  }

  const seg = SCHEDULE.find((s) => t >= s.from && t < s.to) ?? SCHEDULE[0]
  const local = (t - seg.from) / (seg.to - seg.from)
  const progress = Math.round(lerp(seg.p0, seg.p1, local))
  const daysCollected = Math.round(lerp(seg.d0, seg.d1, local))
  const itemsCollected = Math.round(prev.itemsEstimated * easeOut(progress / 100))

  // 事件：按阶段内的步数节流（initial ~4s，backfill ~6s）
  const stepMs = seg.phase === "backfill" ? 6_000 : 4_000
  const step = Math.floor(((t - seg.from) * COLLECTION_PLAN.demoDurationMs) / stepMs)
  const nextEvent = eventAt(seed, seg.phase, step, daysCollected, prev.itemsEstimated)
  const alreadyLogged = prev.feed[0]?.id === nextEvent.id
  const feed = alreadyLogged
    ? prev.feed
    : [{ ...nextEvent, atMs: elapsedMs }, ...prev.feed].slice(0, COLLECTION_PLAN.feedCap)

  return {
    ...prev,
    phase: seg.phase,
    progress: Math.max(prev.progress, progress),
    daysCollected: Math.max(prev.daysCollected, daysCollected),
    itemsCollected: Math.max(prev.itemsCollected, itemsCollected),
    etaMinutes: Math.ceil(COLLECTION_PLAN.nominalTotalMin * (1 - progress / 100)),
    elapsedMinutes: Math.floor(COLLECTION_PLAN.nominalTotalMin * (progress / 100)),
    feed,
  }
}

function tick() {
  const states = read()
  const now = Date.now()
  let changed = false
  const next: Record<string, CollectionState> = { ...states }

  for (const [id, st] of Object.entries(states)) {
    const rt = runtimes.get(id)
    if (!rt?.startedAtMs || st.phase === "live") continue
    const advanced = advance(st, now - rt.startedAtMs)
    if (advanced !== st) { next[id] = advanced; changed = true }
  }

  if (changed) { cached = next; emit() }

  // 全部到达 live 后停表
  const anyRunning = Object.entries(next).some(
    ([id, s]) => s.phase !== "live" && runtimes.get(id)?.startedAtMs
  )
  if (!anyRunning && ticker) { clearInterval(ticker); ticker = null }
}

function ensureTicker() {
  if (ticker || typeof window === "undefined") return
  ticker = setInterval(tick, COLLECTION_PLAN.tickMs)
}

/** 为新添加的品牌启动采集 */
export function startCollection(brandId: string) {
  if (typeof window === "undefined") return
  const states = read()
  if (states[brandId]) return
  const seed = hashSeed(brandId)
  const itemsEstimated = 900 + (seed % 1200)
  cached = {
    ...states,
    [brandId]: {
      brandId,
      phase: "queued",
      progress: 0,
      daysCollected: 0,
      daysTarget: COLLECTION_PLAN.daysTarget,
      itemsCollected: 0,
      itemsEstimated,
      accountsFound: 3 + (seed % 6),
      etaMinutes: COLLECTION_PLAN.nominalTotalMin,
      elapsedMinutes: 0,
      lastSyncMinAgo: 0,
      nextSyncMinutes: 0,
      feed: [eventAt(seed, "queued", 0, 0, itemsEstimated)],
    },
  }
  runtimes.set(brandId, { startedAtMs: Date.now() })
  emit()
  ensureTicker()
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useCollectionMap(): Record<string, CollectionState> {
  return useSyncExternalStore(subscribe, read, getServerSnapshot)
}

export function useCollection(brandId: string): CollectionState {
  const map = useCollectionMap()
  return map[brandId] ?? seedLive(brandId, 15)
}

export function useCollectionSummary(): { collecting: number; live: number; total: number } {
  const map = useCollectionMap()
  const all = Object.values(map)
  const collecting = all.filter((s) => s.phase !== "live").length
  return { collecting, live: all.length - collecting, total: all.length }
}

// ─── DEV helpers ─────────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  const w = window as unknown as Record<string, unknown>
  w.__cs_startCollection = (id: string) => startCollection(id)
  w.__cs_resetCollection = () => {
    cached = defaultStates()
    runtimes.clear()
    if (ticker) { clearInterval(ticker); ticker = null }
    emit()
  }
}
