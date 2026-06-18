import sampleData from "./sample-breakdown.json"
import type { BoundaryKind, DynamicElement, Scene, VideoBreakdown } from "./breakdown-types"

// ─── 加载示例 breakdown ─────────────────────────────────────────────────────

export function loadSampleBreakdown(): VideoBreakdown {
  return sampleData as unknown as VideoBreakdown
}

// ─── AI 启发式：初始判定每个 dynamic element 的复刻边界 ───────────────────

export function inferElementBoundary(elem: DynamicElement): BoundaryKind {
  const content = elem.content.toLowerCase()

  // 合规/法律声明 → 必须保留（SEC / terms / certificate）
  if (
    content.includes("sec") ||
    content.includes("terms") ||
    content.includes("certificate") ||
    content.includes("registration no") ||
    content.includes("regulated by") ||
    content.includes("legal") ||
    content.includes("免责") ||
    content.includes("法律")
  ) {
    return "keep"
  }

  // 品牌名 / Tagline 标题 → 禁止复制（品牌专属内容）
  if (elem.category === "title") {
    if (
      content.includes("cashify") ||
      content.includes("brand") ||
      content.includes("品牌") ||
      // 品牌口号常见模式
      /^[a-z\s]+\.\s*[a-z\s]+\.$/.test(elem.content.trim())
    ) {
      return "ban"
    }
  }

  // 品牌 Logo → 必须保留（用户复刻时换成自己 Logo，仍是保留"有 Logo"这件事）
  if (elem.category === "shape" && (content.includes("logo") || content.includes("cashify"))) {
    return "keep"
  }

  // 字幕：通常保留节奏与位置（即使内容会变）
  if (elem.category === "caption") {
    return "keep"
  }

  // 关键词强调 title（数字/金额放大）→ 保留节奏，但内容可改 → change
  if (elem.category === "title" && elem.narration_relation === "keyword_emphasis") {
    return "change"
  }

  // UI 面板 → 可改（品牌界面，复刻时需重设计）
  if (elem.category === "ui_panel") {
    return "change"
  }

  // 特效 / 标注 / 计数器 → 可改（视觉装饰类）
  if (
    elem.category === "effect" ||
    elem.category === "annotation" ||
    elem.category === "counter"
  ) {
    return "change"
  }

  // 默认 change
  return "change"
}

// ─── 唯一 key（用于 overrides 记录） ────────────────────────────────────────

export function getElementKey(sceneId: number, elemId: number): string {
  return `${sceneId}_${elemId}`
}

// ─── 拿到某个 element 的最终边界（override 优先于 AI 推断） ─────────────────

export function resolveBoundary(
  scene: Scene,
  elem: DynamicElement,
  overrides: Record<string, BoundaryKind>
): BoundaryKind {
  const k = getElementKey(scene.scene_id, elem.id)
  return overrides[k] ?? inferElementBoundary(elem)
}

// ─── 全局统计：keep / change / ban 数量 ────────────────────────────────────

export function aggregateBoundary(
  scenes: Scene[],
  overrides: Record<string, BoundaryKind>
): Record<BoundaryKind, number> {
  const stats: Record<BoundaryKind, number> = { keep: 0, change: 0, ban: 0 }
  for (const scene of scenes) {
    for (const elem of scene.dynamic_elements) {
      const b = resolveBoundary(scene, elem, overrides)
      stats[b]++
    }
  }
  return stats
}

// ─── 找到当前时间命中的 scene_id ───────────────────────────────────────────

export function findActiveSceneId(scenes: Scene[], time: number): number | null {
  for (const s of scenes) {
    if (time >= s.start_time && time < s.end_time) return s.scene_id
  }
  // 边界：超过最后一个 scene 末尾时，命中最后一个
  if (scenes.length > 0 && time >= scenes[scenes.length - 1].end_time) {
    return scenes[scenes.length - 1].scene_id
  }
  return null
}
