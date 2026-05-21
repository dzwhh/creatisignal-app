"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navSections, getSectionByPath } from "@/lib/nav-config"

export function IconRail() {
  const pathname = usePathname()
  const activeSection = getSectionByPath(pathname)

  return (
    <aside className="w-12 border-r border-[var(--line)] bg-[var(--panel)] flex flex-col items-center py-3 gap-4 shrink-0">
      {navSections.map(({ id, icon: Icon, label, defaultHref }) => {
        const isActive = activeSection?.id === id
        return (
          <Link
            key={id}
            href={defaultHref}
            className={cn(
              "relative w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[#a3a6ad] group transition-colors",
              isActive &&
                "bg-[var(--lime)] text-[#242721] shadow-[0_2px_8px_rgba(151,201,13,0.25)]"
            )}
            aria-label={label}
          >
            <Icon size={16} strokeWidth={2} />
            <span className="absolute left-9 top-1/2 -translate-y-1/2 translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 h-7 px-2 flex items-center whitespace-nowrap bg-[#18181b] text-white text-[12px] font-bold rounded-lg border border-[var(--line)] shadow-[0_12px_28px_rgba(9,9,11,0.16)]">
              {label}
            </span>
          </Link>
        )
      })}
      <div className="flex-1" />
    </aside>
  )
}
