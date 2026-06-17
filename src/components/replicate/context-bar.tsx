"use client"

import { Globe2, RadioTower, Smartphone, Store, Tag, type LucideIcon } from "lucide-react"
import { LIFECYCLE_META, MATERIAL_SOURCE_META, type LifecyclePhase, type MaterialSource } from "@/lib/insights/types"

interface Props {
  brand?: string                 // 客户
  country?: string               // 国家/地区
  category?: string              // 行业品类
  source?: MaterialSource | null
  lifecyclePhase?: LifecyclePhase | null
}

// 顶部全局上下文条：客户 / TikTok / GMV Max / 国家 / 品类 / 素材来源 / 生命周期
export function ContextBar({
  brand = "Hotligh",
  country = "US",
  category = "工具户外",
  source,
  lifecyclePhase,
}: Props) {
  const items: { icon: LucideIcon; label: string; value: string; dot?: string; bg?: string; color?: string }[] = [
    { icon: Store,       label: "客户",       value: brand },
    { icon: Smartphone,  label: "平台",       value: "TikTok" },
    { icon: RadioTower,  label: "广告产品",   value: "GMV Max" },
    { icon: Globe2,      label: "国家/地区",  value: country },
    { icon: Tag,         label: "行业品类",   value: category },
  ]

  return (
    <div className="px-8 py-2 bg-white border-b border-[var(--line)] flex items-center gap-4 flex-wrap text-[11.5px]">
      {items.map(({ icon: Icon, label, value }) => (
        <span key={label} className="inline-flex items-center gap-1.5 text-[var(--muted)]">
          <Icon size={11} strokeWidth={2.2} className="text-[var(--muted-2)]" />
          <span className="font-semibold text-[var(--muted-2)]">{label}</span>
          <span className="font-bold text-[var(--text)]">{value}</span>
        </span>
      ))}
      {source && (
        <span
          className="inline-flex items-center gap-1.5 h-5 px-2 rounded-md text-[10.5px] font-extrabold border"
          style={{
            backgroundColor: MATERIAL_SOURCE_META[source].dot + "15",
            borderColor: MATERIAL_SOURCE_META[source].dot + "55",
            color: MATERIAL_SOURCE_META[source].dot,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MATERIAL_SOURCE_META[source].dot }} />
          {MATERIAL_SOURCE_META[source].label}
        </span>
      )}
      {lifecyclePhase && (
        <span
          className="inline-flex items-center gap-1.5 h-5 px-2 rounded-md text-[10.5px] font-extrabold border"
          style={{
            backgroundColor: LIFECYCLE_META[lifecyclePhase].dot + "15",
            borderColor: LIFECYCLE_META[lifecyclePhase].dot + "55",
            color: LIFECYCLE_META[lifecyclePhase].dot,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LIFECYCLE_META[lifecyclePhase].dot }} />
          {LIFECYCLE_META[lifecyclePhase].label}
        </span>
      )}
    </div>
  )
}
