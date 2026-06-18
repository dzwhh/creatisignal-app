import {
  Home,
  Lightbulb,
  Sparkles,
  RadioTower,
  Wrench,
  Archive,
  type LucideIcon,
} from "lucide-react"

export interface SubMenuItem {
  label: string
  href: string
}

export interface NavSection {
  id: string
  icon: LucideIcon
  label: string
  defaultHref: string // first submenu href
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
]

export function getSectionByPath(pathname: string): NavSection | undefined {
  return navSections.find((section) =>
    section.subMenu.some((item) => pathname.startsWith(item.href)) ||
    (pathname === "/" && section.id === "home") ||
    (pathname.startsWith("/assistant") && section.id === "home")
  )
}
