import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--line-strong)] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--near-black)] text-white hover:bg-[#2c2c30]",
        primary:
          "bg-[var(--lime)] text-[var(--near-black)] hover:brightness-95",
        outline:
          "border border-[var(--line)] bg-white text-[var(--text)] hover:bg-[var(--soft)]",
        ghost:
          "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft)]",
        destructive:
          "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-7 px-2.5 text-xs rounded-md",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { Button, buttonVariants }
