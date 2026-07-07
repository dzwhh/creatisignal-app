// 品牌追踪(竞品追踪)mock 数据

export type BrandPlatform = "tiktok" | "meta"

export const PLATFORM_META: Record<BrandPlatform, { label: string }> = {
  tiktok: { label: "TikTok" },
  meta: { label: "Meta" },
}

export type BrandProfile = {
  id: string
  name: string
  category: string
  logoBg: string               // 头像渐变
  platforms: BrandPlatform[]
  engagementScore: number      // 互动评分
  materialCount: number
  lastAdDate: string           // 最新投放
  weeklyTrend: number[]        // 近 7 天素材上新趋势
  active: boolean
}

export type FormatSlice = { label: string; value: number; color: string }
export type CountryStat = { name: string; value: number }
export type CreativeType = { label: string; count: number; pct: number }

export type CreativeInsight = {
  formula: { hook: string; middle: string; ending: string }
  tactics: string
  visualStyle: string
  palette: string
  keyElements: string[]
}

export type BrandDetailData = {
  profile: BrandProfile
  totals: { likes: string; saves: string; score: string }
  recent30: { newMaterials: number; recentEngagement: number; avgScore: number }
  formatDist: FormatSlice[]
  dailyTimeline: number[]      // 180 天
  countryTop: CountryStat[]
  creativeInsight: CreativeInsight
  creativeTypes: CreativeType[]
}

// ─── List 页统计 ─────────────────────────────────────────────────────────────

export const LIST_STATS = [
  { key: "total",   label: "累计追踪素材",  value: "1.2K",  delta: +8.4,  hint: "全部已追踪品牌" },
  { key: "hot",     label: "高互动素材",    value: "1.0K",  delta: +12.1, hint: "互动评分 Top 30%" },
  { key: "avg",     label: "平均互动分",    value: "25.6K", delta: -2.3,  hint: "近 30 天均值" },
  { key: "brands",  label: "活跃投放品牌",  value: "5",     delta: 0,     hint: "近 7 天有上新" },
] as const

export const BRAND_LIMIT = 5

// ─── 品牌数据 ────────────────────────────────────────────────────────────────

export const BRANDS: BrandProfile[] = [
  {
    id: "wuben",
    name: "WUBEN Light Worldwide",
    category: "工具设备",
    logoBg: "linear-gradient(135deg,#84cc16,#3f6212)",
    platforms: ["meta"],
    engagementScore: 124_900,
    materialCount: 204,
    lastAdDate: "2026-06-08",
    weeklyTrend: [2, 5, 3, 8, 12, 9, 14],
    active: true,
  },
  {
    id: "waterdrop",
    name: "waterdrop®",
    category: "饮料",
    logoBg: "linear-gradient(135deg,#a3e635,#4d7c0f)",
    platforms: ["tiktok"],
    engagementScore: 2_100,
    materialCount: 318,
    lastAdDate: "2026-04-21",
    weeklyTrend: [6, 4, 7, 5, 3, 6, 4],
    active: true,
  },
  {
    id: "toys-arabic",
    name: "تاجر لألعاب الأطفال",
    category: "儿童玩具",
    logoBg: "linear-gradient(135deg,#d9f99d,#65a30d)",
    platforms: ["tiktok"],
    engagementScore: 1_100,
    materialCount: 42,
    lastAdDate: "2025-12-29",
    weeklyTrend: [1, 0, 2, 1, 0, 0, 1],
    active: false,
  },
  {
    id: "fisher-price",
    name: "Fisher-Price",
    category: "儿童玩具",
    logoBg: "linear-gradient(135deg,#bef264,#365314)",
    platforms: ["tiktok"],
    engagementScore: 9_400,
    materialCount: 64,
    lastAdDate: "2026-04-20",
    weeklyTrend: [3, 2, 4, 6, 5, 7, 6],
    active: true,
  },
  {
    id: "mobilfox",
    name: "Mobilfox",
    category: "汽车商城",
    logoBg: "linear-gradient(135deg,#ecfccb,#84cc16)",
    platforms: ["tiktok"],
    engagementScore: 3_600,
    materialCount: 539,
    lastAdDate: "2026-04-21",
    weeklyTrend: [8, 10, 7, 12, 9, 11, 13],
    active: true,
  },
]

