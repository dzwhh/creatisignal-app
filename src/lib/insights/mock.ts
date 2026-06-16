// ─── Deterministic mock data for 素材洞察 v2 ────────────────────────────────
// Seeded with fixed values so SSR & client output identical data.

import type {
  Account,
  AccountGroup,
  AccountStatus,
  AccountTier,
  BrandKpi,
  BriefSeed,
  CpoReasonKey,
  DiagnosticIssue,
  ExperimentBatch,
  LifecyclePhase,
  MatchResult,
  MatchSignal,
  Material,
  MaterialAccountRow,
  MaterialAction,
  MaterialBucket,
  Region,
  ReplicaAxis,
  ReplicaCategory,
  ReplicaDirection,
  ReplicaProject,
  ReplicaProjectStatus,
  ScenePointCell,
  SelfProduct,
} from "./types"

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260527)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]
const pickN = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr]
  const out: T[] = []
  const take = Math.min(n, copy.length)
  for (let i = 0; i < take; i++) {
    const idx = Math.floor(rand() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}
const ri = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1))
const rf = (min: number, max: number, d = 2) => Number((min + rand() * (max - min)).toFixed(d))

// ─── Vocabulary ──────────────────────────────────────────────────────────────

const SKUS = ["ZF7899", "ZF8313", "ZF2002", "ZF5566", "ZF3344"]

const INDUSTRY_TAGS = ["工具户外", "汽车配件", "应急装备", "户外露营", "EDC 随身", "家居数码"]
const VIDEO_STYLE_TAGS = ["产品演示", "口播/对镜说话", "使用前后对比", "开箱视频", "UGC 自拍", "试用展示", "平铺摆拍", "教程/怎么做", "情景短剧", "达人测评"]
const SCENE_TAGS = ["修车/车库", "手机灯对比", "停电应急", "露营户外", "EDC 随身", "夜间维修", "户外野营", "家用应急"]
const SELLING_POINT_TAGS = ["磁吸", "高亮 1200LM", "续航", "多模式", "红光", "便携", "Type-C 快充", "双手解放", "防水", "UV/RGB", "夹扣设计"]
const STRUCTURE_TAGS = ["problem-solution", "demo", "before-after", "talking-head", "ugc", "comparison", "lifestyle", "tutorial", "unboxing", "review"]

// ─── Account ID generator ────────────────────────────────────────────────────

function genAccountId(seq: number) {
  // act_${10-digit num}
  const base = 1023400000 + seq * 137 + ri(0, 99)
  return `act_${base}`
}

// ─── Accounts (87 total) ─────────────────────────────────────────────────────

type AccountTemplate = {
  region: Region
  tier: AccountTier
  count: number
  statusDist: AccountStatus[] // sample from this list
  roiTargetRange: [number, number]
  budgetRange: [number, number]
}

const ACCOUNT_TEMPLATES: AccountTemplate[] = [
  { region: "US",  tier: "Main",  count: 12, statusDist: ["scaling", "scaling", "learning", "learning", "rewrite"],         roiTargetRange: [2.0, 2.3], budgetRange: [3000, 5500] },
  { region: "US",  tier: "Test",  count: 20, statusDist: ["learning", "learning", "rewrite", "paused", "paused", "paused"], roiTargetRange: [2.5, 3.3], budgetRange: [500, 1500]  },
  { region: "US",  tier: "Warm",  count: 10, statusDist: ["warming", "learning", "rewrite", "paused"],                       roiTargetRange: [2.8, 3.3], budgetRange: [300, 800]   },
  { region: "US",  tier: "Scale", count: 8,  statusDist: ["scaling", "scaling", "learning"],                                  roiTargetRange: [1.8, 2.2], budgetRange: [5000, 9000] },
  { region: "EU",  tier: "Main",  count: 8,  statusDist: ["scaling", "learning", "learning", "rewrite"],                      roiTargetRange: [2.0, 2.5], budgetRange: [2000, 4000] },
  { region: "EU",  tier: "Test",  count: 12, statusDist: ["learning", "rewrite", "paused", "paused", "paused"],               roiTargetRange: [2.5, 3.0], budgetRange: [400, 1000]  },
  { region: "SEA", tier: "Main",  count: 6,  statusDist: ["scaling", "learning", "rewrite"],                                  roiTargetRange: [1.8, 2.2], budgetRange: [1500, 3000] },
  { region: "SEA", tier: "Test",  count: 6,  statusDist: ["rewrite", "paused", "paused", "paused"],                            roiTargetRange: [2.3, 2.8], budgetRange: [300, 800]   },
  { region: "MX",  tier: "Main",  count: 5,  statusDist: ["learning", "rewrite", "paused", "paused"],                          roiTargetRange: [2.0, 2.6], budgetRange: [400, 1200]  },
]

