"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import type { ConfigErrors, GmvMaxConfig } from "@/lib/ads/gmv-max-types"

// ─── GMV Max 配置分区通用外壳 + 表单小件 ─────────────────────────────────────

/** 各配置分区统一的 props：整份配置 + 单字段更新器 + 校验错误 */
export interface SectionProps {
  config: GmvMaxConfig
  update: <K extends keyof GmvMaxConfig>(key: K, value: GmvMaxConfig[K]) => void
  errors: ConfigErrors
}

interface SectionCardProps {
  id: string
  icon: LucideIcon
  title: string
  desc: string
  children: React.ReactNode
}

export function SectionCard({ id, icon: Icon, title, desc, children }: SectionCardProps) {
  return (
    <section id={id} className="rounded-xl border border-[var(--line)] bg-white p-6 scroll-mt-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--lime-soft)] flex items-center justify-center shrink-0">
          <Icon size={16} strokeWidth={2} className="text-[var(--near-black)]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--text)] leading-tight">{title}</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{desc}</p>
        </div>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-red-500">{message}</p>
}

interface ChoiceCardProps {
  icon?: LucideIcon
  title: string
  desc: string
  selected: boolean
  disabled?: boolean
  badge?: string
  onClick?: () => void
}

/** 可选中的卡片（推广类型 / 视频选择方式等） */
export function ChoiceCard({ icon: Icon, title, desc, selected, disabled, badge, onClick }: ChoiceCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-4 flex items-start gap-3 text-left transition-colors duration-200",
        selected
          ? "border-[var(--lime)] bg-[var(--lime-soft)]/40 ring-1 ring-[var(--lime)]"
          : "border-[var(--line)] bg-white hover:border-[var(--line-strong)]",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
            selected ? "bg-[var(--lime)]" : "bg-[var(--soft)]"
          )}
        >
          <Icon size={15} strokeWidth={2} className="text-[var(--near-black)]" />
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text)]">{title}</span>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--soft)] text-[var(--muted)]">{badge}</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[var(--muted)] leading-relaxed">{desc}</p>
      </div>
    </button>
  )
}

interface ToggleRowProps {
  icon?: LucideIcon
  title: string
  desc: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  children?: React.ReactNode
}

/** Toggle 行（创建后启用广告 / 促销日设置 / 达人帖子） */
export function ToggleRow({ icon: Icon, title, desc, checked, onCheckedChange, children }: ToggleRowProps) {
  return (
    <div className={cn("rounded-lg", Icon && "border border-[var(--line)] p-4")}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-md bg-[var(--soft)] flex items-center justify-center shrink-0">
            <Icon size={15} strokeWidth={2} className="text-[var(--muted)]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[var(--text)]">{title}</div>
          <p className="mt-0.5 text-xs text-[var(--muted)] leading-relaxed">{desc}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
      {checked && children && <div className="mt-4">{children}</div>}
    </div>
  )
}
