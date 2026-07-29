"use client"

import { CalendarDays } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { FieldError, SectionCard, ToggleRow, type SectionProps } from "./section-card"

// ─── 高级优化：促销日预算策略 ────────────────────────────────────────────────

export function AdvancedOptimization({ config, update, errors }: SectionProps) {
  return (
    <SectionCard id="section-advanced" icon={CalendarDays} title="高级优化" desc="促销日预算策略与非促销日自动增量">
      <ToggleRow
        icon={CalendarDays}
        title="促销日设置"
        desc="促销日期间自动增加预算并降低 ROAS 目标以获取更多流量"
        checked={config.promoDayEnabled}
        onCheckedChange={(v) => update("promoDayEnabled", v)}
      >
        <div className="grid grid-cols-1 @xl:grid-cols-2 gap-4">
          <div>
            <Label required htmlFor="gmv-promo-start">促销开始日期</Label>
            <div className="mt-2">
              <DatePicker
                id="gmv-promo-start"
                invalid={!!errors.promoStart}
                value={config.promoStart}
                onChange={(v) => update("promoStart", v)}
              />
            </div>
          </div>
          <div>
            <Label required htmlFor="gmv-promo-end">促销结束日期</Label>
            <div className="mt-2">
              <DatePicker
                id="gmv-promo-end"
                minDate={config.promoStart || undefined}
                value={config.promoEnd}
                onChange={(v) => update("promoEnd", v)}
              />
            </div>
          </div>
        </div>
        <FieldError message={errors.promoStart} />
        <p className="mt-2 text-xs text-[var(--muted-2)]">
          促销期间预算自动上浮 20%～50%，ROAS 目标下调 10%，促销结束后自动恢复。
        </p>
      </ToggleRow>
    </SectionCard>
  )
}
