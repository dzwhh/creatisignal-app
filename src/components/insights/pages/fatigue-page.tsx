"use client"

import { useMemo, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import * as Tooltip from "@radix-ui/react-tooltip"
import {
  BarChart3,
  Boxes,
  Check,
  Columns3,
  ChevronDown,
  FileText,
  Gauge,
  Info,
  Layers3,
  PackageSearch,
  Search,
  ShieldAlert,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react"
import { MATERIALS } from "@/lib/insights/mock"
import { cn } from "@/lib/utils"

type FatigueStage = "learning" | "light" | "moderate" | "heavy" | "severe"
type DriverModule = "commercial" | "commerce_link" | "video_watch" | "delivery_pressure"

type StageMeta = {
  label: string
  shortLabel: string
  scoreRange: string
  count: number
  hint: string
  action: string
  generation: string
  fill: string
  border: string
  text: string
}

type GmvMaxCreativeRow = {
  id: string
  productId: string
  productName: string
  sku: string
  creativeAssetId: string
  videoId: string
  postId: string
  status: "In Queue" | "Learning" | "Delivering" | "Boosting" | "Boosted" | "Authorization Recommended"
  materialName: string
  thumb: string
  stage: FatigueStage
  score: number
  confidence: number
  driverModule: DriverModule
  driverMetrics: string[]
  grossRevenueDelta: number
  ordersDelta: number
  productClickRateDelta: number
  adConversionRateDelta: number
  viewRateDelta: number
  cost: number
  roi: number
  action: string
  generationDirection: string
  dataScope: "asset" | "video" | "product"
}

const STAGE_ORDER: FatigueStage[] = ["learning", "light", "moderate", "heavy", "severe"]

const STAGE_META: Record<FatigueStage, StageMeta> = {
  learning: {
    label: "健康/学习中",
    shortLabel: "健康",
    scoreRange: "0-10",
    count: 26,
    hint: "In Queue / Learning 或数据不足",
    action: "继续观察",
    generation: "暂不生成结论",
    fill: "#f4f4f5",
    border: "#d4d4d8",
    text: "#3f3f46",
  },
  light: {
    label: "轻度疲劳",
    shortLabel: "轻度",
    scoreRange: "10-20",
    count: 34,
    hint: "2s/6s 与商品点击率小幅下滑",
    action: "标记观察",
    generation: "换首帧与前 3 秒 Hook",
    fill: "#f0ffc0",
    border: "#cdf066",
    text: "#3f4f13",
  },
  moderate: {
    label: "中度疲劳",
    shortLabel: "中度",
    scoreRange: "20-40",
    count: 23,
    hint: "点击率、Ad CVR、Gross revenue 同步变弱",
    action: "生成 3-5 条变体",
    generation: "痛点、价格利益、场景证明",
    fill: "#fef3c7",
    border: "#fde68a",
    text: "#a16207",
  },
  heavy: {
    label: "重度疲劳",
    shortLabel: "重度",
    scoreRange: "40-60",
    count: 14,
    hint: "Cost 继续消耗，Orders / GMV / ROI 下滑",
    action: "降权旧素材",
    generation: "测评、对比、场景、达人口播",
    fill: "#fff7ed",
    border: "#fed7aa",
    text: "#c2410c",
  },
  severe: {
    label: "严重疲劳",
    shortLabel: "严重",
    scoreRange: "60+",
    count: 7,
    hint: "Delivering 仍有曝光，但订单/GMV 基本失效",
    action: "暂停/换组合",
    generation: "新达人、新场景、新商品组合",
    fill: "#fef2f2",
    border: "#fecaca",
    text: "#b91c1c",
  },
}

const DRIVER_META: Record<DriverModule, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  commercial: {
    label: "商业结果衰减",
    icon: BarChart3,
    color: "#b91c1c",
    bg: "#fef2f2",
  },
  commerce_link: {
    label: "商品点击/转化链路",
    icon: PackageSearch,
    color: "#a16207",
    bg: "#fef3c7",
  },
  video_watch: {
    label: "视频观看衰减",
    icon: Video,
    color: "#1d4ed8",
    bg: "#eff6ff",
  },
  delivery_pressure: {
    label: "投放压力衰减",
    icon: ShieldAlert,
    color: "#c2410c",
    bg: "#fff7ed",
  },
}

const TOTAL_STAGE_COUNT = STAGE_ORDER.reduce((sum, stage) => sum + STAGE_META[stage].count, 0)

// ─── 评分模型权重（PRD 7.6.3 / 7.6.4） ─────────────────────────────────────
const SCORE_MODEL: Array<{
  module: DriverModule
  weight: number
  internals: string
  rule: string
}> = [
  {
    module: "commercial",
    weight: 45,
    internals: "Gross revenue 18 · Orders 12 · ROI 8 · CPO 7",
    rule: "Gross revenue 权重必须高于 ROI / CPO",
  },
  {
    module: "commerce_link",
    weight: 30,
    internals: "Product ad click rate 15 · Ad CVR 15",
    rule: "看的人 → 买的人 之间的链路衰减",
  },
  {
    module: "video_watch",
    weight: 20,
    internals: "2s 5 · 6s 5 · 25/50/75/100% 10",
    rule: "首帧 + Hook + 内容承接是否失效",
  },
  {
    module: "delivery_pressure",
    weight: 5,
    internals: "Cost share 上升 2 · Impressions 上升 GMV 不涨 3",
    rule: "辅助：判断系统是否仍在烧钱但边际产出下降",
  },
]

// ─── 主驱动 → 诊断信号 / 含义 / 生成方向（PRD 7.8 收敛到 4 个 driver） ────
const DRIVER_DIAGNOSTIC: Record<DriverModule, { signal: string; meaning: string; directions: string[] }> = {
  commercial: {
    signal: "Gross revenue / Orders 下滑但观看还好",
    meaning: "内容吸引人但卖货弱",
    directions: ["痛点 → 证明 → 商品 → 购买理由"],
  },
  commerce_link: {
    signal: "Product ad click rate 下滑",
    meaning: "用户看了但不点商品",
    directions: ["强化商品展示", "价格利益点", "使用场景", "CTA"],
  },
  video_watch: {
    signal: "2s / 6s view rate 下滑",
    meaning: "首帧和前 3 秒失效",
    directions: ["新首帧", "强冲突开头", "价格 / 痛点 / 结果先出"],
  },
  delivery_pressure: {
    signal: "Cost 上升但 GMV 不涨",
    meaning: "系统仍推但边际产出变差",
    directions: ["减少旧素材权重", "补充新创意组"],
  },
}

const CREATIVE_ROWS: GmvMaxCreativeRow[] = [
  {
    id: "row_001",
    productId: "prod_zf7899",
    productName: "ZF7899 磁吸工作灯",
    sku: "ZF7899",
    creativeAssetId: "asset_9af2_main",
    videoId: "vid_9af2",
    postId: "post_77be",
    status: "Delivering",
    materialName: "车库修车 · 磁吸演示",
    thumb: MATERIALS[0].thumb,
    stage: "heavy",
    score: 54,
    confidence: 0.86,
    driverModule: "commercial",
    driverMetrics: ["Gross revenue -32%", "Orders -28%", "ROI -21%"],
    grossRevenueDelta: -32,
    ordersDelta: -28,
    productClickRateDelta: -18,
    adConversionRateDelta: -13,
    viewRateDelta: -8,
    cost: 3420,
    roi: 1.21,
    action: "生成 Brief",
    generationDirection: "测评 + 场景证明",
    dataScope: "asset",
  },
  {
    id: "row_002",
    productId: "prod_zf8313",
    productName: "ZF8313 EDC 口袋灯",
    sku: "ZF8313",
    creativeAssetId: "asset_humor_77be",
    videoId: "vid_humor_14",
    postId: "post_humor_77be",
    status: "Delivering",
    materialName: "达人口播 · 手机灯对比",
    thumb: MATERIALS[1].thumb,
    stage: "heavy",
    score: 48,
    confidence: 0.81,
    driverModule: "video_watch",
    driverMetrics: ["2s view -19%", "6s view -24%", "100% view -31%"],
    grossRevenueDelta: -19,
    ordersDelta: -16,
    productClickRateDelta: -22,
    adConversionRateDelta: -9,
    viewRateDelta: -24,
    cost: 2760,
    roi: 1.34,
    action: "重写 Hook",
    generationDirection: "新首帧 + 强冲突开头",
    dataScope: "video",
  },
  {
    id: "row_003",
    productId: "prod_zf7899",
    productName: "ZF7899 磁吸工作灯",
    sku: "ZF7899",
    creativeAssetId: "asset_car_light_compare",
    videoId: "vid_car_light_compare",
    postId: "post_car_compare",
    status: "Delivering",
    materialName: "手机灯 vs Hotligh 对比",
    thumb: MATERIALS[2].thumb,
    stage: "heavy",
    score: 45,
    confidence: 0.78,
    driverModule: "commerce_link",
    driverMetrics: ["Product click -17%", "Ad CVR -15%"],
    grossRevenueDelta: -15,
    ordersDelta: -12,
    productClickRateDelta: -17,
    adConversionRateDelta: -15,
    viewRateDelta: -11,
    cost: 2120,
    roi: 1.42,
    action: "补 3 条变体",
    generationDirection: "对比镜头 + 购买理由",
    dataScope: "asset",
  },
  {
    id: "row_004",
    productId: "prod_zf2002",
    productName: "ZF2002 应急灯",
    sku: "ZF2002",
    creativeAssetId: "asset_garage_demo_02",
    videoId: "vid_garage_demo_02",
    postId: "post_garage_demo",
    status: "Boosting",
    materialName: "停电应急 · 家用场景",
    thumb: MATERIALS[3].thumb,
    stage: "heavy",
    score: 43,
    confidence: 0.76,
    driverModule: "delivery_pressure",
    driverMetrics: ["Cost share +18%", "Impressions +26%", "Orders -14%"],
    grossRevenueDelta: -14,
    ordersDelta: -13,
    productClickRateDelta: -9,
    adConversionRateDelta: -8,
    viewRateDelta: -6,
    cost: 1840,
    roi: 1.49,
    action: "降权观察",
    generationDirection: "痛点 → 证明 → 商品",
    dataScope: "product",
  },
  {
    id: "row_004b",
    productId: "prod_zf7899",
    productName: "ZF7899 磁吸工作灯",
    sku: "ZF7899",
    creativeAssetId: "asset_workshop_night",
    videoId: "vid_workshop_night",
    postId: "post_workshop_night",
    status: "Delivering",
    materialName: "夜间车库 · 修车口播",
    thumb: MATERIALS[5].thumb,
    stage: "heavy",
    score: 51,
    confidence: 0.83,
    driverModule: "video_watch",
    driverMetrics: ["2s view -22%", "6s view -27%"],
    grossRevenueDelta: -22,
    ordersDelta: -19,
    productClickRateDelta: -15,
    adConversionRateDelta: -10,
    viewRateDelta: -27,
    cost: 2980,
    roi: 1.18,
    action: "重写 Hook",
    generationDirection: "新首帧 + 痛点先出",
    dataScope: "asset",
  },
  {
    id: "row_004c",
    productId: "prod_zf8313",
    productName: "ZF8313 EDC 口袋灯",
    sku: "ZF8313",
    creativeAssetId: "asset_pocket_demo_05",
    videoId: "vid_pocket_demo_05",
    postId: "post_pocket_demo_05",
    status: "Delivering",
    materialName: "EDC 通勤 · 包内场景",
    thumb: MATERIALS[6].thumb,
    stage: "heavy",
    score: 47,
    confidence: 0.79,
    driverModule: "commerce_link",
    driverMetrics: ["Product click -21%", "Ad CVR -16%"],
    grossRevenueDelta: -18,
    ordersDelta: -15,
    productClickRateDelta: -21,
    adConversionRateDelta: -16,
    viewRateDelta: -7,
    cost: 2360,
    roi: 1.31,
    action: "强化商品展示",
    generationDirection: "价格利益点 + 多场景",
    dataScope: "asset",
  },
  {
    id: "row_004d",
    productId: "prod_zf5566",
    productName: "ZF5566 多功能灯",
    sku: "ZF5566",
    creativeAssetId: "asset_kitchen_demo",
    videoId: "vid_kitchen_demo",
    postId: "post_kitchen_demo",
    status: "Delivering",
    materialName: "厨房备餐 · 实拍",
    thumb: MATERIALS[7].thumb,
    stage: "heavy",
    score: 46,
    confidence: 0.77,
    driverModule: "commercial",
    driverMetrics: ["Gross revenue -24%", "Orders -22%", "ROI -14%"],
    grossRevenueDelta: -24,
    ordersDelta: -22,
    productClickRateDelta: -12,
    adConversionRateDelta: -9,
    viewRateDelta: -5,
    cost: 2540,
    roi: 1.27,
    action: "生成 Brief",
    generationDirection: "成交型 + 痛点开头",
    dataScope: "asset",
  },
  {
    id: "row_004e",
    productId: "prod_zf2002",
    productName: "ZF2002 应急灯",
    sku: "ZF2002",
    creativeAssetId: "asset_emergency_blackout",
    videoId: "vid_emergency_blackout",
    postId: "post_emergency_blackout",
    status: "Boosted",
    materialName: "停电 · 家庭场景对话",
    thumb: MATERIALS[8].thumb,
    stage: "heavy",
    score: 44,
    confidence: 0.81,
    driverModule: "delivery_pressure",
    driverMetrics: ["Cost share +22%", "Impressions +31%", "Orders -18%"],
    grossRevenueDelta: -16,
    ordersDelta: -18,
    productClickRateDelta: -7,
    adConversionRateDelta: -10,
    viewRateDelta: -4,
    cost: 3160,
    roi: 1.22,
    action: "降权观察",
    generationDirection: "补新创意组",
    dataScope: "product",
  },
  {
    id: "row_004f",
    productId: "prod_zf7899",
    productName: "ZF7899 磁吸工作灯",
    sku: "ZF7899",
    creativeAssetId: "asset_outdoor_repair",
    videoId: "vid_outdoor_repair",
    postId: "post_outdoor_repair",
    status: "Delivering",
    materialName: "户外露营 · 雨夜修车",
    thumb: MATERIALS[9].thumb,
    stage: "heavy",
    score: 49,
    confidence: 0.84,
    driverModule: "commerce_link",
    driverMetrics: ["Product click -19%", "Ad CVR -14%"],
    grossRevenueDelta: -17,
    ordersDelta: -14,
    productClickRateDelta: -19,
    adConversionRateDelta: -14,
    viewRateDelta: -6,
    cost: 2680,
    roi: 1.36,
    action: "补 3 条变体",
    generationDirection: "使用场景 + CTA",
    dataScope: "asset",
  },
  {
    id: "row_004g",
    productId: "prod_zf3344",
    productName: "ZF3344 露营灯",
    sku: "ZF3344",
    creativeAssetId: "asset_camp_dawn",
    videoId: "vid_camp_dawn",
    postId: "post_camp_dawn",
    status: "Delivering",
    materialName: "清晨露营 · 拆装实拍",
    thumb: MATERIALS[10 % MATERIALS.length].thumb,
    stage: "heavy",
    score: 42,
    confidence: 0.74,
    driverModule: "video_watch",
    driverMetrics: ["6s view -18%", "100% view -25%"],
    grossRevenueDelta: -13,
    ordersDelta: -12,
    productClickRateDelta: -10,
    adConversionRateDelta: -8,
    viewRateDelta: -21,
    cost: 2240,
    roi: 1.45,
    action: "缩短视频",
    generationDirection: "加快节奏 + 减少铺垫",
    dataScope: "video",
  },
  {
    id: "row_005",
    productId: "prod_zf3344",
    productName: "ZF3344 露营灯",
    sku: "ZF3344",
    creativeAssetId: "asset_emergency_light",
    videoId: "vid_emergency_light",
    postId: "post_emergency_light",
    status: "Delivering",
    materialName: "露营户外 · 夜间找物",
    thumb: MATERIALS[4].thumb,
    stage: "severe",
    score: 67,
    confidence: 0.9,
    driverModule: "commercial",
    driverMetrics: ["Gross revenue -58%", "Orders -61%", "Cost +12%"],
    grossRevenueDelta: -58,
    ordersDelta: -61,
    productClickRateDelta: -36,
    adConversionRateDelta: -29,
    viewRateDelta: -21,
    cost: 3180,
    roi: 0.72,
    action: "暂停/换组合",
    generationDirection: "新达人 + 新场景",
    dataScope: "asset",
  },
  {
    id: "row_006",
    productId: "prod_zf5566",
    productName: "ZF5566 多功能灯",
    sku: "ZF5566",
    creativeAssetId: "asset_ugc_review_18",
    videoId: "vid_ugc_review_18",
    postId: "post_ugc_review_18",
    status: "Delivering",
    materialName: "UGC 测评 · 开箱实测",
    thumb: MATERIALS[5].thumb,
    stage: "moderate",
    score: 34,
    confidence: 0.72,
    driverModule: "commerce_link",
    driverMetrics: ["Product click -14%", "Ad CVR -11%"],
    grossRevenueDelta: -11,
    ordersDelta: -9,
    productClickRateDelta: -14,
    adConversionRateDelta: -11,
    viewRateDelta: -4,
    cost: 1480,
    roi: 1.68,
    action: "生成 3-5 条变体",
    generationDirection: "价格利益 + CTA",
    dataScope: "asset",
  },
  {
    id: "row_007",
    productId: "prod_zf7899",
    productName: "ZF7899 磁吸工作灯",
    sku: "ZF7899",
    creativeAssetId: "asset_underhood_06",
    videoId: "vid_underhood_06",
    postId: "post_underhood_06",
    status: "Learning",
    materialName: "引擎盖下 · 双手维修",
    thumb: MATERIALS[6].thumb,
    stage: "moderate",
    score: 28,
    confidence: 0.66,
    driverModule: "video_watch",
    driverMetrics: ["25% view -13%", "50% view -16%"],
    grossRevenueDelta: -8,
    ordersDelta: -7,
    productClickRateDelta: -10,
    adConversionRateDelta: -7,
    viewRateDelta: -16,
    cost: 1120,
    roi: 1.82,
    action: "缩短视频",
    generationDirection: "加快节奏 + 减少铺垫",
    dataScope: "video",
  },
  {
    id: "row_008",
    productId: "prod_zf8313",
    productName: "ZF8313 EDC 口袋灯",
    sku: "ZF8313",
    creativeAssetId: "asset_first_frame_21",
    videoId: "vid_first_frame_21",
    postId: "post_first_frame_21",
    status: "Delivering",
    materialName: "EDC 随身 · 口袋展示",
    thumb: MATERIALS[7].thumb,
    stage: "light",
    score: 18,
    confidence: 0.58,
    driverModule: "video_watch",
    driverMetrics: ["2s view -8%", "6s view -7%"],
    grossRevenueDelta: -4,
    ordersDelta: -3,
    productClickRateDelta: -6,
    adConversionRateDelta: -3,
    viewRateDelta: -8,
    cost: 760,
    roi: 2.05,
    action: "标记观察",
    generationDirection: "换首帧",
    dataScope: "video",
  },
  {
    id: "row_009",
    productId: "prod_zf2002",
    productName: "ZF2002 应急灯",
    sku: "ZF2002",
    creativeAssetId: "asset_caption_offer",
    videoId: "vid_caption_offer",
    postId: "post_caption_offer",
    status: "Delivering",
    materialName: "价格利益点 · 字幕强化",
    thumb: MATERIALS[8].thumb,
    stage: "light",
    score: 14,
    confidence: 0.54,
    driverModule: "commerce_link",
    driverMetrics: ["Product click -6%", "Ad CVR -5%"],
    grossRevenueDelta: -5,
    ordersDelta: -4,
    productClickRateDelta: -6,
    adConversionRateDelta: -5,
    viewRateDelta: -2,
    cost: 690,
    roi: 2.12,
    action: "生成 1-2 个变体",
    generationDirection: "商品利益点字幕",
    dataScope: "asset",
  },
  {
    id: "row_010",
    productId: "prod_zf3344",
    productName: "ZF3344 露营灯",
    sku: "ZF3344",
    creativeAssetId: "asset_camp_new",
    videoId: "vid_camp_new",
    postId: "post_camp_new",
    status: "In Queue",
    materialName: "露营做饭 · 新素材",
    thumb: MATERIALS[9].thumb,
    stage: "learning",
    score: 7,
    confidence: 0.32,
    driverModule: "commercial",
    driverMetrics: ["数据不足", "Learning"],
    grossRevenueDelta: 6,
    ordersDelta: 4,
    productClickRateDelta: 2,
    adConversionRateDelta: 1,
    viewRateDelta: 3,
    cost: 240,
    roi: 2.34,
    action: "继续观察",
    generationDirection: "不生成结论",
    dataScope: "asset",
  },
]

// ─── 可选指标列（搜索框左侧多选下拉） ──────────────────────────────────────
type MetricColumn = "spend" | "ctr" | "cvr" | "orders" | "gross_revenue" | "roi"

const METRIC_COLUMN_META: Record<MetricColumn, { label: string }> = {
  spend:         { label: "Spend" },
  ctr:           { label: "CTR" },
  cvr:           { label: "CVR" },
  orders:        { label: "Orders" },
  gross_revenue: { label: "Gross Revenue" },
  roi:           { label: "ROI" },
}

const METRIC_COLUMN_ORDER: MetricColumn[] = ["spend", "ctr", "cvr", "orders", "gross_revenue", "roi"]

// 每行衍生的绝对值指标（基于 row.cost / row.roi / row.score / row.id 派生，保持稳定）
function rowAbsMetrics(row: GmvMaxCreativeRow): Record<MetricColumn, number> {
  const seed = parseInt(row.id.replace(/\D/g, ""), 10) || 1
  const ctr = Math.max(1.5, 4.8 - row.score * 0.04 + ((seed % 7) * 0.15))   // %
  const cvr = Math.max(1.0, 3.2 - row.score * 0.025 + ((seed % 5) * 0.12))  // %
  const orders = Math.round(row.cost / (24 + row.score * 0.4))
  const grossRevenue = Math.round(row.cost * row.roi)
  return {
    spend: row.cost,
    ctr,
    cvr,
    orders,
    gross_revenue: grossRevenue,
    roi: row.roi,
  }
}

function formatMetricValue(col: MetricColumn, value: number): string {
  switch (col) {
    case "spend":
    case "gross_revenue":
      return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toLocaleString()}`
    case "ctr":
    case "cvr":
      return `${value.toFixed(2)}%`
    case "orders":
      return value.toLocaleString()
    case "roi":
      return value.toFixed(2)
  }
}

export function FatiguePage() {
  const [selectedStage, setSelectedStage] = useState<FatigueStage>("heavy")
  const [query, setQuery] = useState("")
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricColumn>>(
    () => new Set<MetricColumn>(["ctr", "orders", "roi"])
  )

  function toggleMetric(col: MetricColumn) {
    setVisibleMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(col)) next.delete(col); else next.add(col)
      return next
    })
  }

  const selectedMeta = STAGE_META[selectedStage]
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return CREATIVE_ROWS.filter((row) => {
      const matchesStage = row.stage === selectedStage
      if (!normalizedQuery) return matchesStage
      const haystack = [
        row.productName,
        row.sku,
        row.materialName,
        row.creativeAssetId,
        row.videoId,
        row.generationDirection,
      ].join(" ").toLowerCase()
      return matchesStage && haystack.includes(normalizedQuery)
    })
  }, [query, selectedStage])

  const fatigueCount = STAGE_META.light.count + STAGE_META.moderate.count + STAGE_META.heavy.count + STAGE_META.severe.count

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="px-8 py-6 space-y-5 max-w-[1240px] mx-auto">
        <section className="grid grid-cols-4 gap-3">
            <MetricCard icon={Gauge} label="平均疲劳分" value="32" sub="近 14 天 · +6.8" tone="neutral" />
            <MetricCard icon={ShieldAlert} label="风险花费" value="$18.4k" sub="重度/严重素材消耗" tone="danger" />
            <MetricCard icon={Boxes} label="疲劳素材" value={`${fatigueCount} / ${TOTAL_STAGE_COUNT}`} sub="商品 × 素材组合" tone="warn" />
            <MetricCard icon={Sparkles} label="今日建议动作" value="12" sub="Brief 生成与降权观察" tone="lime" />
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
            <header className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--soft)] text-[var(--text)] shrink-0">
                  <Layers3 size={14} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-extrabold text-[var(--text)] leading-snug flex items-center gap-1.5">
                    素材衰减分布
                    <ScoreModelHint />
                  </h2>
                  <p className="text-[12px] text-[var(--muted)] mt-0.5 leading-relaxed">
                    点击对应阶段后下方明细表自动联动
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10.5px] font-extrabold border border-[var(--line)] bg-[var(--soft-2)] text-[var(--muted)]">
                当前选中：<span className="text-[var(--text)]">{selectedMeta.label}</span> · {selectedMeta.count} 条
              </span>
            </header>

            <div className="px-5 py-4">
              <div className="flex w-full h-[72px] rounded-2xl overflow-hidden border border-[var(--line)] bg-[var(--soft)]">
                {STAGE_ORDER.map((stage) => {
                  const meta = STAGE_META[stage]
                  const pct = Math.round((meta.count / TOTAL_STAGE_COUNT) * 100)
                  const active = selectedStage === stage
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => setSelectedStage(stage)}
                      className={cn(
                        "group relative min-w-[112px] px-3 py-2.5 text-left cursor-pointer border-r border-white/80 last:border-r-0 flex flex-col justify-between transition-[filter,opacity] duration-150",
                        // 非选中：稍微降饱和；hover 抬起到正常
                        !active && "opacity-70 hover:opacity-100",
                        active && "opacity-100"
                      )}
                      style={{ flexGrow: meta.count, flexBasis: `${pct}%`, backgroundColor: meta.fill, color: meta.text }}
                      aria-pressed={active}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[12.5px] font-extrabold">{meta.label}</span>
                        <span className="text-[10.5px] font-extrabold tabular-nums">{meta.count} 条</span>
                      </span>
                      <span className="text-[10.5px] font-bold leading-snug opacity-80">
                        {meta.scoreRange} · {meta.action}
                      </span>
                      {/* 选中态：底部 3px 实心色条作 indicator，不再遮挡内容 */}
                      {active && (
                        <span
                          className="absolute left-0 right-0 bottom-0 h-[3px]"
                          style={{ backgroundColor: meta.text }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
            <header className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-start gap-2.5">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--soft)] text-[var(--text)] shrink-0">
                  <PackageSearch size={14} strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[14px] font-extrabold text-[var(--text)] leading-snug">
                    {selectedMeta.label}素材明细
                  </h2>
                  <p className="text-[12px] text-[var(--muted)] mt-0.5 leading-relaxed">
                    由上方 {selectedMeta.label} 分层筛选 · {filteredRows.length} 条当前样例
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ColumnsDropdown visible={visibleMetrics} onToggle={toggleMetric} />
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="搜索商品 / 素材 / video_id"
                    aria-label="搜索 GMV Max 素材"
                    className="h-9 w-[260px] pl-7 pr-3 rounded-full border border-[var(--line)] bg-white text-[12.5px] font-semibold text-[var(--text)] outline-none focus:border-[var(--line-strong)]"
                  />
                </div>
              </div>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[var(--soft-2)] text-[var(--muted)] text-[10.5px] font-extrabold uppercase tracking-wide">
                    <th className="text-left px-4 py-3 border-b border-[var(--line)] min-w-[240px]">创意</th>
                    <th className="text-left px-3 py-3 border-b border-[var(--line)] min-w-[112px]">疲劳分</th>
                    <th className="text-left px-3 py-3 border-b border-[var(--line)] min-w-[220px]">诊断信号</th>
                    {METRIC_COLUMN_ORDER.filter((c) => visibleMetrics.has(c)).map((c) => (
                      <th key={c} className="text-right whitespace-nowrap px-3 py-3 border-b border-[var(--line)] min-w-[96px]">
                        {METRIC_COLUMN_META[c].label}
                      </th>
                    ))}
                    <th className="text-left px-3 py-3 border-b border-[var(--line)] min-w-[240px]">生成方向</th>
                    <th className="text-right px-4 py-3 border-b border-[var(--line)] min-w-[124px]">建议动作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const diag = DRIVER_DIAGNOSTIC[row.driverModule]
                    const driverColor = DRIVER_META[row.driverModule].color
                    const abs = rowAbsMetrics(row)
                    return (
                      <tr key={row.id} className="hover:bg-[var(--soft-2)] transition-colors align-top">
                        {/* 创意：商品名（粗）/ materialName（灰）上下分布 */}
                        <td className="px-4 py-4 border-b border-[var(--line)]">
                          <div className="flex items-start gap-2.5">
                            <span className="w-9 h-11 rounded-lg overflow-hidden bg-[var(--soft)] shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={row.thumb} alt={row.materialName} className="w-full h-full object-cover" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] font-extrabold text-[var(--text)] leading-snug">{row.productName}</p>
                              <p className="text-[11px] text-[var(--muted)] leading-snug mt-1">{row.materialName}</p>
                            </div>
                          </div>
                        </td>
                        {/* 疲劳分 */}
                        <td className="whitespace-nowrap px-3 py-4 border-b border-[var(--line)]">
                          <ScoreCell row={row} />
                        </td>
                        {/* 诊断信号：signal（粗）+ meaning（灰）上下分布 + 左侧小色点 */}
                        <td className="px-3 py-4 border-b border-[var(--line)]">
                          <div className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0" style={{ backgroundColor: driverColor }} />
                            <div className="min-w-0">
                              <p className="text-[12px] font-extrabold text-[var(--text)] leading-snug">{diag.signal}</p>
                              <p className="text-[11px] text-[var(--muted)] leading-snug mt-1">{diag.meaning}</p>
                            </div>
                          </div>
                        </td>
                        {METRIC_COLUMN_ORDER.filter((c) => visibleMetrics.has(c)).map((c) => (
                          <td
                            key={c}
                            className="whitespace-nowrap px-3 py-4 text-right text-[var(--text)] tabular-nums border-b border-[var(--line)]"
                          >
                            {formatMetricValue(c, abs[c])}
                          </td>
                        ))}
                        {/* 生成方向：chips wrap */}
                        <td className="px-3 py-4 border-b border-[var(--line)]">
                          <div className="flex flex-wrap gap-1">
                            {diag.directions.map((d) => (
                              <span
                                key={d}
                                className="inline-flex items-center h-5 px-1.5 rounded-md bg-[var(--lime-soft)] border border-[#cdf066] text-[#3a4b1f] text-[10.5px] font-bold"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* 建议动作 */}
                        <td className="whitespace-nowrap px-4 py-4 text-right border-b border-[var(--line)]">
                          <button
                            type="button"
                            className="h-7 px-2.5 rounded-md border border-[var(--line)] bg-white text-[11.5px] font-bold text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer inline-flex items-center gap-1"
                          >
                            <FileText size={10} strokeWidth={2.6} />
                            {row.action}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

      </div>
    </Tooltip.Provider>
  )
}

// ─── Score model 信息小卡（hover 在「GMV Max 疲劳分层分布」标题旁的 i 图标） ─
function ScoreModelHint() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          aria-label="查看评分模型与权重说明"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[var(--muted)] hover:text-[var(--text)] cursor-help transition-colors"
        >
          <Info size={13} strokeWidth={2.2} />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="bottom"
          align="start"
          sideOffset={8}
          className="z-[60] w-[360px] rounded-xl border border-[var(--line)] bg-white shadow-[0_18px_42px_rgba(9,9,11,0.18)] p-3 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95"
        >
          <p className="text-[11.5px] font-extrabold text-[var(--text)] mb-2">
            评分模型与权重
          </p>
          <p className="text-[10.5px] text-[var(--muted)] leading-relaxed mb-2.5">
            Fatigue Score = 商业结果 45% + 商品链路 30% + 视频观看 20% + 投放压力 5%
          </p>
          {/* 加权 100% 条 */}
          <div className="flex w-full h-5 rounded-md overflow-hidden border border-[var(--line)] mb-2.5">
            {SCORE_MODEL.map((m) => {
              const meta = DRIVER_META[m.module]
              return (
                <div
                  key={m.module}
                  className="h-full flex items-center justify-center text-[9.5px] font-extrabold"
                  style={{ width: `${m.weight}%`, backgroundColor: meta.bg, color: meta.color }}
                  title={`${meta.label} ${m.weight}%`}
                >
                  {m.weight}%
                </div>
              )
            })}
          </div>
          {/* 4 行权重细节 */}
          <ul className="space-y-1.5">
            {SCORE_MODEL.map((m) => {
              const meta = DRIVER_META[m.module]
              const Icon = meta.icon
              return (
                <li key={m.module} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: meta.bg, color: meta.color }}>
                    <Icon size={10} strokeWidth={2.6} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-extrabold text-[var(--text)]">{meta.label}</span>
                      <span className="text-[10.5px] font-extrabold tabular-nums" style={{ color: meta.color }}>{m.weight}%</span>
                    </div>
                    <p className="text-[10px] text-[var(--muted)] leading-snug mt-0.5">{m.internals}</p>
                  </div>
                </li>
              )
            })}
          </ul>
          <Tooltip.Arrow className="fill-white" style={{ filter: "drop-shadow(0 -1px 0 var(--line))" }} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

function MetricCard({ icon: Icon, label, value, sub, tone }: {
  icon: LucideIcon
  label: string
  value: string
  sub: string
  tone: "neutral" | "danger" | "warn" | "lime"
}) {
  const toneClass = {
    neutral: "bg-[var(--soft)] text-[var(--text)]",
    danger: "bg-[#fef2f2] text-[#b91c1c]",
    warn: "bg-[#fef3c7] text-[#a16207]",
    lime: "bg-[#f0ffc0] text-[#1a2010]",
  }[tone]

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center", toneClass)}>
        <Icon size={14} strokeWidth={2.4} />
      </span>
      <p className="text-[11px] text-[var(--muted)] font-semibold mt-2">{label}</p>
      <p className="text-[22px] font-extrabold text-[var(--text)] mt-1 leading-none tabular-nums">{value}</p>
      <p className="text-[10.5px] text-[var(--muted-2)] mt-1 font-bold">{sub}</p>
    </article>
  )
}

function ScoreCell({ row }: { row: GmvMaxCreativeRow }) {
  const meta = STAGE_META[row.stage]
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-[13px] font-extrabold text-[var(--text)] tabular-nums">{row.score}</span>
      <span
        className="h-5 px-1.5 rounded-md border text-[10.5px] font-extrabold inline-flex items-center"
        style={{ backgroundColor: meta.fill, color: meta.text, borderColor: meta.border }}
      >
        {meta.shortLabel}
      </span>
    </span>
  )
}

// ─── Columns multi-select dropdown（搜索框左侧） ──────────────────────────────
function ColumnsDropdown({
  visible,
  onToggle,
}: {
  visible: Set<MetricColumn>
  onToggle: (col: MetricColumn) => void
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[12.5px] font-bold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)] shrink-0 data-[state=open]:border-[var(--line-strong)] data-[state=open]:bg-[var(--soft-2)]"
        >
          <Columns3 size={12} strokeWidth={2.4} className="text-[var(--muted)]" />
          指标列
          <span className="text-[10.5px] font-extrabold text-[var(--muted-2)] tabular-nums">
            {visible.size}/{METRIC_COLUMN_ORDER.length}
          </span>
          <ChevronDown size={11} className="text-[var(--muted)] -mr-0.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[200px] p-1 bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)]"
        >
          <p className="px-2.5 pt-1.5 pb-1 text-[10px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
            可选指标列
          </p>
          {METRIC_COLUMN_ORDER.map((col) => {
            const checked = visible.has(col)
            return (
              <button
                key={col}
                type="button"
                onClick={() => onToggle(col)}
                className={cn(
                  "w-full h-8 px-2.5 rounded-md text-left flex items-center gap-2 cursor-pointer transition-colors",
                  checked ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                    checked ? "bg-[var(--near-black)] border-[var(--near-black)]" : "border-[var(--line-strong)] bg-white"
                  )}
                >
                  {checked && <Check size={9} strokeWidth={3.2} className="text-white" />}
                </span>
                <span className="text-[12px] font-bold text-[var(--text)]">{METRIC_COLUMN_META[col].label}</span>
              </button>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