export const ACCOUNTS: Account[] = (() => {
  const out: Account[] = []
  let seq = 1
  for (const tpl of ACCOUNT_TEMPLATES) {
    for (let i = 1; i <= tpl.count; i++) {
      const status = pick(tpl.statusDist)
      const id = genAccountId(seq++)
      const name = `Hotligh-${tpl.region}-${tpl.tier}-${i.toString().padStart(2, "0")}`
      const roiTarget = rf(tpl.roiTargetRange[0], tpl.roiTargetRange[1], 1)
      const dailyBudget = ri(tpl.budgetRange[0], tpl.budgetRange[1])

      // 7-day metrics — depend on status
      let spendFactor = 1
      let roiBase = 1.6
      if (status === "scaling")  { spendFactor = 0.95; roiBase = rf(2.0, 2.6, 2) }
      if (status === "learning") { spendFactor = 0.55; roiBase = rf(1.4, 1.9, 2) }
      if (status === "rewrite")  { spendFactor = 0.40; roiBase = rf(0.7, 1.3, 2) }
      if (status === "paused")   { spendFactor = 0.05; roiBase = rf(0.5, 1.2, 2) }
      if (status === "warming")  { spendFactor = 0.25; roiBase = rf(1.2, 1.8, 2) }

      const spend = Math.round(dailyBudget * 7 * spendFactor * rf(0.7, 1.0, 3))
      const ctr = rf(0.8, 5.2, 2) / 100
      const impressions = Math.round(spend * ri(800, 1600) / Math.max(roiBase, 0.8))
      const clicks = Math.round(impressions * ctr)
      const orders = Math.max(0, Math.round((spend * roiBase) / ri(35, 65)))
      const cpo = orders > 0 ? Number((spend / orders).toFixed(2)) : 0

      const suggestedTargetRoi =
        status === "rewrite" || status === "warming" ? rf(2.0, 2.2, 1) : undefined

      let diagnosis: string | undefined
      if (status === "rewrite") {
        diagnosis = `账户 ROI 持续低于目标。建议下调 target 至 ${suggestedTargetRoi}，并改写表现差素材的开头。`
      } else if (status === "scaling") {
        diagnosis = "ROI 达标且学习已稳定，可上调预算 +15~20% 持续放量。"
      } else if (status === "learning") {
        diagnosis = "学习期未满，请保持当前预算继续观察 2-3 天。"
      } else if (status === "warming") {
        diagnosis = "新账户养号期，预算保持低位，重点观察 CTR/CVR。"
      }

      out.push({
        id,
        name,
        region: tpl.region,
        tier: tpl.tier,
        channel: "GMV Max",
        status,
        roiTarget,
        dailyBudget,
        suggestedTargetRoi,
        diagnosis,
        metrics7d: {
          spend,
          impressions,
          clicks,
          ctr,
          orders,
          cpo,
          roi: roiBase,
        },
        topMaterialFingerprints: [],
        bottomMaterialFingerprints: [],
        groupIds: [],
      })
    }
  }
  return out
})()

// ─── Account groups (system + user) ──────────────────────────────────────────

export const ACCOUNT_GROUPS: AccountGroup[] = (() => {
  const byStatus = (s: AccountStatus) => ACCOUNTS.filter((a) => a.status === s).map((a) => a.id)
  return [
    { id: "g_all",      name: "全部账户",  type: "system", accountIds: ACCOUNTS.map((a) => a.id),       emoji: "📁" },
    { id: "g_scaling",  name: "可放量",    type: "system", accountIds: byStatus("scaling"),              emoji: "🟢" },
    { id: "g_learning", name: "学习中",    type: "system", accountIds: byStatus("learning"),             emoji: "🟡" },
    { id: "g_rewrite",  name: "需改写",    type: "system", accountIds: byStatus("rewrite"),              emoji: "🟠" },
    { id: "g_paused",   name: "已停用",    type: "system", accountIds: byStatus("paused"),               emoji: "⚪" },
    { id: "g_warming",  name: "养号中",    type: "system", accountIds: byStatus("warming"),              emoji: "🔵" },

    { id: "g_us_main",   name: "US 主账户", type: "user", accountIds: ACCOUNTS.filter((a) => a.region === "US" && a.tier === "Main").map((a) => a.id),  emoji: "🇺🇸" },
    { id: "g_us_scale",  name: "US 放量池", type: "user", accountIds: ACCOUNTS.filter((a) => a.region === "US" && a.tier === "Scale").map((a) => a.id), emoji: "🚀" },
    { id: "g_eu_pool",   name: "EU 投放池", type: "user", accountIds: ACCOUNTS.filter((a) => a.region === "EU").map((a) => a.id), emoji: "🇪🇺" },
    { id: "g_sea_pool",  name: "SEA 投放池",type: "user", accountIds: ACCOUNTS.filter((a) => a.region === "SEA").map((a) => a.id), emoji: "🌏" },
  ]
})()

// ─── Materials (200 total) ───────────────────────────────────────────────────

const ACTIVE_ACCOUNTS = ACCOUNTS.filter((a) => a.status !== "paused")

