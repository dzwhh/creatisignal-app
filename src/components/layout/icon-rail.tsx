"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"
import { PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { findActiveSubMenuHref, navSections, getSectionByPath, type NavSection } from "@/lib/nav-config"
import { useSidebarCollapsed } from "@/lib/layout/sidebar-state"
import { HoverList } from "./hover-list"

export function IconRail() {
  const pathname = usePathname()
  const activeSection = getSectionByPath(pathname)
  const { collapsed, toggle } = useSidebarCollapsed()

  return (
    <aside className="w-12 border-r border-[var(--line)] bg-[var(--panel)] flex flex-col items-center py-3 gap-4 shrink-0">
      {collapsed ? (
        <button
          type="button"
          onClick={toggle}
          aria-label="展开侧栏"
          className="relative w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[#a3a6ad] hover:text-[#242721] hover:bg-[var(--soft)] cursor-pointer group transition-colors"
        >
          <PanelLeftOpen size={16} strokeWidth={2} />
          <SimpleTooltip>展开侧栏</SimpleTooltip>
        </button>
      ) : (
        <Link
          href="/assistant"
          aria-label="CreatiSignal"
          className="relative w-[30px] h-[30px] flex items-center justify-center group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/creatisignal-icon.png" alt="CreatiSignal" className="w-[26px] h-[26px] object-contain select-none" draggable={false} />
          <SimpleTooltip>CreatiSignal</SimpleTooltip>
        </Link>
      )}
      {navSections.map((section) => (
        <Fragment key={section.id}>
          {section.groupBreakBefore && <div className="w-6 h-px bg-[var(--line)] -my-1" aria-hidden />}
          <IconRailItem
            section={section}
            isActive={activeSection?.id === section.id}
            collapsed={collapsed}
            pathname={pathname}
          />
        </Fragment>
      ))}
      <div className="flex-1" />
    </aside>
  )
}

// ─── 单个一级 icon + 可选 hover flyout ──────────────────────────────────────

function IconRailItem({
  section,
  isActive,
  collapsed,
  pathname,
}: {
  section: NavSection
  isActive: boolean
  collapsed: boolean
  pathname: string
}) {
  const Icon = section.icon
  const hasSubMenu = section.subMenu.length > 0
  // 折叠态：仅"有 subMenu 的 section"才弹 flyout；空 subMenu（如 Agent）退回 SimpleTooltip
  const showFlyout = collapsed && hasSubMenu
  const showSimpleTooltip = !collapsed || !hasSubMenu

  return (
    <div className="group relative">
      <Link
        href={section.defaultHref}
        className={cn(
          "relative w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[#a3a6ad] transition-colors",
          isActive && "bg-[var(--lime)] text-[#242721] shadow-[0_2px_8px_rgba(151,201,13,0.25)]"
        )}
        aria-label={section.label}
      >
        <Icon size={16} strokeWidth={2} />
        {showSimpleTooltip && <SimpleTooltip>{section.label}</SimpleTooltip>}
      </Link>
      {showFlyout && <Flyout section={section} pathname={pathname} />}
    </div>
  )
}

// ─── 简单单标签 tooltip（展开态使用） ────────────────────────────────────────

function SimpleTooltip({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute left-9 top-1/2 -translate-y-1/2 translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 h-7 px-2 flex items-center whitespace-nowrap bg-[#18181b] text-white text-[12px] font-bold rounded-lg border border-[var(--line)] shadow-[0_12px_28px_rgba(9,9,11,0.16)]">
      {children}
    </span>
  )
}

// ─── 折叠态的二级菜单飞出卡 ─────────────────────────────────────────────────

function Flyout({ section, pathname }: { section: NavSection; pathname: string }) {
  const activeHref = findActiveSubMenuHref(pathname, section.subMenu)
  const activeIndex = activeHref
    ? section.subMenu.findIndex((i) => i.href === activeHref)
    : -1
  return (
    <div
      className={cn(
        "absolute left-full top-0 z-50 pl-1.5",
        // 进入 / 退出动画 + pointer events
        "invisible opacity-0 -translate-x-1",
        "group-hover:visible group-hover:opacity-100 group-hover:translate-x-0",
        "pointer-events-none group-hover:pointer-events-auto",
        "transition-[opacity,transform] duration-150 ease-out"
      )}
    >
      <div className="min-w-[200px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-xl bg-white border border-[var(--line)] shadow-[0_18px_42px_rgba(9,9,11,0.14)] p-1.5">
        <p className="px-2.5 pt-1 pb-1.5 text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
          {section.label}
        </p>
        <HoverList activeIndex={activeIndex === -1 ? null : activeIndex} gap={2}>
          {section.subMenu.map((item) => {
            const active = item.href === activeHref
            const ItemIcon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "h-9 px-2.5 rounded-lg flex items-center gap-2.5 text-[13px] font-bold transition-colors duration-200",
                  active ? "text-[#17181c]" : "text-[#4f535b] hover:text-[#17181c]"
                )}
              >
                {ItemIcon && <ItemIcon size={13} strokeWidth={2} className="shrink-0" />}
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </HoverList>
      </div>
    </div>
  )
}
