/**
 * GMV Max 素材诊断闭环 · Mock 数据层
 *
 * 对齐 Sprint PRD v1.0：
 * - 诊断最小单元固定为「商品 × 素材 × 国家 × 观察窗口」
 * - 规则引擎按固定优先级只输出一个 active 结果（六类之一）
 * - 非素材问题不允许用素材动作解释，走保护分支
 * - 所有诊断结论都携带证据、Benchmark 口径与唯一主动作
 */

// ─── 诊断结果与状态 ──────────────────────────────────────────────────────────

export type DecisionStatus = "scale" | "stable" | "observe" | "iterate" | "refresh" | "stop"

/** 六类结果的展示与动作元数据（唯一结果原则：一个状态只有一个主按钮） */
export const DECISION_STATUS_META: Record<
  DecisionStatus,
  {
    label: string
    action: string
    /** 摘要卡上的短动作词 */
    shortAction: string
    className: string
    dot: string
    /** 是否需要人工确认（进入今日待处理） */
    actionable: boolean
  }
> = {
  scale: { label: "可放量", action: "创建放量方案", shortAction: "优先处理", className: "bg-emerald-50 text-emerald-700", dot: "#22c55e", actionable: true },
  iterate: { label: "需迭代", action: "生成变体", shortAction: "生成变体", className: "bg-amber-50 text-amber-800", dot: "#eab308", actionable: true },
  refresh: { label: "需换新", action: "生成新方向", shortAction: "新方向", className: "bg-indigo-50 text-indigo-700", dot: "#6366f1", actionable: true },
  stop: { label: "建议关停", action: "确认关停", shortAction: "止损", className: "bg-red-50 text-red-700", dot: "#ef4444", actionable: true },
  stable: { label: "稳定投放", action: "保持投放", shortAction: "无需处理", className: "bg-zinc-100 text-zinc-700", dot: "#71717a", actionable: false },
  observe: { label: "待观察", action: "继续观察", shortAction: "等样本", className: "bg-blue-50 text-blue-700", dot: "#3b82f6", actionable: false },
}

/** 摘要卡与筛选 chip 的固定顺序：先需要确认的，再辅助数量 */
export const DECISION_ACTIONABLE_ORDER: DecisionStatus[] = ["scale", "iterate", "refresh", "stop"]
export const DECISION_PASSIVE_ORDER: DecisionStatus[] = ["stable", "observe"]
export const DECISION_FILTER_ORDER: DecisionStatus[] = ["scale", "stable", "observe", "iterate", "refresh", "stop"]

// ─── 商品经营诊断 ────────────────────────────────────────────────────────────

export type ProductDiagnosisType = "growth" | "creative" | "product" | "observe"

export const PRODUCT_DIAGNOSIS_META: Record<
  ProductDiagnosisType,
  { label: string; className: string; filterLabel: string }
> = {
  growth: { label: "素材可放量", className: "bg-emerald-50 text-emerald-700", filterLabel: "增长机会" },
  creative: { label: "素材问题", className: "bg-amber-50 text-amber-800", filterLabel: "素材问题" },
  product: { label: "非素材问题", className: "bg-blue-50 text-blue-700", filterLabel: "商品问题" },
  observe: { label: "待观察", className: "bg-zinc-100 text-zinc-700", filterLabel: "待观察" },
}

export type ProductDiagnosis = {
  id: string
  name: string
  /** 表格里的短名，避免重复品牌前缀 */
  shortName: string
  sku: string
  country: string
  category: string
  accent: string
  gmv: number
  spend: number
  orders: number
  roi: number
  targetRoi: number
  ctr: number
  benchmarkCtr: number
  cvr: number
  benchmarkCvr: number
  aov: number
  benchmarkAov: number
  diagnosisType: ProductDiagnosisType
  /** 优先级标签，如「高 GMV 机会」「优先处理 P1」 */
  priorityTag?: string
  /** 素材信号（对 Benchmark），列表中直接展示 2-3 行 */
  signals: string[]
  /** 系统判断的一句话结论 */
  headline: string
  /** 结论下的补充说明 */
  detail: string
  /** 经营影响，用于排序与 CTA 说明 */
  impact: string
  /** 预估每日 GMV 影响（美元），列表按此降序 */
  gmvImpactPerDay: number
  /** 归因结论：把经营缺口收敛到具体链路 */
  attribution: { conclusion: string; detail: string }
  creativeCount: number
  statusCounts: Partial<Record<DecisionStatus, number>>
}

export const PRODUCTS: ProductDiagnosis[] = [
  {
    id: "glow-serum",
    name: "GlowLab 10% 烟酰胺精华",
    shortName: "10% 烟酰胺精华",
    sku: "GL-NA10-US",
    country: "US",
    category: "Beauty",
    accent: "from-rose-100 to-rose-300",
    gmv: 38400,
    spend: 18550,
    orders: 1128,
    roi: 2.07,
    targetRoi: 1.8,
    ctr: 0.91,
    benchmarkCtr: 0.81,
    cvr: 4.2,
    benchmarkCvr: 3.77,
    aov: 34.04,
    benchmarkAov: 33.8,
    diagnosisType: "growth",
    priorityTag: "高 GMV 机会",
    signals: ["3 条可放量 · 5 条需迭代", "Top 素材 ROI ↑34% · 供给覆盖仅 62%", "当前不是亏损问题，是素材供给限制增长"],
    headline: "已有赢家，但可用变体不足",
    detail: "3 条素材达到放量线，5 条只需单变量迭代即可补齐供给",
    impact: "预估 GMV 机会 +$2.1K / 日",
    gmvImpactPerDay: 2100,
    attribution: {
      conclusion: "赢家素材已验证 → 缺口在素材供给而非投放设置",
      detail: "ROI 高于目标 15%，但可投素材仅 8 条，低于放量所需的 12 条",
    },
    creativeCount: 8,
    statusCounts: { scale: 3, iterate: 5 },
  },
  {
    id: "collagen-mask",
    name: "GlowLab 胶原蛋白面膜",
    shortName: "胶原蛋白面膜",
    sku: "GL-MASK-05-US",
    country: "US",
    category: "Beauty",
    accent: "from-orange-100 to-orange-300",
    gmv: 22700,
    spend: 14934,
    orders: 668,
    roi: 1.52,
    targetRoi: 1.8,
    ctr: 0.54,
    benchmarkCtr: 0.73,
    cvr: 3.8,
    benchmarkCvr: 3.69,
    aov: 33.98,
    benchmarkAov: 34.6,
    diagnosisType: "creative",
    priorityTag: "优先处理 P1",
    signals: ["CTR 0.54% ↓26%", "CVR 3.80% ↑3%", "AOV 与价格稳定，问题发生在点击前"],
    headline: "开头吸引力下降，拖累商品 ROI",
    detail: "4 条需迭代 · 1 条待观察",
    impact: "预估 GMV 缺口 $1.2K / 日",
    gmvImpactPerDay: 1200,
    attribution: {
      conclusion: "点击前链路异常 → 定位到素材 Hook 与首帧",
      detail: "CTR 低 26%，但 CVR 与 AOV 正常，因此不归因到商品或 Offer",
    },
    creativeCount: 5,
    statusCounts: { iterate: 4, observe: 1 },
  },
  {
    id: "sunscreen",
    name: "GlowLab SPF50 防晒霜",
    shortName: "SPF50 防晒霜",
    sku: "GL-SPF50-US",
    country: "US",
    category: "Beauty",
    accent: "from-yellow-100 to-amber-300",
    gmv: 19300,
    spend: 13219,
    orders: 568,
    roi: 1.46,
    targetRoi: 1.8,
    ctr: 0.82,
    benchmarkCtr: 0.81,
    cvr: 3.6,
    benchmarkCvr: 3.58,
    aov: 27.2,
    benchmarkAov: 33.1,
    diagnosisType: "product",
    priorityTag: "转商品诊断",
    signals: ["CTR 0.82% ≈ 均值", "CVR 3.60% ≈ 均值", "AOV ↓18% · 折扣结束后客单下降"],
    headline: "素材链路正常，不建议换素材",
    detail: "优先检查价格、Offer 与商品组合",
    impact: "换素材无法修复本次 ROI 缺口",
    gmvImpactPerDay: 860,
    attribution: {
      conclusion: "点击与转化均达标 → 缺口来自客单价而非素材",
      detail: "CTR Index 1.01、CVR Index 1.01 均 ≥ 0.90，系统禁用素材动作",
    },
    creativeCount: 6,
    statusCounts: { stable: 5, observe: 1 },
  },
  {
    id: "hair-oil",
    name: "GlowLab 修护发油",
    shortName: "修护发油",
    sku: "GL-HAIR-02-US",
    country: "US",
    category: "Beauty",
    accent: "from-purple-100 to-purple-300",
    gmv: 9100,
    spend: 11974,
    orders: 214,
    roi: 0.76,
    targetRoi: 1.8,
    ctr: 0.41,
    benchmarkCtr: 0.67,
    cvr: 1.9,
    benchmarkCvr: 2.79,
    aov: 42.52,
    benchmarkAov: 41.9,
    diagnosisType: "creative",
    priorityTag: "已触发止损线",
    signals: ["CTR 0.41% ↓39%", "CVR 1.90% ↓32%", "连续两个诊断窗口未恢复"],
    headline: "观看与转化同步下降，原方向已失效",
    detail: "2 条应止损 · 1 条需要全新方向",
    impact: "预计减少风险消耗 $310 / 日",
    gmvImpactPerDay: 310,
    attribution: {
      conclusion: "双链路同时衰退 → 不是迭代问题，是方向失效",
      detail: "CTR Index 0.61、CVR Index 0.68 同时低于 0.80，命中需换新与止损",
    },
    creativeCount: 3,
    statusCounts: { stop: 2, refresh: 1 },
  },
]

