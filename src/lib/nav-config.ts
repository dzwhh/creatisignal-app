import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  Bot,
  Coins,
  Globe2,
  Home,
  Lightbulb,
  Receipt,
  Settings,
  ShieldCheck,
  Sparkles,
  UserCircle,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export interface SubMenuItem {
  label: string
  href: string
  icon?: LucideIcon
}

export interface NavSection {
  id: string
  icon: LucideIcon
  label: string
  defaultHref: string // first submenu href (or direct destination if subMenu is empty)
  groupBreakBefore?: boolean  // IconRail 在此 section 上方加分割线
  subMenu: SubMenuItem[]      // 空数组 = 直达项，无二级
}

export const navSections: NavSection[] = [
  {
    id: "home",
    icon: Home,
    label: "首页",
    defaultHref: "/assistant",
    subMenu: [
      { label: "创意助手", href: "/assistant" },
      { label: "我的任务", href: "/reports" },
    ],
  },
  {
    id: "insights",
    icon: Activity,
    label: "洞察",
    defaultHref: "/insights",
    subMenu: [
      { label: "素材洞察",        href: "/insights" },
      { label: "Creative Tagging", href: "/insights/tagging" },
      { label: "疲劳度监测",      href: "/insights/fatigue" },
      { label: "创意报表",        href: "/insights/reports" },
    ],
  },
  {
    id: "discover",
    icon: Lightbulb,
    label: "发现",
    defaultHref: "/discover/inspiration",
    subMenu: [
      { label: "灵感发现", href: "/discover/inspiration" },
      { label: "品牌追踪", href: "/discover/brands" },
    ],
  },
  {
    id: "create",
    icon: Sparkles,
    label: "创作",
    defaultHref: "/replicate",
    subMenu: [
      { label: "爆款复刻", href: "/replicate" },
      { label: "创意画布", href: "/create/canvas" },
    ],
  },
  {
    id: "agent",
    icon: Bot,
    label: "Agent",
    defaultHref: "/agent",
    subMenu: [],
  },
  {
    id: "tools",
    icon: Wrench,
    label: "工具",
    defaultHref: "/tools/reports",
    subMenu: [
      { label: "报告制作", href: "/tools/reports" },
      { label: "浏览器插件", href: "/tools/plugin" },
      { label: "Skills Hub", href: "/tools/skills" },
    ],
  },
  {
    id: "assets",
    icon: Archive,
    label: "资产库",
    defaultHref: "/assets",
    subMenu: [],
  },
  {
    id: "settings",
    icon: Settings,
    label: "设置",
    defaultHref: "/settings/account",
    groupBreakBefore: true,
    subMenu: [
      { label: "账户",     href: "/settings/account",       icon: UserCircle },
      { label: "用量",     href: "/settings/usage",         icon: BarChart3 },
      { label: "账单",     href: "/settings/billing",       icon: Receipt },
      { label: "积分",     href: "/settings/credits",       icon: Coins },
      { label: "邀请裂变", href: "/settings/invite",        icon: Users },
      { label: "安全",     href: "/settings/security",      icon: ShieldCheck },
      { label: "语言",     href: "/settings/language",      icon: Globe2 },
      { label: "通知",     href: "/settings/notifications", icon: Bell },
    ],
  },
]

export function getSectionByPath(pathname: string): NavSection | undefined {
  if (pathname === "/") return navSections.find((s) => s.id === "home")
  return navSections.find((section) =>
    section.subMenu.length === 0
      ? pathname.startsWith(section.defaultHref)
      : section.subMenu.some((item) => pathname.startsWith(item.href))
  )
}

/**
 * 在 subMenu 里挑选最匹配当前 pathname 的 item href（最长前缀胜出）。
 * 解决 `/insights/reports` 同时 startsWith `/insights` 和 `/insights/reports` 的歧义。
 */
export function findActiveSubMenuHref(pathname: string, subMenu: SubMenuItem[]): string | undefined {
  return subMenu
    .filter((item) => pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
}
