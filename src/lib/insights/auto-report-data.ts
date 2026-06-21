// 自动报表场景配置 —— 重点覆盖 TikTok GMV Max 维度与指标
// 后续可扩展 Meta / Google / Amazon / 跨平台模板

import type { LucideIcon } from "lucide-react"
import { BarChart3, Boxes, Film, Globe2, Layers, ShoppingBag, Sparkles, TrendingDown, Users, Video } from "lucide-react"

// ─── Platforms ──────────────────────────────────────────────────────────────

export type PlatformId = "tiktok" | "meta" | "google" | "amazon" | "cross"

export type Platform = {
  id: PlatformId
  name: string
  short: string
  accent: string
  connected: boolean
  accountCount: number
}

export const PLATFORMS: Platform[] = [
  { id: "tiktok", name: "TikTok Ads", short: "TikTok", accent: "#161823", connected: true,  accountCount: 4 },
  { id: "meta",   name: "Meta Ads",   short: "Meta",   accent: "#1877F2", connected: false, accountCount: 0 },
  { id: "google", name: "Google Ads", short: "Google", accent: "#4285F4", connected: false, accountCount: 0 },
  { id: "amazon", name: "Amazon Ads", short: "Amazon", accent: "#FF9900", connected: false, accountCount: 0 },
  { id: "cross",  name: "跨平台",     short: "Cross",  accent: "#7c3aed", connected: false, accountCount: 0 },
]

// ─── Accounts per platform ─────────────────────────────────────────────────

export type AccountItem = { id: string; name: string; status: "active" | "paused"; created: string }

export const PLATFORM_ACCOUNTS: Record<PlatformId, AccountItem[]> = {
  tiktok: [
    { id: "tt_gmv_us",    name: "Hotligh · US Shop",      status: "active", created: "2025-02-18" },
    { id: "tt_gmv_uk",    name: "Hotligh · UK Shop",      status: "active", created: "2025-04-30" },
    { id: "tt_gmv_sg",    name: "Hotligh · SG Shop",      status: "active", created: "2025-06-11" },
    { id: "tt_brand",     name: "Hotligh · Brand Global", status: "paused", created: "2025-01-08" },
  ],
  meta: [
    { id: "fb_us_brand",  name: "Hotligh · US Brand",  status: "active", created: "2025-03-12" },
    { id: "fb_us_perf",   name: "Hotligh · US Perf",   status: "paused", created: "2024-11-15" },
  ],
  google: [
    { id: "g_search_us",  name: "Google Search · US",  status: "active", created: "2024-08-22" },
    { id: "g_pmax_us",    name: "Google PMax · US",    status: "active", created: "2025-01-10" },
  ],
  amazon: [
    { id: "amz_us",       name: "Amazon · US Store",   status: "active", created: "2025-02-12" },
  ],
  cross: [],
}

// ─── Segments (dimensions) — GMV Max focused ───────────────────────────────

export const SEGMENT_CATEGORIES: Record<string, string[]> = {
  "时间 Time":           ["Date", "Hour", "Day Of Week", "Week", "Month"],
  "商品 Product":        ["Product ID", "SKU", "Product Title", "Category", "Price Band"],
  "素材 Creative":       ["Creative Asset ID", "Video ID", "Post ID", "Creator", "Authorization Type"],
  "广告 Ads":            ["Campaign ID", "Ad Group ID", "Campaign Type", "Material Status"],
  "地理 Geography":      ["Country", "Region"],
  "归因 Attribution":    ["Order Source", "Attribution Window"],
}

// ─── Metrics — GMV Max focused ─────────────────────────────────────────────

export const METRIC_CATEGORIES: Record<string, string[]> = {
  "商业 Commercial":     ["Gross Revenue", "Orders", "ROI", "Cost Per Order"],
  "成本 Cost":           ["Cost", "Cost Share", "Daily Spend"],
  "商品链路 Funnel":     ["Product Impressions", "Product Ad Click Rate", "Ad CVR"],
  "视频观看 Video Watch": ["2s View Rate", "6s View Rate", "25% View Rate", "50% View Rate", "75% View Rate", "100% View Rate"],
  "疲劳 Fatigue":        ["Fatigue Score", "Confidence", "Stage", "Driver Module"],
}

// ─── Scenarios (templates) ─────────────────────────────────────────────────

export type Scenario = {
  id: string
  name: string
  description: string
  platforms: PlatformId[]
  segments: string[]
  metrics: string[]
  fields: number
  defaultName: string
  icon: LucideIcon
}