/** 列表底部说明：本期只详细诊断头部商品 */
export const PRODUCT_TAIL_SUMMARY = { total: 24, shown: 4, observing: 1 }

export function productById(id: string) {
  return PRODUCTS.find((product) => product.id === id) ?? PRODUCTS[0]
}

// ─── 素材诊断 ────────────────────────────────────────────────────────────────

export type CreativeVariant = {
  key: string
  label: string
  script: string
}

export type CreativeDirection = {
  key: string
  label: string
  desc: string
}

export type CreativeDiagnosis = {
  id: string
  productId: string
  title: string
  format: string
  accent: string
  ageDays: number
  sample: "充分" | "不足"
  /** 判断置信度，样本不足时偏低 */
  confidence: number
  spend: number
  gmv: number
  orders: number
  roi: number
  targetRoi: number
  /** 同商品成熟素材订单均值，用于订单对比 */
  benchmarkOrders: number
  ctr: number
  benchmarkCtr: number
  cvr: number
  benchmarkCvr: number
  status: DecisionStatus
  /** 一句话判断（列表 + 抽屉共用） */
  reason: string
  /** 诊断依据补充 */
  evidence: string
  /** 抽屉里的结论标题，用人话说清楚问题 */
  headline: string
  /** 结论下的执行建议 */
  advice: string
  issueTag: string
  /** 排序用的影响分 */
  impactScore: number
  /** 非素材问题保护：禁用一切素材动作 */
  protection?: boolean
  /** 待观察状态的样本缺口 */
  sampleGap?: { spendNeeded: number; ordersNeeded: number; hoursLeft: number }
  /** 需迭代 / 可放量的变体方向 */
  variants?: CreativeVariant[]
  /** 需换新的重做方向 */
  directions?: CreativeDirection[]
  /** 下一次投放策略 */
  nextPlan: { action: string; observation: string }
  /** 稳定投放的下次复查时间 */
  nextReviewAt?: string
  /** 建议关停：该素材在其他商品下的在投情况（关停只影响当前商品） */
  otherProductUsage?: Array<{ productId: string; roi: number; status: DecisionStatus }>
  /** 建议关停：移出后该商品的可投素材供给变化 */
  supplyAfterStop?: { before: number; after: number; min: number }
  /** 建议关停：连续两个诊断窗口的指标快照 */
  windows?: [MetricWindow, MetricWindow]
}

/** 单个诊断窗口的指标快照，用于「连续两个窗口低于止损线」的取证 */
export type MetricWindow = {
  label: string
  roi: number
  ctr: number
  cvr: number
  spend: number
  orders: number
}

const ACCENTS = [
  "from-fuchsia-950 to-rose-400",
  "from-amber-950 to-orange-300",
  "from-emerald-950 to-emerald-300",
  "from-red-950 to-rose-300",
  "from-slate-950 to-blue-300",
  "from-sky-950 to-cyan-300",
  "from-violet-950 to-violet-300",
  "from-zinc-900 to-lime-300",
]

