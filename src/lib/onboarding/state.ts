"use client"

import { useCallback, useSyncExternalStore } from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskKind = "report" | "video" | "brief" | "analysis"

export type OnboardingState = {
  dismissed: boolean              // 用户主动跳过引导
  firstWinDone: boolean           // 完成了首次任务（任意 mode）
  firstWinKind: TaskKind | null   // 完成的是哪种任务
  firstWinSeenAt: string | null   // toast 是否已经展示过（关闭后不再弹）
  freeTriesUsed: number           // 本周已用免费次数
  freeTrialResetAt: string        // 下一次重置 ISO 时间
  revealHintSeen: boolean         // 首次点卡揭示 chat box 后的"点这里提交"箭头是否已显示过
}

const KEY = "creatisignal_onboarding_v1"
const FREE_TRIES_PER_WEEK = 2

// ─── Defaults & week reset ───────────────────────────────────────────────────

function nextMondayLocal(): string {
  const d = new Date()
  const day = d.getDay() // 0=Sun..6=Sat
  const daysToMon = ((1 - day + 7) % 7) || 7
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysToMon, 0, 0, 0, 0)
  return next.toISOString()
}

function defaultState(): OnboardingState {
  return {
    dismissed: false,
    firstWinDone: false,
    firstWinKind: null,
    firstWinSeenAt: null,
    freeTriesUsed: 0,
    freeTrialResetAt: nextMondayLocal(),
    revealHintSeen: false,
  }
}

function applyWeekReset(s: OnboardingState): OnboardingState {
  if (new Date(s.freeTrialResetAt).getTime() > Date.now()) return s
  return { ...s, freeTriesUsed: 0, freeTrialResetAt: nextMondayLocal() }
}

// ─── Store (in-memory mirror + localStorage backing) ─────────────────────────

let cached: OnboardingState | null = null
const listeners = new Set<() => void>()

function read(): OnboardingState {
  if (typeof window === "undefined") return defaultState()
  if (cached) return cached
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed: OnboardingState = raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState()
    cached = applyWeekReset(parsed)
    if (cached !== parsed) writeStorage(cached)
    return cached
  } catch {
    cached = defaultState()
    return cached
  }
}

function writeStorage(s: OnboardingState) {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)) } catch {}
}

function set(updater: (prev: OnboardingState) => OnboardingState) {
  const prev = read()
  const next = updater(prev)
  if (next === prev) return
  cached = next
  writeStorage(next)
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  // Cross-tab sync
  function onStorage(e: StorageEvent) {
    if (e.key !== KEY) return
    cached = null
    cb()
  }
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(cb)
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage)
  }
}

// SSR snapshot — must return a STABLE reference, otherwise useSyncExternalStore
// re-renders forever ("getServerSnapshot should be cached" warning).
const SERVER_SNAPSHOT: OnboardingState = defaultState()
function getServerSnapshot(): OnboardingState {
  return SERVER_SNAPSHOT
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOnboardingState() {
  const state = useSyncExternalStore(subscribe, read, getServerSnapshot)

  const isNewUser = !state.dismissed && !state.firstWinDone
  const freeTriesRemaining = Math.max(0, FREE_TRIES_PER_WEEK - state.freeTriesUsed)

  const dismiss = useCallback(() => {
    set((s) => ({ ...s, dismissed: true }))
  }, [])

  const markFirstWin = useCallback((kind: TaskKind) => {
    set((s) => s.firstWinDone ? s : { ...s, firstWinDone: true, firstWinKind: kind })
  }, [])

  const markFirstWinSeen = useCallback(() => {
    set((s) => ({ ...s, firstWinSeenAt: new Date().toISOString() }))
  }, [])

  const markRevealHintSeen = useCallback(() => {
    set((s) => s.revealHintSeen ? s : { ...s, revealHintSeen: true })
  }, [])

  const useTrial = useCallback(() => {
    set((s) => s.freeTriesUsed >= FREE_TRIES_PER_WEEK ? s : { ...s, freeTriesUsed: s.freeTriesUsed + 1 })
  }, [])

  const reset = useCallback(() => {
    cached = defaultState()
    writeStorage(cached)
    listeners.forEach((l) => l())
  }, [])

  return {
    state,
    isNewUser,
    freeTriesRemaining,
    freeTriesTotal: FREE_TRIES_PER_WEEK,
    shouldShowFirstWinToast: state.firstWinDone && !state.firstWinSeenAt,
    shouldShowRevealHint: !state.revealHintSeen,
    dismiss,
    markFirstWin,
    markFirstWinSeen,
    markRevealHintSeen,
    useTrial,
    reset,
  }
}

// ─── DEV helpers ─────────────────────────────────────────────────────────────

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as unknown as Record<string, unknown>).__cs_resetOnboarding = () => {
    cached = defaultState()
    writeStorage(cached)
    listeners.forEach((l) => l())
    // eslint-disable-next-line no-console
    console.info("[CS] onboarding reset →", cached)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as unknown as Record<string, unknown>).__cs_skipOnboarding = () => {
    set((s) => ({ ...s, dismissed: true }))
    // eslint-disable-next-line no-console
    console.info("[CS] onboarding dismissed")
  }
}
