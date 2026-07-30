/* eslint-disable @next/next/no-img-element */
"use client"

import { useMemo, useState } from "react"
import { Heart, Star, Radar, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatScore } from "@/lib/competitors/mock"
import {
  getBrandMaterials,
  FORMAT_META,
  STATUS_META,
  PLATFORM_META,
  type MaterialFormat,
  type MaterialStatus,
  type MaterialPlatform,
} from "@/lib/competitors/materials"

type FormatFilter = MaterialFormat | "all"
type StatusFilter = MaterialStatus | "all"
type PlatformFilter = MaterialPlatform | "all"

const PAGE_SIZE = 10

export function MaterialLibrary({ brandId, collecting = false }: { brandId: string; collecting?: boolean }) {
  const all = useMemo(() => getBrandMaterials(brandId), [brandId])

  const [format, setFormat] = useState<FormatFilter>("all")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [platform, setPlatform] = useState<PlatformFilter>("all")
  const [shown, setShown] = useState(PAGE_SIZE)

  // 各维度计数：只受「其他两个维度」影响，切自己这一组时数字不跳
  const counts = useMemo(() => {
    const byFormat = (f: MaterialFormat) =>
      all.filter((m) => m.format === f
        && (status === "all" || m.status === status)
        && (platform === "all" || m.platform === platform)).length
    const byStatus = (s: MaterialStatus) =>
      all.filter((m) => m.status === s
        && (format === "all" || m.format === format)
        && (platform === "all" || m.platform === platform)).length
    const byPlatform = (p: MaterialPlatform) =>
      all.filter((m) => m.platform === p
        && (format === "all" || m.format === format)
        && (status === "all" || m.status === status)).length
    return {
      video: byFormat("video"),
      image: byFormat("image"),
      live: byStatus("live"),
      stopped: byStatus("stopped"),
      tiktok: byPlatform("tiktok"),
      meta: byPlatform("meta"),
    }
  }, [all, format, status, platform])

  const filtered = useMemo(
    () => all.filter((m) =>
      (format === "all" || m.format === format)
      && (status === "all" || m.status === status)
      && (platform === "all" || m.platform === platform)),
    [all, format, status, platform]
  )

  const visible = filtered.slice(0, shown)

  function reset<T>(setter: (v: T) => void, v: T) {
    setter(v)
    setShown(PAGE_SIZE)
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      {/* 头部:标题 + 三组筛选 */}
      <div className="flex items-start justify-between gap-5 flex-wrap mb-4">
        <div className="shrink-0">
          <h2 className="text-[15px] font-extrabold text-[var(--text)]">素材库</h2>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5 tabular-nums">
            当前筛选 {formatScore(filtered.length)} 个素材
            {collecting && <span className="ml-1.5 text-[var(--muted-2)]">· 采集中,持续增加</span>}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 格式 */}
          <FilterGroup>
            <Chip active={format === "all"} onClick={() => reset(setFormat, "all")}>全部素材</Chip>
            <Chip active={format === "video"} onClick={() => reset(setFormat, "video")} count={counts.video}>
              {FORMAT_META.video.label}
            </Chip>
            <Chip active={format === "image"} onClick={() => reset(setFormat, "image")} count={counts.image}>
              {FORMAT_META.image.label}
            </Chip>
          </FilterGroup>

          {/* 平台 */}
          <FilterGroup>
            <Chip active={platform === "all"} onClick={() => reset(setPlatform, "all")}>全部平台</Chip>
            <Chip active={platform === "tiktok"} onClick={() => reset(setPlatform, "tiktok")} count={counts.tiktok}>
              {PLATFORM_META.tiktok.label}
            </Chip>
            <Chip active={platform === "meta"} onClick={() => reset(setPlatform, "meta")} count={counts.meta}>
              {PLATFORM_META.meta.label}
            </Chip>
          </FilterGroup>

          {/* 状态 */}
          <FilterGroup>
            <Chip active={status === "all"} onClick={() => reset(setStatus, "all")}>全部状态</Chip>
            <Chip active={status === "live"} onClick={() => reset(setStatus, "live")} count={counts.live}>
              {STATUS_META.live.label}
            </Chip>
            <Chip active={status === "stopped"} onClick={() => reset(setStatus, "stopped")} count={counts.stopped}>
              {STATUS_META.stopped.label}
            </Chip>
          </FilterGroup>
        </div>
      </div>

      {/* 素材网格 */}
      {visible.length > 0 ? (
        <>
          <div className="grid grid-cols-5 gap-3.5">
            {visible.map((m) => (
              <div key={m.id} className="group">
                <div className="relative rounded-xl overflow-hidden bg-[#eceef2] aspect-[9/16] ring-1 ring-black/[0.04] cursor-pointer">
                  <img
                    src={m.thumb}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  {/* 来源 + 格式 */}
                  <span className="absolute top-2 left-2 max-w-[62%] h-[20px] px-1.5 rounded-md bg-black/55 backdrop-blur text-[10px] font-bold text-white/90 flex items-center truncate">
                    {m.source}
                  </span>
                  <span className="absolute top-2 right-2 h-[20px] px-1.5 rounded-md bg-black/55 backdrop-blur text-[10px] font-bold text-white flex items-center">
                    {FORMAT_META[m.format].label}
                  </span>
                  {/* hover 播放态 */}
                  {m.format === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="w-9 h-9 rounded-full bg-black/45 backdrop-blur flex items-center justify-center text-white">
                        <Play size={13} strokeWidth={2.4} fill="currentColor" className="ml-0.5" />
                      </span>
                    </div>
                  )}
                  {/* 投放状态 */}
                  <span
                    className="absolute bottom-2 left-2 h-[20px] px-1.5 rounded-md text-[10px] font-extrabold flex items-center backdrop-blur"
                    style={{ background: STATUS_META[m.status].bg, color: STATUS_META[m.status].text }}
                  >
                    {STATUS_META[m.status].label}
                  </span>
                </div>
                {/* 指标 */}
                <div className="mt-2 flex items-center gap-2.5 text-[11px] text-[var(--muted)] tabular-nums">
                  <span className="flex items-center gap-1">
                    <Heart size={10} strokeWidth={2.4} className="text-[#84cc16]" />
                    {formatScore(m.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={10} strokeWidth={2.4} className="text-[var(--muted-2)]" />
                    {m.saves}
                  </span>
                  <span className="flex items-center gap-1">
                    <Radar size={10} strokeWidth={2.4} className="text-[var(--muted-2)]" />
                    {formatScore(m.reach)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {shown < filtered.length && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShown((s) => s + PAGE_SIZE)}
                className="h-9 px-5 rounded-full border border-[var(--line)] bg-white text-[12.5px] font-extrabold text-[var(--text)] hover:bg-[var(--soft-2)] hover:border-[var(--line-strong)] transition cursor-pointer tabular-nums"
              >
                加载更多 · 还有 {filtered.length - shown} 个
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--line)] py-14 text-center">
          <p className="text-[13px] text-[var(--muted)]">当前筛选下没有素材</p>
          <p className="text-[11.5px] text-[var(--muted-2)] mt-1">
            {collecting ? "采集仍在进行,更多素材会陆续入库" : "试试放宽筛选条件"}
          </p>
        </div>
      )}
    </section>
  )
}

function FilterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-[var(--soft)] p-1">
      {children}
    </div>
  )
}

function Chip({
  active, onClick, count, children,
}: {
  active: boolean
  onClick: () => void
  count?: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "h-7 px-3 rounded-full text-[12px] font-extrabold whitespace-nowrap transition cursor-pointer inline-flex items-center gap-1.5",
        active
          ? "bg-[var(--near-black)] text-white"
          : "text-[var(--muted)] hover:text-[var(--text)]"
      )}
    >
      {children}
      {typeof count === "number" && (
        <span className={cn("tabular-nums font-bold", active ? "text-white/60" : "text-[var(--muted-2)]")}>
          {formatScore(count)}
        </span>
      )}
    </button>
  )
}
