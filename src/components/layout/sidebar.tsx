"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeftClose } from "lucide-react"
import { cn } from "@/lib/utils"
import { navSections, getSectionByPath } from "@/lib/nav-config"
import { useSidebarCollapsed } from "@/lib/layout/sidebar-state"
import { ProjectSwitcher } from "./project-switcher"
import { HoverList } from "./hover-list"

export function Sidebar() {
  const pathname = usePathname()
  const activeSection = getSectionByPath(pathname) ?? navSections[0]
  const { collapsed, toggle } = useSidebarCollapsed()

  if (collapsed) return null

  const activeIndex = activeSection.subMenu.findIndex((item) => pathname.startsWith(item.href))

  return (
    <aside className="w-[260px] border-r border-[var(--line)] bg-[var(--panel)] p-[10px] shrink-0">
      <div className="h-9 flex items-center gap-1">
        <ProjectSwitcher />
        <button
          type="button"
          onClick={toggle}
          aria-label="收起侧栏"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer shrink-0"
          title="收起侧栏"
        >
          <PanelLeftClose size={14} strokeWidth={2} />
        </button>
      </div>

      <nav className="mt-[10px]" aria-label="产品菜单">
        <HoverList activeIndex={activeIndex === -1 ? null : activeIndex} gap={4}>
          {activeSection.subMenu.map(({ label, href, icon: ItemIcon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "h-[38px] rounded-lg flex items-center gap-[10px] px-[10px] text-sm font-semibold transition-colors duration-200",
                  isActive ? "text-[#17181c]" : "text-[#4f535b] hover:text-[#17181c]"
                )}
              >
                {ItemIcon && <ItemIcon size={14} strokeWidth={2} className="shrink-0" />}
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </HoverList>
      </nav>
    </aside>
  )
}