/** 需要人工确认的 12 条素材，逐条手写以保证结论、证据和动作自洽 */
const ACTIONABLE_CREATIVES: CreativeDiagnosis[] = [
  {
    id: "7626360624905601032",
    productId: "glow-serum",
    title: "达人实测｜对比型开头",
    format: "UGC 口播",
    accent: ACCENTS[0],
    ageDays: 12,
    sample: "充分",
    confidence: 96,
    spend: 1860,
    gmv: 4501,
    orders: 126,
    roi: 2.42,
    targetRoi: 1.8,
    benchmarkOrders: 103,
    ctr: 1.31,
    benchmarkCtr: 1.02,
    cvr: 4.2,
    benchmarkCvr: 3.78,
    status: "scale",
    reason: "连续 3 日 ROI 达标，订单稳定",
    evidence: "ROI 高于目标 34%，订单高于同商品成熟素材均值 22%",
    headline: "这是本商品目前最稳的赢家",
    advice: "保留原素材，同时扩充同结构变体，并在商品层放量",
    issueTag: "主力素材",
    impactScore: 96,
    variants: [
      { key: "A", label: "同结构换达人", script: "换一位同人设达人复刻对比开头，保留脚本节奏" },
      { key: "B", label: "同结构换场景", script: "把浴室场景换成通勤补妆，保留对比结构" },
      { key: "C", label: "同结构换 Hook", script: "开头由「对比」改为「结果先出」，中后段完全保留" },
    ],
    nextPlan: { action: "3 个衍生变体加入 GMV Max 素材池 · 商品层预算 +20%", observation: "24 小时 · ROI ≥ 1.80 · 订单 ≥ 10" },
  },
  {
    id: "7601248877391250116",
    productId: "glow-serum",
    title: "成分讲解｜专业背书",
    format: "口播讲解",
    accent: ACCENTS[6],
    ageDays: 15,
    sample: "充分",
    confidence: 93,
    spend: 1420,
    gmv: 3196,
    orders: 94,
    roi: 2.25,
    targetRoi: 1.8,
    benchmarkOrders: 103,
    ctr: 1.18,
    benchmarkCtr: 1.02,
    cvr: 3.98,
    benchmarkCvr: 3.78,
    status: "scale",
    reason: "ROI 稳定高于目标，可复制结构",
    evidence: "ROI 高于目标 25%，近 3 日波动小于 6%",
    headline: "专业背书结构已被验证有效",
    advice: "保留讲解结构，仅替换达人与场景生成衍生版本",
    issueTag: "主力素材",
    impactScore: 88,
    variants: [
      { key: "A", label: "换达人", script: "由皮肤科背景达人出镜，保留讲解逻辑" },
      { key: "B", label: "换场景", script: "实验室场景改为家庭梳妆台" },
      { key: "C", label: "换开头", script: "前 3 秒改为成分对比可视化" },
    ],
    nextPlan: { action: "3 个衍生变体加入 GMV Max 素材池", observation: "24 小时 · ROI ≥ 1.80 · 订单 ≥ 10" },
  },
  {
    id: "7588210934417785220",
    productId: "glow-serum",
    title: "前后对比｜28 天记录",
    format: "剪辑合集",
    accent: ACCENTS[4],
    ageDays: 18,
    sample: "充分",
    confidence: 91,
    spend: 1180,
    gmv: 2560,
    orders: 76,
    roi: 2.17,
    targetRoi: 1.8,
    benchmarkOrders: 103,
    ctr: 1.09,
    benchmarkCtr: 1.02,
    cvr: 3.86,
    benchmarkCvr: 3.78,
    status: "scale",
    reason: "长周期素材仍保持达标 ROI",
    evidence: "ROI 高于目标 21%，18 天未出现衰退信号",
    headline: "长效素材，仍在放量窗口内",
    advice: "维持原素材，补充同结构衍生用于扩量",
    issueTag: "长效素材",
    impactScore: 82,
    variants: [
      { key: "A", label: "缩短版本", script: "把 28 天记录压缩为 15 秒快剪" },
      { key: "B", label: "换证据", script: "把主观感受替换为仪器检测数据" },
      { key: "C", label: "换结尾 CTA", script: "结尾改为限时价格利益点" },
    ],
    nextPlan: { action: "3 个衍生变体加入 GMV Max 素材池", observation: "24 小时 · ROI ≥ 1.80 · 订单 ≥ 10" },
  },
  {
    id: "7637401399248076818",
    productId: "collagen-mask",
    title: "痛点口播｜价格利益点",
    format: "达人口播",
    accent: ACCENTS[1],
    ageDays: 9,
    sample: "充分",
    confidence: 91,
    spend: 980,
    gmv: 1705,
    orders: 43,
    roi: 1.74,
    targetRoi: 1.8,
    benchmarkOrders: 44,
    ctr: 0.62,
    benchmarkCtr: 0.81,
    cvr: 4.0,
    benchmarkCvr: 3.77,
    status: "iterate",
    reason: "转化正常，但前 3 秒吸引力下降",
    evidence: "CTR 低于 Benchmark 23%，CVR 仍高于均值 6%",
    headline: "不是商品卖不动，是开头抓不住人",
    advice: "保留卖点、达人和 Offer，只替换前 3 秒 Hook",
    issueTag: "Hook 疲劳",
    impactScore: 94,
    variants: [
      { key: "A", label: "结果先出", script: "「用了 7 天后，毛孔真的小了吗？」" },
      { key: "B", label: "痛点冲突", script: "「越控油越出油，你可能做错了」" },
      { key: "C", label: "价格利益", script: "「不到一杯咖啡，测 10% 烟酰胺」" },
    ],
    nextPlan: { action: "3 个变体加入 GMV Max 素材池", observation: "48 小时 · ROI ≥ 1.80 · 订单 ≥ 5" },
  },
  {
    id: "7517967168055656464",
    productId: "collagen-mask",
    title: "结果前置｜真人证言",
    format: "达人口播",
    accent: ACCENTS[4],
    ageDays: 7,
    sample: "充分",
    confidence: 89,
    spend: 760,
    gmv: 1277,
    orders: 31,
    roi: 1.68,
    targetRoi: 1.8,
    benchmarkOrders: 44,
    ctr: 0.66,
    benchmarkCtr: 0.81,
    cvr: 3.92,
    benchmarkCvr: 3.77,
    status: "iterate",
    reason: "Hook 点击效率开始下滑",
    evidence: "CTR 低于 Benchmark 19%，CVR 保持正常",
    headline: "证言结构有效，问题只在开场",
    advice: "保留证言结构，生成结果前置和痛点冲突两类开头",
    issueTag: "Hook 疲劳",
    impactScore: 86,
    variants: [
      { key: "A", label: "结果先出", script: "「第 3 张面膜后，同事问我做了什么」" },
      { key: "B", label: "痛点冲突", script: "「熬夜脸不是缺水，是屏障塌了」" },
      { key: "C", label: "身份代入", script: "「敏感肌能不能用胶原面膜？」" },
    ],
    nextPlan: { action: "3 个变体加入 GMV Max 素材池", observation: "48 小时 · ROI ≥ 1.80 · 订单 ≥ 5" },
  },
  {
    id: "7563209188410772391",
    productId: "collagen-mask",
    title: "使用教程｜三步敷法",
    format: "教程演示",
    accent: ACCENTS[5],
    ageDays: 11,
    sample: "充分",
    confidence: 88,
    spend: 690,
    gmv: 1160,
    orders: 28,
    roi: 1.68,
    targetRoi: 1.8,
    benchmarkOrders: 44,
    ctr: 0.64,
    benchmarkCtr: 0.81,
    cvr: 3.84,
    benchmarkCvr: 3.77,
    status: "iterate",
    reason: "教程节奏偏慢，首帧留存不足",
    evidence: "CTR 低于 Benchmark 21%，CVR 与均值持平",
    headline: "内容有用，但没人看到第 3 秒",
    advice: "保留三步结构，把结果画面提到开头",
    issueTag: "Hook 疲劳",
    impactScore: 78,
    variants: [
      { key: "A", label: "结果先出", script: "开场直接给敷后 10 分钟的对比脸" },
      { key: "B", label: "错误示范", script: "「90% 的人第一步就敷错了」" },
      { key: "C", label: "时间承诺", script: "「15 分钟，三步走完」" },
    ],
    nextPlan: { action: "3 个变体加入 GMV Max 素材池", observation: "48 小时 · ROI ≥ 1.80 · 订单 ≥ 5" },
  },
  {
    id: "7529844170036612847",
    productId: "collagen-mask",
    title: "开箱质地｜特写镜头",
    format: "产品特写",
    accent: ACCENTS[2],
    ageDays: 13,
    sample: "充分",
    confidence: 87,
    spend: 620,
    gmv: 1010,
    orders: 25,
    roi: 1.63,
    targetRoi: 1.8,
    benchmarkOrders: 44,
    ctr: 0.6,
    benchmarkCtr: 0.81,
    cvr: 3.81,
    benchmarkCvr: 3.77,
    status: "iterate",
    reason: "缺少人物出镜，开场信息密度低",
    evidence: "CTR 低于 Benchmark 26%，CVR 正常",
    headline: "看得见产品，看不见理由",
    advice: "保留质地特写，开头补一句使用者视角的理由",
    issueTag: "Hook 疲劳",
    impactScore: 74,
    variants: [
      { key: "A", label: "人物代入", script: "达人出镜说明为什么挑这款质地" },
      { key: "B", label: "痛点冲突", script: "「精华涂不进去，其实是敷法问题」" },
      { key: "C", label: "对比开场", script: "同价位两款质地对比" },
    ],
    nextPlan: { action: "3 个变体加入 GMV Max 素材池", observation: "48 小时 · ROI ≥ 1.80 · 订单 ≥ 5" },
  },
  {
    id: "7574011923884550172",
    productId: "glow-serum",
    title: "痛点反问｜熬夜场景",
    format: "UGC 口播",
    accent: ACCENTS[3],
    ageDays: 10,
    sample: "充分",
    confidence: 90,
    spend: 840,
    gmv: 1470,
    orders: 41,
    roi: 1.75,
    targetRoi: 1.8,
    benchmarkOrders: 103,
    ctr: 0.79,
    benchmarkCtr: 1.02,
    cvr: 3.9,
    benchmarkCvr: 3.78,
    status: "iterate",
    reason: "点击效率弱于同商品成熟素材",
    evidence: "CTR 低于 Benchmark 23%，CVR 高于均值 3%",
    headline: "转化没问题，是开场没留住人",
    advice: "只替换开头 Hook，保留熬夜场景与卖点顺序",
    issueTag: "Hook 疲劳",
    impactScore: 72,
    variants: [
      { key: "A", label: "结果先出", script: "「熬夜脸第二天怎么救回来」" },
      { key: "B", label: "冲突开场", script: "「越贵的精华越不适合熬夜肌」" },
      { key: "C", label: "价格利益", script: "「一晚不到 3 块钱的急救方案」" },
    ],
    nextPlan: { action: "3 个变体加入 GMV Max 素材池", observation: "48 小时 · ROI ≥ 1.80 · 订单 ≥ 5" },
  },
  {
    id: "7647056764006760455",
    productId: "hair-oil",
    title: "产品展示｜成分解释",
    format: "产品演示",
    accent: ACCENTS[2],
    ageDays: 24,
    sample: "充分",
    confidence: 94,
    spend: 1410,
    gmv: 1960,
    orders: 18,
    roi: 1.39,
    targetRoi: 1.8,
    benchmarkOrders: 31,
    ctr: 0.48,
    benchmarkCtr: 0.73,
    cvr: 2.2,
    benchmarkCvr: 2.98,
    status: "refresh",
    reason: "观看与转化同步下降，原方向已失效",
    evidence: "CTR 低 34%，CVR 低 26%，连续两个窗口未恢复",
    headline: "两条链路同时变弱，迭代救不回来",
    advice: "保留商品与合规约束，重新测试达人、场景与表达结构",
    issueTag: "方向疲劳",
    impactScore: 84,
    directions: [
      { key: "talent", label: "换达人人设", desc: "从产品讲解切换为理发师专业视角" },
      { key: "scene", label: "换使用场景", desc: "从家庭日常切换为出行 / 健身后护理" },
      { key: "structure", label: "换表达结构", desc: "从成分解释切换为前后对比叙事" },
    ],
    nextPlan: { action: "按选定方向生成全新素材并加入素材池", observation: "72 小时 · ROI ≥ 1.80 · 订单 ≥ 5" },
  },
  {
    id: "7512380045512377901",
    productId: "hair-oil",
    title: "沙龙教学｜手法演示",
    format: "教程演示",
    accent: ACCENTS[6],
    ageDays: 21,
    sample: "充分",
    confidence: 92,
    spend: 1120,
    gmv: 1590,
    orders: 15,
    roi: 1.42,
    targetRoi: 1.8,
    benchmarkOrders: 31,
    ctr: 0.5,
    benchmarkCtr: 0.73,
    cvr: 2.31,
    benchmarkCvr: 2.98,
    status: "refresh",
    reason: "双链路持续弱于基准，无恢复迹象",
    evidence: "CTR 低 32%，CVR 低 22%，两个诊断窗口均未回升",
    headline: "教学向表达已经跑不动了",
    advice: "保留品牌与合规信息，换人设与叙事结构重新测试",
    issueTag: "方向疲劳",
    impactScore: 70,
    directions: [
      { key: "talent", label: "换达人人设", desc: "改由真实用户口播替代专业教学" },
      { key: "scene", label: "换使用场景", desc: "改为通勤前 30 秒快速护理" },
      { key: "structure", label: "换表达结构", desc: "改为问题—解决—结果三段式" },
    ],
    nextPlan: { action: "按选定方向生成全新素材并加入素材池", observation: "72 小时 · ROI ≥ 1.80 · 订单 ≥ 5" },
  },
  {
    id: "7550853680897146888",
    productId: "hair-oil",
    title: "UGC 自拍｜日常场景",
    format: "UGC 自拍",
    accent: ACCENTS[3],
    ageDays: 8,
    sample: "充分",
    confidence: 95,
    spend: 186,
    gmv: 134,
    orders: 2,
    roi: 0.72,
    targetRoi: 1.8,
    benchmarkOrders: 31,
    ctr: 0.39,
    benchmarkCtr: 0.69,
    cvr: 1.42,
    benchmarkCvr: 2.81,
    status: "stop",
    reason: "样本充分且持续不达标，无修复信号",
    evidence: "消耗 $186 · CPO $93 · 连续 3 日低于止损线",
    headline: "已经确认无效，继续跑只会加大亏损",
    advice: "移出当前商品素材池，停止无效消耗",
    issueTag: "已触发止损线",
    impactScore: 90,
    nextPlan: { action: "移出「修护发油」GMV Max 素材池，可随时恢复", observation: "关停后不再计入该商品素材供给" },
  },
  {
    id: "7498120365571109882",
    productId: "hair-oil",
    title: "情景短剧｜通勤翻车",
    format: "情景短剧",
    accent: ACCENTS[5],
    ageDays: 6,
    sample: "充分",
    confidence: 93,
    spend: 214,
    gmv: 158,
    orders: 2,
    roi: 0.74,
    targetRoi: 1.8,
    benchmarkOrders: 31,
    ctr: 0.42,
    benchmarkCtr: 0.69,
    cvr: 1.5,
    benchmarkCvr: 2.81,
    status: "stop",
    reason: "两个诊断窗口均低于止损线",
    evidence: "消耗 $214 · 仅 2 单 · ROI 低于目标 59%",
    headline: "剧情吸引力与转化都不成立",
    advice: "移出当前商品素材池，把预算让给待验证方向",
    issueTag: "已触发止损线",
    impactScore: 80,
    nextPlan: { action: "移出「修护发油」GMV Max 素材池，可随时恢复", observation: "关停后不再计入该商品素材供给" },
  },
]

