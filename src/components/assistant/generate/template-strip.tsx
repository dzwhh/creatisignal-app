"use client"

import { motion } from "framer-motion"
import { LayoutGrid, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEMPLATES } from "@/lib/generate/templates"
import type { Template } from "@/lib/generate/types"

// ─── 模板卡片流：视频生成态下的框内底部区域 ──────────────────────────────────

function TemplateCard({ template, active, onApply, index }: {
  template: Template
  active: boolean
  onApply: (t: Template) => void
  index: number
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, type: "spring", stiffness: 380, damping: 28 }}
      whileHover={{ y: -3 }}
      onClick={() => onApply(template)}
      className="relative shrink-0 w-[96px] text-left cursor-pointer group"
    >
      <div className={cn(
        "relative w-full h-[120px] rounded-[12px] overflow-hidden border transition-all",
        active
          ? "border-[var(--near-black)] ring-2 ring-[var(--lime)]"
          : "border-[var(--line)] group-hover:border-[var(--line-strong)] group-hover:shadow-[0_8px_20px_rgba(9,9,11,0.10)]"
      )}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={template.cover} alt={template.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]" />
        <span className="absolute top-1.5 left-1.5 h-[18px] px-1.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-[9px] font-bold flex items-center leading-none">
          {template.tag}
        </span>
        {active && (
          <span className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--lime)] text-[#1a2010] flex items-center justify-center shadow-sm">
            <Check size={11} strokeWidth={3} />
          </span>
        )}
      </div>
      <p className={cn(
        "mt-1.5 text-[11.5px] font-bold leading-tight truncate",
        active ? "text-[var(--text)]" : "text-[#3f3f46] group-hover:text-[var(--text)]"
      )}>
        {template.name}
      </p>
    </motion.button>
  )
}

export function TemplateStrip({ activeTemplateId, onApply, onOpenGallery }: {
  activeTemplateId: string | null
  onApply: (t: Template) => void
  onOpenGallery: () => void
}) {
  return (
    <div className="-mx-[18px] -mb-[18px] mt-1 px-[18px] pt-3 pb-3.5 border-t border-[var(--line)] bg-[var(--soft-2)] rounded-b-[20px]">
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] font-bold text-[var(--muted)] tracking-wide">从模板开始 · 一键填充提示词与参考</p>
        <button
          type="button"
          onClick={onOpenGallery}
          className="flex items-center gap-1 text-[11.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer transition-colors"
        >
          <LayoutGrid size={12} strokeWidth={2.2} />
          全部模板
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TEMPLATES.map((t, i) => (
          <TemplateCard key={t.id} template={t} active={t.id === activeTemplateId} onApply={onApply} index={i} />
        ))}
      </div>
    </div>
  )
}
