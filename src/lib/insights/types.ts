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
  lifecyclePhase: LifecyclePhase
  ageDays: number             // 距首次出现的天数
}

// ─── Lifecycle phase（素材生命周期，决定复刻动作可用性） ────────────────────────

export type LifecyclePhase =
  | "cold_start"   // 冷启动期：刚上线，等待潜力信号
  | "potential"    // 潜力期：信号兑现，开始小预算放量
  | "scaling"      // 爆量期：稳定放量中
  | "peak"         // 爆量拐点：黄金 48h 复刻窗口
  | "declining"    // 衰退期：CTR/ROI 下行
  | "retired"      // 已退场

export const LIFECYCLE_META: Record<LifecyclePhase, {
  label: string
  short: string
  tone: "muted" | "info" | "ok" | "hot" | "warn" | "bad"
  dot: string
  replicaCta: string           // 该阶段建议的复刻文案
  replicaAllowed: boolean      // 是否允许走复刻流程
  hint: string                 // 阶段说明（drawer 内显示）
}> = {
  cold_start: { label: "冷启动期", short: "冷启",  tone: "muted", dot: "#94a3b8", replicaCta: "先小预算测一轮信号",       replicaAllowed: false, hint: "潜力未验证，复刻为时尚早，先用小预算测信号。" },
  potential:  { label: "潜力期",   short: "潜力",  tone: "info",  dot: "#0ea5e9", replicaCta: "信号已出，可生成 1-2 个变体", replicaAllowed: true,  hint: "潜力信号兑现，建议小批量复刻试探。" },
  scaling:    { label: "爆量期",   short: "爆量",  tone: "ok",    dot: "#22c55e", replicaCta: "持续放量，可复刻 3 个变体延续", replicaAllowed: true,  hint: "正在稳定爆量，是延续生命周期的合理复刻窗口。" },
  peak:       { label: "爆量拐点", short: "拐点",  tone: "hot",   dot: "#f97316", replicaCta: "⚡ 48h 复刻窗口，立即生成 3 变体", replicaAllowed: true,  hint: "拐点已经出现，48h 内复刻变体延续，否则衰退会加速。" },
  declining:  { label: "衰退期",   short: "衰退",  tone: "warn",  dot: "#eab308", replicaCta: "不建议复刻（会加速衰退）",         replicaAllowed: false, hint: "已进入衰退期，复刻只会拉低新系列的天花板，建议换骨架。" },
  retired:    { label: "已退场",   short: "退场",  tone: "bad",   dot: "#a1a1aa", replicaCta: "已退场素材不可复刻",               replicaAllowed: false, hint: "素材已退场，请从核心爆款重新挑选。" },
}

// ─── 自有产品（复刻匹配的右侧"自己"） ────────────────────────────────────────

export type SelfProduct = {
  sku: string
  name: string
  image: string
  category: string
  coreSellingPoints: string[]    // 可 link to brief
  brandVoice: string[]           // 品牌话术模板片段
  competitiveEdge: string        // 一句话差异化
  inventoryStatus: "in_stock" | "low" | "out"
  matchableSceneTags: string[]   // 自有产品适配的场景
}

// ─── 爆款源类型 + 复刻项目（最近项目卡） ──────────────────────────────────────
// "派生迭代" 不是第三种类型，而是项目元数据（见 ReplicaProject.derivedFromProjectId）

export type ReplicaCategory = "market" | "own"

export const REPLICA_CATEGORY_META: Record<ReplicaCategory, {
  label: string
  short: string
  desc: string
  tone: "info" | "ok"
  dot: string
}> = {
  market:  { label: "市场爆款", short: "市场", desc: "复刻别人，最快验证。需做自有产品匹配检查。", tone: "info", dot: "#0ea5e9" },
  own:     { label: "自有爆款", short: "自有", desc: "复刻自己，放大已验证素材。生命周期决定窗口。", tone: "ok",   dot: "#22c55e" },
}

// 派生关系沿用的变量轴（与 ReplicaDirection.axis 同义）
export type ReplicaAxis = "hook" | "scene" | "selling"

// ─── 复刻匹配评分 ────────────────────────────────────────────────────────────

export type MatchSignal = {
  key: "selling_point" | "scene" | "category" | "voice" | "evidence"
  label: string
  score: number      // 0-100
  weight: number     // 占比 0-1
  detail: string     // 一句话解释
  ok: boolean
}

export type MatchResult = {
  total: number             // 0-100 加权总分
  level: "high" | "mid" | "low"
  signals: MatchSignal[]
  blockers: string[]        // 拦截项（命中则不可复刻）
}

// ─── 复刻方向（替代 prototype 的 Directions） ─────────────────────────────────

export type ReplicaDirection = {
  id: "A" | "B" | "C"
  title: string
  desc: string
  axis: "hook" | "scene" | "selling"   // 只动一个轴
  keep: string[]
  change: string
  impact: string
  confidence: number              // 0-1
  lifecycleFit: LifecyclePhase[]  // 哪些生命周期阶段适合
  brief: string
}

// ─── 复刻项目（最近项目列表） ─────────────────────────────────────────────────

export type ReplicaProjectStatus = "draft" | "in_progress" | "submitted" | "completed"

export type ReplicaProject = {
  id: string
  title: string
  category: ReplicaCategory
  sourceFingerprint?: string  // own 用；market 没有自有 fp
  sourceName: string
  productSku: string
  matchScore: number
  variantCount: number
  status: ReplicaProjectStatus
  createdAt: string
  updatedAt: string
  thumb: string
  lifecyclePhase?: LifecyclePhase
  // 派生关系（如果这是一次"二次复刻"）
  derivedFromProjectId?: string
  derivedFromAxis?: ReplicaAxis     // 上轮已验证、本轮沿用的变量轴
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