/** 无需立即处理的素材：稳定投放 16 条 + 待观察 7 条 */
const PASSIVE_SEEDS: Array<Pick<CreativeDiagnosis, "id" | "productId" | "title" | "format" | "status"> & { protection?: boolean }> = [
  { id: "7591146540673321903", productId: "sunscreen", title: "户外实测｜防晒对比", format: "场景实测", status: "stable", protection: true },
  { id: "7583920174451209388", productId: "sunscreen", title: "泳池场景｜防水演示", format: "场景实测", status: "stable", protection: true },
  { id: "7571003398820117554", productId: "sunscreen", title: "上妆前打底｜质地测试", format: "产品特写", status: "stable" },
  { id: "7565881202233470019", productId: "sunscreen", title: "通勤日常｜补涂提醒", format: "UGC 口播", status: "stable" },
  { id: "7559330847712900461", productId: "sunscreen", title: "成分安全｜敏感肌可用", format: "口播讲解", status: "stable" },
  { id: "7548217760029113347", productId: "glow-serum", title: "夜间护理｜叠涂顺序", format: "教程演示", status: "stable" },
  { id: "7542098431770556128", productId: "glow-serum", title: "闺蜜对话｜种草口播", format: "UGC 口播", status: "stable" },
  { id: "7536714029948231705", productId: "glow-serum", title: "空瓶记录｜复购理由", format: "剪辑合集", status: "stable" },
  { id: "7530660118843207964", productId: "collagen-mask", title: "旅行装｜便携场景", format: "场景实测", status: "stable" },
  { id: "7524509973310884472", productId: "collagen-mask", title: "急救面膜｜约会前夜", format: "情景短剧", status: "stable" },
  { id: "7518447856125993310", productId: "collagen-mask", title: "成分对比｜同价位横评", format: "口播讲解", status: "stable" },
  { id: "7509338291064721185", productId: "glow-serum", title: "痘印记录｜21 天", format: "剪辑合集", status: "stable" },
  { id: "7503227140997640573", productId: "sunscreen", title: "海边旅拍｜全天不脱妆", format: "剪辑合集", status: "stable" },
  { id: "7495116089930559468", productId: "collagen-mask", title: "妈妈同款｜家庭场景", format: "情景短剧", status: "stable" },
  { id: "7489005938863478351", productId: "glow-serum", title: "早八急救｜3 分钟", format: "教程演示", status: "stable" },
  { id: "7482994787796397234", productId: "sunscreen", title: "户外骑行｜汗测", format: "场景实测", status: "stable" },
  { id: "7600981374522188451", productId: "collagen-mask", title: "开箱测评｜质地展示", format: "测评", status: "observe" },
  { id: "7476883636729316117", productId: "glow-serum", title: "新达人试用｜首发", format: "UGC 口播", status: "observe" },
  { id: "7470772485662235096", productId: "glow-serum", title: "价格利益｜礼盒装", format: "产品特写", status: "observe" },
  { id: "7464661334595153979", productId: "collagen-mask", title: "沉浸开箱｜ASMR", format: "产品特写", status: "observe" },
  { id: "7458550183528072852", productId: "sunscreen", title: "换季提醒｜紫外线科普", format: "口播讲解", status: "observe" },
  { id: "7452439032460991735", productId: "hair-oil", title: "新方向测试｜理发师视角", format: "口播讲解", status: "observe" },
  { id: "7446327881393910618", productId: "hair-oil", title: "新方向测试｜出行护理", format: "场景实测", status: "observe" },
]

/** 用 id 派生稳定的伪随机数，避免 Math.random 造成 SSR/CSR 不一致 */
function hashRatio(seed: string, salt: number): number {
  let hash = salt
  for (let index = 0; index < seed.length; index++) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  return (hash % 1000) / 1000
}

function buildPassiveCreative(seed: (typeof PASSIVE_SEEDS)[number], index: number): CreativeDiagnosis {
  const product = productById(seed.productId)
  const stable = seed.status === "stable"
  const r1 = hashRatio(seed.id, 7)
  const r2 = hashRatio(seed.id, 13)
  const r3 = hashRatio(seed.id, 29)

  const roi = stable
    ? Number((product.targetRoi * (1.0 + r1 * 0.14)).toFixed(2))
    : Number((product.targetRoi * (0.72 + r1 * 0.5)).toFixed(2))
  const ctr = Number((product.benchmarkCtr * (stable ? 0.94 + r2 * 0.16 : 0.86 + r2 * 0.28)).toFixed(2))
  const cvr = Number((product.benchmarkCvr * (stable ? 0.95 + r3 * 0.14 : 0.88 + r3 * 0.26)).toFixed(2))
  const spend = stable ? Math.round(620 + r1 * 980) : Math.round(18 + r2 * 46)
  const orders = stable ? Math.round(22 + r3 * 46) : Math.round(1 + r1 * 3)
  const ageDays = stable ? 6 + Math.round(r2 * 18) : 1 + Math.round(r3 * 2)

  const spendNeeded = Math.round(30 + r1 * 40)
  const ordersNeeded = Math.max(1, 5 - orders)
  const hoursLeft = 6 + Math.round(r2 * 18)

  return {
    id: seed.id,
    productId: seed.productId,
    title: seed.title,
    format: seed.format,
    accent: ACCENTS[index % ACCENTS.length],
    ageDays,
    sample: stable ? "充分" : "不足",
    confidence: stable ? 88 + Math.round(r3 * 8) : 38 + Math.round(r1 * 22),
    spend,
    gmv: Math.round(spend * roi),
    orders,
    roi,
    targetRoi: product.targetRoi,
    benchmarkOrders: stable ? 44 : 44,
    ctr,
    benchmarkCtr: product.benchmarkCtr,
    cvr,
    benchmarkCvr: product.benchmarkCvr,
    status: seed.status,
    protection: seed.protection,
    reason: seed.protection
      ? "素材链路正常，ROI 缺口不来自素材"
      : stable
        ? "素材链路正常，ROI 已达到商品目标"
        : "样本不足，暂时不能判断方向",
    evidence: seed.protection
      ? "CTR Index 1.01、CVR Index 1.01 均 ≥ 0.90，问题在客单价"
      : stable
        ? "CTR、CVR 与订单趋势均未显著下降"
        : `距离有效判断还差约 $${spendNeeded} 消耗或 ${ordersNeeded} 个订单`,
    headline: seed.protection
      ? "不要再换素材了，问题不在这里"
      : stable
        ? "保持现状即可，系统会持续监控"
        : "还没到可判断的样本量",
    advice: seed.protection
      ? "跳转商品与投放诊断，优先检查价格、Offer 与商品组合"
      : stable
        ? "保持投放，72 小时后自动复查"
        : "继续观察，达到阈值后自动重新诊断",
    issueTag: seed.protection ? "非素材问题" : stable ? "稳定" : "学习中",
    impactScore: stable ? 30 + Math.round(r1 * 18) : 12 + Math.round(r2 * 14),
    sampleGap: stable ? undefined : { spendNeeded, ordersNeeded, hoursLeft },
    nextReviewAt: stable ? `${12 + Math.round(r3 * 48)} 小时后自动复查` : undefined,
    nextPlan: stable
      ? { action: "不修改 GMV Max 配置，仅创建 72h 自动复查任务", observation: "指标越界后自动生成新的待处理任务" }
      : { action: "维持当前投放，不做任何素材动作", observation: `预计 ${hoursLeft} 小时后可给出结论` },
  }
}

