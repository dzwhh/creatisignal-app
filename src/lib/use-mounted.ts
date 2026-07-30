"use client"

import { useSyncExternalStore } from "react"

const noopSubscribe = () => () => {}

/**
 * SSR 时返回 false，客户端 hydrate 后返回 true。
 * 用于把「依赖当前时间」的内容推迟到 mount 之后，避免 hydration mismatch。
 * 比 useState+useEffect 好：没有 setState-in-effect 的级联渲染。
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}
