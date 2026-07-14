// ─── 创意生成：模板 / 引用 / 商品 领域类型 ─────────────────────────────────────
// 术语对照见根目录 CONTEXT.md；句段替换机制见 docs/adr/0002

/** 参考区中一条媒体引用（编号与提示词中 [Image #n] / [Video #n] 对应） */
export interface Reference {
  id: string
  kind: "image" | "video"
  /** 在同类引用中的序号，从 1 开始；渲染为 [Image #n] / [Video #n] */
  index: number
  thumb: string
  name: string
  /** 来源：模板自带 / 商品图 / 素材库选择 / 本地上传 */
  source: "template" | "product" | "library" | "upload"
  /** source 为 product 时指向商品 */
  productId?: string
}

/** 模板提示词中可被 Hook/场景选择器替换的句段 */
export interface PromptSegment {
  slot: "hook" | "scene"
  /** 当前句段文本（必须与提示词中一段完全一致才能替换） */
  text: string
}

/** Hook / 场景 的一个可选项 */
export interface SlotOption {
  id: string
  label: string
  /** 选中后写入提示词的句子 */
  sentence: string
  /** 底部 tab 卡片封面图 */
  cover: string
}

/** 模板推荐的生成配置 */
export interface TemplateSettings {
  ratio: string
  duration: number
  model: string
  resolution: string
}

/** 投放目标（平台 / 地区 / 语言），影响生成语境 */
export interface Targeting {
  platform: string
  region: string
  language: string
}

/** 创意打法（Playbook）：结构化提示词 + 参考媒体 + Hook/场景预设 + 推荐配置 */
export interface Template {
  id: string
  name: string
  /** 类型标签，如「口播种草」「开箱测评」 */
  tag: string
  cover: string
  description: string
  /**
   * 提示词模板。包含 {hook} {scene} 两个句段占位符，
   * 以及 [Image #n] / [Video #n] 引用 token。
   */
  prompt: string
  /** Hook 选项，第一个为默认 */
  hooks: SlotOption[]
  /** 场景选项，第一个为默认 */
  scenes: SlotOption[]
  /** 模板自带参考媒体（应用时进入参考区） */
  references: Omit<Reference, "index">[]
  settings: TemplateSettings
}

/** 商品库中的一件商品 */
export interface Product {
  id: string
  title: string
  /** 商品图集，第一张为主图 */
  images: { id: string; src: string }[]
  source: "link" | "manual"
  /** 链接解析来源 URL */
  url?: string
}

/** 解析中的商品占位（进度环状态） */
export interface AnalyzingProduct {
  id: string
  url: string
  progress: number
}
