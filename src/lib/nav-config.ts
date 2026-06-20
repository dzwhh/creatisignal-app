import {
  Archive,
  BarChart3,
  Bell,
  Coins,
  Globe2,
  Home,
  Lightbulb,
  RadioTower,
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
  defaultHref: string // first submenu href
  groupBreakBefore?: boolean   // IconRail 在此 section 上方加分割线
  subMenu: SubMenuItem[]
}

export const navSections: NavSection[] = [
  {
    id: "home",
    icon: Home,
    label: "主页",
    defaultHref: "/assistant",
    subMenu: [
      { label: "创意助手", href: "/assistant" },
      { label: "素材洞察", href: "/insights" },
      { label: "爆款推荐", href: "/replicate" },
      { label: "我的任务", href: "/reports" },
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
    defaultHref: "/create/image",
    subMenu: [
      { label: "图片创作", href: "/create/image" },
      { label: "视频创作", href: "/create/video" },
      { label: "创意画布", href: "/create/canvas" },
    ],
  },
  {
    id: "ads",
    icon: RadioTower,
    label: "投放",
    defaultHref: "/ads/dashboard",
    subMenu: [
      { label: "投放看板", href: "/ads/dashboard" },
      { label: "素材投放", href: "/ads/materials" },
    ],
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
    subMenu: [
      { label: "AI 生成", href: "/assets/generated" },
      { label: "上传的资产", href: "/assets/uploaded" },
      { label: "数字人", href: "/assets/avatars" },
    ],
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
  return navSections.find((section) =>
    section.subMenu.some((item) => pathname.startsWith(item.href)) ||
    (pathname === "/" && section.id === "home") ||
    (pathname.startsWith("/assistant") && section.id === "home")
  )
}
