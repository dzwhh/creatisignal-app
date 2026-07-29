// ─── TikTok GMV Max 创编：类型与校验 ─────────────────────────────────────────

export type ProductScope = "all" | "specific"
export type VideoSelectMode = "manual" | "smart"
export type ScheduleMode = "immediate" | "custom"
export type TaskStatus = "success" | "failed"

export interface AdAccount {
  id: string
  name: string
  advertiserId: string
  currency: string
}

export interface Shop {
  id: string
  name: string
  region: string
}

export interface ShopProduct {
  id: string
  name: string
  price: string
  sales: number
}

// 视频来源：我的创意视频 / 私域素材库 / TikTok 直发帖
export type VideoSource = "creative" | "private" | "tiktok"

export interface ShopVideo {
  id: string
  title: string
  author: string
  duration: string
  gmv: string
  cover?: string
  source: VideoSource
}

export interface GmvMaxConfig {
  accountId: string
  /** 推广类型：本期仅支持商品 GMV Max，直播置灰预留 */
  promotionType: "product" | "live"
  enableOnCreate: boolean
  planName: string
  shopId: string
  productScope: ProductScope
  productIds: string[]
  roasBid: string
  dailyBudget: string
  promoDayEnabled: boolean
  promoStart: string
  promoEnd: string
  videoMode: VideoSelectMode
  videoIds: string[]
  creatorPostEnabled: boolean
  scheduleMode: ScheduleMode
  scheduleStart: string
  scheduleEnd: string
}

export interface GmvMaxTask {
  id: number
  name: string
  advertiserId: string
  createdAt: string
  status: TaskStatus
  duration: string
  hasGmvMaxLink: boolean
  hasVideoLink: boolean
  failReason?: string
  /** 复制回填新建创编表单用 */
  config?: Partial<GmvMaxConfig>
}

export const defaultGmvMaxConfig: GmvMaxConfig = {
  accountId: "",
  promotionType: "product",
  enableOnCreate: false,
  planName: "",
  shopId: "",
  productScope: "all",
  productIds: [],
  roasBid: "",
  dailyBudget: "",
  promoDayEnabled: false,
  promoStart: "",
  promoEnd: "",
  videoMode: "manual",
  videoIds: [],
  creatorPostEnabled: false,
  scheduleMode: "immediate",
  scheduleStart: "",
  scheduleEnd: "",
}

export const PLAN_NAME_MAX = 512

/** 计划名称的日期前缀，如 07291632_ */
export function planNamePrefix(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}_`
}

export type ConfigErrors = Partial<Record<keyof GmvMaxConfig, string>>

/** 发布前校验：返回 { 字段: 错误信息 }，空对象 = 通过 */
export function validateGmvMaxConfig(config: GmvMaxConfig): ConfigErrors {
  const errors: ConfigErrors = {}
  if (!config.accountId) errors.accountId = "请选择广告账户"
  if (!config.shopId) errors.shopId = "请选择关联店铺"
  if (config.productScope === "specific" && config.productIds.length === 0)
    errors.productIds = "请至少选择 1 个商品"

  const roas = Number(config.roasBid)
  if (!config.roasBid) errors.roasBid = "请输入 ROAS 出价"
  else if (Number.isNaN(roas) || roas <= 0) errors.roasBid = "ROAS 出价须为正数"
  else if (!/^\d+(\.\d)?$/.test(config.roasBid)) errors.roasBid = "最多保留 1 位小数"

  const budget = Number(config.dailyBudget)
  if (!config.dailyBudget) errors.dailyBudget = "请输入每日预算"
  else if (Number.isNaN(budget) || budget <= 0) errors.dailyBudget = "每日预算须为正数"

  if (config.promoDayEnabled && (!config.promoStart || !config.promoEnd))
    errors.promoStart = "请选择促销日期间"
  if (config.videoMode === "manual" && config.videoIds.length === 0)
    errors.videoIds = "请至少挑选 1 个视频"
  if (config.scheduleMode === "custom" && !config.scheduleStart)
    errors.scheduleStart = "请选择开始时间"
  return errors
}
