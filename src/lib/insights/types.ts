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

// ═══════════════════════════════════════════════════════════════════════════
// V2 复刻工作台（5 步流程：选择素材 → 爆款判定 → 元素拆解 → 生成方向 → 确认生成）
// ═══════════════════════════════════════════════════════════════════════════

// ─── Step 1 素材来源 ────────────────────────────────────────────────────────

export type MaterialSource = "market_hot" | "competitor_hot" | "owned_hot" | "local_upload"

export const MATERIAL_SOURCE_META: Record<MaterialSource, {
  label: string
  short: string
  desc: string
  tone: "info" | "warn" | "ok" | "muted"
  dot: string
}> = {
  market_hot:     { label: "市场爆款",   short: "市场",   desc: "公域 Top 素材，看互动率与生命周期", tone: "info",  dot: "#0ea5e9" },
  competitor_hot: { label: "竞品爆款",   short: "竞品",   desc: "竞品在跑素材，看可借鉴 + 差异化",   tone: "warn",  dot: "#f97316" },
  owned_hot:      { label: "自有爆款",   short: "自有",   desc: "GMV Max 已验证素材，看 ROI 与稳定", tone: "ok",    dot: "#22c55e" },
  local_upload:   { label: "本地上传",   short: "本地",   desc: "用户素材，仅做结构识别，低置信",     tone: "muted", dot: "#a1a1aa" },
}

// 卖点输入方式
export type SellingPointInputMode = "manual" | "link_ai_analysis"

// 商品信息（Step 1 右侧面板收集）
export type ProductBrief = {
  image?: string
  url?: string
  name: string
  category: string
  sellingPoints: string[]         // 3-5 条
  sellingPointMode: SellingPointInputMode
  audience: string                 // 目标人群
  scenes: string[]                 // 使用场景
  price?: string                   // 价格/优惠
  forbidden: string[]              // 禁忌表达
}

// ─── Step 2 爆款判定 ────────────────────────────────────────────────────────

export type HotItemVerdictKind = "recommended" | "cautious" | "not_recommended" | "not_enough_data"

