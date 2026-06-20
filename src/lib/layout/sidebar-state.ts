"use client"

import { useCallback, useSyncExternalStore } from "react"

const KEY = "creatisignal_sidebar_collapsed_v1"

let cached: boolean | null = null
const listeners = new Set<() => void>()

function read(): boolean {
  if (typeof window === "undefined") return false
  if (cached !== null) return cached
  try {
    const raw = window.localStorage.getItem(KEY)
    cached = raw === "1"
    return cached
  } catch {
    cached = false
    return cached
  }
}

function write(v: boolean) {
  try { window.localStorage.setItem(KEY, v ? "1" : "0") } catch {}
}

function subscribe(cb: () => void) {
  listeners.add(cb)
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

function getServerSnapshot(): boolean { return false }

export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, read, getServerSnapshot)

  const setCollapsed = useCallback((v: boolean) => {
    if (cached === v) return
    cached = v
    write(v)
    listeners.forEach((l) => l())
  }, [])

  const toggle = useCallback(() => {
    const next = !read()
    cached = next
    write(next)
    listeners.forEach((l) => l())
  }, [])

  return { collapsed, setCollapsed, toggle }
}

if (typeof window !== "undefined") {
  ;(window as unknown as Record<string, unknown>).__cs_resetSidebar = () => {
    cached = false
    write(false)
    listeners.forEach((l) => l())
    // eslint-disable-next-line no-console
    console.info("[CS] sidebar collapse reset → false")
  }
}
