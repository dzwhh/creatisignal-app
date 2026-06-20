"use client"

import { Play, Star } from "lucide-react"
import type { Material } from "@/lib/insights/types"

interface Props {
  materials: Material[]
}

export function MaterialStrip({ materials }: Props) {
  if (materials.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white px-6 py-8 text-center">
        <p className="text-[12px] text-[var(--muted-2)]">暂无可推荐素材</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-3 overflow-x-auto">
      <div className="flex gap-3">
        {materials.map((m) => (
          <article
            key={m.fingerprint}
            className="w-[140px] shrink-0 rounded-xl overflow-hidden border border-[var(--line)] bg-white cursor-pointer hover:border-[var(--line-strong)] transition-colors"
          >
            <div className="relative aspect-[9/14] bg-[var(--soft)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.thumb} alt={m.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                <span className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow">
                  <Play size={14} className="text-[#18181b] translate-x-0.5" fill="#18181b" />
                </span>
              </div>
              <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md bg-black/65 text-white text-[10px] font-extrabold">
                <Star size={9} strokeWidth={2.6} className="text-[#facc15]" fill="#facc15" />
                {Math.round(m.rating)}
              </span>
            </div>
            <div className="p-2">
              <p className="text-[11px] font-extrabold text-[var(--text)] truncate">{m.name}</p>
              <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate">ROI {m.metrics.roi.toFixed(2)} · {m.sceneTags[0] ?? ""}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