export function formatScore(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ─── 详情页数据(seed 稳定生成) ─────────────────────────────────────────────

function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function genTimeline(seed: number, days = 180): number[] {
  const out: number[] = []
  for (let i = 0; i < days; i++) {
    const base = Math.sin((i + seed % 17) * 0.11) * 4 + 5
    const spike1 = Math.exp(-((i - 30) ** 2) / 90) * 9
    const spike2 = Math.exp(-((i - (110 + (seed % 20))) ** 2) / 50) * (16 + (seed % 8))
    const noise = ((seed * (i + 3)) % 7) * 0.5
    out.push(Math.max(0, Math.round(base + spike1 + spike2 + noise - 4)))
  }
  return out
}

const COUNTRY_POOL = ["美国", "中国", "德国", "英国", "肯尼亚", "印度", "乌克兰", "法国", "巴西", "日本", "墨西哥", "泰国"]

const INSIGHTS: Record<string, CreativeInsight> = {
  wuben: {
    formula: {
      hook: "极致性能视觉冲击或硬核场景切入",
      middle: "沉浸式功能演示与耐用性实证",
      ending: "引导私域分享或社群口碑传播",
    },
    tactics: "利用硬核桌面场景与手持特写,直观展现便携照明产品的战术科技感。",
    visualStyle: "硬核战术科技风与 UGC 真实桌面质感结合,氛围感强。",
    palette: "黑白色调为主,辅以暖黄灯光与红绿背景点缀,对比鲜明。",
    keyElements: ["WUBEN 包装", "战术头盔", "垂直灯条", "黑色装备", "手持特写"],
  },
}

const DEFAULT_INSIGHT: CreativeInsight = {
  formula: {
    hook: "生活化痛点场景或强反差开场",
    middle: "产品核心卖点演示与真实使用反馈",
    ending: "限时优惠引导与行动号召",
  },
  tactics: "以 UGC 口播与场景化演示为主,快速建立信任并突出核心卖点。",
  visualStyle: "自然光真实场景,手持拍摄质感,贴近平台原生内容。",
  palette: "明亮暖色调为主,产品色作为视觉锚点。",
  keyElements: ["口播特写", "产品开箱", "使用前后对比", "字幕强调"],
}

export function getBrandDetail(id: string): BrandDetailData | null {
  const profile = BRANDS.find((b) => b.id === id)
  if (!profile) return null
  const seed = hashSeed(profile.id)

  const video = 60 + (seed % 30)
  const image = Math.max(1, (seed % 9))
  const square = seed % 3
  const other = Math.max(0, 100 - video - image - square)

  const countries = Array.from({ length: 10 }, (_, i) => ({
    name: COUNTRY_POOL[(seed + i * 5) % COUNTRY_POOL.length],
    value: Math.max(2, Math.round(profile.materialCount * (0.62 / (i + 1)))),
  }))

  const typeLabels = [profile.category, "口播测评", "场景演示", "开箱展示"]
  const counts = typeLabels.map((_, i) => Math.max(1, Math.round(profile.materialCount * [0.284, 0.18, 0.12, 0.05][i])))
  const creativeTypes = typeLabels.map((label, i) => ({
    label,
    count: counts[i],
    pct: Math.round((counts[i] / profile.materialCount) * 1000) / 10,
  }))

  return {
    profile,
    totals: {
      likes: formatScore(profile.engagementScore * 190 + (seed % 9000)),
      saves: formatScore(Math.round(profile.engagementScore * 0.008) + 800),
      score: formatScore(profile.engagementScore),
    },
    recent30: {
      newMaterials: profile.weeklyTrend.reduce((a, b) => a + b, 0) % 9 || 2,
      recentEngagement: 4 + (seed % 40),
      avgScore: profile.active ? Math.round(profile.engagementScore / Math.max(profile.materialCount, 1)) : 0,
    },
    formatDist: [
      { label: "视频", value: video, color: "#84cc16" },
      { label: "图片", value: image, color: "#c9ff29" },
      { label: "方形", value: square, color: "#5a7821" },
      { label: "其他", value: other, color: "#e4e4e7" },
    ],
    dailyTimeline: genTimeline(seed),
    countryTop: countries,
    creativeInsight: INSIGHTS[id] ?? DEFAULT_INSIGHT,
    creativeTypes,
  }
}