function buildMaterial(seq: number): Material {
  const fingerprint = `fp_${seq.toString().padStart(3, "0")}`
  const id = `Demo_Ad_${seq.toString().padStart(3, "0")}`
  const sku = pick(SKUS)
  const industryTag = pick(INDUSTRY_TAGS)
  const videoStyleTag = pick(VIDEO_STYLE_TAGS)
  const sceneTags = pickN(SCENE_TAGS, ri(1, 3))
  const sellingPointTags = pickN(SELLING_POINT_TAGS, ri(2, 4))
  const structureTags = pickN(STRUCTURE_TAGS, ri(1, 3))

  // Determine quality tier first; metrics depend on it
  const tierRoll = rand()
  let bucket: MaterialBucket
  let baseRoi: number
  let baseRating: number
  if (tierRoll < 0.55) {
    bucket = "core"; baseRoi = rf(1.8, 2.8, 2); baseRating = ri(78, 92)
  } else if (tierRoll < 0.75) {
    bucket = "potential"; baseRoi = rf(1.4, 1.9, 2); baseRating = ri(65, 80)
  } else if (tierRoll < 0.85) {
    bucket = "iterate"; baseRoi = rf(0.6, 1.3, 2); baseRating = ri(42, 64)
  } else {
    bucket = "archived"; baseRoi = rf(0.3, 0.8, 2); baseRating = ri(25, 50)
  }

  const accountCount = bucket === "core" ? ri(6, 14) : bucket === "potential" ? ri(3, 9) : bucket === "iterate" ? ri(1, 4) : ri(1, 3)
  const pickedAccounts = pickN(ACTIVE_ACCOUNTS, accountCount)

  // Generate per-account rows with variance
  let totalSpend = 0
  let totalImpressions = 0
  let totalClicks = 0
  let totalOrders = 0
  const rows: MaterialAccountRow[] = pickedAccounts.map((acc) => {
    // each account-material ROI deviates from baseRoi
    const acctRoi = Math.max(0.2, baseRoi * rf(0.55, 1.45, 2))
    const acctSpend = Math.round((acc.dailyBudget * 7) * rf(0.05, 0.18, 3))
    const acctCtr = rf(0.8, 6, 2) / 100
    const acctImpr = Math.round(acctSpend * ri(700, 1500))
    const acctClicks = Math.round(acctImpr * acctCtr)
    const acctOrders = Math.max(0, Math.round((acctSpend * acctRoi) / ri(30, 60)))
    const acctCpo = acctOrders > 0 ? Number((acctSpend / acctOrders).toFixed(2)) : 0
    totalSpend += acctSpend
    totalImpressions += acctImpr
    totalClicks += acctClicks
    totalOrders += acctOrders

    let rec: MaterialAction
    if (acctRoi >= 2.0) rec = "scale"
    else if (acctRoi >= 1.4) rec = "observe"
    else if (acctCtr < 0.015) rec = "rewrite_hook"
    else if (acctRoi < 0.7) rec = "pause"
    else rec = "replace_scene"

    return {
      accountId: acc.id,
      accountName: acc.name,
      status: acc.status,
      spend: acctSpend,
      impressions: acctImpr,
      clicks: acctClicks,
      ctr: acctCtr,
      orders: acctOrders,
      cpo: acctCpo,
      roi: acctRoi,
      recommendation: rec,
    }
  })

  const sortedByRoi = [...rows].sort((a, b) => b.roi - a.roi)
  const best = sortedByRoi[0]
  const worst = sortedByRoi[sortedByRoi.length - 1]
  const variance = best && worst ? Number((best.roi - worst.roi).toFixed(2)) : 0

  const aggCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
  const aggCpo = totalOrders > 0 ? Number((totalSpend / totalOrders).toFixed(2)) : 0
  const aggRoi = totalSpend > 0 ? Number(((rows.reduce((s, r) => s + r.spend * r.roi, 0)) / totalSpend).toFixed(2)) : 0

  // Pick a recommendation for the material as a whole
  let rec: MaterialAction
  if (bucket === "core") rec = "scale"
  else if (bucket === "potential") rec = aggCtr < 0.02 ? "rewrite_hook" : "observe"
  else if (bucket === "iterate") rec = aggCtr > 0.025 ? "replace_scene" : "rewrite_hook"
  else rec = "pause"

  let cpoReason: CpoReasonKey | undefined
  if (bucket !== "core") {
    if (aggCtr < 0.012) cpoReason = "weak_hook"
    else if (aggRoi < 1 && aggCtr > 0.03) cpoReason = "weak_landing"
    else if (aggRoi < 1) cpoReason = "weak_scene"
    else cpoReason = "weak_selling"
  }
  if (variance >= 1.5) cpoReason = "target_too_tight"

  // ─ Lifecycle phase 推导（基于 bucket + ageDays + 数据走势）─
  const ageDays = ri(1, 30)
  const firstSeenAt = new Date(2026, 4, Math.max(1, 28 - ageDays)).toISOString()
  let lifecyclePhase: LifecyclePhase
  if (bucket === "archived") {
    lifecyclePhase = "retired"
  } else if (bucket === "iterate") {
    lifecyclePhase = ageDays > 14 ? "declining" : "potential"
  } else if (bucket === "potential") {
    lifecyclePhase = ageDays <= 3 ? "cold_start" : "potential"
  } else {
    // core
    if (ageDays <= 2) lifecyclePhase = "cold_start"
    else if (ageDays <= 5 && aggRoi > 2.2) lifecyclePhase = "peak"     // 出现拐点
    else if (ageDays <= 14) lifecyclePhase = "scaling"
    else if (aggRoi < 1.6) lifecyclePhase = "declining"
    else lifecyclePhase = "scaling"
  }

  return {
    fingerprint,
    thumb: `https://picsum.photos/seed/${fingerprint}/240/240`,
    sku,
    name: id,
    firstSeenAt,
    format: "video",
    industryTag,
    videoStyleTag,
    sceneTags,
    sellingPointTags,
    structureTags,
    bucket,
    rating: baseRating,
    metrics: {
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: aggCtr,
      orders: totalOrders,
      cpo: aggCpo,
      roi: aggRoi,
      cvr: totalClicks > 0 ? totalOrders / totalClicks : 0,
    },
    accountRows: rows,
    accountCount: rows.length,
    bestAccount: best ? { id: best.accountId, accountName: best.accountName, roi: best.roi } : { id: "", accountName: "", roi: 0 },
    worstAccount: worst ? { id: worst.accountId, accountName: worst.accountName, roi: worst.roi } : { id: "", accountName: "", roi: 0 },
    recommendation: rec,
    variance,
    cpoReason,
    lifecyclePhase,
    ageDays,
  }
}

