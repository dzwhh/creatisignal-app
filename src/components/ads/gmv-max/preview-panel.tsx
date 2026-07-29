"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Home, Inbox, MessageCircle, Music2, Plus, Search, Share2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAccounts, mockProducts, mockVideos } from "@/lib/ads/gmv-max-mock"
import type { GmvMaxConfig } from "@/lib/ads/gmv-max-types"

// ─── 右侧预览：手机 For You mockup + 基础信息卡 ──────────────────────────────

type PreviewTab = "video" | "card"

// 投放位置选项：视频与商品卡片可投放的版位不同
const PLACEMENTS: Record<PreviewTab, { value: string; label: string }[]> = {
  video: [
    { value: "foryou", label: "推荐页 (TikTok)" },
    { value: "mall-suggest", label: "建议（商城）" },
    { value: "search", label: "搜索 (TikTok)" },
    { value: "mall-search", label: "搜索（商城）" },
  ],
  card: [
    { value: "mall-suggest", label: "建议（商城）" },
    { value: "mall-search", label: "搜索（商城）" },
  ],
}

export function PreviewPanel({ config }: { config: GmvMaxConfig }) {
  const [tab, setTab] = useState<PreviewTab>("video")
  const [placement, setPlacement] = useState(PLACEMENTS.video[0].value)

  // 切换 tab 时，若当前版位在新 tab 下不可用则回退到首个选项
  const switchTab = (next: PreviewTab) => {
    setTab(next)
    if (!PLACEMENTS[next].some((p) => p.value === placement)) {
      setPlacement(PLACEMENTS[next][0].value)
    }
  }

  const account = mockAccounts.find((a) => a.id === config.accountId)
  const firstVideo = mockVideos.find((v) => config.videoIds.includes(v.id))
  const firstProduct =
    config.productScope === "specific"
      ? mockProducts.find((p) => config.productIds.includes(p.id))
      : mockProducts[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text)]">预览</h3>
        <div className="flex items-center gap-1 rounded-lg bg-[var(--soft)] p-0.5">
          {(
            [
              { value: "video", label: "视频" },
              { value: "card", label: "商品卡片" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => switchTab(value)}
              className={cn(
                "h-6.5 px-2.5 rounded-md text-xs font-medium transition-colors duration-200 cursor-pointer",
                tab === value ? "bg-white text-[var(--text)] shadow-[var(--shadow-sm)]" : "text-[var(--muted)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Select value={placement} onValueChange={setPlacement}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLACEMENTS[tab].map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 手机 mockup：宽度随视口高度收缩，保证预览整体一屏内完整可见 */}
      <div className="flex justify-center">
        <div className="relative w-[clamp(150px,calc((100dvh-480px)*0.474),220px)] aspect-[9/19] rounded-[28px] bg-[var(--near-black)] border-[5px] border-[#2c2c30] overflow-hidden shadow-[var(--shadow-sm)]">
          {/* 背景：选中视频封面 or 占位 */}
          {tab === "video" && firstVideo?.cover ? (
            <Image src={firstVideo.cover} alt="预览视频" fill sizes="220px" className="object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#26262b] to-[#101013]" />
          )}

          {/* 顶部 Following / For You */}
          <div className="absolute top-3 inset-x-0 flex justify-center gap-4 text-[10px] z-10">
            <span className="text-white/50">Following</span>
            <span className="text-white font-semibold border-b-2 border-white pb-0.5">For You</span>
          </div>

          {/* 右侧互动栏 */}
          <div className="absolute right-2 bottom-[72px] flex flex-col items-center gap-3 z-10 text-white">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center">
                <User size={14} />
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#fe2c55] text-white text-[8px] flex items-center justify-center">
                +
              </span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Heart size={18} fill="currentColor" />
              <span className="text-[8px]">25.3k</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <MessageCircle size={18} fill="currentColor" />
              <span className="text-[8px]">3456</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Share2 size={16} />
              <span className="text-[8px]">1256</span>
            </div>
          </div>

          {/* 底部文案 + 商品卡片 */}
          <div className="absolute bottom-9 left-2.5 right-12 z-10 text-white space-y-1">
            {tab === "card" && (
              <div className="rounded-md bg-white/95 p-1.5 flex items-center gap-1.5 text-[var(--near-black)]">
                <div className="w-7 h-7 rounded bg-[var(--soft)] shrink-0 overflow-hidden relative">
                  <Image src="/creative-assets/wedding-dress-cover.png" alt="" fill sizes="28px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-medium truncate">{firstProduct?.name ?? "选择商品后预览"}</p>
                  <p className="text-[8px] text-[#fe2c55] font-semibold">{firstProduct?.price ?? "--"}</p>
                </div>
              </div>
            )}
            <p className="text-[10px] font-semibold">@BrandName</p>
            <p className="text-[9px] text-white/80 truncate">
              {firstVideo ? firstVideo.title : "广告文案预览区域"}
            </p>
            <p className="text-[8px] text-white/60 flex items-center gap-1">
              <Music2 size={8} /> Original sound
            </p>
          </div>

          {/* 底部导航 */}
          <div className="absolute bottom-0 inset-x-0 h-8 bg-black/85 flex items-center justify-around text-white/60 text-[7px] z-10">
            <span className="flex flex-col items-center text-white"><Home size={11} />Home</span>
            <span className="flex flex-col items-center"><Search size={11} />Discover</span>
            <span className="w-6 h-4 rounded-md bg-white flex items-center justify-center text-[var(--near-black)]"><Plus size={10} strokeWidth={3} /></span>
            <span className="flex flex-col items-center"><Inbox size={11} />Inbox</span>
            <span className="flex flex-col items-center"><User size={11} />Me</span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-[var(--muted-2)]">选择视频和商品后预览效果</p>

      {/* 基础信息 */}
      <div className="rounded-xl border border-[var(--line)] bg-white p-4">
        <h4 className="text-[13px] font-semibold text-[var(--text)]">基础信息</h4>
        <dl className="mt-3 space-y-2.5 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[var(--muted)] shrink-0">广告账户</dt>
            <dd className="text-[var(--text)] font-mono text-xs truncate">
              {account ? account.advertiserId : "未选择"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[var(--muted)] shrink-0">广告类型</dt>
            <dd><Badge variant="lime">商品 GMV Max</Badge></dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[var(--muted)] shrink-0">状态</dt>
            <dd>
              {config.enableOnCreate ? (
                <Badge variant="success">创建后启用</Badge>
              ) : (
                <Badge variant="secondary">暂停</Badge>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[var(--muted)] shrink-0">已选视频</dt>
            <dd className="text-[var(--text)]">
              {config.videoMode === "smart" ? "智能选择" : `${config.videoIds.length} 个`}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