/**
 * 建议关停的取证上下文全部派生，不手写：
 * 窗口 2 用当前实际值，窗口 1 用略好但同样低于止损线的值，证明「连续两个窗口未恢复」；
 * 跨商品占用与供给变化按素材 id 稳定派生，避免每次渲染跳动。
 */
function withStopContext(creative: CreativeDiagnosis): CreativeDiagnosis {
  if (creative.status !== "stop") return creative

  const r = hashRatio(creative.id, 41)
  const prevRoi = Number((creative.roi * (1.08 + r * 0.16)).toFixed(2))
  const productCreatives = CREATIVE_COUNT_BY_PRODUCT.get(creative.productId) ?? 1
  const otherProducts = PRODUCTS.filter((product) => product.id !== creative.productId)
  const usageCount = r > 0.6 ? 2 : r > 0.3 ? 1 : 0

  return {
    ...creative,
    windows: [
      {
        label: "窗口 1 · 前 3 日",
        roi: prevRoi,
        ctr: Number((creative.ctr * 1.06).toFixed(2)),
        cvr: Number((creative.cvr * 1.05).toFixed(2)),
        spend: Math.round(creative.spend * 0.72),
        orders: Math.max(1, creative.orders - 1),
      },
      {
        label: "窗口 2 · 近 3 日",
        roi: creative.roi,
        ctr: creative.ctr,
        cvr: creative.cvr,
        spend: creative.spend,
        orders: creative.orders,
      },
    ],
    supplyAfterStop: { before: productCreatives, after: productCreatives - 1, min: 6 },
    otherProductUsage: otherProducts.slice(0, usageCount).map((product, index) => ({
      productId: product.id,
      roi: Number((product.targetRoi * (0.95 + hashRatio(creative.id + product.id, 53 + index) * 0.5)).toFixed(2)),
      status: hashRatio(creative.id + product.id, 67) > 0.5 ? ("stable" as const) : ("observe" as const),
    })),
  }
}

const BASE_CREATIVES: CreativeDiagnosis[] = [...ACTIONABLE_CREATIVES, ...PASSIVE_SEEDS.map(buildPassiveCreative)]

/** 商品维度的可投素材数，供关停的供给影响预警使用 */
const CREATIVE_COUNT_BY_PRODUCT = new Map<string, number>(
  PRODUCTS.map((product) => [product.id, BASE_CREATIVES.filter((item) => item.productId === product.id).length])
)

export const CREATIVES: CreativeDiagnosis[] = BASE_CREATIVES.map(withStopContext).sort(
  (a, b) => b.impactScore - a.impactScore
)

export function creativesByProduct(productId: string) {
  return CREATIVES.filter((creative) => creative.productId === productId)
}

export function countByStatus(creatives: CreativeDiagnosis[]) {
  return creatives.reduce<Record<DecisionStatus, number>>(
    (acc, creative) => {
      acc[creative.status] += 1
      return acc
    },
    { scale: 0, stable: 0, observe: 0, iterate: 0, refresh: 0, stop: 0 }
  )
}

// ─── 素材链路与迭代变量 ──────────────────────────────────────────────────────

export type LinkStage = "hook" | "scene" | "proof" | "offer"

/** 素材四环：点击前两环由 CTR 反映，点击后两环由 CVR 反映 */
export const LINK_CHAIN: Array<{ key: LinkStage; label: string; question: string; metric: "ctr" | "cvr" }> = [
  { key: "hook", label: "前 3 秒 Hook", question: "用户会不会停下来", metric: "ctr" },
  { key: "scene", label: "场景 / 人物", question: "用户会不会继续看", metric: "ctr" },
  { key: "proof", label: "卖点与证明", question: "用户信不信", metric: "cvr" },
  { key: "offer", label: "Offer / CTA", question: "用户下不下单", metric: "cvr" },
]

export type IterationLevel = "primary" | "secondary" | "ok"

/**
 * 迭代优先级判定。
 *
 * CTR / CVR 只能定位到「点击前」或「点击后」，无法区分具体是哪一环，所以分主次而不是一律标红：
 * CTR < 0.90 → Hook 主迭代（前 3 秒是点击率最强因子），场景 / 人物次迭代；
 * CVR < 0.90 → 卖点与证明主迭代，Offer / CTA 次迭代。
 */
export function iterationLevels(creative: CreativeDiagnosis): Record<LinkStage, IterationLevel> {
  const levels: Record<LinkStage, IterationLevel> = { hook: "ok", scene: "ok", proof: "ok", offer: "ok" }
  if (ctrIndex(creative) < 0.9) {
    levels.hook = "primary"
    levels.scene = "secondary"
  }
  if (cvrIndex(creative) < 0.9) {
    levels.proof = "primary"
    levels.offer = "secondary"
  }
  return levels
}

/** 主迭代环，用于决定哪些迭代变量打「主迭代」标 */
export function primaryIterationStages(creative: CreativeDiagnosis): LinkStage[] {
  const levels = iterationLevels(creative)
  return (Object.keys(levels) as LinkStage[]).filter((stage) => levels[stage] === "primary")
}

export type IterationVariable = {
  key: string
  label: string
  desc: string
  /** 改这个变量主要想拉回哪个指标 */
  targetMetric: "ctr" | "cvr"
  stage: LinkStage
  /** 被锁定保留的部分，保证单变量验证 */
  locked: string[]
}

/**
 * 迭代变量：收敛到 5 个可独立 brief、可归因的杠杆。
 *
 * 不再把 Hook 拆成「文案 / 首帧 / 节奏」——一个 Hook 是一个完整概念，换开场话术必然带着
 * 首帧画面和节奏一起换，拆开既没法给设计师下 brief，在 48h + 5 单的判赢门槛下也跑不出
 * 区分度。同理，卖点顺序并入证明方式，Offer 呈现与 CTA 合成同一个结尾卡。
 */
export const ITERATION_VARIABLES: IterationVariable[] = [
  {
    key: "hook",
    label: "换 Hook",
    desc: "整体替换前 3 秒：开场话术、首帧画面与节奏一起换",
    targetMetric: "ctr",
    stage: "hook",
    locked: ["正文", "卖点", "Offer", "CTA"],
  },
  {
    key: "talent",
    label: "换出镜达人",
    desc: "换人不换脚本，验证达人与商品的匹配度",
    targetMetric: "ctr",
    stage: "scene",
    locked: ["脚本结构", "卖点", "Offer"],
  },
  {
    key: "scene",
    label: "换场景",
    desc: "换拍摄环境与画面氛围，人物与台词保持",
    targetMetric: "ctr",
    stage: "scene",
    locked: ["人物", "台词", "Offer"],
  },
  {
    key: "proof",
    label: "换卖点与证明",
    desc: "换主打卖点及其支撑证据的形态",
    targetMetric: "cvr",
    stage: "proof",
    locked: ["Hook", "人物", "Offer"],
  },
  {
    key: "cta",
    label: "换 Offer 与 CTA 呈现",
    desc: "换结尾卡的利益点表达与行动指令，不改优惠本身",
    targetMetric: "cvr",
    stage: "offer",
    locked: ["Hook", "正文", "价格"],
  },
]

/** 可放量的爆款衍生：PRD 限定一次只改 Hook、达人或场景中的一个 */
export const DERIVATION_VARIABLE_KEYS = ["hook", "talent", "scene"]
export const DERIVATION_VARIABLES = ITERATION_VARIABLES.filter((item) => DERIVATION_VARIABLE_KEYS.includes(item.key))

export function variableByKey(key: string) {
  return ITERATION_VARIABLES.find((item) => item.key === key)
}

// ─── 候选方案卡（带封面，hover 看完整脚本） ──────────────────────────────────

export type OptionSource = "platform" | "market" | "competitor" | "own" | "upload" | "link"

export const OPTION_SOURCE_META: Record<OptionSource, { label: string; className: string }> = {
  platform: { label: "平台推荐", className: "bg-[var(--lime-soft)] text-[#5c7a00]" },
  market: { label: "市场爆款", className: "bg-blue-50 text-blue-700" },
  competitor: { label: "竞对爆款", className: "bg-amber-50 text-amber-800" },
  own: { label: "自有爆款", className: "bg-emerald-50 text-emerald-700" },
  upload: { label: "本地上传", className: "bg-zinc-100 text-zinc-700" },
  link: { label: "视频链接", className: "bg-zinc-100 text-zinc-700" },
}

