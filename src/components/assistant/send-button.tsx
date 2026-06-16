"use client"

import { ArrowUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SendButtonProps {
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export function SendButton({ disabled = true, loading = false, onClick }: SendButtonProps) {
  const effectivelyDisabled = disabled || loading
  return (
    <button
      type="button"
      disabled={effectivelyDisabled}
      onClick={onClick}
      aria-label={loading ? "正在生成" : "提交生成"}
      aria-busy={loading}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0",
        loading
          ? "bg-[var(--near-black)] text-white cursor-progress"
          : effectivelyDisabled
            ? "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
            : "bg-[var(--near-black)] text-white cursor-pointer hover:opacity-90"
      )}
    >
      {loading ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.5} />}
    </button>
  )
}
