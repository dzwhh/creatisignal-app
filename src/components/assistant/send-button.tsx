"use client"

import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface SendButtonProps {
  disabled?: boolean
}

export function SendButton({ disabled = true }: SendButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0",
        disabled
          ? "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
          : "bg-[var(--near-black)] text-white cursor-pointer"
      )}
      aria-label="提交生成"
    >
      <ArrowUp size={16} strokeWidth={2.5} />
    </button>
  )
}