export type CreativeOption = {
  key: string
  /** 卡片左上角的套路分类 */
  category: string
  title: string
  desc: string
  /** hover 浮层里的完整脚本 */
  script: string
  cover: string
  source: OptionSource
  /** 平台按变量推荐时，标记这条方案属于哪个变量；引用进来的没有此字段 */
  variableKey?: string
}

type OptionSeed = Pick<CreativeOption, "category" | "title" | "desc" | "script">

/** 每个迭代变量对应的候选套路库 */
const OPTION_POOL: Record<string, OptionSeed[]> = {
  hook: [
    { category: "结果先出", title: "7 天后的脸", desc: "开口就把使用结果摆出来，用疑问句留住人", script: "「用了 7 天后，毛孔真的小了吗？」——先给第 7 天的素颜特写，再倒回第 1 天，全程不提品牌名。" },
    { category: "痛点冲突", title: "越控油越出油", desc: "用反直觉冲突制造停留，指向常见误区", script: "「越控油越出油，你可能一直做错了」——先展示一张油光特写，再切到正确护理动作，制造认知反差。" },
    { category: "价格利益", title: "一杯咖啡的浓度", desc: "把单次成本换算成日常消费，降低决策门槛", script: "「不到一杯咖啡的钱，测一次 10% 烟酰胺」——用咖啡杯和产品同框对比，直接给出单次成本。" },
    { category: "反常识", title: "别再早晚都用", desc: "否定一个流行做法，引出正确用法", script: "「别再早晚都用精华了」——先否定高频误区，再给出频次建议，把观点变成留人钩子。" },
    { category: "转场揭晓", title: "响指揭晓", desc: "自信人物用充满表现力的动作亮出产品", script: "人物直视镜头打响指，画面瞬间转场，产品出现在手中，随后进入卖点介绍。节奏卡在音乐重拍上。" },
    { category: "奇观吸睛", title: "极限场景推销", desc: "跳伞场景突然转为空中产品亮相", script: "跳伞镜头急速下坠，在半空中画面定格，产品在云层间亮相，用强反差制造记忆点。" },
  ],
  talent: [
    { category: "素人自拍", title: "第一人称真实感", desc: "手持自拍、无脚本感的真实分享", script: "素人手持手机自拍，光线为家中自然光，语速偏快，全程无提词器感。脚本结构完全沿用原素材。" },
    { category: "专业背书", title: "皮肤科视角", desc: "由专业人设讲解成分与机理", script: "白大褂人设出镜，先讲成分浓度与作用机理，再给使用建议，语速平稳。卖点顺序不变。" },
    { category: "达人实测", title: "中腰部达人 7 天记录", desc: "由达人做连续记录式测评", script: "达人固定机位每天记录一次，最后拼成 7 天变化合集，标注日期水印。" },
  ],
  scene: [
    { category: "浴室日常", title: "洗漱台护肤动线", desc: "还原真实的洗漱台使用场景", script: "镜头架在洗漱台镜前，跟随洗脸—擦干—上精华的完整动线，背景保留真实生活杂物。" },
    { category: "通勤补妆", title: "车里的碎片时间", desc: "把使用场景放进通勤缝隙", script: "车内后视镜视角，人物利用等红灯的间隙快速补涂，强调便携与快速吸收。" },
    { category: "户外自然光", title: "阳台真实光线", desc: "用自然光呈现肤质细节", script: "阳台侧逆光，镜头贴近拍摄肤质细节，不加滤镜，强调真实质感。" },
  ],
  proof: [
    { category: "效果先行", title: "先结果再成分", desc: "把效果画面提到成分讲解之前", script: "前 5 秒只给结果对比画面，第 6 秒才引出 10% 烟酰胺的浓度说明，用结果换取继续观看。" },
    { category: "实测对比", title: "同机位前后对比", desc: "固定机位消除拍摄差异带来的质疑", script: "三脚架固定机位，同光线同角度拍摄使用前后，画面并排展示并标注天数。" },
    { category: "权威证书", title: "检测报告特写", desc: "用第三方报告承接信任", script: "镜头推近第三方检测报告的关键结论行，配合成分含量数字的动态高亮。" },
    { category: "UGC 合集", title: "多人真实短评", desc: "用数量堆叠可信度", script: "拼接 5 位真实用户的 3 秒短评，保留原始画质与环境音，不做统一调色。" },
  ],
  cta: [
    { category: "限时折扣", title: "倒计时叠加价格", desc: "把优惠和时间压力绑定在结尾卡", script: "画面右上角常驻倒计时，价格数字在结尾从原价滚动到活动价，口播「现在点左下角」。" },
    { category: "买赠组合", title: "加赠小样展示", desc: "用赠品提升到手价值感", script: "把正装与赠品小样一起摆放入镜，逐件点数并口播到手总价值，最后落到购物车图标。" },
    { category: "库存告急", title: "库存数字跳动", desc: "用稀缺感推动即时下单", script: "结尾叠加剩余库存数字并做轻微跳动动画，口播提醒可能售罄。" },
    { category: "路径演示", title: "直接演示下单", desc: "把操作路径拍给用户看，消除犹豫", script: "录屏演示从视频页到购物车的完整点击路径，配合新客立减弹窗展示。" },
  ],
}

/** 按变量取候选方案，封面用与仓内一致的确定性占位图 */
export function getOptionsForVariable(variableKey: string, seedPrefix: string): CreativeOption[] {
  const pool = OPTION_POOL[variableKey] ?? []
  return pool.map((seed, index) => ({
    ...seed,
    key: `${variableKey}-${index}`,
    cover: `https://picsum.photos/seed/${seedPrefix}_${variableKey}_${index}/360/640`,
    source: "platform" as const,
    variableKey,
  }))
}

/** 需换新的方向卡：在既有 directions 上补封面与套路分类 */
export function getDirectionOptions(creative: CreativeDiagnosis): CreativeOption[] {
  const categoryByKey: Record<string, string> = { talent: "人设重做", scene: "场景重做", structure: "结构重做" }
  return (creative.directions ?? []).map((direction, index) => ({
    key: direction.key,
    category: categoryByKey[direction.key] ?? "方向重做",
    title: direction.label,
    desc: direction.desc,
    script: `${direction.desc}。只保留商品、品牌与合规约束，不继承原素材的 Hook、场景与表达结构。`,
    cover: `https://picsum.photos/seed/${creative.id}_dir_${index}/360/640`,
    source: "platform" as const,
  }))
}

// ─── 稳定投放：复查与越界规则 ────────────────────────────────────────────────

export const STABLE_REVIEW_WINDOWS = [24, 48, 72, 168]
export const STABLE_REVIEW_DEFAULT = 72

export const STABLE_BREACH_RULES: Array<{ key: string; label: string; threshold: string }> = [
  { key: "roi", label: "ROI Index", threshold: "< 1.00" },
  { key: "ctr", label: "CTR Index", threshold: "< 0.90" },
  { key: "cvr", label: "CVR Index", threshold: "< 0.90" },
  { key: "volatility", label: "近 3 日 ROI / CTR 波动", threshold: "> 15%" },
]

/** 把越界规则跟当前素材的实际值配上，做成只读对照表 */
export function stableBreachStatus(creative: CreativeDiagnosis) {
  const volatility = 4 + Math.round(hashRatio(creative.id, 83) * 9)
  const values: Record<string, { current: string; ok: boolean }> = {
    roi: { current: roiIndex(creative).toFixed(2), ok: roiIndex(creative) >= 1 },
    ctr: { current: ctrIndex(creative).toFixed(2), ok: ctrIndex(creative) >= 0.9 },
    cvr: { current: cvrIndex(creative).toFixed(2), ok: cvrIndex(creative) >= 0.9 },
    volatility: { current: `${volatility}%`, ok: volatility <= 15 },
  }
  return STABLE_BREACH_RULES.map((rule) => ({ ...rule, ...values[rule.key] }))
}

// ─── 待观察：样本门槛与数据质量 ──────────────────────────────────────────────

export const SAMPLE_MATURITY_RULE = "Active Time ≥ 24h 且 Orders ≥ 5，或 Spend ≥ 2 × Target CPA"

export type DataQualityCheck = { key: string; label: string; desc: string; ok: boolean }

/** 数据质量未通过时结果强制待观察，并禁止关停与生成 */
export function dataQualityFor(creative: CreativeDiagnosis): DataQualityCheck[] {
  const delayed = hashRatio(creative.id, 97) > 0.55
  return [
    { key: "auth", label: "账户授权", desc: "TikTok Ads 与 Shop 授权均有效", ok: true },
    { key: "fields", label: "字段完整性", desc: "展现、点击、订单、GMV 字段无缺失", ok: true },
    { key: "delay", label: "数据回传", desc: delayed ? "近 2 小时回传延迟，指标可能偏低" : "回传正常，最近一次同步 12 分钟前", ok: !delayed },
    { key: "attribution", label: "订单归因", desc: "归因窗口内无未结算订单", ok: true },
  ]
}