export const HOT_VERDICT_META: Record<HotItemVerdictKind, {
  label: string
  short: string
  tone: "ok" | "warn" | "bad" | "muted"
  dot: string
  bg: string
  border: string
  desc: string
}> = {
  recommended:     { label: "推荐复刻",  short: "推荐", tone: "ok",    dot: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", desc: "数据扎实且匹配，建议直接进入元素拆解" },
  cautious:        { label: "谨慎复刻",  short: "谨慎", tone: "warn",  dot: "#a16207", bg: "#fffbeb", border: "#fde68a", desc: "有可借鉴价值但需要修改要点；继续但标记低置信" },
  not_recommended: { label: "不推荐",    short: "拒",   tone: "bad",   dot: "#dc2626", bg: "#fef2f2", border: "#fecaca", desc: "复刻收益低或风险大，建议返回重选素材" },
  not_enough_data: { label: "数据不足",  short: "?",    tone: "muted", dot: "#71717a", bg: "#f4f4f5", border: "#e4e4e7", desc: "样本不足或仅结构识别，结论低置信" },
}

// 4 来源的"数据支撑"字段（4 种结构互斥）
export type HotVerdictDataSupport =
  | { source: "market_hot";     popularityScore: number; engagementRate: number; lifecycleDays: number; categoryMatch: number; reusability: number }
  | { source: "competitor_hot"; competitorCategory: string; similarSkus: number; runDays: number; structurePattern: string; differentiationRisk: "low" | "mid" | "high" }
  | { source: "owned_hot";      dailyOrders: number; roi: number; spend: number; stableDays: number; declineRate: number }
  | { source: "local_upload";   structureIdentified: string[]; confidence: "low" }

export type HotItemVerdict = {
  verdict: HotItemVerdictKind
  source: MaterialSource
  category: string                  // 爆款类型文案（"市场候选 / 竞品可借鉴 / 自有可复刻 / 数据不足"）
  reasons: string[]                 // 最多 3 条
  dataSupport: HotVerdictDataSupport
  lifecyclePhase: LifecyclePhase
  lowConfidence?: boolean           // 进入后续步骤是否标记低置信
}

// ─── Step 3 8 元素拆解（电商内容元素，非技术字段） ─────────────────────────

export type ElementKey =
  | "audience_scene"  // 人群与场景
  | "hook"            // Hook
  | "value"           // 商品价值
  | "proof"           // Proof
  | "structure"       // 内容结构
  | "cta"             // CTA
  | "emotion"         // 情绪杠杆
  | "platform_fit"    // 平台适配

export const ELEMENT_META: Record<ElementKey, {
  label: string
  icon: string                 // emoji 兜底
  question: string             // 拆解关键问题
}> = {
  audience_scene: { label: "人群与场景", icon: "👥", question: "谁在什么场景下被打中" },
  hook:           { label: "Hook",       icon: "⚡", question: "前 1-3 秒如何停留" },
  value:          { label: "商品价值",   icon: "💎", question: "产品解决什么问题" },
  proof:          { label: "Proof",      icon: "✅", question: "如何证明有效" },
  structure:      { label: "内容结构",   icon: "📐", question: "信息推进顺序" },
  cta:            { label: "CTA",        icon: "🎯", question: "如何引导点击/下单" },
  emotion:        { label: "情绪杠杆",   icon: "❤️", question: "爽感 / 焦虑 / 省钱 / 信任" },
  platform_fit:   { label: "平台适配",   icon: "📱", question: "节奏 / 字幕 / 安全区 / 红线" },
}

export type ElementBreakdown = {
  key: ElementKey
  conclusion: string                // 拆解结论
  dataSupport: string               // 数据支撑（短）
  lifecyclePhase: LifecyclePhase    // 当前生命周期
  mustKeep: string[]                // 必须保留
  canVary: string[]                 // 可以变化
  forbidden: string[]               // 禁止复制
}

// ─── Step 4 内容脚本 + 分镜脚本 ─────────────────────────────────────────────

export type ScriptTimeRange = "0-3s" | "3-8s" | "8-13s" | "13-15s"

export type ScriptStep = {
  timeRange: ScriptTimeRange
  voiceover: string                 // 口播
  subtitle: string                  // 字幕
  action: string                    // 动作 / 行为
}

export type StoryboardShot = {
  timeRange: ScriptTimeRange
  shot: string                      // 镜头描述
  framing: string                   // 景别
  materials: string[]               // 所需素材
  notes?: string                    // 拍摄备注
}

// ─── Step 4 方向（在 V1 基础上扩展） ──────────────────────────────────────

// 注：原 ReplicaDirection（types.ts 上方）的字段保留并向下兼容；
// V2 扩展字段可通过 ReplicaDirectionV2 引用
export type ReplicaDirectionV2 = ReplicaDirection & {
  script: ScriptStep[]              // 内容脚本（按时间轴）
  storyboard: StoryboardShot[]      // 分镜脚本（按镜头）
  expectedDelta: string             // 预期提升指标文案（短）
  risks: string[]                   // 风险提示
}

// ─── Step 5 生成结果 ────────────────────────────────────────────────────────

export type OutcomeStatus = "pending" | "generating" | "done" | "adopted" | "rejected" | "edited"

export type GenerationOutcome = {
  id: string
  directionId: ReplicaDirection["id"]
  status: OutcomeStatus
  progress: number                  // 0-100，生成进度
  thumb: string                     // 占位缩略图
  durationSec: number               // 视频时长
  scriptOverride?: ScriptStep[]     // 编辑覆盖
  storyboardOverride?: StoryboardShot[]
  rejectionReason?: RejectionReason
  versions?: OutcomeVersion[]       // 历史版本，最多 5 个，新版本在前
  currentVersionId?: string         // 当前展示版本（默认最新）
}

// 单条 outcome 的历史版本（在 OutcomeDetailDrawer 中"再次生成"产生）
export type OutcomeVersion = {
  id: string
  index: number                     // V1, V2, V3...
  createdAt: string
  storyboardEdits: Record<string, string>   // timeRange → 编辑后的 shot 描述
  thumb: string                     // 该版本的缩略图（mock 占位）
}

export const MAX_VERSIONS_PER_OUTCOME = 5

// 一次生成 = 一个任务，包含 3 个 outcome（对应 A/B/C 三方向）
export type GenerationTask = {
  id: string
  index: number                     // 1, 2, 3...
  createdAt: string
  outcomes: GenerationOutcome[]
}

// 不采纳原因 6 选
export type RejectionReason =
  | "hook_weak"
  | "proof_untrust"
  | "cta_hard"
  | "storyboard_unfilmable"
  | "off_value"
  | "platform_risk"

export const REJECTION_REASON_META: Record<RejectionReason, {
  label: string
  desc: string
}> = {
  hook_weak:             { label: "Hook 不够强",      desc: "前 3 秒没抓住注意力" },
  proof_untrust:         { label: "Proof 不可信",     desc: "证据弱、容易被质疑" },
  cta_hard:              { label: "CTA 太硬",         desc: "硬推销，转化反向" },
  storyboard_unfilmable: { label: "分镜不可拍",       desc: "实际拍摄成本高/做不出" },
  off_value:             { label: "不符合商品卖点",   desc: "脚本和产品价值脱节" },
  platform_risk:         { label: "平台风险",         desc: "可能触发红线 / 不通过审核" },
}

// 4 步生成阶段（Step 5 顶部 progress）
export type GenerationStage = "script_lock" | "shot_gen" | "subtitle" | "safety_check"

export const GENERATION_STAGE_META: Record<GenerationStage, { label: string }> = {
  script_lock:  { label: "脚本锁定" },
  shot_gen:     { label: "镜头生成" },
  subtitle:     { label: "字幕合成" },
  safety_check: { label: "安全检查" },
}
