"use client"

import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateTimePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { FieldError, SectionCard, type SectionProps } from "./section-card"

// ─── 排期方式：立即开始 / 自定义时间段 ───────────────────────────────────────

export function ScheduleSettings({ config, update, errors }: SectionProps) {
  return (
    <SectionCard id="section-schedule" icon={Zap} title="排期方式" desc="设置广告投放的时间安排">
      <div>
        <Label required>排期方式</Label>
        <div className="mt-2 inline-flex rounded-lg border border-[var(--line)] p-1 bg-[var(--soft-2)]">
          {(
            [
              { value: "immediate", label: "立即开始" },
              { value: "custom", label: "自定义时间段" },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => update("scheduleMode", value)}
              className={cn(
                "h-8 px-4 rounded-md text-[13px] font-medium transition-colors duration-200 cursor-pointer",
                config.scheduleMode === value
                  ? "bg-white text-[var(--text)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {config.scheduleMode === "custom" && (
        <div className="grid grid-cols-1 @xl:grid-cols-2 gap-4">
          <div>
            <Label required htmlFor="gmv-schedule-start">开始时间</Label>
            <div className="mt-2">
              <DateTimePicker
                id="gmv-schedule-start"
                invalid={!!errors.scheduleStart}
                value={config.scheduleStart}
                onChange={(v) => update("scheduleStart", v)}
              />
            </div>
            <FieldError message={errors.scheduleStart} />
          </div>
          <div>
            <Label htmlFor="gmv-schedule-end">结束时间（可选）</Label>
            <div className="mt-2">
              <DateTimePicker
                id="gmv-schedule-end"
                minDate={config.scheduleStart || undefined}
                value={config.scheduleEnd}
                onChange={(v) => update("scheduleEnd", v)}
              />
            </div>
            <p className="mt-1.5 text-xs text-[var(--muted-2)]">留空则长期投放，直到手动暂停</p>
          </div>
        </div>
      )}
    </SectionCard>
  )
}
