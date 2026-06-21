"use client"

import Link from "next/link"
import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type PlatformId = "tiktok" | "meta" | "google" | "snap"

type Platform = {
  id: PlatformId
  label: string
  short: string
  advertisers: number
}

const PLATFORMS: Platform[] = [
  { id: "tiktok", label: "TikTok Ads", short: "TikTok", advertisers: 160 },
  { id: "meta",   label: "Meta Ads",   short: "Meta",   advertisers: 84  },
  { id: "google", label: "Google Ads", short: "Google", advertisers: 32  },
  { id: "snap",   label: "Snap Ads",   short: "Snap",   advertisers: 0   },
]

// ─── Inline brand logos (simplified, recognizable monograms) ────────────────
function PlatformLogo({ id, size = 14, muted = false }: { id: PlatformId; size?: number; muted?: boolean }) {
  const opacity = muted ? 0.4 : 1
  if (id === "tiktok") {
    // 黑色 d 形 + 一笔上挑（TikTok 简化字形）
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ opacity }}>
        <path d="M15 3v10.5a3.5 3.5 0 1 1-3.5-3.5h.7v2.8h-.7a.7.7 0 1 0 .7.7V3H15z" fill="#000" />
        <path d="M15 3c.2 2 1.6 3.7 3.6 4" stroke="#000" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (id === "meta") {
    // 蓝色 ∞ 状色带
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ opacity }}>
        <path
          d="M4.2 12.3c0-2.9 1.7-5.4 3.9-5.4 1.7 0 3 1.3 4.3 3.6 1.3-2.3 2.5-3.6 4.3-3.6 2.2 0 4.1 2.5 4.1 5.4 0 2.5-1.5 3.9-3 3.9-1.6 0-2.6-1-3.7-2.9l-1.7-3-1.7 3c-1.1 1.9-2.1 2.9-3.7 2.9-1.5 0-2.8-1.4-2.8-3.9z"
          fill="#0866ff"
        />
      </svg>
    )
  }
  if (id === "google") {
    // 四色 G
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ opacity }}>
        <path d="M21.6 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.39c-.23 1.25-.94 2.31-2.01 3.02v2.51h3.25c1.9-1.75 3-4.33 3-7.56z" fill="#4285F4" />
        <path d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.25-2.51c-.9.6-2.05.96-3.37.96-2.6 0-4.8-1.75-5.58-4.1H3.06v2.58A9.99 9.99 0 0 0 12 22z" fill="#34A853" />
        <path d="M6.42 13.92c-.2-.6-.31-1.24-.31-1.92s.11-1.32.31-1.92V7.5H3.06A9.99 9.99 0 0 0 2 12c0 1.62.39 3.15 1.06 4.5l3.36-2.58z" fill="#FBBC05" />
        <path d="M12 5.98c1.47 0 2.78.5 3.82 1.49l2.86-2.86C16.95 2.99 14.7 2 12 2 8.05 2 4.65 4.34 3.06 7.5l3.36 2.58C7.2 7.73 9.4 5.98 12 5.98z" fill="#EA4335" />
      </svg>
    )
  }
  // snap：黄色 ghost
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ opacity }}>
      <path
        d="M12 2.4c-2.9 0-5 2-5.1 4.7 0 1.1.1 2.5.2 3.5-.4 0-.8.1-1.2.4-.4.3-.4.8 0 1.1.4.3 1.4.5 1.8.8.4.3-.4 2-1.6 3.2-.8.8-1.6 1.2-2.4 1.4-.4.1-.4.6 0 .8.8.4 1.8.8 2 1.2.2.4 0 .8.6.9.6.2 1.2-.2 1.8-.2.5 0 1 0 1.8.6.8.6 1.9 1.1 3.3 1.1s2.5-.5 3.3-1.1c.8-.6 1.3-.6 1.8-.6.5 0 1.2.4 1.8.2.6-.1.4-.5.6-.9.2-.4 1.2-.8 2-1.2.4-.2.4-.7 0-.8-.8-.2-1.6-.6-2.4-1.4-1.2-1.2-2-2.9-1.6-3.2.4-.3 1.4-.5 1.8-.8.4-.3.4-.8 0-1.1-.4-.3-.8-.4-1.2-.4.1-1 .2-2.4.2-3.5C17 4.4 14.9 2.4 12 2.4z"
        fill="#FFFC00"
        stroke="#1f1f1f"
        strokeWidth="0.6"
      />
    </svg>
  )
}

export function DataSourceSwitcher() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<Platform>(PLATFORMS[0])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-[30px] border border-[var(--line-strong)] rounded-lg bg-white text-[#2c2f35] px-2.5 flex items-center gap-1.5 font-bold cursor-pointer text-xs hover:bg-[var(--soft-2)] data-[state=open]:bg-[var(--soft-2)]"
        >
          <PlatformLogo id={active.id} size={14} />
          <span className="text-[#2c2f35]">{active.short}</span>
          <span className="text-[var(--muted)] font-semibold">({active.advertisers})</span>
          <ChevronDown size={12} strokeWidth={2.4} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-[60] w-[240px] bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)] overflow-hidden"
        >
          <div className="p-1">
            {PLATFORMS.map((p) => {
              const isActive = p.id === active.id
              const disabled = p.advertisers === 0
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => { setActive(p); setOpen(false) }}
                  className={cn(
                    "w-full px-2.5 py-2 rounded-md flex items-center gap-2.5 text-left transition-colors",
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : isActive
                        ? "bg-[var(--soft)] cursor-pointer"
                        : "hover:bg-[var(--soft-2)] cursor-pointer"
                  )}
                >
                  <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <PlatformLogo id={p.id} size={16} muted={disabled} />
                  </span>
                  <span className="flex-1 text-[12.5px] font-bold text-[var(--text)]">{p.label}</span>
                  <span className="text-[11px] text-[var(--muted)] font-semibold whitespace-nowrap">
                    {p.advertisers > 0 ? `${p.advertisers} 个广告主` : "未关联"}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="border-t border-[var(--line)] p-1">
            <Popover.Close asChild>
              <Link
                href="/settings/billing"
                className="w-full h-9 px-2.5 rounded-md flex items-center text-[12.5px] font-extrabold text-[#1d4ed8] hover:bg-[#eff6ff] cursor-pointer"
              >
                管理数据源
              </Link>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
