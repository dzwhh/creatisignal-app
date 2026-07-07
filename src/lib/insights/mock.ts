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

export const WEDDING_DRESS_FINGERPRINT = "fp_009"
export const WEDDING_DRESS_SKU = "WD9009"
export const WEDDING_DRESS_COVER = "/creative-assets/wedding-dress-cover.png"
export const WEDDING_DRESS_VIDEO = "/creative-assets/wedding-dress-ad.mp4"

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

function applyWeddingDressMaterial() {
  const target = MATERIALS[8]
  if (!target) return

  const roiValues = [3.18, 2.94, 2.72, 2.61, 2.38, 2.27, 2.16, 1.96, 1.78, 1.62]
  const spendValues = [1860, 1420, 1280, 1140, 980, 860, 720, 640, 520, 430]
  const rows: MaterialAccountRow[] = ACTIVE_ACCOUNTS.slice(0, 10).map((acc, index) => {
    const spend = spendValues[index] ?? 500
    const roi = roiValues[index] ?? 1.8
    const impressions = Math.round(spend * (980 + index * 42))
    const ctr = Number((0.048 - index * 0.0016).toFixed(4))
    const clicks = Math.round(impressions * ctr)
    const orders = Math.max(1, Math.round((spend * roi) / 286))
    const cpo = Number((spend / orders).toFixed(2))
    return {
      accountId: acc.id,
      accountName: acc.name,
      status: acc.status,
      spend,
      impressions,
      clicks,
      ctr,
      orders,
      cpo,
      roi,
      recommendation: roi >= 2.1 ? "scale" : "observe",
    }
  })

  const totalSpend = rows.reduce((sum, row) => sum + row.spend, 0)
  const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0)
  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0)
  const totalOrders = rows.reduce((sum, row) => sum + row.orders, 0)
  const sortedByRoi = [...rows].sort((a, b) => b.roi - a.roi)
  const best = sortedByRoi[0]
  const worst = sortedByRoi[sortedByRoi.length - 1]

  Object.assign(target, {
    fingerprint: WEDDING_DRESS_FINGERPRINT,
    thumb: WEDDING_DRESS_COVER,
    sku: WEDDING_DRESS_SKU,
    name: "演示广告009",
    firstSeenAt: "2026-07-06T09:00:00.000Z",
    format: "video",
    industryTag: "婚纱礼服",
    videoStyleTag: "展厅实拍展示",
    sceneTags: ["婚纱展厅", "暗场聚光", "礼服陈列", "婚礼仪式感"],
    sellingPointTags: ["闪钻重工", "大拖尾公主裙", "高定腰线", "镜头下显瘦"],
    structureTags: ["spotlight-reveal", "detail-proof", "continuous-demo", "silhouette-hold"],
    bucket: "core",
    rating: 99,
    metrics: {
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      orders: totalOrders,
      cpo: totalOrders > 0 ? Number((totalSpend / totalOrders).toFixed(2)) : 0,
      roi: totalSpend > 0 ? Number((rows.reduce((sum, row) => sum + row.spend * row.roi, 0) / totalSpend).toFixed(2)) : 0,
      cvr: totalClicks > 0 ? totalOrders / totalClicks : 0,
    },
    accountRows: rows,
    accountCount: rows.length,
    bestAccount: best ? { id: best.accountId, accountName: best.accountName, roi: best.roi } : { id: "", accountName: "", roi: 0 },
    worstAccount: worst ? { id: worst.accountId, accountName: worst.accountName, roi: worst.roi } : { id: "", accountName: "", roi: 0 },
    recommendation: "scale",
    variance: best && worst ? Number((best.roi - worst.roi).toFixed(2)) : 0,
    cpoReason: "weak_selling",
    lifecyclePhase: "peak",
    ageDays: 1,
  })
}

