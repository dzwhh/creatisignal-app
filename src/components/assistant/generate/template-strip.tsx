"use client"

import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEMPLATES, HOOK_OPTIONS, SCENE_OPTIONS } from "@/lib/generate/templates"
import type { Template, SlotOption } from "@/lib/generate/types"

// ─── 底部面板：创意模板 / Hooks / 场景 三 tab 卡片流（tab 受控）──────────────

export type StripTab = "playbook" | "hooks" | "scenes"

const TAB_META: Record<StripTab, { label: string; subtitle: string }> = {
  playbook: { label: "创意模板", subtitle: "创意模板来源于 Top Ads 高表现广告的最佳实践" },
  hooks: { label: "Hooks", subtitle: "精选近期热门 Hooks，快速吸引用户注意" },
  scenes: { label: "场景", subtitle: "选择场景设定 · 点选即填充提示词句段" },
}

// ─── 封面卡片（打法与 Hook/场景 选项共用）────────────────────────────────────

function CoverCard({ cover, name, badge, active, title, onClick, index }: {
  cover: string
  name: string
  /** 左上角角标（如「推荐」）*/
  badge?: string
  active: boolean
  title?: string
  onClick: () => void
  index: number
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, type: "spring", stiffness: 380, damping: 28 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
      title={title}
      className="relative shrink-0 w-[96px] text-left cursor-pointer group"
    >
      <div className={cn(
        "relative w-full h-[120px] rounded-[12px] overflow-hidden border transition-all",
        active
          ? "border-[var(--near-black)] ring-2 ring-[var(--lime)]"
          : "border-[var(--line)] group-hover:border-[var(--line-strong)] group-hover:shadow-[0_8px_20px_rgba(9,9,11,0.10)]"
      )}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]" />
        {badge && (
          <span className="absolute top-1.5 left-1.5 h-[18px] px-1.5 rounded-md bg-[var(--lime)] text-[#1a2010] text-[9px] font-black flex items-center leading-none shadow-sm">
            {badge}
          </span>
        )}
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
        {name}
      </p>
    </motion.button>
  )
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export function TemplateStrip({ tab, onTabChange, playbook, hook, scene, onApplyPlaybook, onSelectHook, onSelectScene, onOpenGallery }: {
  tab: StripTab
  onTabChange: (t: StripTab) => void
  playbook: Template | null
  hook: SlotOption | null
  scene: SlotOption | null
  onApplyPlaybook: (t: Template) => void
  onSelectHook: (opt: SlotOption) => void
  onSelectScene: (opt: SlotOption) => void
  onOpenGallery: () => void
}) {
  return (
    <div className="-mx-[18px] -mb-[18px] mt-1 px-[18px] pt-3 pb-3.5 border-t border-[var(--line)] bg-[var(--soft-2)] rounded-b-[20px]">
      {/* Tab 行 + 全部模板 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[3px] border border-[var(--line)] rounded-full bg-[var(--soft)] p-[3px] w-max">
          {(Object.keys(TAB_META) as StripTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange(t)}
              className={cn(
                "h-[26px] rounded-full px-2.5 text-[11.5px] font-bold flex items-center cursor-pointer transition-colors whitespace-nowrap",
                tab === t
                  ? "bg-white text-[#18181b] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                  : "bg-transparent text-[var(--muted)]"
              )}
            >
              {TAB_META[t].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onOpenGallery}
          className="flex items-center gap-1 text-[11.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer transition-colors"
        >
          <LayoutGrid size={12} strokeWidth={2.2} />
          全部模板
        </button>
      </div>

      {/* 副标题（tab 下方，随 tab 切换）*/}
      <p className="mt-2 mb-2.5 text-[11px] font-bold text-[var(--muted)] tracking-wide">
        {TAB_META[tab].subtitle}
      </p>

      {/* 当前 tab 的卡片流 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tab === "playbook" && TEMPLATES.map((t, i) => (
            <CoverCard
              key={t.id} cover={t.cover} name={t.name} badge={i === 0 ? "推荐" : undefined}
              title={t.description} active={t.id === playbook?.id}
              onClick={() => onApplyPlaybook(t)} index={i}
            />
          ))}
          {tab === "hooks" && (playbook?.hooks ?? HOOK_OPTIONS).map((opt, i) => (
            <CoverCard
              key={opt.id} cover={opt.cover} name={opt.label} title={opt.sentence}
              active={opt.id === hook?.id} onClick={() => onSelectHook(opt)} index={i}
            />
          ))}
          {tab === "scenes" && (playbook?.scenes ?? SCENE_OPTIONS).map((opt, i) => (
            <CoverCard
              key={opt.id} cover={opt.cover} name={opt.label} title={opt.sentence}
              active={opt.id === scene?.id} onClick={() => onSelectScene(opt)} index={i}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
