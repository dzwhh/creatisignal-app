// ─── Domain types for 素材洞察 v2 ────────────────────────────────────────────

export type AccountStatus = "scaling" | "learning" | "rewrite" | "paused" | "warming"

export type Region = "US" | "EU" | "SEA" | "MX"
export type AccountTier = "Main" | "Test" | "Warm" | "Scale"

export type MaterialAction =
  | "scale"          // 继续放量
  | "rewrite_hook"   // 改写开头
  | "replace_scene"  // 替换场景
  | "rewrite_selling"// 改写卖点
  | "pause"          // 暂停
  | "observe"        // 继续观察

export const STATUS_META: Record<AccountStatus, { label: string; tone: "ok" | "warn" | "bad" | "muted" | "info"; dot: string }> = {
  scaling:  { label: "可放量", tone: "ok",    dot: "#22c55e" },
  learning: { label: "学习中", tone: "info",  dot: "#eab308" },
  rewrite:  { label: "需改写", tone: "warn",  dot: "#f97316" },
  paused:   { label: "已停用", tone: "muted", dot: "#a1a1aa" },
  warming:  { label: "养号中", tone: "info",  dot: "#0ea5e9" },
}

export const ACTION_META: Record<MaterialAction, { label: string; tone: "ok" | "warn" | "bad" | "muted" }> = {
  scale:            { label: "继续放量",  tone: "ok"    },
  rewrite_hook:     { label: "改写开头",  tone: "warn"  },
  replace_scene:    { label: "替换场景",  tone: "warn"  },
  rewrite_selling:  { label: "改写卖点",  tone: "warn"  },
  pause:            { label: "暂停",       tone: "bad"   },
  observe:          { label: "继续观察",  tone: "muted" },
}

export type Metrics = {
  spend: number
  impressions: number
  clicks: number
  ctr: number
  orders: number
  cpo: number
  roi: number
  cvr?: number
}

export type Account = {
  id: string                  // act_xxxxxxxxx
  name: string                // Hotligh-US-Main-01
  alias?: string
  region: Region
  tier: AccountTier
  channel: "GMV Max" | "Manual"
  status: AccountStatus
  roiTarget: number
  dailyBudget: number
  metrics7d: Metrics
  topMaterialFingerprints: string[]
  bottomMaterialFingerprints: string[]
  groupIds: string[]
  diagnosis?: string          // 该账户专属诊断结论
  suggestedTargetRoi?: number // 系统建议的 ROI target
}

export type MaterialAccountRow = {
  accountId: string
  accountName: string
  status: AccountStatus
  spend: number
  impressions: number
  clicks: number
  ctr: number
  orders: number
  cpo: number
  roi: number
  recommendation: MaterialAction
}

export type MaterialBucket = "core" | "potential" | "iterate" | "archived"
export const BUCKET_META: Record<MaterialBucket, { label: string }> = {
  core:      { label: "优质核心素材" },
  potential: { label: "高潜力素材" },
  iterate:   { label: "待迭代素材" },
  archived:  { label: "已归档"       },
}

export type Material = {
  fingerprint: string         // fp_001 .. fp_200
  thumb: string
  sku: string
  name: string                // Demo_Ad_001
  firstSeenAt: string
  format: "video" | "image"
  industryTag: string         // 单一行业标签（用于左侧 bar）
  videoStyleTag: string       // 单一视频风格标签（用于右侧 bar）
  sceneTags: string[]         // 场景多标签
  sellingPointTags: string[]  // 卖点多标签
  structureTags: string[]
  bucket: MaterialBucket
  rating: number              // 综合评级 0-100
  metrics: Metrics
  accountRows: MaterialAccountRow[]
  accountCount: number
  bestAccount: { id: string; accountName: string; roi: number }
  worstAccount: { id: string; accountName: string; roi: number }
  recommendation: MaterialAction
  variance: number            // 跨账户 ROI 方差 = max-min
  cpoReason?: CpoReasonKey
}

export type CpoReasonKey = "weak_hook" | "weak_scene" | "weak_selling" | "weak_landing" | "target_too_tight"

export const CPO_REASONS: Record<CpoReasonKey, { label: string; advice: string }> = {
  weak_hook:        { label: "开头弱",          advice: "重写钩子，加入反差/问题画面" },
  weak_scene:       { label: "场景弱",          advice: "换成更强购买意图场景" },
  weak_selling:     { label: "卖点弱",          advice: "改为「解决什么麻烦」式表达" },
  weak_landing:     { label: "承接弱",          advice: "检查商品页首屏、价格、优惠、评价" },
  target_too_tight: { label: "投放设置过紧",    advice: "降低 ROI target 或延长学习周期" },
}

export type AccountGroup = {
  id: string
  name: string
  type: "system" | "user"
  accountIds: string[]
  emoji?: string
}

export type ScenePointCell = {
  scene: string
  sellingPoint: string
  bestRoi: number
  materialCount: number
  totalSpend: number
  accountIds: string[]
}

export type DiagnosticIssue = {
  id: string
  type: "roi_target_too_high" | "scene_weak" | "hook_weak" | "creative_gap" | "landing_weak"
  severity: "high" | "medium" | "low"
  title: string
  detail: string
  affectedAccountIds: string[]
  affectedMaterialFingerprints: string[]
  suggestedActions: Array<{ label: string; kind: "brief" | "budget" | "target" | "pause" }>
}

export type BriefSeed = {
  title: string
  product: string
  scene: string
  pain: string
  proposition: string
  hook: string
  visuals: string[]
  sellingPriority: string[]
  cta: string
  count: number
}

export type ExperimentItem = {
  materialFingerprint: string
  accountId: string
  status: "pending" | "learning" | "scale" | "rewrite" | "pause"
  roi: number
  cpo: number
  trend: number[]
  suggestion: string
}

export type ExperimentBatch = {
  id: string
  name: string
  createdAt: string
  daysRunning: number
  totalDays: number
  items: ExperimentItem[]
}

export type ViewMode = "material" | "account"

export type DateRange = "7d" | "14d" | "30d"
export const DATE_RANGE_LABEL: Record<DateRange, string> = {
  "7d":  "近 7 天",
  "14d": "近 14 天",
  "30d": "近 30 天",
}

// Aggregate brand KPI snapshot
export type BrandKpi = {
  brand: string
  market: string
  channel: string
  dailyOrders: number
  dailyOrdersTarget: number
  roi: number
  roiTarget: number
  cpo: number
  cpoTargetLow: number
  cpoTargetHigh: number
  spend: number
  conclusion: string
}
