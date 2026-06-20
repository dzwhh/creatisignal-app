"use client"

import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowRight, Check, ShieldCheck, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AD_PLATFORM_META, type AdPlatform } from "@/lib/discovery/state"

interface Props {
  open: boolean
  initialPlatforms: AdPlatform[]
  onOpenChange: (v: boolean) => void
  onGrant: (platforms: AdPlatform[]) => void
}

export function PlatformGrantDialog({ open, initialPlatforms, onOpenChange, onGrant }: Props) {
  const [selected, setSelected] = useState<Set<AdPlatform>>(new Set(initialPlatforms))

  useEffect(() => {
    if (open) setSelected(new Set(initialPlatforms))
  }, [open, initialPlatforms])

  const platforms = Object.keys(AD_PLATFORM_META) as AdPlatform[]
  const count = selected.size
  const canSubmit = count > 0

  function toggle(p: AdPlatform) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(p)) next.delete(p); else next.add(p)
      return next
    })
  }

  function submit() {
    if (!canSubmit) return
    onGrant(Array.from(selected))
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Dialog.Title className="text-[15px] font-extrabold text-[var(--text)] flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#5a7821]" />
                关联广告平台
              </Dialog.Title>
              <Dialog.Description className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed">
                选择一个或多个平台授权，系统只读取素材投放相关数据，仅用于效果分析。
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={14} />
            </Dialog.Close>
          </div>

          <div className="space-y-1.5">
            {platforms.map((p) => {
              const meta = AD_PLATFORM_META[p]
              const checked = selected.has(p)
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(p)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-colors text-left",
                    checked
                      ? "border-[var(--text)] bg-[var(--soft)]"
                      : "border-[var(--line)] bg-white hover:border-[var(--line-strong)]"
                  )}
                >
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
                    style={{ backgroundColor: meta.color === "#fffc00" ? "#facc15" : meta.color }}
                  >
                    {meta.label.slice(0, 2)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-extrabold text-[var(--text)]">{meta.label}</p>
                    <p className="text-[10.5px] text-[var(--muted)] mt-0.5 truncate">{meta.desc}</p>
                  </div>
                  <span
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                      checked ? "bg-[var(--text)] text-white" : "border border-[var(--line-strong)] bg-white"
                    )}
                  >
                    {checked && <Check size={12} strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="text-[10.5px] text-[var(--muted-2)] mt-3 leading-relaxed">
            授权后可在此处随时管理；系统不会读取与素材效果无关的字段。
          </p>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-3.5 rounded-full text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className={cn(
                "h-9 px-4 rounded-full text-[12.5px] font-extrabold flex items-center gap-1.5 transition-opacity",
                canSubmit ? "bg-[#18181b] text-white hover:opacity-90 cursor-pointer" : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
              )}
            >
              授权选中（{count}）
              <ArrowRight size={12} strokeWidth={2.4} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
