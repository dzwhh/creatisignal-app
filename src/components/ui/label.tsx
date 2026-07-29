import * as React from "react"
import { cn } from "@/lib/utils"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** 必填标记（红色星号） */
  required?: boolean
}

function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-[13px] font-medium text-[var(--text)] leading-none", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

export { Label }