export const MATERIALS: Material[] = Array.from({ length: 200 }, (_, i) => buildMaterial(i + 1))

// ─── Backfill account.top/bottomMaterialFingerprints ─────────────────────────

;(function backfill() {
  const byAccount = new Map<string, Array<{ fp: string; roi: number; spend: number }>>()
  for (const m of MATERIALS) {
    for (const r of m.accountRows) {
      if (!byAccount.has(r.accountId)) byAccount.set(r.accountId, [])
      byAccount.get(r.accountId)!.push({ fp: m.fingerprint, roi: r.roi, spend: r.spend })
    }
  }
  for (const acc of ACCOUNTS) {
    const list = byAccount.get(acc.id) ?? []
    const top = [...list].sort((a, b) => b.roi - a.roi).slice(0, 5).map((x) => x.fp)
    const bot = [...list].sort((a, b) => a.roi - b.roi).slice(0, 5).map((x) => x.fp)
    acc.topMaterialFingerprints = top
    acc.bottomMaterialFingerprints = bot
  }
})()

// ─── Brand-level KPI snapshot ────────────────────────────────────────────────

export const BRAND_KPI: BrandKpi = (() => {
  const active = ACTIVE_ACCOUNTS
  const spend = active.reduce((s, a) => s + a.metrics7d.spend, 0)
  const orders = active.reduce((s, a) => s + a.metrics7d.orders, 0)
  const roi = spend > 0 ? Number((active.reduce((s, a) => s + a.metrics7d.spend * a.metrics7d.roi, 0) / spend).toFixed(2)) : 0
  const cpo = orders > 0 ? Number((spend / orders).toFixed(2)) : 0
  return {
    brand: "Hotligh",
    market: "US / EU / SEA / MX",
    channel: "GMV Max",
    dailyOrders: Number((orders / 7).toFixed(1)),
    dailyOrdersTarget: 20,
    roi,
    roiTarget: 2,
    cpo,
    cpoTargetLow: 13,
    cpoTargetHigh: 14,
    spend,
    conclusion:
      "当前 ROI 距目标尚有约 20% CPO 优化空间。重点：US-Warm / US-Test 多个账户 ROI target 偏紧；「修车 / 手机灯对比 / 停电应急」三类素材未充分铺开。建议下调相关账户 target 至 2.0 并补充对应场景素材。",
  }
})()

// ─── Tag rankings (for split-view) ───────────────────────────────────────────

export type TagRankRow = {
  tag: string
  count: number          // 素材数
  spend: number
  roi: number
  cpo: number
  accountCount: number
  topMaterials: Material[] // top 5 by roi*spend
  variance: number
}

function rankByTag(materials: Material[], getTag: (m: Material) => string | string[]): TagRankRow[] {
  const map = new Map<string, Material[]>()
  for (const m of materials) {
    const tags = getTag(m)
    const list = Array.isArray(tags) ? tags : [tags]
    for (const t of list) {
      if (!map.has(t)) map.set(t, [])
      map.get(t)!.push(m)
    }
  }
  const rows: TagRankRow[] = []
  for (const [tag, list] of map.entries()) {
    const spend = list.reduce((s, m) => s + m.metrics.spend, 0)
    const orders = list.reduce((s, m) => s + m.metrics.orders, 0)
    const roi = spend > 0 ? Number((list.reduce((s, m) => s + m.metrics.spend * m.metrics.roi, 0) / spend).toFixed(2)) : 0
    const cpo = orders > 0 ? Number((spend / orders).toFixed(2)) : 0
    const accountSet = new Set<string>()
    list.forEach((m) => m.accountRows.forEach((r) => accountSet.add(r.accountId)))
    const top = [...list].sort((a, b) => b.metrics.roi * b.metrics.spend - a.metrics.roi * a.metrics.spend).slice(0, 5)
    const rois = list.map((m) => m.metrics.roi).filter((x) => x > 0)
    const variance = rois.length > 1 ? Number((Math.max(...rois) - Math.min(...rois)).toFixed(2)) : 0
    rows.push({
      tag,
      count: list.length,
      spend,
      roi,
      cpo,
      accountCount: accountSet.size,
      topMaterials: top,
      variance,
    })
  }
  return rows.sort((a, b) => b.count - a.count)
}

export const INDUSTRY_RANK: TagRankRow[] = rankByTag(MATERIALS, (m) => m.industryTag)
export const VIDEO_STYLE_RANK: TagRankRow[] = rankByTag(MATERIALS, (m) => m.videoStyleTag)
export const SCENE_RANK: TagRankRow[] = rankByTag(MATERIALS, (m) => m.sceneTags)
export const SELLING_POINT_RANK: TagRankRow[] = rankByTag(MATERIALS, (m) => m.sellingPointTags)

