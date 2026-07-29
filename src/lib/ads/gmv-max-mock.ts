import type { AdAccount, GmvMaxTask, Shop, ShopProduct, ShopVideo } from "./gmv-max-types"

// ─── TikTok GMV Max 创编：纯前端 mock 数据 ───────────────────────────────────

export const mockAccounts: AdAccount[] = [
  {
    id: "acc-1",
    name: "GSUS-TikTok Ecommerce ops-Tecdo-VSA-US1",
    advertiserId: "7352806048576716816",
    currency: "USD",
  },
  {
    id: "acc-2",
    name: "GSUS-TikTok Ecommerce ops-Tecdo-VSA-US2",
    advertiserId: "7594710320099622929",
    currency: "USD",
  },
  {
    id: "acc-3",
    name: "GSUS-TikTok Ecommerce ops-Tecdo-GB1",
    advertiserId: "7412093855216677391",
    currency: "GBP",
  },
]

export const mockShops: Shop[] = [
  { id: "shop-1", name: "Grace Bridal Official Store", region: "US" },
  { id: "shop-2", name: "Tecdo Fashion Outlet", region: "US" },
  { id: "shop-3", name: "Bloom & Lace Boutique", region: "GB" },
]

export const mockProducts: ShopProduct[] = [
  { id: "prod-1", name: "蕾丝拖尾婚纱 · 经典款", price: "$189.00", sales: 1284 },
  { id: "prod-2", name: "缎面 A 字裙婚纱 · 简约款", price: "$149.00", sales: 986 },
  { id: "prod-3", name: "亮片鱼尾晚礼服", price: "$129.00", sales: 754 },
  { id: "prod-4", name: "复古方领伴娘裙", price: "$79.00", sales: 512 },
  { id: "prod-5", name: "珍珠头纱配饰套装", price: "$39.00", sales: 431 },
  { id: "prod-6", name: "高腰阔腿西装裤", price: "$59.00", sales: 327 },
]

export const mockVideos: ShopVideo[] = [
  { id: "vid-1", title: "新娘试纱实拍 | 灯光下的蕾丝细节", author: "@grace.bridal", duration: "00:21", gmv: "$12.4k", cover: "/creative-assets/wedding-dress-cover.png", source: "creative" },
  { id: "vid-2", title: "婚纱开箱：从包装到上身全流程", author: "@grace.bridal", duration: "00:34", gmv: "$9.8k", cover: "/creative-assets/wedding-dress-cover.png", source: "creative" },
  { id: "vid-3", title: "3 套婚纱换装挑战，最后一套绝了", author: "@bridetobe.us", duration: "00:18", gmv: "$7.2k", source: "creative" },
  { id: "vid-4", title: "伴娘裙合集 | 一场婚礼的配色方案", author: "@bloomlace", duration: "00:27", gmv: "$4.6k", source: "private" },
  { id: "vid-5", title: "晚礼服上身对比：亮片 vs 缎面", author: "@tecdo.fashion", duration: "00:24", gmv: "$3.9k", source: "private" },
  { id: "vid-6", title: "婚纱清洗与收纳小技巧", author: "@grace.bridal", duration: "00:41", gmv: "$2.1k", source: "tiktok" },
  { id: "vid-7", title: "门店实拍：婚纱上新第一视角", author: "@grace.bridal", duration: "00:16", gmv: "$1.8k", source: "tiktok" },
]

