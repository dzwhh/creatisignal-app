"use client"

import { useEffect, useRef, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { ArrowLeft, Check, X } from "lucide-react"
import { REJECTION_REASON_META, type RejectionReason } from "@/lib/insights/types"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  trigger: React.ReactNode
  onPick: (reason: RejectionReason, customText?: string) => void
}

export function RejectionReasonPicker({ open, onOpenChange, trigger, onPick }: Props) {
  const [mode, setMode] = useState<"list" | "custom">("list")
  const [customText, setCustomText] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // 每次打开时重置
  useEffect(() => {
    if (open) {
      setMode("list")
      setCustomText("")
    }
  }, [open])

  // 切换到 custom 模式时聚焦输入
  useEffect(() => {
    if (mode === "custom") window.setTimeout(() => inputRef.current?.focus(), 60)
  }, [mode])

  function submitCustom() {
    const text = customText.trim()
    if (!text) return
    onPick("custom", text)
    onOpenChange(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-[60] w-[260px] p-1 bg-white border border-[var(--line)] rounded-2xl shadow-[0_20px_44px_rgba(9,9,11,0.16)]"
        >
          {mode === "list" ? (
            <>
              <p className="px-2.5 pt-2 pb-1 text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
                选个不采纳原因
              </p>
              {(Object.keys(REJECTION_REASON_META) as RejectionReason[])
                .filter((k) => k !== "custom")
                .map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { onPick(key); onOpenChange(false) }}
                    className="w-full text-left px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[var(--soft-2)] transition-colors"
                  >
                    <p className="text-[12px] font-bold text-[var(--text)]">{REJECTION_REASON_META[key].label}</p>
                    <p className="text-[10.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{REJECTION_REASON_META[key].desc}</p>
                  </button>
                ))}
              <div className="border-t border-[var(--line)] my-1" />
              <button
                type="button"
                onClick={() => setMode("custom")}
                className="w-full text-left px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[var(--soft-2)] transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-[12px] font-bold text-[var(--text)]">{REJECTION_REASON_META.custom.label}</p>
                  <p className="text-[10.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{REJECTION_REASON_META.custom.desc}</p>
                </div>
                <span className="text-[10.5px] font-bold text-[var(--muted-2)]">输入 →</span>
              </button>
              <div className="border-t border-[var(--line)] my-1" />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[var(--muted)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center justify-center gap-1"
              >
                <X size={10} />
                取消
              </button>
            </>
          ) : (
            <>
              <div className="px-2.5 pt-2 pb-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode("list")}
                  className="text-[10.5px] font-extrabold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={10} />
                  返回选项
                </button>
                <span className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
                  自定义原因
                </span>
              </div>
              <div className="px-2 pb-1.5 pt-1">
                <input
                  ref={inputRef}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitCustom()
                    if (e.key === "Escape") setMode("list")
                  }}
                  placeholder="一句话写明原因，例如：女声不适配该品牌调性"
                  className="w-full h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12px] outline-none focus:border-[var(--text)]"
                />
                <p className="mt-1 text-[10px] text-[var(--muted-2)]">回车提交 · Esc 返回</p>
              </div>
              <div className="px-2 pb-2 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="h-7 px-2.5 rounded-md text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={submitCustom}
                  disabled={!customText.trim()}
                  className={cn(
                    "h-7 px-2.5 rounded-md text-[11px] font-extrabold flex items-center gap-1 transition-opacity",
                    customText.trim()
                      ? "bg-[var(--near-black)] text-white cursor-pointer hover:opacity-90"
                      : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
                  )}
                >
                  <Check size={10} strokeWidth={2.6} />
                  确认
                </button>
              </div>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
