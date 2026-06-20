"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"

interface Props {
  icon?: LucideIcon
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  noPad?: boolean        // true 时 body 不加 padding（给表格用）
}

export function SettingsCard({ icon: Icon, title, description, actions, children, noPad }: Props) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      <header className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-start justify-between gap-3">
        <div className="min-w-0 flex items-start gap-2.5">
          {Icon && (
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--soft)] text-[var(--text)] shrink-0">
              <Icon size={14} strokeWidth={2.2} />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-[14px] font-extrabold text-[var(--text)] leading-snug">{title}</h2>
            {description && <p className="text-[12px] text-[var(--muted)] mt-0.5 leading-relaxed">{description}</p>}
          </div>
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </header>
      <div className={noPad ? "" : "px-5 py-4"}>{children}</div>
    </section>
  )
}