applyWeddingDressMaterial()

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
    sku: WEDDING_DRESS_SKU,
    name: "Aurora Crystal Ball Gown",
    image: WEDDING_DRESS_COVER,
    category: "婚纱礼服 / 高定婚纱",
    coreSellingPoints: ["闪钻重工", "大拖尾公主裙", "高定腰线", "镜头下显瘦"],
    brandVoice: ["A dress made for the first gasp.", "Spotlight-ready from every angle.", "Every crystal catches the light."],
    competitiveEdge: "暗场聚光下仍能清晰闪耀的重工闪钻大拖尾婚纱，适合短视频首帧直接抓住仪式感",
    inventoryStatus: "in_stock",
    matchableSceneTags: ["婚纱展厅", "暗场聚光", "礼服陈列", "婚礼仪式感"],
  },
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
  if (material.fingerprint === WEDDING_DRESS_FINGERPRINT) {
    const signals: MatchSignal[] = [
      { key: "selling_point", label: "卖点重合度", score: 96, weight: 0.30, detail: "命中闪钻重工、大拖尾、高定腰线、镜头显瘦", ok: true },
      { key: "scene", label: "场景兼容性", score: 94, weight: 0.25, detail: "展厅、暗场聚光、礼服陈列均与产品高度一致", ok: true },
      { key: "category", label: "行业一致性", score: 100, weight: 0.15, detail: "婚纱礼服品类完全一致", ok: true },
      { key: "voice", label: "话术兼容性", score: 88, weight: 0.15, detail: "适合奢华、仪式感、静物展示型表达", ok: true },
      { key: "evidence", label: "证据等级", score: 92, weight: 0.15, detail: "核心素材已在多账户验证，首帧停留和商品理解强", ok: true },
    ]
    const total = Math.round(signals.reduce((sum, signal) => sum + signal.score * signal.weight, 0))
    return { total, level: "high", signals, blockers: [] }
  }
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
  const cores = MATERIALS.filter((m) => m.bucket === "core").slice(0, 8)
  const cats: ReplicaCategory[] = ["market", "competitor", "own", "own", "upload", "market", "competitor", "own"]
  const stages: import("./types").ReplicaStage[] = ["confirm", "direction", "breakdown", "direction", "source", "confirm", "breakdown", "direction"]
  const statuses: ReplicaProjectStatus[] = ["completed", "in_progress", "submitted", "in_progress", "draft", "completed", "in_progress", "in_progress"]
  const derivations: Record<number, { fromId: string; axis: ReplicaAxis }> = {
    3: { fromId: "rep_002", axis: "hook" },
    7: { fromId: "rep_003", axis: "scene" },
  }
  const titleByCat: Record<ReplicaCategory, string> = {
    market: "市场爆款复刻",
    competitor: "竞对爆款拆解",
    own: "自有爆款放大",
    upload: "自主上传迭代",
  }
  const sourceNameByCat: Record<ReplicaCategory, (i: number, mName: string) => string> = {
    market: (i) => `TikTok 市场素材 #${i + 1}`,
    competitor: (i) => `竞品账户 @rival_${i + 1}`,
    own: (_i, mName) => mName,
    upload: (i) => `本地上传 · upload_${(i + 1).toString().padStart(2, "0")}.mp4`,
  }
  const out: ReplicaProject[] = []
  for (let i = 0; i < cores.length; i++) {
    const m = cores[i]
    const cat = cats[i % cats.length]
    const derived = derivations[i]
    out.push({
      id: `rep_${(i + 1).toString().padStart(3, "0")}`,
      title: `${titleByCat[cat]} · ${m.sceneTags[0] ?? "通用"}`,
      category: cat,
      stage: stages[i % stages.length],
      sourceFingerprint: cat === "own" ? m.fingerprint : undefined,
      sourceName: sourceNameByCat[cat](i, m.name),
      productSku: pickDefaultProduct(m).sku,
      matchScore: 60 + ri(0, 30),
      variantCount: ri(2, 4),
      status: statuses[i % statuses.length],
      createdAt: new Date(2026, 5, 4 + i).toISOString(),
      updatedAt: new Date(2026, 5, 10 + i).toISOString(),
      thumb: m.thumb,
      lifecyclePhase: m.lifecyclePhase,
      derivedFromProjectId: derived?.fromId,
      derivedFromAxis: derived?.axis,
    })
  }
  return out
})()

// ═══════════════════════════════════════════════════════════════════════════
// V2 复刻工作台 mock 函数
// ═══════════════════════════════════════════════════════════════════════════

import type {
  ElementBreakdown,
  ElementKey,
  GenerationOutcome,
  HotItemVerdict,
  HotItemVerdictKind,
  HotVerdictDataSupport,
  MaterialSource,
  ProductBrief,
  ReplicaDirectionV2,
  ScriptStep,
  StoryboardShot,
} from "./types"

// ─── Step 2: computeHotVerdict ──────────────────────────────────────────────

