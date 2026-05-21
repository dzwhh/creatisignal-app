"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MultimodalSearch } from "./multimodal-search"

const categories = [
  "全部", "兴趣推荐", "中小型电商", "食品生鲜", "美食",
  "平台电商", "饮料", "护肤", "个护电器", "保健品",
  "医疗服务", "女士服饰", "手机", "家居用品及饰品",
]

const materials = [
  {
    id: "1", tag: "教程类", tactic: "痛点切入",
    bg: "linear-gradient(160deg,#f0e6ff,#d4c8ff)",
    likes: "12.4K", comments: "1.2K", shares: "3.1K",
  },
  {
    id: "2", tag: "开箱类", tactic: "对比展示",
    bg: "linear-gradient(160deg,#ffecd2,#fcb69f)",
    likes: "8.7K", comments: "980", shares: "2.4K",
  },
  {
    id: "3", tag: "种草类", tactic: "达人推荐",
    bg: "linear-gradient(160deg,#d4f5e9,#a8e6cf)",
    likes: "15.1K", comments: "2.1K", shares: "4.8K",
  },
  {
    id: "4", tag: "评测类", tactic: "数据驱动",
    bg: "linear-gradient(160deg,#ffd3e8,#ff9a9e)",
    likes: "6.3K", comments: "740", shares: "1.9K",
  },
  {
    id: "5", tag: "场景类", tactic: "情绪共鸣",
    bg: "linear-gradient(160deg,#a1c4fd,#c2e9fb)",
    likes: "22.0K", comments: "3.4K", shares: "7.2K",
  },
  {
    id: "6", tag: "促销类", tactic: "限时优惠",
    bg: "linear-gradient(160deg,#fddb92,#d1fdff)",
    likes: "9.8K", comments: "1.5K", shares: "2.7K",
  },
  {
    id: "7", tag: "UGC类", tactic: "真实体验",
    bg: "linear-gradient(160deg,#e0c3fc,#8ec5fc)",
    likes: "11.2K", comments: "1.8K", shares: "3.5K",
  },
  {
    id: "8", tag: "品牌类", tactic: "价值观传达",
    bg: "linear-gradient(160deg,#f6d365,#fda085)",
    likes: "7.6K", comments: "890", shares: "2.0K",
  },
  {
    id: "9", tag: "功能类", tactic: "使用演示",
    bg: "linear-gradient(160deg,#96fbc4,#f9f586)",
    likes: "18.3K", comments: "2.6K", shares: "5.4K",
  },
  {
    id: "10", tag: "节日类", tactic: "节点营销",
    bg: "linear-gradient(160deg,#fbc2eb,#a6c1ee)",
    likes: "14.7K", comments: "2.2K", shares: "4.1K",
  },
]

export function MaterialsContent() {
  const [activeCategory, setActiveCategory] = useState("兴趣推荐")
  const [search, setSearch] = useState("")

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-[850] leading-snug text-[#17181c]">灵感发现</h1>
          <p className="mt-2 text-[14px] text-[#8b8f98]">多模态搜索 · 精选素材创意拆解</p>
        </div>
      </div>

      {/* Multimodal search */}
      <MultimodalSearch />

      {/* Section label */}
      <div className="flex items-start justify-between gap-4 mb-[22px]">
        <div>
          <h2 className="text-[17px] font-extrabold text-[#17181c]">优质素材拆解</h2>
          <p className="mt-1 text-[13px] text-[#8b8f98]">精选素材的创意细节拆分</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-[18px]">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "h-[34px] border rounded-full px-[15px] text-[13px] font-bold whitespace-nowrap cursor-pointer transition-colors",
                activeCategory === cat
                  ? "border-[var(--lime)] bg-[var(--lime)] text-[#1f2419]"
                  : "border-[var(--line)] bg-white text-[#52525b] hover:border-[var(--line-strong)]"
              )}
            >
              {cat}
            </button>
          ))}
          <button
            type="button"
            className="h-[34px] border border-[var(--line)] rounded-full px-[15px] text-[13px] font-bold text-[#52525b] whitespace-nowrap cursor-pointer hover:border-[var(--line-strong)] flex items-center gap-1.5"
          >
            更多 <ChevronDown size={13} strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-[34px] w-[210px] border border-[var(--line)] rounded-lg bg-white px-[11px] flex items-center gap-1.5 text-[13px] text-[var(--muted-2)]">
            <Search size={14} strokeWidth={2} className="shrink-0" />
            <input
              className="flex-1 outline-none border-0 bg-transparent text-[13px] placeholder:text-[var(--muted-2)]"
              placeholder="搜索标题或品牌..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="h-[34px] border border-[var(--line)] rounded-full px-[15px] text-[13px] font-bold text-[#52525b] whitespace-nowrap cursor-pointer hover:border-[var(--line-strong)] flex items-center gap-1.5"
          >
            互动值 <ChevronDown size={13} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="h-[34px] border border-[var(--line)] rounded-full px-[15px] text-[13px] font-bold text-[#52525b] whitespace-nowrap cursor-pointer hover:border-[var(--line-strong)] flex items-center gap-1.5"
          >
            全部消耗 <ChevronDown size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Source note */}
      <div className="inline-flex items-center min-h-7 border border-[var(--line)] rounded bg-white text-[var(--muted-2)] px-[10px] text-[12px] mb-[14px]">
        公域 Top 素材 · 来自 TikTok 全球高互动广告，非你的投放素材
      </div>

      <div className="flex items-center justify-between mb-[14px]">
        <span></span>
        <button className="h-[34px] border-0 rounded-full bg-[var(--lime)] text-[#20251a] px-[18px] text-[13px] font-extrabold cursor-pointer">
          一键克隆创意 ★
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-[18px]">
        {materials.map((m) => (
          <article
            key={m.id}
            className="border border-[var(--line)] rounded-xl bg-white overflow-hidden shadow-[0_1px_2px_rgba(9,9,11,0.03)] cursor-pointer hover:shadow-[0_4px_16px_rgba(9,9,11,0.08)] transition-shadow"
          >
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "9/14", background: m.bg }}
            >
              {/* Highlight overlay */}
              <div className="absolute inset-[12%] inset-b-[22%] rounded-t-[999px] rounded-b-[18px] bg-white/40" />
              <span className="absolute top-[9px] right-[9px] text-[15px]">🔥🔥</span>
              <div className="absolute left-[10px] right-[10px] bottom-[10px] flex justify-between items-end gap-1">
                <span className="h-[22px] rounded-full bg-[rgba(28,30,36,0.72)] text-white px-2.5 text-[11px] font-extrabold flex items-center">
                  {m.tag}
                </span>
                <span className="h-[22px] rounded-full bg-[var(--lime)] text-[#1a2010] px-2.5 text-[11px] font-extrabold flex items-center">
                  {m.tactic}
                </span>
              </div>
            </div>
            <div className="px-3 py-2.5 flex items-center justify-between text-[12px] text-[#8b8f98]">
              <span>♡ {m.likes}</span>
              <span>□ {m.comments}</span>
              <span>⇧ {m.shares}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
