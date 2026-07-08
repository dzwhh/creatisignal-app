import type { Product } from "./types"

// ─── Mock 商品库 ──────────────────────────────────────────────────────────────
// 预置 2 个商品便于演示；链接解析为 2.5s 进度环模拟（见 product-modal）

export const PRESET_PRODUCTS: Product[] = [
  {
    id: "prod-worklight",
    title: "5000mAh 磁吸折叠工作灯",
    source: "link",
    url: "https://hotligh.com/products/rechargeable-work-light",
    images: [
      { id: "prod-worklight-1", src: "https://picsum.photos/seed/wl-main/400/400" },
      { id: "prod-worklight-2", src: "https://picsum.photos/seed/wl-side/400/400" },
      { id: "prod-worklight-3", src: "https://picsum.photos/seed/wl-use/400/400" },
      { id: "prod-worklight-4", src: "https://picsum.photos/seed/wl-pack/400/400" },
    ],
  },
  {
    id: "prod-headlamp",
    title: "感应式超轻头灯 230°广角",
    source: "manual",
    images: [
      { id: "prod-headlamp-1", src: "https://picsum.photos/seed/hl-main/400/400" },
      { id: "prod-headlamp-2", src: "https://picsum.photos/seed/hl-wear/400/400" },
      { id: "prod-headlamp-3", src: "https://picsum.photos/seed/hl-night/400/400" },
    ],
  },
]

/** 链接解析完成后返回的 mock 商品（标题按域名简单变化，图集固定） */
export function buildAnalyzedProduct(url: string): Product {
  const id = `prod-${Date.now().toString(36)}`
  let host = "商品"
  try {
    host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "")
  } catch {
    /* 保持默认 */
  }
  return {
    id,
    title: `全景声蓝牙音响 · 来自 ${host}`,
    source: "link",
    url,
    images: [
      { id: `${id}-1`, src: `https://picsum.photos/seed/${id}a/400/400` },
      { id: `${id}-2`, src: `https://picsum.photos/seed/${id}b/400/400` },
      { id: `${id}-3`, src: `https://picsum.photos/seed/${id}c/400/400` },
    ],
  }
}