export function computeHotVerdict(
  source: MaterialSource,
  material?: Material,
  productBrief?: ProductBrief
): HotItemVerdict {
  // 按 source 派生不同的数据支撑 + 结论
  const phase = material?.lifecyclePhase ?? "potential"

  if (source === "market_hot") {
    const ds: HotVerdictDataSupport = {
      source: "market_hot",
      popularityScore: 78 + ri(0, 18),
      engagementRate: rf(3.2, 6.4),
      lifecycleDays: ri(3, 12),
      categoryMatch: ri(70, 95),
      reusability: ri(72, 90),
    }
    const verdict: HotItemVerdictKind = ds.popularityScore >= 80 ? "recommended" : "cautious"
    return {
      verdict,
      source,
      category: verdict === "recommended" ? "市场候选" : "市场可借鉴",
      reasons: [
        `公域互动率 ${ds.engagementRate.toFixed(1)}%，高于同类中位 +22%`,
        `素材跑了 ${ds.lifecycleDays} 天仍在放量，生命周期未到拐点`,
        `品类匹配度 ${ds.categoryMatch}，与你的产品契合度高`,
      ].slice(0, 3),
      dataSupport: ds,
      lifecyclePhase: phase,
    }
  }

  if (source === "competitor_hot") {
    const runDays = ri(5, 21)
    const ds: HotVerdictDataSupport = {
      source: "competitor_hot",
      competitorCategory: productBrief?.category ?? "工具户外",
      similarSkus: ri(3, 12),
      runDays,
      structurePattern: "Hook → Demo → CTA",
      differentiationRisk: runDays > 14 ? "high" : runDays > 7 ? "mid" : "low",
    }
    const verdict: HotItemVerdictKind = ds.differentiationRisk === "high" ? "cautious" : "recommended"
    return {
      verdict,
      source,
      category: "竞品可借鉴",
      reasons: [
        `竞品已持续投放 ${ds.runDays} 天，说明这套结构跑得通`,
        `相似 SKU 已有 ${ds.similarSkus} 个，差异化空间 ${ds.differentiationRisk === "high" ? "较小，需重点改写" : "充足"}`,
        `结构模式：${ds.structurePattern}，可借鉴但需要规避相似度`,
      ],
      dataSupport: ds,
      lifecyclePhase: phase,
      lowConfidence: ds.differentiationRisk === "high",
    }
  }

  if (source === "owned_hot") {
    const dailyOrders = ri(18, 65)
    const roi = rf(1.8, 3.4)
    const ds: HotVerdictDataSupport = {
      source: "owned_hot",
      dailyOrders,
      roi,
      spend: ri(2500, 8800),
      stableDays: ri(3, 14),
      declineRate: rf(0.02, 0.12),
    }
    const verdict: HotItemVerdictKind = ds.roi >= 2.4 ? "recommended" : "cautious"
    return {
      verdict,
      source,
      category: "自有可复刻",
      reasons: [
        `GMV Max 日均出单 ${ds.dailyOrders} 单，ROI ${ds.roi.toFixed(2)}`,
        `已稳定跑量 ${ds.stableDays} 天，处于${phase === "peak" ? "爆量拐点" : phase === "scaling" ? "放量期" : "潜力期"}`,
        ds.declineRate > 0.08 ? "近期衰退迹象，建议尽快复刻延续" : "数据稳定，是延续生命周期的合理窗口",
      ],
      dataSupport: ds,
      lifecyclePhase: phase,
    }
  }

  // local_upload
  const ds: HotVerdictDataSupport = {
    source: "local_upload",
    structureIdentified: ["开场展示", "中段口播", "结尾 CTA"],
    confidence: "low",
  }
  return {
    verdict: "not_enough_data",
    source,
    category: "数据不足",
    reasons: [
      "本地素材无投放数据，无法判断商业爆款属性",
      "仅识别出基础结构：开场 + 口播 + CTA",
      "可继续走结构化复刻，但置信度低，建议小预算先测",
    ],
    dataSupport: ds,
    lifecyclePhase: phase,
    lowConfidence: true,
  }
}

// ─── Step 3: get8ElementBreakdown ───────────────────────────────────────────

