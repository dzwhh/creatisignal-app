"use client"

import * as Popover from "@radix-ui/react-popover"
import { Check } from "lucide-react"
import { BOUNDARY_META, type BoundaryKind } from "@/lib/replicate/breakdown-types"
import { cn } from "@/lib/utils"

interface Props {
  value: BoundaryKind
  onChange: (next: BoundaryKind) => void
  compact?: boolean
}

const ORDER: BoundaryKind[] = ["keep", "change", "ban"]

export function BoundaryChip({ value, onChange, compact }: Props) {
  const meta = BOUNDARY_META[value]
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-md font-extrabold border cursor-pointer transition-all hover:shadow-[0_2px_8px_rgba(9,9,11,0.08)]",
            compact ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-[10.5px]"
          )}
          style={{
            backgroundColor: meta.bg,
            borderColor: meta.border,
            color: meta.text,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
          {meta.short}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={4}
          className="z-[60] w-[160px] p-1 bg-white border border-[var(--line)] rounded-lg shadow-[0_18px_42px_rgba(9,9,11,0.14)]"
        >
          {ORDER.map((k) => {
            const m = BOUNDARY_META[k]
            const selected = k === value
            return (
              <Popover.Close key={k} asChild>
                <button
                  type="button"
                  onClick={() => onChange(k)}
                  className={cn(
                    "w-full px-2 py-1.5 rounded-md text-left cursor-pointer flex items-center gap-2 transition-colors text-[11.5px] font-bold",
                    selected ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                  )}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.dot }} />
                  <span style={{ color: m.text }} className="flex-1">{m.label}</span>
                  {selected && <Check size={11} strokeWidth={2.6} className="text-[var(--text)]" />}
                </button>
              </Popover.Close>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
