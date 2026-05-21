"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { navSections, getSectionByPath } from "@/lib/nav-config"

export function Sidebar() {
  const pathname = usePathname()
  const activeSection = getSectionByPath(pathname) ?? navSections[0]

  return (
    <aside className="w-[260px] border-r border-[var(--line)] bg-[var(--panel)] p-[10px] shrink-0">
      <div className="h-9 flex items-center gap-[10px] px-2 text-[#2b2e34] font-bold text-sm cursor-pointer">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--lime)] text-[13px] font-extrabold shrink-0">
          T
        </div>
        <span className="flex-1 truncate">TikTok Shop</span>
        <ChevronDown size={14} className="text-[var(--muted)] shrink-0" />
      </div>

      <nav className="mt-[10px] flex flex-col gap-1" aria-label="产品菜单">
        {activeSection.subMenu.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "h-[38px] rounded-lg flex items-center gap-[10px] px-[10px] text-[#4f535b] text-sm font-semibold transition-colors hover:bg-[#f4f4f5]",
              pathname.startsWith(href) && "bg-[#eeeeef] text-[#17181c]"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