// ─── Scene × Selling Point matrix ────────────────────────────────────────────

export const SCENE_MATRIX: ScenePointCell[] = (() => {
  const scenes = SCENE_TAGS.slice(0, 5)
  const points = SELLING_POINT_TAGS.slice(0, 6)
  const out: ScenePointCell[] = []
  for (const sc of scenes) {
    for (const pt of points) {
      const matches = MATERIALS.filter((m) => m.sceneTags.includes(sc) && m.sellingPointTags.includes(pt))
      if (matches.length === 0) {
        out.push({ scene: sc, sellingPoint: pt, bestRoi: 0, materialCount: 0, totalSpend: 0, accountIds: [] })
        continue
      }
      const bestRoi = Math.max(...matches.map((m) => m.metrics.roi))
      const totalSpend = matches.reduce((s, m) => s + m.metrics.spend, 0)
      const acctSet = new Set<string>()
      matches.forEach((m) => m.accountRows.forEach((r) => acctSet.add(r.accountId)))
      out.push({
        scene: sc,
        sellingPoint: pt,
        bestRoi: Number(bestRoi.toFixed(2)),
        materialCount: matches.length,
        totalSpend,
        accountIds: [...acctSet],
      })
    }
  }
  return out
})()

// ─── Diagnostic issues ───────────────────────────────────────────────────────

export const DIAGNOSTIC_ISSUES: DiagnosticIssue[] = (() => {
  const issues: DiagnosticIssue[] = []

  // 1. ROI target too high in warming/rewrite accounts
  const tightAccounts = ACCOUNTS.filter((a) => a.suggestedTargetRoi !== undefined && a.roiTarget > (a.suggestedTargetRoi + 0.5))
  if (tightAccounts.length > 0) {
    issues.push({
      id: "iss_target_tight",
      type: "roi_target_too_high",
      severity: "high",
      title: `${tightAccounts.length} 个账户 ROI target 设置过紧`,
      detail: `这些账户当前 ROI 平均 ${(tightAccounts.reduce((s, a) => s + a.metrics7d.roi, 0) / tightAccounts.length).toFixed(2)}，远低于 target，导致消耗不足 / 学习中断。建议批量下调到 2.0 学习。`,
      affectedAccountIds: tightAccounts.map((a) => a.id),
      affectedMaterialFingerprints: [],
      suggestedActions: [
        { label: `批量下调 ${tightAccounts.length} 个账户 target 到 2.0`, kind: "target" },
      ],
    })
  }

  // 2. Creative gap: 3 critical scenes underused
  const targetScenes = ["修车/车库", "手机灯对比", "停电应急"]
  const sceneCounts = targetScenes.map((sc) => ({ scene: sc, count: MATERIALS.filter((m) => m.sceneTags.includes(sc)).length }))
  const weakScenes = sceneCounts.filter((s) => s.count < 12).map((s) => s.scene)
  if (weakScenes.length > 0) {
    issues.push({
      id: "iss_creative_gap",
      type: "creative_gap",
      severity: "high",
      title: `${weakScenes.length} 类核心场景素材覆盖不足`,
      detail: `${weakScenes.join("、")} 是 Hotligh 高 ROI 潜力场景，但当前素材数量偏低。建议优先补充。`,
      affectedAccountIds: [],
      affectedMaterialFingerprints: [],
      suggestedActions: [{ label: `为 ${weakScenes.length} 个缺口场景生成 Brief`, kind: "brief" }],
    })
  }

  // 3. High-variance materials needing per-account tuning
  const highVariance = MATERIALS.filter((m) => m.variance >= 1.5 && m.bucket !== "archived").slice(0, 6)
  if (highVariance.length > 0) {
    issues.push({
      id: "iss_variance",
      type: "hook_weak",
      severity: "medium",
      title: `${highVariance.length} 条素材跨账户表现两极`,
      detail: "同一素材在不同账户上 ROI 差距 > 1.5，提示账户受众/出价差异主导，需要逐账户调优。",
      affectedAccountIds: [],
      affectedMaterialFingerprints: highVariance.map((m) => m.fingerprint),
      suggestedActions: [
        { label: "查看高方差素材清单", kind: "brief" },
        { label: "在差账户上暂停这些素材", kind: "pause" },
      ],
    })
  }

  return issues
})()

// ─── Brief seeds ─────────────────────────────────────────────────────────────

