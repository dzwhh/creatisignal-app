"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { TEMPLATES } from "@/lib/generate/templates"
import type { Template } from "@/lib/generate/types"

// ─── 全部模板画廊 Modal ──────────────────────────────────────────────────────

export function TemplateGalleryModal({ open, onOpenChange, activeTemplateId, onApply }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  activeTemplateId: string | null
  onApply: (t: Template) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[840px] max-w-[calc(100vw-48px)] max-h-[82vh] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <div>
              <Dialog.Title className="text-[17px] font-bold text-[var(--text)]">视频生成模板</Dialog.Title>
              <Dialog.Description className="text-[12.5px] text-[var(--muted)] mt-0.5">
                选择模板一键填充提示词、参考素材与推荐配置，随后可自由编辑
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-3 gap-4">
              {TEMPLATES.map((t) => {
                const active = t.id === activeTemplateId
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { onApply(t); onOpenChange(false) }}
                    className={cn(
                      "relative rounded-[14px] overflow-hidden border text-left cursor-pointer group transition-all",
                      active
                        ? "border-[var(--near-black)] ring-2 ring-[var(--lime)]"
                        : "border-[var(--line)] hover:border-[var(--line-strong)] hover:shadow-[0_12px_28px_rgba(9,9,11,0.10)]"
                    )}
                  >
                    <div className="relative h-[150px] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.cover} alt={t.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]" />
                      <span className="absolute top-2 left-2 h-[20px] px-2 rounded-md bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold flex items-center leading-none">
                        {t.tag}
                      </span>
                      {/* hover 浮层：使用模板 */}
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="h-8 px-3.5 rounded-full bg-[var(--lime)] text-[#1a2010] text-[12px] font-extrabold flex items-center gap-1.5 shadow-lg">
                          <Sparkles size={13} strokeWidth={2.4} />
                          {active ? "重新应用" : "使用模板"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[13.5px] font-bold text-[var(--text)]">{t.name}</p>
                      <p className="text-[11.5px] text-[var(--muted)] mt-1 leading-snug line-clamp-2">{t.description}</p>
                      <p className="text-[10.5px] text-[var(--muted-2)] mt-2 font-semibold">
                        {t.settings.ratio} · {t.settings.duration}s · {t.settings.model}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