export function get8ElementBreakdown(
  material: Material,
  productBrief?: ProductBrief
): ElementBreakdown[] {
  const sp1 = material.sellingPointTags[0] ?? "核心卖点"
  const sp2 = material.sellingPointTags[1] ?? "辅助卖点"
  const sc1 = material.sceneTags[0] ?? "通用场景"
  const phase = material.lifecyclePhase
  const audience = productBrief?.audience ?? (material.fingerprint === WEDDING_DRESS_FINGERPRINT ? "正在备婚、挑选婚礼主纱，关注闪钻、大拖尾、展厅高级感和上镜效果的新娘" : "户外通勤 / EDC 用户")

  const items: ElementBreakdown[] = [
    {
      key: "audience_scene",
      conclusion: `${audience} 在「${sc1}」场景被痛点打中`,
      dataSupport: `场景命中率 ${ri(68, 89)}%，受众覆盖 ${ri(120, 480)}k`,
      lifecyclePhase: phase,
      mustKeep: [`${sc1} 场景骨架`, "受众情绪进入点"],
      canVary: ["具体角色与服化", "场景细节装饰"],
      forbidden: ["脱离产品适用范围的场景"],
    },
    {
      key: "hook",
      conclusion: "首秒结果前置 + 反差画面（手机灯 vs 工作灯）",
      dataSupport: `2 秒观看率 ${rf(34, 62, 1)}%（同类 +${ri(15, 28)}%）`,
      lifecyclePhase: phase,
      mustKeep: ["前 1 秒结果画面", "反差冲击力"],
      canVary: ["开头一句话", "对比方式"],
      forbidden: ["纯文字开场", "缓慢镜头淡入"],
    },
    {
      key: "value",
      conclusion: `${sp1} + ${sp2} 解决"双手解放 + 持久照明"组合痛点`,
      dataSupport: `产品价值点击率 ${rf(4.2, 8.8)}%`,
      lifecyclePhase: phase,
      mustKeep: ["产品核心价值不变", "痛点-解决路径"],
      canVary: ["卖点排列顺序", "表达句式"],
      forbidden: ["弱化主胜因", "替换为次要功能"],
    },
    {
      key: "proof",
      conclusion: "多场景实拍 Demo + 极端冲水测试，建立 IPX5 信任",
      dataSupport: "完播率 38%，停留中位 8.2s",
      lifecyclePhase: phase,
      mustKeep: ["至少 2 个真实场景 Demo", "结果可见的验证镜头"],
      canVary: ["验证场景的选择", "数字/证书展示方式"],
      forbidden: ["未经验证的承诺", "夸大数据"],
    },
    {
      key: "structure",
      conclusion: "Hook → 痛点 → 产品 → Demo → 卖点 → CTA（15 秒紧凑）",
      dataSupport: "结构完成率 76%，未跳出节奏",
      lifecyclePhase: phase,
      mustKeep: ["6 段时间分布", "每段 2-3 秒推进"],
      canVary: ["段内具体内容", "字幕样式"],
      forbidden: ["长段独白", "打乱推进顺序"],
    },
    {
      key: "cta",
      conclusion: `结尾 "Keep one in your car" 软推 + 商品卡引导`,
      dataSupport: `CTA 点击率 ${rf(3.4, 6.2)}%`,
      lifecyclePhase: phase,
      mustKeep: ["明确动作引导", "商品卡可见"],
      canVary: ["CTA 文案", "情绪触发点"],
      forbidden: ["硬广推销话术", "限时焦虑滥用"],
    },
    {
      key: "emotion",
      conclusion: "省力 + 信任为主，少量惊喜（首秒反差）",
      dataSupport: "评论正向情绪占比 72%",
      lifecyclePhase: phase,
      mustKeep: ["省力 + 信任的主基调"],
      canVary: ["惊喜程度", "焦虑使用"],
      forbidden: ["焦虑过度", "煽动负面情绪"],
    },
    {
      key: "platform_fit",
      conclusion: "TikTok 9:16 · 字幕安全区 · 商品卡不遮挡核心镜头",
      dataSupport: "平台合规率 100%",
      lifecyclePhase: phase,
      mustKeep: ["9:16 比例", "字幕在安全区", "商品卡位置规范"],
      canVary: ["字幕字号", "色彩搭配"],
      forbidden: ["医疗承诺", "竞品对比性内容", "假折扣表达"],
    },
  ]
  return items
}

// ─── Step 4: getDirectionsV2（含 script + storyboard） ──────────────────────