/** 待观察时被系统禁用的动作，页面必须说明原因 */
export const OBSERVE_BLOCKED_ACTIONS = [
  { label: "确认关停", reason: "样本不足时关停会误杀仍在学习期的素材" },
  { label: "生成变体", reason: "尚未定位到弱环，改哪一环都缺少依据" },
  { label: "生成新方向", reason: "还没有证据说明原方向失效" },
]

/** 今日诊断摘要：待处理数量与预计可减少的无效消耗（Mock 预估） */
export const DECISION_SUMMARY = {
  riskSpendPerDay: 680,
  isEstimated: true,
}

/** Benchmark 口径：默认同商品同国家近 7 日成熟素材去极值均值 */
export const BENCHMARK_SCOPE = {
  label: "同商品 · 同国家 · 近 7 天成熟素材",
  sampleSize: 8,
  fallbackLevel: "未回退（样本充足）",
  excludeSelf: true,
  updatedAt: "12 分钟前",
  note: "样本不足 5 条时扩展至近 14 日，仍不足则回退到同账户同品类",
}

// ─── 指标计算（统一口径，前端只展示不复算规则） ───────────────────────────────

export function roiIndex(creative: CreativeDiagnosis) {
  return creative.roi / creative.targetRoi
}
export function ctrIndex(creative: CreativeDiagnosis) {
  return creative.ctr / creative.benchmarkCtr
}
export function cvrIndex(creative: CreativeDiagnosis) {
  return creative.cvr / creative.benchmarkCvr
}
/** 指数转成「↑34%」「↓23%」这类相对差值 */
export function indexDelta(index: number) {
  return Math.round((index - 1) * 100)
}

// ─── 投放中心 ────────────────────────────────────────────────────────────────

export type DeliveryIntent = {
  id: string
  title: string
  productId: string
  sourceCreativeId: string
  sourceStatus: DecisionStatus
  /** 选中的素材，第一条为原素材 */
  creatives: Array<{ id: string; label: string; kind: "origin" | "variant"; selected: boolean }>
  targetRoi: number
  dailyBudget: number
  observationHours: number
  winOrders: number
  stopRoi: number
  createdAt: string
}

export type LiveDelivery = {
  id: string
  name: string
  productId: string
  account: string
  status: "learning" | "delivering" | "limited"
  spend: number
  gmv: number
  orders: number
  roi: number
  targetRoi: number
  dailyBudget: number
  creativeCount: number
  recommendation: DeliveryRecommendation
  reason: string
  updatedAt: string
  /** 抽屉里的三条实时证据 */
  evidences: Array<{ label: string; value: string; hint: string; tone: "good" | "bad" | "default" }>
  /** 调整前后值 */
  changes: Array<{ label: string; before: string; after: string }>
  /** 触发条件说明，保证建议可解释 */
  trigger: string
  /** 需要毛利安全线时的约束说明 */
  constraint?: string
}

export type DeliveryRecommendation = "scale" | "hold" | "lower_target" | "supply" | "stop"

export const DELIVERY_RECOMMENDATION_META: Record<
  DeliveryRecommendation,
  { label: string; action: string; className: string; tone: "good" | "warn" | "info" | "danger" }
> = {
  scale: { label: "建议放量", action: "创建调整方案", className: "bg-emerald-50 text-emerald-700", tone: "good" },
  hold: { label: "保持投放", action: "继续观察", className: "bg-zinc-100 text-zinc-700", tone: "info" },
  lower_target: { label: "调整目标 ROI", action: "确认调整目标", className: "bg-blue-50 text-blue-700", tone: "info" },
  supply: { label: "补充素材", action: "去补充素材", className: "bg-amber-50 text-amber-800", tone: "warn" },
  stop: { label: "建议止损", action: "确认止损", className: "bg-red-50 text-red-700", tone: "danger" },
}

function variantSet(originId: string, labels: string[]) {
  return [
    { id: originId, label: "原素材", kind: "origin" as const, selected: true },
    ...labels.map((label, index) => ({
      id: `V-${String.fromCharCode(65 + index)}`,
      label,
      kind: "variant" as const,
      selected: true,
    })),
  ]
}

export const BASE_DELIVERY_DRAFTS: DeliveryIntent[] = [
  {
    id: "draft-scale-serum",
    title: "烟酰胺精华｜爆款衍生放量",
    productId: "glow-serum",
    sourceCreativeId: "7626360624905601032",
    sourceStatus: "scale",
    creatives: variantSet("7626360624905601032", ["同结构换达人", "同结构换场景", "同结构换 Hook"]),
    targetRoi: 1.8,
    dailyBudget: 3200,
    observationHours: 24,
    winOrders: 10,
    stopRoi: 1.62,
    createdAt: "今天 10:24",
  },
  {
    id: "draft-hook-mask",
    title: "胶原蛋白面膜｜Hook 变体测试",
    productId: "collagen-mask",
    sourceCreativeId: "7637401399248076818",
    sourceStatus: "iterate",
    creatives: variantSet("7637401399248076818", ["结果先出", "痛点冲突", "价格利益"]),
    targetRoi: 1.8,
    dailyBudget: 1800,
    observationHours: 48,
    winOrders: 5,
    stopRoi: 1.4,
    createdAt: "今天 09:18",
  },
]

export const LIVE_DELIVERIES: LiveDelivery[] = [
  {
    id: "live-serum",
    name: "GL-Serum-US-Scale-01",
    productId: "glow-serum",
    account: "GlowLab-US-Main-01",
    status: "delivering",
    spend: 4860,
    gmv: 12830,
    orders: 342,
    roi: 2.64,
    targetRoi: 1.8,
    dailyBudget: 3200,
    creativeCount: 8,
    recommendation: "scale",
    reason: "ROI 连续 3 日高于目标 47%，素材供给健康",
    updatedAt: "8 分钟前",
    trigger: "连续 3 个自然日 ROI ≥ 目标 × 1.20、日订单 ≥ 10、可投素材 ≥ 6，且 CTR/CVR 降幅均未超过 15%",
    evidences: [
      { label: "ROI / 目标", value: "2.64", hint: "目标 1.80 · 超出 47%", tone: "good" },
      { label: "日均订单", value: "114", hint: "连续 3 日 ≥ 10", tone: "good" },
      { label: "素材供给", value: "8 条", hint: "≥ 6 条，供给健康", tone: "good" },
    ],
    changes: [
      { label: "每日预算", before: "$3.2K", after: "$4.0K" },
      { label: "目标 ROI", before: "1.80", after: "1.80（不变）" },
    ],
  },
  {
    id: "live-mask",
    name: "GL-Mask-US-AlwaysOn",
    productId: "collagen-mask",
    account: "GlowLab-US-Main-02",
    status: "limited",
    spend: 3290,
    gmv: 5001,
    orders: 148,
    roi: 1.52,
    targetRoi: 1.8,
    dailyBudget: 2200,
    creativeCount: 5,
    recommendation: "supply",
    reason: "CTR 下滑造成学习受限，先补 3 个 Hook 变体再谈预算",
    updatedAt: "12 分钟前",
    trigger: "近 3 日 CTR 较前窗口下降 ≥ 20%、CVR ≥ Benchmark × 0.90，且可投素材少于 6 条",
    evidences: [
      { label: "CTR 变化", value: "-24%", hint: "0.71% → 0.54%", tone: "bad" },
      { label: "CVR / 基准", value: "3.80%", hint: "基准 3.69% · 正常", tone: "good" },
      { label: "素材供给", value: "5 条", hint: "少于 6 条，供给不足", tone: "bad" },
    ],
    changes: [{ label: "素材池", before: "5 条", after: "8 条（+3 Hook 变体）" }],
    constraint: "本次不调整预算与目标 ROI，避免在素材供给不足时放大亏损",
  },
  {
    id: "live-spf",
    name: "GL-SPF-US-Core",
    productId: "sunscreen",
    account: "GlowLab-US-Main-01",
    status: "delivering",
    spend: 2980,
    gmv: 4351,
    orders: 128,
    roi: 1.46,
    targetRoi: 1.8,
    dailyBudget: 2000,
    creativeCount: 6,
    recommendation: "lower_target",
    reason: "素材链路正常，建议把目标 ROI 调整到毛利安全线之上的 1.65",
    updatedAt: "16 分钟前",
    trigger: "连续 3 日消耗受限、CTR/CVR 正常、实际 ROI 位于目标的 80%～95%；建议值 = max(近 7 日稳定 ROI P25, 毛利安全线)",
    evidences: [
      { label: "ROI / 目标", value: "1.46", hint: "目标 1.80 · 达成 81%", tone: "bad" },
      { label: "素材链路", value: "正常", hint: "CTR、CVR 均 ≈ 基准", tone: "good" },
      { label: "毛利安全线", value: "1.58", hint: "建议值不得低于此线", tone: "default" },
    ],
    changes: [{ label: "目标 ROI", before: "1.80", after: "1.65" }],
    constraint: "1.65 高于毛利安全线 1.58，可执行；毛利数据缺失时将禁用确认",
  },
  {
    id: "live-hair",
    name: "GL-Hair-US-Test-02",
    productId: "hair-oil",
    account: "GlowLab-US-Test-01",
    status: "limited",
    spend: 1180,
    gmv: 897,
    orders: 21,
    roi: 0.76,
    targetRoi: 1.8,
    dailyBudget: 900,
    creativeCount: 3,
    recommendation: "stop",
    reason: "连续两个诊断窗口 ROI 低于止损线 1.40",
    updatedAt: "21 分钟前",
    trigger: "订单 ≥ 5 或 Spend ≥ 目标 CPA × 3，且连续 2 个诊断窗口 ROI < 止损 ROI；数据异常时不触发",
    evidences: [
      { label: "ROI / 止损线", value: "0.76", hint: "止损 1.40 · 连续 2 窗口低于", tone: "bad" },
      { label: "累计消耗", value: "$1.2K", hint: "目标 CPA × 3 已达成", tone: "bad" },
      { label: "素材供给", value: "3 条", hint: "2 条已建议关停", tone: "bad" },
    ],
    changes: [
      { label: "每日预算", before: "$900", after: "$0（暂停）" },
      { label: "素材池", before: "3 条", after: "移出 2 条无效素材" },
    ],
    constraint: "暂停后计划与素材均可恢复，操作写入审计记录",
  },
]

