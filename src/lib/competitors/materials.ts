// 品牌追踪 · 素材库 mock（按 brandId 稳定生成）

export type MaterialFormat = "video" | "image"
export type MaterialStatus = "live" | "stopped"
export type MaterialPlatform = "tiktok" | "meta"

export type BrandMaterial = {
  id: string
  thumb: string
  format: MaterialFormat
  status: MaterialStatus
  platform: MaterialPlatform
  /** 来源标签，如 "E-commerce website" */
  source: string
  likes: number
  saves: number
  reach: number
}

export const FORMAT_META: Record<MaterialFormat, { label: string }> = {
  video: { label: "视频" },
  image: { label: "图片" },
}

export const STATUS_META: Record<MaterialStatus, { label: string; bg: string; text: string }> = {
  live:    { label: "投放中", bg: "#dcfce7", text: "#15803d" },
  stopped: { label: "已停投", bg: "rgba(0,0,0,0.55)", text: "#ffffff" },
}

export const PLATFORM_META: Record<MaterialPlatform, { label: string }> = {
  tiktok: { label: "TikTok" },
  meta:   { label: "Meta" },
}

const SOURCES = ["E-commerce website", "Brand official", "Creator UGC", "Live shopping"]

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * splitmix32 finalizer —— 雪崩混合。
 * 必须有这一步：相邻下标的字符串哈希值也相邻，直接取模会让
 * 格式/平台/状态高度相关（出现「图片素材永远不在投放」这类假象）。
 */
function mix(x: number): number {
  let h = x >>> 0
  h ^= h >>> 16
  h = Math.imul(h, 0x21f0aaad)
  h ^= h >>> 15
  h = Math.imul(h, 0x735a2d97)
  h ^= h >>> 15
  return h >>> 0
}

/** 每个维度走独立的 stream，互不相关 */
function pick(seed: number, i: number, stream: number): number {
  return mix(seed ^ Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(stream, 0x85ebca6b)) % 100
}

/**
 * 生成品牌的素材库。数量与属性都由 brandId 稳定派生，
 * 刷新不变，但不同品牌各不相同。
 */
export function getBrandMaterials(brandId: string, count = 40): BrandMaterial[] {
  const base = brandId.toLowerCase().replace(/[^a-z0-9]/g, "") || "brand"
  const seed = hash(brandId)

  return Array.from({ length: count }, (_, i) => {
    // 约 82% 视频，贴近真实广告库构成
    const format: MaterialFormat = pick(seed, i, 1) < 82 ? "video" : "image"
    // 约 28% 仍在投放（与格式无关）
    const status: MaterialStatus = pick(seed, i, 2) < 28 ? "live" : "stopped"
    const platform: MaterialPlatform = pick(seed, i, 3) < 62 ? "tiktok" : "meta"
    const m = mix(seed ^ Math.imul(i + 1, 0xc2b2ae35))
    return {
      id: `${base}_lib_${i + 1}`,
      thumb: `https://picsum.photos/seed/${base}_lib_${i + 1}/480/854`,
      format,
      status,
      platform,
      source: SOURCES[pick(seed, i, 4) % SOURCES.length],
      likes: 8_000 + (m % 380_000),
      saves: 1 + (pick(seed, i, 5) % 9),
      reach: mix(m) % 12_000,
    }
  })
}
