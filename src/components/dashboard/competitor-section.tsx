"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const sortOptions = ["素材上新", "预估曝光"]

const competitors = [
  {
    brand: "GlowSkin",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
    title: "夏季防晒新品推广",
    spend: "$18.50K",
    impression: "1.3M",
    ctr: "3.50%",
  },
  {
    brand: "FitWear",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=80",
    title: "运动系列开箱测评",
    spend: "$12.80K",
    impression: "920.0K",
    ctr: "2.80%",
  },
  {
    brand: "TechNova",
    img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=700&q=80",
    title: "智能手表功能演示",
    spend: "$9.60K",
    impression: "680.0K",
    ctr: "4.20%",
  },
]

function brandInitial(name: string) {
  return name[0]
}

const brandColors = ["#222,#9aa", "#445,#b8c", "#234,#8bc"]

export function CompetitorSection() {
  const [sortBy, setSortBy] = useState(0)

  return (
    <section>
      <div className="flex items-center justify-between mb-[14px]">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-extrabold text-[#17181c]">竞品追踪</h2>
          <div className="flex items-center gap-[3px] border border-[var(--line)] rounded-full bg-[#f5f5f6] p-[3px]">
            {sortOptions.map((opt, i) => (
              <button
                key={opt}
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
        </div>
        <button className="h-[34px] border-0 rounded-full bg-[var(--lime)] text-[#20251a] px-[18px] text-[13px] font-extrabold cursor-pointer">
          关注品牌
        </button>
      </div>

      <div className="grid grid-cols-3 gap-[18px]">
        {competitors.map((c, idx) => (
          <article
            key={c.brand}
            className="border border-[var(--line)] rounded-[10px] overflow-hidden bg-white"
          >
            <div className="h-[42px] flex items-center justify-between px-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2 text-[13px] font-extrabold text-[#33363d]">
                <span
                  className="w-[22px] h-[22px] rounded-full shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${brandColors[idx]})`,
                  }}
                />
                {c.brand}
              </div>
              <span className="shrink-0 h-5 rounded-full bg-[var(--green)] text-[var(--green-text)] px-2 flex items-center text-[11px] font-extrabold">
                活跃
              </span>
            </div>
            <div className="relative aspect-video overflow-hidden bg-[#eceef2]">
              <Image
                src={c.img}
                alt={`${c.brand} creative`}
                fill
                className="object-cover"
                sizes="(max-width: 1040px) 33vw"
              />
            </div>
            <div className="px-[13px] pt-3 pb-[14px]">
              <h3 className="text-sm font-extrabold text-[#2d3037] mb-[9px]">
                {c.title}
              </h3>
              <div className="flex flex-wrap gap-x-[14px] gap-y-2 text-[12px] text-[#8b8f98] leading-[1.5]">
                <span>
                  花费 <strong className="text-[#31343b] font-extrabold">{c.spend}</strong>
                </span>
                <span>
                  展示 <strong className="text-[#31343b] font-extrabold">{c.impression}</strong>
                </span>
                <span>
                  CTR <strong className="text-[#31343b] font-extrabold">{c.ctr}</strong>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
