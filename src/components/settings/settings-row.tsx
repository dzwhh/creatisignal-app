"use client"

import * as React from "react"

interface Props {
  label: string
  description?: string
  children: React.ReactNode
  divider?: boolean   // 默认带分隔线，行间用
}

export function SettingsRow({ label, description, children, divider = true }: Props) {
  return (
    <div className={["flex items-center gap-4 py-3", divider ? "border-t border-[var(--line)] first:border-t-0 first:pt-0 last:pb-0" : ""].join(" ")}>
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-extrabold text-[var(--text)] leading-snug">{label}</p>
        {description && <p className="text-[11.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0 flex items-center gap-2">{children}</div>
    </div>
  )
}
