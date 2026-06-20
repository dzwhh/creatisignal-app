"use client"

import * as React from "react"

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function SettingsShell({ title, subtitle, children }: Props) {
  return (
    <main className="flex-1 overflow-y-auto bg-[var(--soft-2)]">
      <div className="max-w-[960px] mx-auto px-8 py-6">
        <header className="mb-5">
          <h1 className="text-[22px] font-extrabold text-[var(--text)] tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-[12.5px] text-[var(--muted)] mt-1">{subtitle}</p>}
        </header>
        <div className="space-y-5">{children}</div>
      </div>
    </main>
  )
}
