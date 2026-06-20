"use client"

import * as React from "react"

interface Props {
  title: string
  subtitle: string
  actions?: React.ReactNode    // 右侧附加按钮（如「管理授权」「修改偏好」「+ 添加品牌」）
  children: React.ReactNode
}

export function SectionShell({ title, subtitle, actions, children }: Props) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3 gap-3">
        <div className="min-w-0">
          <h2 className="text-[18px] font-extrabold text-[var(--text)] tracking-tight leading-tight">{title}</h2>
          <p className="text-[12.5px] text-[var(--muted)] mt-1">{subtitle}</p>
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  )
}