export const SCENARIOS: Scenario[] = [
  {
    id: "gmv_max_product_daily",
    name: "GMV Max 商品日报",
    description: "按商品维度追踪 GMV Max 自动投放下的 Gross revenue、Orders、Cost、ROI 与商品点击/转化率",
    platforms: ["tiktok"],
    segments: ["Date", "Product ID", "SKU"],
    metrics: ["Gross Revenue", "Orders", "Cost", "ROI", "Product Ad Click Rate", "Ad CVR"],
    fields: 14,
    defaultName: "GMV Max 商品日报",
    icon: ShoppingBag,
  },
  {
    id: "gmv_max_creative_fatigue",
    name: "GMV Max 创意疲劳监测",
    description: "按 product × creative_asset 聚合疲劳分、置信度、主驱动衰减信号，输出下一批素材生成方向",
    platforms: ["tiktok"],
    segments: ["Creative Asset ID", "Product ID", "Driver Module"],
    metrics: ["Fatigue Score", "Confidence", "Gross Revenue", "Orders", "Cost", "ROI"],
    fields: 16,
    defaultName: "GMV Max 创意疲劳",
    icon: TrendingDown,
  },
  {
    id: "gmv_max_video_diagnose",
    name: "GMV Max 视频观看诊断",
    description: "诊断 2s / 6s / 25% / 50% / 75% / 100% 观看率衰减，定位首帧失效与中段撑不住的素材",
    platforms: ["tiktok"],
    segments: ["Video ID", "Creative Asset ID"],
    metrics: ["2s View Rate", "6s View Rate", "25% View Rate", "50% View Rate", "75% View Rate", "100% View Rate"],
    fields: 12,
    defaultName: "GMV Max 视频观看诊断",
    icon: Video,
  },
  {
    id: "gmv_max_creator_breakdown",
    name: "GMV Max Creator 拆解",
    description: "按 Spark / Creator 授权类型拆分 GMV / Orders / ROI，对比授权、达人、自营素材的卖货效率",
    platforms: ["tiktok"],
    segments: ["Creator", "Authorization Type", "Date"],
    metrics: ["Gross Revenue", "Orders", "ROI", "Cost"],
    fields: 11,
    defaultName: "GMV Max Creator 拆解",
    icon: Users,
  },
  {
    id: "gmv_max_geo_distribution",
    name: "GMV Max 国家分布报表",
    description: "Shop 维度按国家分布 GMV Max 消耗、Orders 与 ROI，识别高 ROI 高消耗市场",
    platforms: ["tiktok"],
    segments: ["Country", "Date"],
    metrics: ["Gross Revenue", "Orders", "ROI", "Cost"],
    fields: 10,
    defaultName: "GMV Max 国家分布",
    icon: Globe2,
  },
  {
    id: "gmv_max_score_health",
    name: "GMV Max 素材池健康报表",
    description: "按疲劳分层（健康 / 轻度 / 中度 / 重度 / 严重）汇总素材数、Cost share、风险预算",
    platforms: ["tiktok"],
    segments: ["Stage", "Product ID"],
    metrics: ["Fatigue Score", "Cost Share", "Cost", "Gross Revenue"],
    fields: 9,
    defaultName: "GMV Max 素材池健康",
    icon: Boxes,
  },
  {
    id: "tiktok_creative_tagging_roi",
    name: "Creative Tagging × ROI",
    description: "按 Hook / 内容结构 / CTA / 卖点 / 场景标签聚合素材，对比标签命中下的 CTR、ROI、Orders",
    platforms: ["tiktok"],
    segments: ["Creative Asset ID"],
    metrics: ["Gross Revenue", "Orders", "ROI", "Cost", "Product Ad Click Rate"],
    fields: 12,
    defaultName: "Creative Tagging × ROI",
    icon: Layers,
  },
  {
    id: "tiktok_spark_creator",
    name: "Spark Ads × Creator 表现",
    description: "按 Spark Ads 创作者维度拆分曝光、互动、商品点击与 Orders，识别需要续约/扩量的达人",
    platforms: ["tiktok"],
    segments: ["Creator", "Authorization Type"],
    metrics: ["Gross Revenue", "Orders", "Cost", "Product Ad Click Rate", "6s View Rate"],
    fields: 13,
    defaultName: "Spark × Creator 表现",
    icon: Film,
  },
  {
    id: "tiktok_creative_weekly",
    name: "TikTok 素材周报",
    description: "按周聚合素材层 Spend / Impressions / CTR / Orders / ROI，含 Top10 排行与上新率",
    platforms: ["tiktok"],
    segments: ["Week", "Creative Asset ID"],
    metrics: ["Cost", "Product Impressions", "Product Ad Click Rate", "Orders", "ROI"],
    fields: 11,
    defaultName: "TikTok 素材周报",
    icon: BarChart3,
  },
  {
    id: "tiktok_standard_daily",
    name: "TikTok 标准竞价日报",
    description: "Web Conversion / Traffic / Reach 等普通竞价场景的 Spend / CTR / CVR / CPA / ROAS 日级报表",
    platforms: ["tiktok"],
    segments: ["Date", "Campaign ID", "Campaign Type"],
    metrics: ["Cost", "Product Ad Click Rate", "Ad CVR", "Orders", "ROI"],
    fields: 13,
    defaultName: "TikTok 标准竞价日报",
    icon: Sparkles,
  },
  {
    id: "cross_tiktok_meta",
    name: "TikTok × Meta 对比",
    description: "同周期下 TikTok GMV Max 与 Meta 投放的 Spend / Orders / ROI 对比，看预算分配是否合理",
    platforms: ["tiktok", "meta"],
    segments: ["Date", "Country"],
    metrics: ["Cost", "Orders", "ROI", "Gross Revenue"],
    fields: 14,
    defaultName: "TikTok × Meta 对比",
    icon: Layers,
  },
  {
    id: "cross_attribution",
    name: "跨平台归因报表",
    description: "TikTok + Meta + Google 多触点归因，按 Last Click / Linear / Data Driven 拆 Orders & Revenue",
    platforms: ["tiktok", "meta", "google"],
    segments: ["Order Source", "Attribution Window", "Date"],
    metrics: ["Orders", "Gross Revenue", "Cost", "ROI"],
    fields: 16,
    defaultName: "跨平台归因报表",
    icon: Globe2,
  },
]