export function getDirectionsV2(
  material: Material,
  productBrief?: ProductBrief
): ReplicaDirectionV2[] {
  if (material.fingerprint === WEDDING_DRESS_FINGERPRINT) {
    return getWeddingDressDirections()
  }
  // 内容脚本原文（菲律宾普惠金融视频）—— 自由文本，不改字
  const briefText = `帮我做一条 22 秒的菲律宾普惠金融短视频，目标受众为有短期资金需求、关注还款压力与平台合规的成年用户。

镜头结构：
- 0–4s：女主持人正面口播痛点反问（"还款压力大？"），背景叠加乌云贴纸 + 集中线
- 4–9s：切到平台 UI 截图，逐项展示利率 / 额度 / 还款方案
- 9–14s：动效"集中线"汇聚到品牌 Logo，强化记忆
- 14–18s：法律免责声明小字，资质 ID 居中淡入
- 18–22s：CTA「立即申请」+ 二维码 + 主持人最后一句安抚

风格 & 节奏：
- 主持人中近景为主，暖色调，字幕全程同步关键词
- 节奏档位 fast_dense → moderate_escalating → urgent_push
- 情绪曲线 焦虑 → 安心 → 信任 → 紧迫

卖点优先级：1) 月供低 2) 5 分钟到账 3) SEC 持牌合规
禁忌：避免对利率做承诺、避免对比竞品、保留法律免责声明`
  // 22 秒菲律宾普惠金融视频 5 段脚本基线
  // 0-4s 痛点反问 / 4-9s 平台 UI / 9-14s 品牌动效 / 14-18s 法律资质 / 18-22s CTA
  const baseScript = (variant: "hook" | "proof" | "cta"): ScriptStep[] => {
    // Hook 段：A 方向更具痛点张力
    const hook = variant === "hook"
      ? { vo: "晚一天就要罚息？还款压力大？", sub: "Stressed about late fees & repayments?", action: "女主持人正面口播痛点反问 + 背景乌云贴纸 + 集中线汇聚" }
      : { vo: "还款压力大？", sub: "Stressed about repayments?", action: "女主持人正面口播痛点反问 + 乌云贴纸 + 集中线" }
    // Proof 段：B 方向中段更密集
    const proof = variant === "proof"
      ? { vo: "查看利率、额度、还款方案，5 分钟到账", sub: "Rates · limits · plans · 5-min payout", action: "平台 UI 截图快切：利率 / 额度 / 还款方案，叠加 5 分钟到账标签" }
      : { vo: "查看你的利率、额度和还款方案", sub: "Check rates, limits and repayment plans", action: "切到平台 UI 截图，逐项展示利率 / 额度 / 还款方案" }
    // CTA 段：C 方向更紧迫
    const cta = variant === "cta"
      ? { vo: "限时立即申请，扫码 30 秒搞定", sub: "Apply now · 30s · Scan QR", action: "CTA「立即申请」放大 + 二维码弹出 + 主持人安抚收尾 + 倒计时" }
      : { vo: "立即申请，扫码下载", sub: "Apply now · Scan QR", action: "CTA「立即申请」+ 二维码 + 主持人最后一句安抚" }
    return [
      { timeRange: "0-4s",   voiceover: hook.vo,                                 subtitle: hook.sub,                              action: hook.action },
      { timeRange: "4-9s",   voiceover: proof.vo,                                subtitle: proof.sub,                             action: proof.action },
      { timeRange: "9-14s",  voiceover: "汇聚到品牌 Logo，5 分钟到账更省心",       subtitle: "Logo focus · 5-min payout, peace of mind", action: "动效\"集中线\"汇聚到品牌 Logo，强化记忆" },
      { timeRange: "14-18s", voiceover: "SEC 持牌合规，放心借款",                  subtitle: "SEC licensed · compliant lending",   action: "法律免责声明小字 + 资质 ID 居中淡入" },
      { timeRange: "18-22s", voiceover: cta.vo,                                  subtitle: cta.sub,                              action: cta.action },
    ]
  }

  const baseStoryboard = (variant: "hook" | "proof" | "cta", extraNotes?: string): StoryboardShot[] => {
    const hookShot = variant === "hook"
      ? { shot: "近景：女主持人面部反问表情 + 乌云贴纸压顶 + 集中线极速汇聚", materials: ["女主持人", "乌云贴纸", "集中线动效", "暖色调灯光", "罚息提示气泡"], notes: extraNotes ?? "首镜需要极端反差 + 痛点字幕放大" }
      : { shot: "近景：女主持人正面口播 + 乌云贴纸叠加 + 集中线", materials: ["女主持人", "乌云贴纸", "集中线动效", "暖色调灯光"], notes: extraNotes }
    const proofShot = variant === "proof"
      ? { shot: "屏录快切：平台 UI 利率/额度/还款方案 + 5 分钟到账标签", materials: ["平台 UI 截图", "利率信息", "额度信息", "还款方案", "5 分钟到账标签"], notes: "中段需要 3-4 个 UI 快切镜头" }
      : { shot: "屏录：平台 UI 截图逐项滑过利率/额度/还款方案", materials: ["平台 UI 截图", "利率信息", "额度信息", "还款方案"] }
    const ctaShot = variant === "cta"
      ? { shot: "中近景：主持人安抚收尾 + CTA「立即申请」放大 + 二维码 + 限时倒计时", materials: ["女主持人面部", "CTA 按钮放大", "二维码", "倒计时", "限时角标"], notes: "CTA 字幕需动态放大 + 倒计时强化紧迫感" }
      : { shot: "中近景：主持人安抚收尾 + CTA「立即申请」+ 二维码", materials: ["女主持人面部", "CTA 按钮", "二维码", "品牌色"] }
    return [
      { timeRange: "0-4s",   shot: hookShot.shot,    framing: "近景",       materials: hookShot.materials,    notes: hookShot.notes },
      { timeRange: "4-9s",   shot: proofShot.shot,   framing: "屏录全屏",   materials: proofShot.materials,   notes: proofShot.notes },
      { timeRange: "9-14s",  shot: "中景：动效\"集中线\"汇聚到品牌 Logo 中心，粒子聚拢强化记忆", framing: "中景",  materials: ["品牌 Logo", "集中线动效", "粒子聚拢", "Logo 高亮"] },
      { timeRange: "14-18s", shot: "全景：法律免责声明小字底部滚动 + SEC 资质 ID 居中淡入", framing: "全景", materials: ["法律免责声明文字", "SEC 资质 ID 卡片", "淡入动画"], notes: "资质 ID 必须可读，避免被覆盖" },
      { timeRange: "18-22s", shot: ctaShot.shot,     framing: "中近景",     materials: ctaShot.materials,     notes: ctaShot.notes },
    ]
  }

  return [
    {
      id: "A",
      title: "强化 Hook · 提升 2 秒观看率",
      desc: "保留中段证明和合规收尾，强化前 4s 痛点反问：让目标受众第一秒就停留",
      axis: "hook",
      keep: ["平台 UI 证明", "合规资质强信任", "CTA 节奏"],
      change: "前 4s：从普通反问升级为\"晚一天就要罚息？\"+ 集中线极速汇聚",
      impact: "2 秒观看率 / CTR ↗",
      confidence: 0.82,
      lifecycleFit: ["peak", "scaling", "potential"],
      brief: "用最具体的还款压力痛点 + 视觉反差，把目标受众钉在前 4 秒。",
      briefText,
      script: baseScript("hook"),
      storyboard: baseStoryboard("hook"),
      expectedDelta: "预计 2 秒观看率 +15~25%，CTR +8~12%",
      risks: ["反问过激可能影响平台合规审核 · 需走法务复核"],
    },
    {
      id: "B",
      title: "强化 Proof · 提升 CVR / ROI",
      desc: "保留 Hook 和 CTA，加大中段 UI 证明密度：利率、额度、5 分钟到账多维呈现",
      axis: "scene",
      keep: ["Hook 反问", "合规资质", "CTA 节奏"],
      change: "4-9s：UI 截图快切节奏加密，叠加 5 分钟到账标签和实时审批动效",
      impact: "CVR / ROAS ↗",
      confidence: 0.74,
      lifecycleFit: ["scaling", "peak"],
      brief: "把抽象的金融产品变成可视的 UI + 数字证明，建立点击信任。",
      briefText,
      script: baseScript("proof"),
      storyboard: baseStoryboard("proof", "中段 4-9s 要 3 个以上 UI 快切"),
      expectedDelta: "预计 CVR +10~18%，ROAS +12~20%",
      risks: ["UI 信息密度过高可能让用户跳出 · 单镜头需控制 1.5-2s"],
    },
    {
      id: "C",
      title: "强化 CTA · 提升下载 / 申请",
      desc: "保留 Hook 和证明，只动结尾 4 秒：把 CTA 从软推改成限时紧迫感",
      axis: "selling",
      keep: ["Hook 反问", "UI 证明", "合规资质"],
      change: "18-22s：CTA 从「立即申请」升级为「限时立即申请」+ 倒计时 + 二维码放大",
      impact: "下载 / 申请转化 ↗",
      confidence: 0.68,
      lifecycleFit: ["scaling", "potential"],
      brief: "用紧迫感 + 30 秒承诺降低决策成本，把观看转成 CTA 点击。",
      briefText,
      script: baseScript("cta"),
      storyboard: baseStoryboard("cta", "结尾倒计时不超过 1.5s，避免和资质 ID 信任感冲突"),
      expectedDelta: "预计 CTA 点击率 +12~18%",
      risks: ["紧迫感过强可能影响平台合规 · 必须保留 SEC 资质和免责声明"],
    },
  ]
}

