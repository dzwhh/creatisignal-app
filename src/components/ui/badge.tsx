import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        secondary: "bg-[var(--soft)] text-[var(--muted)]",
        success: "bg-[var(--green)] text-[var(--green-text)]",
        destructive: "bg-red-50 text-red-600",
        lime: "bg-[var(--lime-soft)] text-[#5c7a00]",
        outline: "border border-[var(--line)] text-[var(--muted)]",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