// ─── Mock dashboard data（模板预览用） ──────────────────────────────────────

export const DASHBOARD_MOCK = {
  kpis: [
    { label: "Gross Revenue", value: "$1.84M",   change: "+22.1%", up: true  },
    { label: "Orders",        value: "12,486",   change: "+18.2%", up: true  },
    { label: "Cost",          value: "$324.8K",  change: "+12.4%", up: true  },
    { label: "ROI",           value: "5.67",     change: "+0.42",  up: true  },
    { label: "Ad CVR",        value: "3.14%",    change: "-0.2%",  up: false },
    { label: "Click Rate",    value: "4.82%",    change: "+0.6%",  up: true  },
  ],
  trend: {
    current:  [42, 46, 44, 51, 49, 56, 61, 58, 64, 68, 65, 72, 76, 74, 79, 83, 80, 86, 91, 88, 94, 98, 96, 103, 107, 105, 112, 117, 114, 121],
    previous: [36, 39, 41, 43, 45, 47, 50, 52, 54, 55, 57, 59, 61, 63, 65, 68, 70, 71, 73, 75, 77, 80, 81, 83, 85, 87, 89, 91, 93, 95],
    labels: ["05/22", "05/26", "05/30", "06/03", "06/07", "06/11", "06/15", "06/19"],
  },
  distribution: [
    { label: "GMV Max",     value: 52, color: "#111827" },
    { label: "Spark Ads",   value: 24, color: "#4B5563" },
    { label: "Standard",    value: 17, color: "#9CA3AF" },
    { label: "其他",         value:  7, color: "#E5E7EB" },
  ],
  rows: [
    { product: "ZF7899 磁吸工作灯",     creative: "车库修车 · 磁吸演示",       cost: "$8,420",  orders: "684",   gmv: "$48,260", roi: "5.73" },
    { product: "ZF8313 EDC 口袋灯",     creative: "达人口播 · 手机灯对比",     cost: "$6,760",  orders: "542",   gmv: "$38,120", roi: "5.64" },
    { product: "ZF7899 磁吸工作灯",     creative: "手机灯 vs Hotligh 对比",    cost: "$5,120",  orders: "421",   gmv: "$29,488", roi: "5.76" },
    { product: "ZF2002 应急灯",         creative: "停电应急 · 家用场景",       cost: "$4,840",  orders: "362",   gmv: "$25,820", roi: "5.34" },
    { product: "ZF3344 露营灯",         creative: "露营户外 · 夜间找物",       cost: "$4,180",  orders: "298",   gmv: "$22,160", roi: "5.30" },
    { product: "ZF5566 多功能灯",       creative: "UGC 测评 · 开箱实测",       cost: "$3,480",  orders: "248",   gmv: "$18,640", roi: "5.36" },
    { product: "ZF7899 磁吸工作灯",     creative: "引擎盖下 · 双手维修",       cost: "$3,120",  orders: "212",   gmv: "$16,420", roi: "5.26" },
  ],
}

// ─── NL examples ───────────────────────────────────────────────────────────

export const NL_EXAMPLES = [
  "帮我生成 GMV Max 商品 × 素材的疲劳分层报表，按疲劳分倒序，含建议动作和生成方向",
  "对比 TikTok GMV Max 和 Meta Ads 过去 30 天 Orders / Revenue / ROI，按国家拆分",
  "按 Hook / CTA / 场景标签聚合本周新上 TikTok 素材，输出 CTR / ROI / Orders Top10",
]
