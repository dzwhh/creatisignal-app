"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEMPLATES, HOOK_OPTIONS, SCENE_OPTIONS } from "@/lib/generate/templates"
import type { Template, SlotOption } from "@/lib/generate/types"

// ─── 全部模板画廊 Modal：创意模板 / Hooks / 场景 三 tab ──────────────────────

type GalleryTab = "playbook" | "hooks" | "scenes"

const TAB_META: Record<GalleryTab, { label: string; subtitle: string }> = {
  playbook: { label: "创意模板", subtitle: "创意模板来源于 Top Ads 高表现广告的最佳实践" },
  hooks: { label: "Hooks", subtitle: "精选近期热门 Hooks，快速吸引用户注意" },
  scenes: { label: "场景", subtitle: "选择场景设定，点选即填充提示词句段" },
}

function GalleryCard({ cover, name, description, active, actionLabel, onClick }: {
  cover: string
  name: string
  description: string
  active: boolean
  actionLabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative rounded-[14px] overflow-hidden border text-left cursor-pointer group transition-all",
        active
          ? "border-[var(--near-black)] ring-2 ring-[var(--lime)]"
          : "border-[var(--line)] hover:border-[var(--line-strong)] hover:shadow-[0_12px_28px_rgba(9,9,11,0.10)]"
      )}
    >
      <div className="relative h-[150px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]" />
        {active && (
          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--lime)] text-[#1a2010] flex items-center justify-center shadow-sm">
            <Check size={13} strokeWidth={3} />
          </span>
        )}
        {/* hover 浮层 */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="h-8 px-3.5 rounded-full bg-[var(--lime)] text-[#1a2010] text-[12px] font-extrabold flex items-center gap-1.5 shadow-lg">
            <Sparkles size={13} strokeWidth={2.4} />
            {actionLabel}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[13.5px] font-bold text-[var(--text)]">{name}</p>
        <p className="text-[11.5px] text-[var(--muted)] mt-1 leading-snug line-clamp-2">{description}</p>
      </div>
    </button>
  )
}

export function TemplateGalleryModal({ open, onOpenChange, playbook, hook, scene, onApplyPlaybook, onSelectHook, onSelectScene }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  playbook: Template | null
  hook: SlotOption | null
  scene: SlotOption | null
  onApplyPlaybook: (t: Template) => void
  onSelectHook: (opt: SlotOption) => void
  onSelectScene: (opt: SlotOption) => void
}) {
  const [tab, setTab] = useState<GalleryTab>("playbook")

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[840px] max-w-[calc(100vw-48px)] max-h-[82vh] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <div>
              <Dialog.Title className="text-[17px] font-bold text-[var(--text)]">全部模板</Dialog.Title>
              <Dialog.Description className="text-[12.5px] text-[var(--muted)] mt-0.5">
                {TAB_META[tab].subtitle}，随后可自由编辑
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Tab 行 */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-[3px] border border-[var(--line)] rounded-full bg-[var(--soft)] p-[3px] w-max">
              {(Object.keys(TAB_META) as GalleryTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "h-[28px] rounded-full px-3 text-[12.5px] font-bold flex items-center cursor-pointer transition-colors whitespace-nowrap",
                    tab === t
                      ? "bg-white text-[#18181b] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                      : "bg-transparent text-[var(--muted)]"
                  )}
                >
                  {TAB_META[t].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-3 gap-4">
              {tab === "playbook" && TEMPLATES.map((t) => (
                <GalleryCard
                  key={t.id} cover={t.cover} name={t.name} description={t.description}
                  active={t.id === playbook?.id}
                  actionLabel={t.id === playbook?.id ? "重新应用" : "使用模板"}
                  onClick={() => { onApplyPlaybook(t); onOpenChange(false) }}
                />
              ))}
              {tab === "hooks" && (playbook?.hooks ?? HOOK_OPTIONS).map((opt) => (
                <GalleryCard
                  key={opt.id} cover={opt.cover} name={opt.label} description={opt.sentence}
                  active={opt.id === hook?.id}
                  actionLabel={opt.id === hook?.id ? "已选择" : "使用"}
                  onClick={() => { onSelectHook(opt); onOpenChange(false) }}
                />
              ))}
              {tab === "scenes" && (playbook?.scenes ?? SCENE_OPTIONS).map((opt) => (
                <GalleryCard
                  key={opt.id} cover={opt.cover} name={opt.label} description={opt.sentence}
                  active={opt.id === scene?.id}
                  actionLabel={opt.id === scene?.id ? "已选择" : "使用"}
                  onClick={() => { onSelectScene(opt); onOpenChange(false) }}
                />
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
