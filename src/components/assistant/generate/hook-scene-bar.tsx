"use client"

import { motion } from "framer-motion"
import { Zap, Clapperboard } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SlotOption } from "@/lib/generate/types"

// ─── Hook / 场景 胶囊选择行（仅模板态显示，句段替换见 docs/adr/0002）─────────

function SlotGroup({ icon: Icon, label, options, selectedId, onSelect }: {
  icon: React.ElementType
  label: string
  options: SlotOption[]
  selectedId: string
  onSelect: (opt: SlotOption) => void
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--muted)] shrink-0">
        <Icon size={12} strokeWidth={2.4} />
        {label}
      </span>
      <div className="flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((opt) => {
          const active = opt.id === selectedId
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt)}
              title={opt.sentence}
              className={cn(
                "h-[26px] px-2.5 rounded-full text-[11.5px] font-bold whitespace-nowrap cursor-pointer transition-all border",
                active
                  ? "bg-[var(--near-black)] border-[var(--near-black)] text-white shadow-sm"
                  : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function HookSceneBar({ hooks, scenes, selectedHookId, selectedSceneId, onSelectHook, onSelectScene }: {
  hooks: SlotOption[]
  scenes: SlotOption[]
  selectedHookId: string
  selectedSceneId: string
  onSelectHook: (opt: SlotOption) => void
  onSelectScene: (opt: SlotOption) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className="overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[12px] bg-[var(--soft-2)] border border-[var(--line)] px-3 py-2">
        <SlotGroup icon={Zap} label="Hook" options={hooks} selectedId={selectedHookId} onSelect={onSelectHook} />
        <SlotGroup icon={Clapperboard} label="场景" options={scenes} selectedId={selectedSceneId} onSelect={onSelectScene} />
      </div>
    </motion.div>
  )
}