export const BRIEF_SEEDS: BriefSeed[] = [
  {
    title: "「手机灯 vs Hotligh」对比视频",
    product: "ZF7899 1200LM Magnetic Work Light",
    scene: "手机灯对比",
    pain: "手机灯不够亮，照不稳，还占用一只手",
    proposition: "Hotligh 让你双手空出来，细节看得清",
    hook: "Stop using your phone light under the hood.",
    visuals: ["手机灯照不清", "灯磁吸到车身", "双手维修", "细节清晰特写"],
    sellingPriority: ["磁吸", "高亮 1200LM", "续航", "Type-C 快充"],
    cta: "Keep one in your car.",
    count: 10,
  },
  {
    title: "「磁吸修车 双手解放」演示视频",
    product: "ZF7899",
    scene: "修车/车库",
    pain: "一手拿灯一手干活不方便",
    proposition: "磁吸固定 + 泛光照明，修车终于不用嘴叼灯了",
    hook: "Mechanics, this is how you stop dropping your flashlight.",
    visuals: ["发动机舱昏暗", "磁吸到金属车身", "旋转角度", "双手拧螺丝"],
    sellingPriority: ["磁吸", "泛光", "高亮 1200LM"],
    cta: "Add to cart now.",
    count: 10,
  },
  {
    title: "「停电应急 / 车载救援」场景短剧",
    product: "ZF8313",
    scene: "停电应急",
    pain: "家里突然停电 / 半夜车爆胎，手忙脚乱找光源",
    proposition: "Hotligh 在车里、家里、包里，急用时秒级响应",
    hook: "When the power goes out, every second counts.",
    visuals: ["突然停电黑屏", "车里取出灯", "红光警示", "继续操作"],
    sellingPriority: ["红光", "续航", "便携", "多模式"],
    cta: "Be ready before you need it.",
    count: 8,
  },
  {
    title: "「ZF8313 EDC 测评」达人口播",
    product: "ZF8313 EDC Multi-Mode Light",
    scene: "EDC 随身",
    pain: "想要小而强、多功能，但市面 EDC 灯太鸡肋",
    proposition: "2000LM + UV + RGB + 夹扣 — EDC 灯的终极形态",
    hook: "I tested 12 EDC lights — only this one stayed in my pocket.",
    visuals: ["开箱", "尺寸对比", "多模式切换", "口袋实拍"],
    sellingPriority: ["2000LM", "UV", "RGB", "夹扣设计"],
    cta: "Link in bio.",
    count: 6,
  },
]

// ─── Experiment batches (mock) ───────────────────────────────────────────────

export const EXPERIMENTS: ExperimentBatch[] = (() => {
  const out: ExperimentBatch[] = []
  for (let i = 1; i <= 4; i++) {
    const items: ExperimentBatch["items"] = []
    const matCount = ri(3, 6)
    const mats = pickN(MATERIALS.filter((m) => m.bucket !== "archived"), matCount)
    const accs = pickN(ACTIVE_ACCOUNTS, ri(2, 4))
    for (const m of mats) {
      for (const a of accs) {
        const roi = rf(0.5, 2.6, 2)
        const cpo = roi > 0 ? rf(8, 28, 2) : 0
        let status: "pending" | "learning" | "scale" | "rewrite" | "pause"
        if (roi >= 2.0) status = "scale"
        else if (roi >= 1.3) status = "learning"
        else if (roi >= 0.8) status = "rewrite"
        else status = "pause"
        const trend: number[] = []
        for (let d = 0; d < 3; d++) trend.push(rf(Math.max(0.3, roi - 0.5), roi + 0.4, 2))
        let suggestion = ""
        if (status === "scale") suggestion = "ROI 达标，可复制到更多账户"
        else if (status === "learning") suggestion = "继续观察 1-2 天"
        else if (status === "rewrite") suggestion = "钩子可能太弱，建议改写后重投"
        else suggestion = "ROI 低于 0.8，建议立即暂停"
        items.push({
          materialFingerprint: m.fingerprint,
          accountId: a.id,
          status,
          roi,
          cpo,
          trend,
          suggestion,
        })
      }
    }
    out.push({
      id: `batch_${i.toString().padStart(3, "0")}`,
      name: i === 1
        ? "磁吸修车系列 v1"
        : i === 2
        ? "停电应急短剧"
        : i === 3
        ? "EDC 达人测评"
        : "手机灯对比 A/B",
      createdAt: new Date(2026, 4, 27 - i * 4).toISOString(),
      daysRunning: ri(1, 3),
      totalDays: 3,
      items,
    })
  }
  return out
})()

// ─── 自有产品库 SELF_PRODUCTS ─────────────────────────────────────────────────
// 用于复刻匹配的右侧"自己"。第一版 mock；后续接商品中心。

