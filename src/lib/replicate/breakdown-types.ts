// ─── Video breakdown JSON 类型 ────────────────────────────────────────────────
// 对应 sample-breakdown.json 结构

export type DynamicCategory =
  | "caption"
  | "shape"
  | "ui_panel"
  | "title"
  | "effect"
  | "annotation"
  | "counter"

export type NarrativeRole =
  | "hook"
  | "problem_setup"
  | "solution_intro"
  | "benefit_highlight"
  | "product_demo"
  | "objection_handling"
  | "social_proof"
  | "cta"

export type BoundaryKind = "keep" | "change" | "ban"

export type SceneType = "hybrid" | "hyperframes" | "video_only"

// ─── Dynamic Element ────────────────────────────────────────────────────────

export type DynamicElement = {
  id: number
  category: DynamicCategory
  content: string
  visual_description: string
  animation: string
  start: number
  end: number
  narration_relation?: "independent" | "keyword_emphasis"
}

// ─── Transcript ─────────────────────────────────────────────────────────────

export type Transcript = {
  time: string
  speaker: string
  state: string
  content: string
  content_chinese: string
}

// ─── Scene Profile ──────────────────────────────────────────────────────────

export type Profile = {
  shot: {
    shot_size: string
    camera_movement: string
    camera_angle: string
  }
  host: {
    present: boolean
    pip_mode: boolean
  }
  scene_type: SceneType
  visual_description: {
    hyperframes_layer: string
    video_layer: string | null
  }
}

// ─── Scene ──────────────────────────────────────────────────────────────────

export type Scene = {
  scene_id: number
  start_time: number
  end_time: number
  duration: number
  narrative_role: NarrativeRole[]
  narrative_context: string
  transcript: Transcript[]
  local_path: string
  video_url: string | null
  profile: Profile
  dynamic_elements: DynamicElement[]
}

// ─── Narrative Section ──────────────────────────────────────────────────────

export type NarrativeSection = {
  sect_id: number
  role: NarrativeRole
  time: string
  scene_context: string
  description: string
  strategy: string | null
  transcript: Transcript[]
}

// ─── Top-level VideoBreakdown ───────────────────────────────────────────────

export type VideoBreakdown = {
  source_video_url: string
  narrative_overview: {
    overall_strategy: string
    target_audience: string
    emotional_journey: string
    viral_analysis: {
      hook_trigger_mechanism: string
      hook_sentence_pattern: string
      persuasion_type: string
      conversion_trigger: string
      emotion_curve: string[]
      rhythm_profile: {
        hook_pace: string
        body_pace: string
        cta_pace: string
      }
    }
  }
  scenes: Scene[]
  narrative_sections: NarrativeSection[]
}

// ─── Meta：narrative role 颜色 + label ──────────────────────────────────────

export const NARRATIVE_ROLE_META: Record<NarrativeRole, {
  label: string
  short: string
  color: string             // 16 进制色，用于时间轴段
  bg: string
  border: string
  text: string
}> = {
  hook:               { label: "Hook",       short: "Hook",   color: "#dc2626", bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
  problem_setup:      { label: "痛点铺垫",   short: "痛点",   color: "#f97316", bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
  solution_intro:     { label: "解决方案",   short: "方案",   color: "#0ea5e9", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  benefit_highlight:  { label: "收益强化",   short: "收益",   color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  product_demo:       { label: "产品演示",   short: "演示",   color: "#d97706", bg: "#fffbeb", border: "#fde68a", text: "#a16207" },
  objection_handling: { label: "异议处理",   short: "异议",   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9" },
  social_proof:       { label: "社交验证",   short: "验证",   color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4", text: "#0f766e" },
  cta:                { label: "号召行动",   short: "CTA",    color: "#a855f7", bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" },
}

// ─── Meta：dynamic category 标签 + 图标 ────────────────────────────────────
// 用 lucide icon name 字符串，渲染端 import 后查表（避免在 types 里依赖 lucide）

export type DynamicCategoryIconName =
  | "MessageSquare"
  | "Shapes"
  | "LayoutDashboard"
  | "Type"
  | "Sparkles"
  | "PenLine"
  | "Hash"

export const DYNAMIC_CATEGORY_META: Record<DynamicCategory, {
  label: string
  iconName: DynamicCategoryIconName
  dot: string
}> = {
  caption:    { label: "字幕",      iconName: "MessageSquare",    dot: "#0ea5e9" },
  shape:      { label: "图形",      iconName: "Shapes",           dot: "#7c3aed" },
  ui_panel:   { label: "UI 面板",   iconName: "LayoutDashboard",  dot: "#0d9488" },
  title:      { label: "标题",      iconName: "Type",             dot: "#d97706" },
  effect:     { label: "特效",      iconName: "Sparkles",         dot: "#a855f7" },
  annotation: { label: "标注",      iconName: "PenLine",          dot: "#ef4444" },
  counter:    { label: "计数器",    iconName: "Hash",             dot: "#16a34a" },
}

// ─── Meta：边界三色 ────────────────────────────────────────────────────────

export const BOUNDARY_META: Record<BoundaryKind, {
  label: string
  short: string
  bg: string
  border: string
  text: string
  dot: string
}> = {
  keep:   { label: "必须保留", short: "保留", bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#16a34a" },
  change: { label: "可以改",   short: "可改", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", dot: "#2563eb" },
  ban:    { label: "禁止复制", short: "禁止", bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", dot: "#dc2626" },
}
