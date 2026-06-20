"use client"

import { useState } from "react"
import { Globe2, Settings } from "lucide-react"
import { useDiscoveryState, MARKET_CATEGORY_META } from "@/lib/discovery/state"
import { getMarketHotPicks, type MarketHotSort } from "@/lib/insights/mock"
import { SectionShell } from "./section-shell"
import { GatedEmptyState } from "./gated-empty-state"
import { MarketPrefsDialog } from "./market-prefs-dialog"
import { MaterialStrip } from "./material-strip"
import { TabStrip } from "./tab-strip"

const MARKET_TABS = [
  { id: "latest",  label: "最新爆款" },
  { id: "played",  label: "播放最多" },
  { id: "engaged", label: "互动最高" },
] as const

export function MarketHotSection() {
  const { state, setMarketPrefs } = useDiscoveryState()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<MarketHotSort>("latest")
  const configured = state.marketPrefs.configured

  return (
    <>
      <SectionShell
        title="市场爆款"
        subtitle="最近行业热门素材"
        actions={
          configured ? (
            <>
              <TabStrip<MarketHotSort> tabs={MARKET_TABS} value={tab} onChange={setTab} />
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="h-8 px-3 rounded-full border border-[var(--line)] text-[11.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
              >
                <Settings size={11} strokeWidth={2.4} />
                修改偏好
              </button>
            </>
          ) : null
        }
      >
        {configured ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {state.marketPrefs.countries.map((c) => (
                <span key={c} className="inline-flex items-center h-5 px-1.5 rounded-md bg-[var(--soft)] text-[10.5px] font-bold text-[var(--text)]">
                  {c}
                </span>
              ))}
              {state.marketPrefs.categories.map((k) => (
                <span key={k} className="inline-flex items-center h-5 px-1.5 rounded-md bg-[#fff7ed] text-[10.5px] font-bold text-[#9a3412]">
                  {MARKET_CATEGORY_META[k].label}
                </span>
              ))}
            </div>
            <MaterialStrip materials={getMarketHotPicks(10, tab)} />
          </div>
        ) : (
          <GatedEmptyState
            icon={<Globe2 size={22} strokeWidth={2.2} />}
            headline="告诉我你关心的国家 + 品类，每日推送市场爆款"
            subline="一句话描述行业品类，系统按国家 / 品类智能筛选近 24h 热门素材。"
            ctaLabel="设置推送偏好"
            onCta={() => setOpen(true)}
          />
        )}
      </SectionShell>

      <MarketPrefsDialog
        open={open}
        initial={{
          countries: state.marketPrefs.countries,
          categories: state.marketPrefs.categories,
          description: state.marketPrefs.description,
        }}
        onOpenChange={setOpen}
        onSave={setMarketPrefs}
      />
    </>
  )
}
