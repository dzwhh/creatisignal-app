"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TabStripItem<T extends string> {
  id: T
  label: string
}

interface Props<T extends string> {
  tabs: ReadonlyArray<TabStripItem<T>>
  value: T
  onChange: (id: T) => void
  size?: "sm" | "md"
}

export function TabStrip<T extends string>({ tabs, value, onChange, size = "sm" }: Props<T>) {
  const h = size === "md" ? "h-9 p-1" : "h-8 p-0.5"
  const inner = size === "md" ? "h-7 px-3 text-[12px]" : "h-7 px-2.5 text-[11.5px]"
  return (
    <div className={cn("inline-flex rounded-lg border border-[var(--line)] bg-[var(--soft)]", h)} role="tablist">
      {tabs.map((t) => {
        const active = t.id === value
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "rounded-[6px] font-bold whitespace-nowrap cursor-pointer transition-colors",
              inner,
              active
                ? "bg-white text-[var(--text)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
