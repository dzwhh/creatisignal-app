export type AssetKind = "image" | "video" | "avatar" | "product" | "trashed"
export type AssetTab = "generated" | "uploaded" | "avatars" | "products" | "trash"

export type AssetItem = {
  id: string
  kind: AssetKind
  thumb: string
  /** width / height ratio */
  ratio: "1:1" | "9:14" | "16:9" | "4:3"
  /** 显示在卡片底部的时间 */
  timeLabel: string
  /** 文件大小 KB */
  sizeKB: number
  /** 原始名称 / Prompt 摘要 */
  caption?: string
  /** 用于 trash tab：删除时间 */
  deletedAt?: string
}

function makeImage(seed: string, ratio: AssetItem["ratio"] = "1:1"): string {
  const wh = ratio === "1:1" ? "480/480" : ratio === "9:14" ? "480/746" : ratio === "16:9" ? "640/360" : "480/360"
  return `https://picsum.photos/seed/${seed}/${wh}`
}

const TIME_LABELS = [
  "刚刚",
  "10 分钟前",
  "1 小时前",
  "昨天",
  "2 天前",
  "1 周前",
  "2 周前",
  "1 个月前",
  "2 个月前",
  "3 个月前",
]

function pickTime(i: number): string {
  return TIME_LABELS[i % TIME_LABELS.length]
}

export const ASSET_KIND_META: Record<AssetKind, { label: string; bg: string; color: string }> = {
  image:   { label: "图片",   bg: "#dbeafe", color: "#1d4ed8" },
  video:   { label: "视频",   bg: "#ede9fe", color: "#6d28d9" },
  avatar:  { label: "数字人", bg: "#fce7f3", color: "#be185d" },
  product: { label: "商品",   bg: "#dcfce7", color: "#15803d" },
  trashed: { label: "已删除", bg: "#fee2e2", color: "#b91c1c" },
}

// ─── Mock generators per tab ────────────────────────────────────────────────

export const ASSETS_GENERATED: AssetItem[] = Array.from({ length: 24 }, (_, i) => {
  const isVideo = i % 5 === 0
  return {
    id: `gen_${i + 1}`,
    kind: isVideo ? "video" : "image",
    thumb: makeImage(`gen_${i + 7}`, i % 3 === 0 ? "9:14" : "1:1"),
    ratio: i % 3 === 0 ? "9:14" : "1:1",
    timeLabel: pickTime(i),
    sizeKB: 240 + i * 18,
    caption: isVideo ? "30s 演示视频" : "电商场景图",
  }
})

export const ASSETS_UPLOADED: AssetItem[] = Array.from({ length: 16 }, (_, i) => ({
  id: `up_${i + 1}`,
  kind: i % 4 === 0 ? "video" : "image",
  thumb: makeImage(`up_${i + 3}`, i % 2 === 0 ? "16:9" : "1:1"),
  ratio: i % 2 === 0 ? "16:9" : "1:1",
  timeLabel: pickTime(i + 2),
  sizeKB: 480 + i * 30,
  caption: i % 4 === 0 ? "IMG_2086.MOV" : "DSC_0421.JPG",
}))

export const ASSETS_AVATARS: AssetItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `av_${i + 1}`,
  kind: "avatar",
  thumb: makeImage(`av_${i + 11}`, "1:1"),
  ratio: "1:1",
  timeLabel: pickTime(i + 1),
  sizeKB: 96 + i * 8,
  caption: ["小美", "Anna", "Vince", "Kai", "Mei", "Leo", "Sofia", "Hank", "Lina", "Max", "Eli", "Yui"][i],
}))

export const ASSETS_PRODUCTS: AssetItem[] = Array.from({ length: 14 }, (_, i) => ({
  id: `pd_${i + 1}`,
  kind: "product",
  thumb: makeImage(`pd_${i + 21}`, "1:1"),
  ratio: "1:1",
  timeLabel: pickTime(i + 3),
  sizeKB: 184 + i * 14,
  caption: ["ZF7899 磁吸车灯", "户外露营灯", "EDC 多功能扳手", "蓝牙音箱", "便携咖啡杯", "智能手表", "防水手提包", "无线充电板", "运动水壶", "便携投影仪", "夜灯", "桌面香薰机", "蓝牙耳机", "随身风扇"][i],
}))

export const ASSETS_TRASH: AssetItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `tr_${i + 1}`,
  kind: "trashed",
  thumb: makeImage(`tr_${i + 31}`, "1:1"),
  ratio: "1:1",
  timeLabel: pickTime(i + 4),
  sizeKB: 220 + i * 12,
  caption: "已移入回收站",
  deletedAt: ["3 天前", "1 周前", "1 周前", "2 周前", "2 周前", "1 个月前", "1 个月前", "2 个月前"][i],
}))

export const ASSETS_BY_TAB: Record<AssetTab, AssetItem[]> = {
  generated: ASSETS_GENERATED,
  uploaded:  ASSETS_UPLOADED,
  avatars:   ASSETS_AVATARS,
  products:  ASSETS_PRODUCTS,
  trash:     ASSETS_TRASH,
}

// 存储使用量 mock（与 image 一致 41.58 MB / 1 GB）
export const STORAGE_USAGE = { usedMB: 41.58, quotaMB: 1024 }
