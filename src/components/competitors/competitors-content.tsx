"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Search, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const sortOptions = ["素材上新", "预估曝光", "预估花费"]

const competitors = [
  {
    brand: "GlowSkin",
    color: "linear-gradient(135deg,#222,#9aa)",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
    title: "夏季防晒新品推广",
    spend: "$18.50K", impression: "1.3M", ctr: "3.50%",
    count: 12, active: true,
  },
  {
    brand: "FitWear",
    color: "linear-gradient(135deg,#445,#b8c)",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80",
    title: "运动系列开箱测评",
    spend: "$12.80K", impression: "920.0K", ctr: "2.80%",
    count: 8, active: true,
  },
  {
    brand: "TechNova",
    color: "linear-gradient(135deg,#234,#8bc)",
    img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=700&q=80",
    title: "智能手表功能演示",
    spend: "$9.60K", impression: "680.0K", ctr: "4.20%",
    count: 5, active: true,
  },
  {
    brand: "NaturaCare",
    color: "linear-gradient(135deg,#3a6,#8d4)",
    img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=700&q=80",
    title: "有机护肤系列上市",
    spend: "$7.20K", impression: "540.0K", ctr: "2.10%",
    count: 3, active: false,
  },
  {
    brand: "PureBrew",
    color: "linear-gradient(135deg,#863,#fa8)",
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80",
    title: "精品咖啡订阅招募",
    spend: "$5.80K", impression: "410.0K", ctr: "3.90%",
    count: 7, active: true,
  },
  {
    brand: "StylePeak",
    color: "linear-gradient(135deg,#63a,#c8f)",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80",
    title: "秋冬新品穿搭指南",
    spend: "$14.30K", impression: "1.1M", ctr: "1.80%",
    count: 15, active: true,
  },
]

export function CompetitorsContent() {
  const [sortBy, setSortBy] = useState(0)
  const [search, setSearch] = useState("")

  const filtered = competitors.filter((c) =>
    c.brand.toLowerCase().includes(search.toLowerCase()) ||
    c.title.includes(search)
  )

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-[22px]">
        <div>
          <h1 className="text-[24px] font-[850] leading-snug text-[#17181c]">竞品追踪</h1>
          <p className="mt-2 text-[14px] text-[#8b8f98]">关注竞品品牌的最新素材动态与投放趋势</p>
        </div>
        <button className="shrink-0 h-[34px] border-0 rounded-full bg-[var(--lime)] text-[#20251a] px-[18px] text-[13px] font-extrabold cursor-pointer flex items-center gap-1.5">
          <Plus size={14} strokeWidth={2.5} />
          关注品牌
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-[3px] border border-[var(--line)] rounded-full bg-[#f5f5f6] p-[3px]">
          {sortOptions.map((opt, i) => (
            <button
              key={opt}
              type="button"
              onClick={() => setSortBy(i)}
              className={cn(
                "border rounded-full h-[26px] px-3 text-[12px] font-extrabold cursor-pointer whitespace-nowrap transition-colors",
                sortBy === i
                  ? "border-white bg-white text-[#181b20] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "border-transparent bg-transparent text-[#777b83]"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="h-[34px] w-[210px] border border-[var(--line)] rounded-lg bg-white px-[11px] flex items-center gap-1.5 text-[13px] text-[var(--muted-2)]">
          <Search size={14} strokeWidth={2} className="shrink-0" />
          <input
            className="flex-1 outline-none border-0 bg-transparent text-[13px] placeholder:text-[var(--muted-2)]"
            placeholder="搜索品牌..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-[18px]">
        {filtered.map((c) => (
          <article
            key={c.brand}
            className="border border-[var(--line)] rounded-[10px] overflow-hidden bg-white cursor-pointer hover:shadow-[0_4px_16px_rgba(9,9,11,0.08)] transition-shadow"
          >
            <div className="h-[42px] flex items-center justify-between px-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#33363d] min-w-0">
                <span
                  className="w-[22px] h-[22px] rounded-full shrink-0"
                  style={{ background: c.color }}
                />
                <span className="truncate">{c.brand}</span>
                <span className="text-[11px] font-bold text-[var(--muted-2)] ml-1 shrink-0">
                  {c.count} 条素材
                </span>
              </div>
              {c.active && (
                <span className="shrink-0 h-5 rounded-full bg-[var(--green)] text-[var(--green-text)] px-2 flex items-center text-[11px] font-extrabold">
                  活跃
                </span>
              )}
            </div>
            <div className="relative aspect-video overflow-hidden bg-[#eceef2]">
              <Image
                src={c.img}
                alt={`${c.brand} creative`}
                fill
                className="object-cover"
                sizes="(max-width: 1240px) 33vw"
              />
            </div>
            <div className="px-[13px] pt-3 pb-[14px]">
              <h3 className="text-sm font-extrabold text-[#2d3037] mb-[9px]">{c.title}</h3>
              <div className="flex flex-wrap gap-x-[14px] gap-y-2 text-[12px] text-[#8b8f98] leading-[1.5]">
                <span>花费 <strong className="text-[#31343b] font-extrabold">{c.spend}</strong></span>
                <span>展示 <strong className="text-[#31343b] font-extrabold">{c.impression}</strong></span>
                <span>CTR <strong className="text-[#31343b] font-extrabold">{c.ctr}</strong></span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
