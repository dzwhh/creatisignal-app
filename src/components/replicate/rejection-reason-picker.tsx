"use client"

import * as Popover from "@radix-ui/react-popover"
import { X } from "lucide-react"
import { REJECTION_REASON_META, type RejectionReason } from "@/lib/insights/types"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  trigger: React.ReactNode
  onPick: (reason: RejectionReason) => void
}

export function RejectionReasonPicker({ open, onOpenChange, trigger, onPick }: Props) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-[60] w-[240px] p-1 bg-white border border-[var(--line)] rounded-2xl shadow-[0_20px_44px_rgba(9,9,11,0.16)]"
        >
          <p className="px-2.5 pt-2 pb-1 text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
            选个不采纳原因
          </p>
          {(Object.keys(REJECTION_REASON_META) as RejectionReason[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { onPick(key); onOpenChange(false) }}
              className={cn(
                "w-full text-left px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[var(--soft-2)] transition-colors"
              )}
            >
              <p className="text-[12px] font-bold text-[var(--text)]">{REJECTION_REASON_META[key].label}</p>
              <p className="text-[10.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{REJECTION_REASON_META[key].desc}</p>
            </button>
          ))}
          <div className="border-t border-[var(--line)] my-1" />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[var(--muted)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center justify-center gap-1"
          >
            <X size={10} />
            取消
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