export const SELF_PRODUCTS: SelfProduct[] = [
  {
    sku: "ZF7899",
    name: "Hotligh 1200LM Magnetic Work Light",
    image: "https://picsum.photos/seed/sku_zf7899/240/240",
    category: "工具户外 / 维修照明",
    coreSellingPoints: ["磁吸固定", "1200LM 高亮", "Type-C 快充", "双手解放"],
    brandVoice: ["Built for mechanics.", "Light where you need it.", "Hands-free in seconds."],
    competitiveEdge: "唯一一款能磁吸到任何金属车身、还顶得住户外冲洗的工作灯",
    inventoryStatus: "in_stock",
    matchableSceneTags: ["修车/车库", "夜间维修", "户外野营", "停电应急"],
  },
  {
    sku: "ZF8313",
    name: "Hotligh EDC Multi-Mode Light",
    image: "https://picsum.photos/seed/sku_zf8313/240/240",
    category: "EDC 随身 / 多模式照明",
    coreSellingPoints: ["2000LM 输出", "UV / RGB 多模式", "夹扣设计", "口袋便携"],
    brandVoice: ["Stays in your pocket.", "Twelve modes, one button.", "EDC done right."],
    competitiveEdge: "唯一同时具备 UV + RGB + 夹扣的口袋级 EDC 灯",
    inventoryStatus: "in_stock",
    matchableSceneTags: ["EDC 随身", "停电应急", "户外野营"],
  },
  {
    sku: "ZF2002",
    name: "Hotligh Compact Camping Lantern",
    image: "https://picsum.photos/seed/sku_zf2002/240/240",
    category: "户外露营 / 露营灯具",
    coreSellingPoints: ["360° 泛光", "续航 18h", "防水 IPX5", "可挂可立"],
    brandVoice: ["Light up your camp.", "Eighteen hours, one charge.", "Rain-ready."],
    competitiveEdge: "续航最长 + 防水最高级 的小尺寸营地灯",
    inventoryStatus: "low",
    matchableSceneTags: ["露营户外", "户外野营", "停电应急"],
  },
  {
    sku: "ZF5566",
    name: "Hotligh Magnetic Bike Headlight",
    image: "https://picsum.photos/seed/sku_zf5566/240/240",
    category: "汽车配件 / 自行车照明",
    coreSellingPoints: ["3 段亮度", "磁吸快拆", "USB-C 充电", "防雨"],
    brandVoice: ["Click on, ride out.", "No tools, no straps."],
    competitiveEdge: "5 秒磁吸快拆，比绑带式车灯快 10 倍",
    inventoryStatus: "in_stock",
    matchableSceneTags: ["EDC 随身", "户外野营"],
  },
]

// ─── 复刻匹配评分 computeMatchScore（mock）────────────────────────────────────

