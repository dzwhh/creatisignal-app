// 积分体系共用数据与计算

export type CreditTxKind = "earn" | "spend"

export type CreditTx = {
  id: string
  title: string
  ts: string
  delta: number          // 正 = 获得，负 = 消耗
}

export const CREDIT_BALANCE = {
  /** 剩余 = 赠送 + 充值 */
  gift: 10_880,
  paid: 90,
}
export const CREDIT_TOTAL = CREDIT_BALANCE.gift + CREDIT_BALANCE.paid

export const CREDIT_LEDGER: CreditTx[] = [
  { id: "t1",  title: "一次性赠送", ts: "2026-07-30 18:23", delta:    100 },
  { id: "t2",  title: "生成视频",   ts: "2026-07-30 14:34", delta:   -420 },
  { id: "t3",  title: "每日刷新",   ts: "2026-07-30 11:53", delta: 10_800 },
  { id: "t4",  title: "到期清零",   ts: "2026-07-30 00:04", delta: -7_188 },
  { id: "t5",  title: "尝鲜体验包", ts: "2026-07-29 20:41", delta:     10 },
  { id: "t6",  title: "尝鲜体验包", ts: "2026-07-29 20:36", delta:     10 },
  { id: "t7",  title: "尝鲜体验包", ts: "2026-07-29 20:27", delta:     10 },
  { id: "t8",  title: "生成图片",   ts: "2026-07-29 16:12", delta:    -60 },
  { id: "t9",  title: "每日刷新",   ts: "2026-07-29 11:48", delta: 10_800 },
  { id: "t10", title: "口播配音",   ts: "2026-07-28 19:05", delta:   -140 },
]

// ─── 月度套餐 ────────────────────────────────────────────────────────────────

export type CreditPack = {
  id: string
  name: string
  price: number
  /** 购买积分（不含赠送） */
  base: number
  /** 赠送积分 */
  bonus: number
  desc: string
  recommended?: boolean
  /** 起价（企业级） */
  from?: boolean
}

/**
 * 固定档加量包 —— 前 3 档，允许小额起步。
 * 第 4 档是弹性档（见 FLEX），不在这个数组里。
 * 数据来源：官方定价表（实付 / 赠送金额 / 购买积分 / 赠送积分）。
 */
export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", name: "尝鲜包", price:  69, base:    760, bonus:  20, desc: "适合首次体验与单条视频测试" },
  { id: "regular", name: "常用包", price: 299, base:  3_310, bonus: 110, desc: "适合日常创作与小批量素材产出", recommended: true },
  { id: "pro",     name: "进阶包", price: 999, base: 11_030, bonus: 550, desc: "适合稳定产出与多项目并行" },
]

// ─── 第 4 档：弹性加量包（大额用户自选）──────────────────────────────────────

export const FLEX = {
  id: "flex",
  name: "弹性包",
  desc: "适合大额采购与团队规模化生产",
  min: 20_000,
  max: 100_000,
  step: 5_000,
  /**
   * 官方定价表口径：**整单套用所在档的单价**（不是累进）。
   * 单价 = 表中「每秒单价」÷ 10，对应 87 / 86 折两档。
   *
   * 整单套档在档位边界理论上可能出现「多买反而更便宜」，
   * 但在本区间（2 万–10 万、步长 5,000）唯一的边界是 5 万，
   * 跨档增量 5,000×0.08858 = ¥442.9 远大于折让损失
   * 50,000×0.00103 = ¥51.5，故不会倒挂。若日后放宽上限
   * 到 60 万以上，需改回累进计价。
   */
  tiers: [
    { upTo:  50_000, unit: 0.08961 },   // 87 折
    { upTo: 100_000, unit: 0.08858 },   // 86 折
  ],
}

/** 所在档的单价（整单套用，与官方定价表一致） */
export function flexUnitPrice(credits: number): number {
  const tier = FLEX.tiers.find((t) => credits <= t.upTo) ?? FLEX.tiers[FLEX.tiers.length - 1]
  return tier.unit
}

/** 整单套档计价：积分 × 所在档单价 */
export function flexPrice(credits: number): number {
  return Math.round(credits * flexUnitPrice(credits))
}

/** 下一档，用于「再买多少可享更低单价」提示 */
export function flexNextTier(credits: number): { upTo: number; unit: number } | undefined {
  return FLEX.tiers.find((t) => credits < t.upTo && t.unit < flexUnitPrice(credits))
}

// ─── 消耗换算（用于「约可生成」）─────────────────────────────────────────────

export const COST = {
  /** 15s 视频 · Seedance 2.0-720P */
  video15s: 152,
  image: 1,
  /** 每积分约耗时（秒），用于预计到账秒数 */
  secPerCredit: 0.1,
}

export function videosFrom(credits: number): number {
  return Math.floor(credits / COST.video15s)
}

export function imagesFrom(credits: number): number {
  return Math.floor(credits / COST.image)
}

export function fmt(n: number): string {
  return n.toLocaleString("en-US")
}
