"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface Props {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  ariaLabel?: string
}

export function Toggle({ checked, onChange, disabled, ariaLabel }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 rounded-full transition-colors shrink-0",
        disabled
          ? "bg-[var(--soft)] cursor-not-allowed opacity-50"
          : checked
            ? "bg-[var(--text)] cursor-pointer"
            : "bg-[var(--soft)] cursor-pointer hover:bg-[var(--line-strong)]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
