"use client"

import Link from "next/link"
import { BrandDetail } from "./brand-detail"
import { buildDetail, type BrandDetailData } from "@/lib/competitors/mock"
import { useDiscoveryState } from "@/lib/discovery/state"
import { useMounted } from "@/lib/use-mounted"
import { toBrandProfile } from "@/lib/competitors/tracked"

/**
 * server 端只认识静态 BRANDS，session 新增品牌会拿到 serverDetail === null。
 * 这里在客户端兜底：从 discovery store 找到它再 buildDetail。
 * 未 mount 前不渲染「未找到」，否则新增品牌会闪一下错误态。
 */
export function BrandDetailRoute({
  id,
  serverDetail,
}: {
  id: string
  serverDetail: BrandDetailData | null
}) {
  const mounted = useMounted()
  const { state } = useDiscoveryState()

  if (serverDetail) return <BrandDetail detail={serverDetail} />

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
        <div className="h-5 w-40 rounded bg-[var(--soft)]" />
        <div className="mt-3 h-3 w-64 rounded bg-[var(--soft-2)]" />
        <div className="mt-6 h-1.5 rounded-full bg-[var(--soft)] overflow-hidden relative">
          <span className="absolute inset-y-0 w-10 cs-sweep bg-[linear-gradient(90deg,transparent,rgba(132,204,22,.6),transparent)]" />
        </div>
      </div>
    )
  }

  const tracked = state.trackedBrands.find((b) => b.id === id)
  if (tracked) return <BrandDetail detail={buildDetail(toBrandProfile(tracked))} />

  return (
    <div className="rounded-xl border border-dashed border-[var(--line-strong)] py-20 text-center">
      <p className="text-[14px] text-[var(--muted)]">未找到该品牌</p>
      <Link
        href="/discover/brands"
        className="inline-block mt-3 text-[13px] font-extrabold text-[#5a7821] hover:underline"
      >
        返回品牌追踪
      </Link>
    </div>
  )
}
