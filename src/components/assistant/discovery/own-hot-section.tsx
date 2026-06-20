"use client"

import { useState } from "react"
import { Settings, ShieldCheck } from "lucide-react"
import { useDiscoveryState, AD_PLATFORM_META } from "@/lib/discovery/state"
import { getOwnHotPicks, type OwnHotSort } from "@/lib/insights/mock"
import { SectionShell } from "./section-shell"
import { GatedEmptyState } from "./gated-empty-state"
import { PlatformGrantDialog } from "./platform-grant-dialog"
import { MaterialStrip } from "./material-strip"
import { TabStrip } from "./tab-strip"

const OWN_TABS = [
  { id: "order", label: "Order" },
  { id: "roi",   label: "ROI" },
] as const

export function OwnHotSection() {
  const { state, grantPlatforms } = useDiscoveryState()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<OwnHotSort>("roi")
  const authorized = state.ownAds.authorized

  return (
    <>
      <SectionShell
        title="自有爆款"
        subtitle="最近投放表现最好的素材"
        actions={
          authorized ? (
            <>
              <TabStrip<OwnHotSort> tabs={OWN_TABS} value={tab} onChange={setTab} />
              <span className="text-[11px] text-[var(--muted-2)] font-semibold hidden md:inline-flex items-center gap-1">
                {state.ownAds.platforms.map((p) => AD_PLATFORM_META[p].label).join(" · ")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="h-8 px-3 rounded-full border border-[var(--line)] text-[11.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
              >
                <Settings size={11} strokeWidth={2.4} />
                管理授权
              </button>
            </>
          ) : null
        }
      >
        {authorized ? (
          <MaterialStrip materials={getOwnHotPicks(8, tab)} />
        ) : (
          <GatedEmptyState
            icon={<ShieldCheck size={22} strokeWidth={2.2} />}
            headline="一键关联广告平台数据，透视 TOP 素材表现"
            subline="安全读取素材投放相关数据，仅用于效果分析，你可随时管理授权。"
            ctaLabel="关联广告平台"
            onCta={() => setOpen(true)}
          />
        )}
      </SectionShell>

      <PlatformGrantDialog
        open={open}
        initialPlatforms={state.ownAds.platforms}
        onOpenChange={setOpen}
        onGrant={grantPlatforms}
      />
    </>
  )
}