export const mockTasks: GmvMaxTask[] = [
  {
    id: 197, name: "07211632_真人", advertiserId: "7594710320099622929",
    createdAt: "07-21 16:32:28", status: "failed", duration: "30m18s",
    hasGmvMaxLink: false, hasVideoLink: true,
    failReason: "素材审核未通过：视频含第三方水印，已终止创编流程。",
    config: { planName: "真人", roasBid: "2.0", dailyBudget: "800" },
  },
  {
    id: 196, name: "07211404_裤子", advertiserId: "7594710320099622929",
    createdAt: "07-21 14:04:21", status: "failed", duration: "25m22s",
    hasGmvMaxLink: false, hasVideoLink: true,
    failReason: "商品库存低于投放阈值，GMV Max 计划创建被拒。",
    config: { planName: "裤子", roasBid: "2.2", dailyBudget: "500" },
  },
  {
    id: 177, name: "06171004_11111111裙子", advertiserId: "7594710320099622929",
    createdAt: "06-17 10:04:33", status: "success", duration: "25m30s",
    hasGmvMaxLink: true, hasVideoLink: true,
    config: { planName: "11111111裙子", roasBid: "2.5", dailyBudget: "1000" },
  },
  {
    id: 176, name: "{06251958}_测试01", advertiserId: "7594710320099622929",
    createdAt: "06-16 19:58:35", status: "success", duration: "20m30s",
    hasGmvMaxLink: true, hasVideoLink: true,
    config: { planName: "测试01", roasBid: "1.8", dailyBudget: "600" },
  },
  {
    id: 175, name: "{06171832}_copy", advertiserId: "7594710320099622929",
    createdAt: "06-16 18:33:07", status: "success", duration: "41m28s",
    hasGmvMaxLink: true, hasVideoLink: true,
    config: { planName: "copy", roasBid: "2.5", dailyBudget: "1200" },
  },
  {
    id: 174, name: "06161625_ggggg", advertiserId: "7594710320099622929",
    createdAt: "06-16 16:25:15", status: "success", duration: "20m32s",
    hasGmvMaxLink: true, hasVideoLink: true,
    config: { planName: "ggggg", roasBid: "3.0", dailyBudget: "900" },
  },
  {
    id: 173, name: "06161624_ggsgsg", advertiserId: "7594710320099622929",
    createdAt: "06-16 16:24:12", status: "failed", duration: "9.8s",
    hasGmvMaxLink: false, hasVideoLink: true,
    failReason: "广告账户余额不足，创编请求被 TikTok Ads 拒绝。",
    config: { planName: "ggsgsg", roasBid: "2.0", dailyBudget: "700" },
  },
  {
    id: 172, name: "06161541_asdfsf", advertiserId: "7594710320099622929",
    createdAt: "06-16 15:41:19", status: "failed", duration: "20m14s",
    hasGmvMaxLink: false, hasVideoLink: true,
    failReason: "视频抓取超时：店铺关联帖子接口连续 3 次无响应。",
    config: { planName: "asdfsf", roasBid: "2.4", dailyBudget: "300" },
  },
  {
    id: 169, name: "06161531_ccccccc", advertiserId: "7594710320099622929",
    createdAt: "06-16 15:31:17", status: "failed", duration: "20m17s",
    hasGmvMaxLink: false, hasVideoLink: true,
    failReason: "ROAS 出价低于账户历史最低门槛，计划校验失败。",
    config: { planName: "ccccccc", roasBid: "0.5", dailyBudget: "400" },
  },
  {
    id: 167, name: "06161416_aaaa", advertiserId: "7594710320099622929",
    createdAt: "06-16 14:16:00", status: "success", duration: "42m16s",
    hasGmvMaxLink: true, hasVideoLink: true,
    config: { planName: "aaaa", roasBid: "2.6", dailyBudget: "1500" },
  },
  {
    id: 166, name: "06161203_fff", advertiserId: "7594710320099622929",
    createdAt: "06-16 12:03:01", status: "success", duration: "25m27s",
    hasGmvMaxLink: true, hasVideoLink: true,
    config: { planName: "fff", roasBid: "2.0", dailyBudget: "1000" },
  },
  {
    id: 165, name: "06161201_测试商品01", advertiserId: "7594710320099622929",
    createdAt: "06-16 12:01:50", status: "failed", duration: "16.8s",
    hasGmvMaxLink: false, hasVideoLink: true,
    failReason: "商品未通过 TikTok Shop 资质审核，无法进入 GMV Max 投放。",
    config: { planName: "测试商品01", roasBid: "2.1", dailyBudget: "200" },
  },
]
