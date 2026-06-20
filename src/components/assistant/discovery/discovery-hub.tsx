"use client"

import { OwnHotSection } from "./own-hot-section"
import { MarketHotSection } from "./market-hot-section"
import { CompetitorHotSection } from "./competitor-hot-section"

export function DiscoveryHub() {
  return (
    <div className="space-y-10">
      <OwnHotSection />
      <MarketHotSection />
      <CompetitorHotSection />
    </div>
  )
}