export const DELIVERY_ADJUSTMENTS: Array<{
  id: string
  time: string
  action: string
  campaign: string
  result: string
  tone: "good" | "wait" | "bad"
  operator: string
}> = [
  { id: "adj-1", time: "今天 14:32", action: "日预算 $2.4K → $3.2K", campaign: "GL-Serum-US-Scale-01", result: "已生效", tone: "good", operator: "陈昊" },
  { id: "adj-2", time: "今天 11:08", action: "补充 3 条 Hook 变体", campaign: "GL-Mask-US-AlwaysOn", result: "生成中", tone: "wait", operator: "林悦" },
  { id: "adj-3", time: "昨天 19:42", action: "移除 2 条低效素材", campaign: "GL-Hair-US-Test-02", result: "风险消耗 -$310 / 日", tone: "good", operator: "系统" },
  { id: "adj-4", time: "昨天 16:20", action: "目标 ROI 1.80 → 1.65", campaign: "GL-SPF-US-Core", result: "已生效 · 高于毛利安全线", tone: "good", operator: "王琦" },
  { id: "adj-5", time: "昨天 09:55", action: "发布 Hook 变体测试", campaign: "GL-Mask-US-HookTest", result: "授权失效，已重试成功", tone: "bad", operator: "林悦" },
]

/** 投放中心顶部 KPI（素材覆盖健康度 = 可投素材 ≥ 6 条的在投商品数 / 在投商品总数） */
export const DELIVERY_HEALTH = {
  coverageReady: 3,
  coverageTotal: 4,
  gmvOpportunity: 3300,
  isEstimated: true,
}

// ─── 任务记录 ────────────────────────────────────────────────────────────────

export type TaskStage = "generating" | "ready" | "observing" | "validated" | "failed"

export const TASK_STAGE_META: Record<TaskStage, { label: string; className: string }> = {
  generating: { label: "生成中", className: "bg-indigo-50 text-indigo-700" },
  ready: { label: "待投放", className: "bg-blue-50 text-blue-700" },
  observing: { label: "观察中", className: "bg-amber-50 text-amber-800" },
  validated: { label: "已验证", className: "bg-emerald-50 text-emerald-700" },
  failed: { label: "有阻塞", className: "bg-red-50 text-red-700" },
}

export type ClosedLoopTask = {
  id: string
  title: string
  productName: string
  source: string
  stage: TaskStage
  progress: number
  result: string
  updatedAt: string
  /** 全过程时间线 */
  timeline: Array<{ time: string; label: string; detail: string; state: "done" | "current" | "todo" | "error" }>
  /** 回流对比：原素材 vs 变体 */
  comparison?: Array<{ name: string; roi: number; ctr: number; orders: number; winner?: boolean; nextStatus: DecisionStatus }>
  /** 阻塞原因 */
  blocker?: string
}

export const INITIAL_CLOSED_LOOP_TASKS: ClosedLoopTask[] = [
  {
    id: "task-01",
    title: "胶原蛋白面膜 Hook 变体测试",
    productName: "GlowLab 胶原蛋白面膜",
    source: "需迭代",
    stage: "observing",
    progress: 64,
    result: "V-B 暂时领先，ROI 2.12",
    updatedAt: "12 分钟前",
    timeline: [
      { time: "08-02 09:18", label: "诊断命中需迭代", detail: "CTR 低于 Benchmark 23%，CVR 正常", state: "done" },
      { time: "08-02 09:24", label: "生成 3 个 Hook 变体", detail: "锁定卖点与 Offer，仅替换前 3 秒", state: "done" },
      { time: "08-02 10:02", label: "加入 GMV Max 素材池", detail: "商品：胶原蛋白面膜 · 4 条素材", state: "done" },
      { time: "08-02 10:03", label: "首轮观察 48 小时", detail: "判赢线 ROI ≥ 1.80 且订单 ≥ 5", state: "current" },
      { time: "—", label: "结果回流", detail: "同口径比较原素材与变体后更新诊断", state: "todo" },
    ],
    comparison: [
      { name: "原素材 7637401…", roi: 1.74, ctr: 0.62, orders: 43, nextStatus: "iterate" },
      { name: "V-A 结果先出", roi: 1.86, ctr: 0.78, orders: 21, nextStatus: "stable" },
      { name: "V-B 痛点冲突", roi: 2.12, ctr: 0.89, orders: 26, winner: true, nextStatus: "scale" },
      { name: "V-C 价格利益", roi: 1.52, ctr: 0.7, orders: 14, nextStatus: "iterate" },
    ],
  },
  {
    id: "task-02",
    title: "烟酰胺精华爆款衍生",
    productName: "GlowLab 10% 烟酰胺精华",
    source: "可放量",
    stage: "ready",
    progress: 100,
    result: "3 个变体已生成，等待加入投放",
    updatedAt: "28 分钟前",
    timeline: [
      { time: "08-04 10:12", label: "诊断命中可放量", detail: "ROI 高于目标 34%，订单高于均值 22%", state: "done" },
      { time: "08-04 10:20", label: "生成 3 个同结构变体", detail: "一次只改一个变量：达人 / 场景 / Hook", state: "done" },
      { time: "08-04 10:24", label: "等待投放确认", detail: "商品层预算建议 +20%，需 AO 确认", state: "current" },
      { time: "—", label: "首轮观察 24 小时", detail: "ROI 低于目标 90% 时自动停止放量", state: "todo" },
    ],
  },
  {
    id: "task-03",
    title: "修护发油素材止损",
    productName: "GlowLab 修护发油",
    source: "建议关停",
    stage: "validated",
    progress: 100,
    result: "已移出 2 条素材，风险消耗下降 $310 / 日",
    updatedAt: "1 小时前",
    timeline: [
      { time: "08-03 19:36", label: "诊断命中建议关停", detail: "连续两个窗口低于止损线", state: "done" },
      { time: "08-03 19:42", label: "AO 二次确认后执行", detail: "仅移出当前商品素材池，素材资产保留", state: "done" },
      { time: "08-03 19:42", label: "写入审计记录", detail: "operator 王琦 · request_id 7f21c9 · 可恢复", state: "done" },
      { time: "08-04 07:40", label: "结果回流验证", detail: "风险消耗下降 $310 / 日，无 GMV 损失", state: "done" },
    ],
  },
  {
    id: "task-04",
    title: "防晒霜 Offer 诊断",
    productName: "GlowLab SPF50 防晒霜",
    source: "非素材问题",
    stage: "failed",
    progress: 40,
    result: "等待商品折扣配置同步",
    updatedAt: "2 小时前",
    blocker: "商品毛利数据缺失，目标 ROI 调整确认已被阻断",
    timeline: [
      { time: "08-04 06:10", label: "识别非素材问题", detail: "CTR / CVR 均达标，AOV 下降 18%", state: "done" },
      { time: "08-04 06:12", label: "禁用素材动作", detail: "生成变体、生成新方向与关停均置灰", state: "done" },
      { time: "08-04 06:15", label: "等待商品成本同步", detail: "毛利安全线缺失，无法确认目标 ROI 调整", state: "error" },
    ],
  },
]

// ─── 通用格式化 ──────────────────────────────────────────────────────────────

export function formatMoney(value: number) {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`
  return `$${Math.round(value)}`
}

export function formatSignedPct(value: number) {
  if (value === 0) return "≈ 均值"
  return `${value > 0 ? "↑" : "↓"}${Math.abs(value)}%`
}
