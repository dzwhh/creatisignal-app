"use client"

import Link from "next/link"
import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Platform = {
  id: string
  label: string
  short: string
  advertisers: number
  color: string   // status dot
}

const PLATFORMS: Platform[] = [
  { id: "tiktok",  label: "TikTok Ads",  short: "TikTok",  advertisers: 160, color: "#16a34a" },
  { id: "meta",    label: "Meta Ads",    short: "Meta",    advertisers: 84,  color: "#0866ff" },
  { id: "google",  label: "Google Ads",  short: "Google",  advertisers: 32,  color: "#fbbc04" },
  { id: "snap",    label: "Snap Ads",    short: "Snap",    advertisers: 0,   color: "#a1a1aa" },
]

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
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: active.color }} />
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
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
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
