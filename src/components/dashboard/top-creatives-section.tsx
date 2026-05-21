"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const sortOptions = ["Spend", "CTR"]

const creatives = [
  {
    id: "001",
    title: "Demo_Ad_001",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
    spend: "$164.76K",
    impression: "7.0M",
    ctr: "5.48%",
    cpa: "$2.45",
    rank: 1,
  },
  {
    id: "002",
    title: "Demo_Ad_002",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=700&q=80",
    spend: "$158.97K",
    impression: "16.4M",
    ctr: "1.07%",
    cpa: "$5.40",
    rank: 2,
  },
  {
    id: "003",
    title: "Demo_Ad_003",
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=700&q=80",
    spend: "$122.10K",
    impression: "9.8M",
    ctr: "3.21%",
    cpa: "$3.80",
    rank: 3,
  },
]

export function TopCreativesSection() {
  const [sortBy, setSortBy] = useState(0)

  return (
    <section>
      <div className="flex items-center justify-between mb-[14px]">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-extrabold text-[#17181c]">
            表现最好的素材
          </h2>
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
          去看看
        </button>
      </div>

      <div className="grid grid-cols-3 gap-[18px]">
        {creatives.map((c) => (
          <article
            key={c.id}
            className="border border-[var(--line)] rounded-[10px] overflow-hidden bg-white"
          >
            <div className="relative aspect-video overflow-hidden bg-[#eceef2]">
              <Image
                src={c.img}
                alt={c.title}
                fill
                className="object-cover"
                sizes="(max-width: 1040px) 33vw"
              />
              <span className="absolute top-2 left-2 min-w-6 h-6 px-[7px] rounded-full flex items-center justify-center bg-[rgba(28,30,36,0.72)] text-white text-[12px] font-extrabold">
                {c.rank}
              </span>
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
                <span>
                  CPA <strong className="text-[#31343b] font-extrabold">{c.cpa}</strong>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
