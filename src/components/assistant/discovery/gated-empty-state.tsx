"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { RainbowButton } from "@/components/ui/rainbow-button"

interface Props {
  icon: React.ReactNode
  headline: string
  subline: string
  ctaLabel: string
  onCta: () => void
}

export function GatedEmptyState({ icon, headline, subline, ctaLabel, onCta }: Props) {
  return (
    <div className="w-full rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] px-6 py-7 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--lime-soft)] text-[#5a7821]">
        {icon}
      </div>
      <div className="max-w-[560px]">
        <p className="text-[14px] font-extrabold text-[var(--text)] leading-snug">{headline}</p>
        <p className="text-[12px] text-[var(--muted)] mt-1.5 leading-relaxed">{subline}</p>
      </div>
      <RainbowButton
        type="button"
        onClick={onCta}
        className="h-10 px-5 rounded-xl text-[13px] mt-1"
      >
        {ctaLabel}
        <Sparkles size={12} strokeWidth={2.4} className="ml-1.5" />
      </RainbowButton>
    </div>
  )
}