function getWeddingDressDirections(): ReplicaDirectionV2[] {
  const briefText = [
    "帮我做一条 9.38 秒的高定婚纱展厅展示短视频，目标用户是正在备婚、挑选婚礼主纱，关注闪钻、大拖尾、展厅高级感和上镜效果的新娘。",
    "",
    "镜头结构：",
    "- 0-1.5s：Hook 钩子。暗场展厅里单束聚光打在银白闪钻大拖尾婚纱上，首帧让整件婚纱成为唯一视觉中心。",
    "- 1.5-9.38s：产品演示。镜头保持慢推进和轻微移动，持续展示胸口闪钻重工、蓬裙体量、大拖尾、腰线结构和展厅反光质感。",
    "",
    "风格 & 节奏：",
    "- 暗场聚光、慢推进、细节闪光、轻奢安静，不做吵闹口播。",
    "- 情绪曲线：首帧惊艳 -> 细节可信 -> 整裙记忆。",
    "- 卖点优先级：1) 闪钻重工 2) 大拖尾公主裙 3) 高定腰线 4) 展厅聚光质感。",
  ].join("\n")

  const baseScript = (variant: "hook" | "proof" | "combo"): ScriptStep[] => {
    const isHook = variant === "hook" || variant === "combo"
    const isProof = variant === "proof" || variant === "combo"
    return [
      {
        timeRange: "0-1.5s",
        voiceover: isHook ? "第一眼，只让整件婚纱发光。" : "这件婚纱，先用完整轮廓抓住视线。",
        subtitle: isHook ? "Spotlight first. Full gown first." : "Crystal ball gown in spotlight.",
        action: isHook
          ? "暗场保留一束聚光，镜头先让胸口钻面亮起，再完整露出蓬裙和大拖尾；首帧不要切细节，先给整裙结果。"
          : "从展厅暗场淡入整裙全景，婚纱居中，保持慢推进，让用户看清闪钻、公主裙体量和拖尾轮廓。",
      },
      {
        timeRange: "1.5-9.38s",
        voiceover: isProof ? "近看是整片闪钻重工，远看是完整大拖尾轮廓。" : "满身闪钻和层叠纱摆，让白纱在灯下更有体量。",
        subtitle: isProof ? "Crystal detail · Sculpted waist · Full train." : "Sparkle, volume, silhouette.",
        action: isProof
          ? "沿胸口钉钻、腰线结构、裙面反光和拖尾边缘做慢速展示，卖点标签只标真实可见位置：闪钻重工 / 高定腰线 / 大拖尾。"
          : "镜头维持缓慢移动，依次带到胸口钻面、裙摆体量、拖尾延展和展厅地面反光，保持高定静物展示感。",
      },
    ]
  }

  const baseStoryboard = (variant: "hook" | "proof" | "combo"): StoryboardShot[] => {
    const isHook = variant === "hook" || variant === "combo"
    const isProof = variant === "proof" || variant === "combo"
    return [
      {
        timeRange: "0-1.5s",
        shot: isHook
          ? "黑场开场，聚光先打亮胸口水钻，再露出整件公主裙和大拖尾，整裙始终位于画面正中心。"
          : "暗场展厅全景，婚纱置于画面中心，镜头慢慢推进，周围礼服只作为环境暗示。",
        framing: "全景慢推",
        materials: ["暗场婚纱展厅", "单束聚光", "闪钻公主裙", "完整大拖尾"],
        notes: "首帧必须能看清裙身轮廓和钻光，暗场不能压掉胸口与裙摆细节。",
      },
      {
        timeRange: "1.5-9.38s",
        shot: isProof
          ? "近景扫过胸口钉钻和腰线，再拉回蓬裙体量与拖尾边缘；轻量卖点标签贴在真实细节旁边。"
          : "镜头围绕整裙做慢速展示，保留胸口反光、裙面层次、拖尾长度和展厅地面反射。",
        framing: "中远景 / 近景穿插",
        materials: ["胸口闪钻", "高定腰线", "蓬裙体量", "大拖尾", "柔白字幕"],
        notes: "只拆 Hook 钩子和产品演示两段；字幕与标签不能遮挡胸口、腰线和拖尾。",
      },
    ]
  }

  const directionBriefText = (variant: "hook" | "proof" | "combo", title: string) => {
    const steps = baseScript(variant)
    return [
      title + " 内容脚本",
      "",
      ...steps.map((step) => [
        "[" + step.timeRange + "]",
        "口播：" + step.voiceover,
        "字幕：" + step.subtitle,
        "画面：" + step.action,
      ].join("\n")),
    ].join("\n\n")
  }

  return [
    {
      id: "A",
      title: "强聚光 Hook · 整裙首帧拉停",
      desc: "来自诊断建议 1：保留暗场聚光和闪钻大拖尾首帧，把前 1.5 秒做成整裙揭幕，强化停留优势。",
      axis: "hook",
      keep: ["暗场婚纱展厅", "整裙居中", "闪钻公主裙", "大拖尾轮廓"],
      change: "0-1.5s 聚光更集中，先给整裙结果，再进入细节；避免首帧只拍局部。",
      impact: "首帧停留 / CTR ↗",
      confidence: 0.88,
      lifecycleFit: ["peak", "scaling", "potential"],
      brief: "用更强的聚光揭幕和完整婚纱轮廓，把用户注意力压在首帧。",
      briefText: directionBriefText("hook", "A · 强聚光 Hook"),
      script: baseScript("hook"),
      storyboard: baseStoryboard("hook"),
      expectedDelta: "预计首帧停留 +18~28%，CTR +10~16%",
      risks: ["画面不能压得过暗，必须保留钻面反光和裙摆轮廓。"],
    },
    {
      id: "B",
      title: "强细节 Proof · 闪钻与腰线证明",
      desc: "来自诊断建议 2：在产品演示段放大闪钻重工、腰线结构和拖尾体量，让高客单婚纱有更明确的细节支撑。",
      axis: "scene",
      keep: ["全裙展示", "闪钻重工", "高定腰线", "大拖尾"],
      change: "1.5-9.38s 用慢速细节展示和轻量标签证明卖点，标签只贴真实可见位置。",
      impact: "完播 / 商品理解 ↗",
      confidence: 0.82,
      lifecycleFit: ["scaling", "peak"],
      brief: "把“好看”变成可被看见的重工细节，提升用户对婚纱价值的理解。",
      briefText: directionBriefText("proof", "B · 强细节 Proof"),
      script: baseScript("proof"),
      storyboard: baseStoryboard("proof"),
      expectedDelta: "预计完播 +12~20%，商品理解 +10~16%",
      risks: ["细节标签要克制，不能把高定展示做成普通商品贴纸。"],
    },
    {
      id: "C",
      title: "强聚光 Hook + 强细节 Proof 组合",
      desc: "来自诊断建议 3：同时保留强聚光首帧和强细节证明，形成完整的“先拉停，再证明”复刻版本。",
      axis: "scene",
      keep: ["暗场聚光", "整裙首帧", "闪钻细节", "拖尾轮廓"],
      change: "0-1.5s 强化聚光首帧；1.5-9.38s 强化闪钻、腰线和拖尾细节证明。",
      impact: "首帧停留 / 完播 ↗",
      confidence: 0.84,
      lifecycleFit: ["peak", "scaling", "potential"],
      brief: "把强 Hook 和强 Proof 合并成一个版本，用完整婚纱结果拉停，再用真实细节支撑价值。",
      briefText: directionBriefText("combo", "C · 强聚光 Hook + 强细节 Proof 组合"),
      script: baseScript("combo"),
      storyboard: baseStoryboard("combo"),
      expectedDelta: "预计首帧停留 +15~24%，完播 +10~18%",
      risks: ["两个强化点都要服务真实素材内容，不能额外添加原视频没有的转化动作。"],
    },
  ]
}

