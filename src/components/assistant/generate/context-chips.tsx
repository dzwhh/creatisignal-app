"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Pencil, RemoveFormatting } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Template, Targeting } from "@/lib/generate/types"

// ─── chips 行：模板 / 转自由文本 / 投放目标 ──────────────────────────────────

type OpenPopup = "targeting" | null

const chipBase = "h-[32px] rounded-full border flex items-center gap-1.5 px-3 text-[12.5px] font-[650] cursor-pointer transition-colors whitespace-nowrap"

function DropdownCard({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className={cn(
        "absolute top-[calc(100%+6px)] z-40 bg-white border border-[var(--line)] rounded-[14px] shadow-[0_18px_42px_rgba(9,9,11,0.14)]",
        align === "left" ? "left-0" : "right-0"
      )}
    >
      {children}
    </motion.div>
  )
}

// ─── 投放目标 ────────────────────────────────────────────────────────────────

const TARGETING_GROUPS: { key: keyof Targeting; label: string; options: string[] }[] = [
  { key: "platform", label: "平台", options: ["TikTok", "Reels", "Shorts"] },
  { key: "region", label: "地区", options: ["美国", "东南亚", "欧洲", "日本"] },
  { key: "language", label: "语言", options: ["English", "中文", "Español"] },
]

function TargetingChip({ targeting, onChange, open, onToggle }: {
  targeting: Targeting
  onChange: (t: Targeting) => void
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        title="投放目标"
        className={cn(chipBase, "bg-white border-[var(--line)] text-[var(--text)] hover:border-[var(--line-strong)]")}
      >
        <span>{targeting.platform}</span>
        <span className="text-[var(--muted-2)]">·</span>
        <span>{targeting.region}</span>
        <span className="text-[var(--muted-2)]">·</span>
        <span>{targeting.language}</span>
        <Pencil size={11} className="text-[var(--muted)] ml-0.5" />
      </button>
      <AnimatePresence>
        {open && (
          <DropdownCard align="right">
            <div className="w-[300px] p-4 flex flex-col gap-3.5">
              {TARGETING_GROUPS.map((group) => (
                <div key={group.key}>
                  <p className="text-[11px] font-semibold text-[var(--muted)] mb-1.5 tracking-wide">{group.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.options.map((opt) => {
                      const active = targeting[group.key] === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onChange({ ...targeting, [group.key]: opt })}
                          className={cn(
                            "h-[28px] px-3 rounded-full text-[12px] font-bold border cursor-pointer transition-colors",
                            active
                              ? "bg-[var(--near-black)] border-[var(--near-black)] text-white"
                              : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
                          )}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </DropdownCard>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export function ContextChips({
  playbook, onClearPlaybook,
  showFreeTextButton, onFreeText, targeting, onTargetingChange,
}: {
  playbook: Template | null
  onClearPlaybook: () => void
  showFreeTextButton: boolean
  onFreeText: () => void
  targeting: Targeting
  onTargetingChange: (t: Targeting) => void
}) {
  const [openPopup, setOpenPopup] = useState<OpenPopup>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openPopup) return
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenPopup(null)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [openPopup])

  const toggle = (p: OpenPopup) => setOpenPopup((prev) => (prev === p ? null : p))

  return (
    <div ref={rootRef} className="flex items-center gap-2 flex-wrap">
      {/* 打法 chip */}
      <AnimatePresence>
        {playbook && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -6 }}
            transition={{ type: "spring", stiffness: 480, damping: 30 }}
            className="flex items-center h-[32px] rounded-full bg-[var(--lime-soft)] border border-[#d4e89a] pl-3 pr-1"
          >
            <span className="flex items-center gap-1.5 text-[12.5px] font-[650] text-[#3a4a10]">
              <Sparkles size={12} strokeWidth={2.2} />
              {playbook.name}
            </span>
            <button
              type="button"
              onClick={onClearPlaybook}
              aria-label="清除模板"
              className="ml-1 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[#5a6b1a] hover:bg-[#dff0a8] cursor-pointer"
            >
              <X size={11} strokeWidth={2.4} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 转自由文本 */}
      {showFreeTextButton && (
        <button
          type="button"
          onClick={onFreeText}
          title="转为自由文本（去掉结构化标签）"
          className="w-[32px] h-[32px] rounded-full border border-[var(--line)] bg-white flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--line-strong)] cursor-pointer transition-colors"
        >
          <RemoveFormatting size={13} strokeWidth={2.2} />
        </button>
      )}

      <div className="flex-1" />

      {/* 投放目标 */}
      <TargetingChip
        targeting={targeting} onChange={onTargetingChange}
        open={openPopup === "targeting"} onToggle={() => toggle("targeting")}
      />
    </div>
  )
}