export function computeMatchScore(material: Material, product: SelfProduct): MatchResult {
  // 1. 卖点重合度（mat.sellingPointTags ∩ product.coreSellingPoints — 模糊匹配）
  const overlap = material.sellingPointTags.filter((t) =>
    product.coreSellingPoints.some((p) =>
      p.includes(t.replace(/\s.*$/, "")) || t.includes(p.split(/\s|\//)[0])
    )
  )
  const sellingScore = Math.min(100, (overlap.length / Math.max(1, material.sellingPointTags.length)) * 130)

  // 2. 场景兼容性
  const sceneHit = material.sceneTags.filter((s) => product.matchableSceneTags.includes(s)).length
  const sceneScore = sceneHit > 0 ? Math.min(100, 50 + sceneHit * 25) : 25

  // 3. 行业一致性
  const catScore = product.category.split("/")[0].trim() === material.industryTag.split("/")[0].trim() ? 100 : 60

  // 4. 品牌话术兼容（与 hook 风格的兼容，mock：按 videoStyleTag 启发式）
  const voiceFriendly = ["产品演示", "使用前后对比", "试用展示", "教程/怎么做", "开箱视频"]
  const voiceScore = voiceFriendly.includes(material.videoStyleTag) ? 85 : 65

  // 5. 证据等级 — 基于 bucket + accountCount
  const evidenceScore =
    material.bucket === "core" ? 90 :
    material.bucket === "potential" ? 70 :
    material.bucket === "iterate" ? 40 : 20

  const signals: MatchSignal[] = [
    { key: "selling_point", label: "卖点重合度",   score: Math.round(sellingScore),  weight: 0.30, detail: overlap.length > 0 ? `命中 ${overlap.length} 个卖点：${overlap.join("、")}` : "卖点无明显重合，需要重写卖点表达",                                   ok: sellingScore >= 60 },
    { key: "scene",         label: "场景兼容性",   score: Math.round(sceneScore),    weight: 0.25, detail: sceneHit > 0 ? `${sceneHit} 个场景与产品适用范围一致` : "场景不在产品适配范围，复刻后受众错位",                                            ok: sceneScore >= 60 },
    { key: "category",      label: "行业一致性",   score: Math.round(catScore),      weight: 0.15, detail: catScore === 100 ? "行业完全一致" : "行业不同，复刻骨架仍可用但需要本土化",                                                            ok: catScore >= 60 },
    { key: "voice",         label: "话术兼容性",   score: Math.round(voiceScore),    weight: 0.15, detail: voiceScore >= 80 ? "视频风格与品牌口吻易适配" : "视频风格偏剧情，需调整为演示+口播",                                                  ok: voiceScore >= 60 },
    { key: "evidence",      label: "证据等级",     score: evidenceScore,             weight: 0.15, detail: material.bucket === "core" ? "已在多账户验证，证据 E3" : material.bucket === "potential" ? "证据 E2，仍在小规模验证" : "证据不足 E1，复刻风险较高", ok: evidenceScore >= 60 },
  ]

  const total = Math.round(signals.reduce((s, sig) => s + sig.score * sig.weight, 0))

  // Blockers — 命中则不允许复刻
  const blockers: string[] = []
  if (!LIFECYCLE_REPLICA_ALLOWED.includes(material.lifecyclePhase)) {
    blockers.push(`素材已进入"${material.lifecyclePhase === "declining" ? "衰退期" : material.lifecyclePhase === "retired" ? "退场" : "冷启动期"}"，复刻只会拉低新系列天花板`)
  }
  if (product.inventoryStatus === "out") {
    blockers.push(`产品 ${product.sku} 已断货，无法支撑复刻投放`)
  }

  const level: MatchResult["level"] = total >= 75 ? "high" : total >= 55 ? "mid" : "low"

  return { total, level, signals, blockers }
}

const LIFECYCLE_REPLICA_ALLOWED: LifecyclePhase[] = ["potential", "scaling", "peak"]

// 默认配对：按行业一致性优先 + 卖点重合度兜底
export function pickDefaultProduct(material: Material): SelfProduct {
  const sameSku = SELF_PRODUCTS.find((p) => p.sku === material.sku)
  if (sameSku) return sameSku
  // pick by industry then by selling overlap
  const byIndustry = SELF_PRODUCTS.find((p) => p.category.split("/")[0].trim() === material.industryTag.split("/")[0].trim())
  if (byIndustry) return byIndustry
  return SELF_PRODUCTS[0]
}

// ─── 复刻方向生成 getDirectionsForMaterial（mock 静态 3 个方向）──────────────

export function getDirectionsForMaterial(material: Material): ReplicaDirection[] {
  const sp1 = material.sellingPointTags[0] ?? "核心卖点"
  const sp2 = material.sellingPointTags[1] ?? "辅助卖点"
  const sc1 = material.sceneTags[0] ?? "通用场景"
  const phase = material.lifecyclePhase

  // 三个方向的置信度根据生命周期调整：peak/scaling 更适合 hook 变体；potential 更适合 selling
  const hookConfidence  = phase === "peak" || phase === "scaling" ? 0.82 : 0.68
  const sceneConfidence = 0.65
  const sellingConfidence = phase === "potential" ? 0.78 : 0.62

  return [
    {
      id: "A",
      title: "强化首秒结果（开场 Hook 变体）",
      desc: "保留骨架，只动开场 3 秒——首帧直接抛出最强结果画面",
      axis: "hook",
      keep: [`${sp1} 的演示完整保留`, "中段 Demo 节奏不变", "CTA 不变"],
      change: "前 3 秒开场画面，从「问题切入」改为「结果前置」",
      impact: "2 秒观看率 / CTR ↗",
      confidence: hookConfidence,
      lifecycleFit: ["peak", "scaling", "potential"],
      brief: `Stop scrolling — see what ${sp1} actually does in 3 seconds.`,
    },
    {
      id: "B",
      title: "替换核心场景",
      desc: "保留卖点和节奏，只改场景——切换到产品另一个高潜力使用场景",
      axis: "scene",
      keep: [`${sp1} / ${sp2} 卖点完整`, "结构与节奏不变", "CTA 不变"],
      change: `场景从「${sc1}」切换到自有产品更适配的场景`,
      impact: "受众覆盖 / CVR ↗",
      confidence: sceneConfidence,
      lifecycleFit: ["scaling", "potential"],
      brief: `Same ${sp1}, new scene — proving it works anywhere.`,
    },
    {
      id: "C",
      title: "改写卖点优先级",
      desc: "保留开场和场景，只动卖点表达——把次要卖点升级为主卖点",
      axis: "selling",
      keep: ["开场不变", "场景不变", "Demo 结构不变"],
      change: `卖点优先级从「${sp1}」改写为「${sp2}」主打`,
      impact: "ROAS / 客单价 ↗",
      confidence: sellingConfidence,
      lifecycleFit: ["potential", "scaling"],
      brief: `It's not about ${sp1}. It's about ${sp2}.`,
    },
  ]
}

// ─── 最近复刻项目 REPLICA_PROJECTS ───────────────────────────────────────────
// 源类型只有 market/own；部分 own 项目带 lineage（派生自上轮）

export const REPLICA_PROJECTS: ReplicaProject[] = (() => {
  const cores = MATERIALS.filter((m) => m.bucket === "core").slice(0, 6)
  const cats: ReplicaCategory[] = ["market", "own", "own", "own", "market", "market"]
  const statuses: ReplicaProjectStatus[] = ["completed", "in_progress", "submitted", "in_progress", "draft", "completed"]
  // 第 3、4 个项目派生自 rep_001（"自有爆款放大"链路：先 own 出爆量，再二次派生迭代）
  const derivations: Record<number, { fromId: string; axis: ReplicaAxis }> = {
    2: { fromId: "rep_001", axis: "hook" },
    3: { fromId: "rep_002", axis: "scene" },
  }
  const out: ReplicaProject[] = []
  for (let i = 0; i < cores.length; i++) {
    const m = cores[i]
    const cat = cats[i % cats.length]
    const titlePrefix = cat === "market" ? "市场爆款复刻" : "自有爆款放大"
    const derived = derivations[i]
    out.push({
      id: `rep_${(i + 1).toString().padStart(3, "0")}`,
      title: `${titlePrefix} · ${m.sceneTags[0] ?? "通用"}`,
      category: cat,
      sourceFingerprint: cat === "market" ? undefined : m.fingerprint,
      sourceName: cat === "market" ? `TikTok 市场素材 #${i + 1}` : m.name,
      productSku: pickDefaultProduct(m).sku,
      matchScore: 60 + ri(0, 30),
      variantCount: ri(2, 4),
      status: statuses[i % statuses.length],
      createdAt: new Date(2026, 5, 6 + i).toISOString(),
      updatedAt: new Date(2026, 5, 11 + i).toISOString(),
      thumb: m.thumb,
      lifecyclePhase: m.lifecyclePhase,
      derivedFromProjectId: derived?.fromId,
      derivedFromAxis: derived?.axis,
    })
  }
  return out
})()