// ─── Step 5: mockGenerationOutcomes ─────────────────────────────────────────

export function mockGenerationOutcomes(directions: ReplicaDirectionV2[]): GenerationOutcome[] {
  const isWeddingDress = directions.some((d) =>
    d.briefText?.includes("婚纱") || d.title.includes("闪钻") || d.title.includes("聚光")
  )

  return directions.map((d) => ({
    id: `out_${d.id}`,
    directionId: d.id,
    status: "pending",
    progress: 0,
    thumb: isWeddingDress ? WEDDING_DRESS_COVER : `https://picsum.photos/seed/outcome_${d.id}/480/854`,
    durationSec: isWeddingDress ? 9.38 : 15,
  }))
}
// ═══════════════════════════════════════════════════════════════════════════
// Discovery Hub mock helpers（自有 / 市场 / 竞对）
// ═══════════════════════════════════════════════════════════════════════════

export type OwnHotSort = "order" | "roi"
export function getOwnHotPicks(n: number, sort: OwnHotSort = "roi"): Material[] {
  const list = MATERIALS.filter((m) => m.bucket === "core").slice()
  list.sort((a, b) =>
    sort === "order"
      ? b.metrics.orders - a.metrics.orders
      : b.metrics.roi - a.metrics.roi
  )
  return list.slice(0, n)
}

export type MarketHotSort = "latest" | "played" | "engaged"
export function getMarketHotPicks(n: number, sort: MarketHotSort = "latest"): Material[] {
  const list = MATERIALS.slice(0, n * 2)
  list.sort((a, b) => {
    if (sort === "latest")  return a.ageDays - b.ageDays
    if (sort === "played")  return b.metrics.impressions - a.metrics.impressions
    /* engaged */            return b.metrics.ctr - a.metrics.ctr
  })
  return list.slice(0, n)
}

export type CompetitorSort = "latest" | "played" | "engaged" | "sustained"

// 用 brand 名做 seed 拿稳定子集；每个品牌得到一组不同缩略图
// 加 sort 后缀 → 切 tab 时缩略图也轮换，视觉上能感知切换
export function getCompetitorMaterialsByBrand(brandSeed: string, n: number, sort: CompetitorSort = "latest"): { thumb: string; id: string }[] {
  const base = brandSeed.toLowerCase().replace(/[^a-z0-9]/g, "")
  return Array.from({ length: n }, (_, i) => ({
    id: `${base}_${sort}_ad_${i + 1}`,
    thumb: `https://picsum.photos/seed/${base}_${sort}_${i + 1}/480/854`,
  }))
}

