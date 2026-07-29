import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[var(--line)] bg-white px-3 text-sm text-[var(--text)] transition-colors duration-200",
        "placeholder:text-[var(--muted-2)]",
        "focus-visible:outline-none focus-visible:border-[var(--line-strong)] focus-visible:ring-2 focus-visible:ring-[var(--soft)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--soft-2)]",
        "aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-100",
        className
      )}
      {...props}
    />
  )
}

export { Input }
