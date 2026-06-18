"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Magic-UI RainbowButton — animated rainbow border + glow under the button.
// Tokens (--color-1..5) defined in globals.css.

// Exported so Links / Slots can wear the same look.
export const rainbowButtonClassName = cn(
  "group relative inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-[length:200%_100%] px-4 h-9 text-[12.5px] font-extrabold text-white transition-colors",
  "[background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
  // before glow under the button
  "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow",
  "before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
  "before:[filter:blur(calc(0.8*1rem))]",
  // button itself: inner dark + rainbow border
  "animate-rainbow",
  "bg-[linear-gradient(#18181b,#18181b),linear-gradient(#18181b_50%,rgba(24,24,27,0.6)_80%,rgba(24,24,27,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
  "disabled:pointer-events-none disabled:opacity-50"
)

export type RainbowButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  function RainbowButton({ className, children, ...rest }, ref) {
    return (
      <button ref={ref} {...rest} className={cn(rainbowButtonClassName, className)}>
        {children}
      </button>
    )
  }
)
