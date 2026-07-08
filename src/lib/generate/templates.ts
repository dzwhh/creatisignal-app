import type { Template, SlotOption, Reference, Product } from "./types"
import { tokenOf, renumber } from "./references"

// ─── Mock 视频生成模板 ────────────────────────────────────────────────────────
// 提示词占位符：{hook} {scene} 为可替换句段；{product} 指向商品图引用；
// {video1}/{image1} 指向模板自带的第 n 个参考视频/参考图。

const HOOKS = {
  pain: { id: "hook-pain", label: "痛点开场", sentence: "开头 3 秒直击痛点：昏暗车底找不到螺丝的抓狂瞬间" },
  price: { id: "hook-price", label: "价格先出", sentence: "开头 3 秒价格冲击：字幕砸出「不到一顿外卖钱」" },
  conflict: { id: "hook-conflict", label: "冲突反转", sentence: "开头 3 秒制造冲突：同事的灯突然没电，主角淡定掏出备用" },
  result: { id: "hook-result", label: "结果前置", sentence: "开头 3 秒先给结果：漆黑机舱被瞬间照亮的前后对比" },
  question: { id: "hook-question", label: "提问开场", sentence: "开头 3 秒抛出问题：「你还在用嘴咬着手电干活吗？」" },
} satisfies Record<string, SlotOption>

const SCENES = {
  repair: { id: "scene-repair", label: "维修间", sentence: "场景设定在维修间：戴手套的双手在发动机舱内操作" },
  home: { id: "scene-home", label: "居家夜修", sentence: "场景设定在深夜居家：橱柜底下检修水管的狭小空间" },
  outdoor: { id: "scene-outdoor", label: "户外露营", sentence: "场景设定在户外露营地：夜间帐篷旁的挂灯与手持照明" },
  unbox: { id: "scene-unbox", label: "开箱桌面", sentence: "场景设定在开箱桌面：牛皮纸箱、气泡膜与商品特写" },
  street: { id: "scene-street", label: "街头实测", sentence: "场景设定在夜晚街头：路边应急换胎的真实实测" },
} satisfies Record<string, SlotOption>

export const TEMPLATES: Template[] = [
  {
    id: "tpl-talking-seed",
    name: "达人口播种草",
    tag: "口播种草",
    cover: "https://picsum.photos/seed/tpl-talk/480/600",
    description: "数字人/达人出镜口播，痛点引入 + 商品演示 + 行动号召",
    prompt:
      "{hook}。{scene}。达人手持 {product} 中的商品出镜口播，边说边演示核心功能，" +
      "参考 {video1} 的运镜节奏，中景与商品特写交替。结尾达人指向屏幕下方，" +
      "字幕弹出「点击下方链接立省 30%」。",
    hooks: [HOOKS.pain, HOOKS.price, HOOKS.question, HOOKS.conflict],
    scenes: [SCENES.repair, SCENES.home, SCENES.outdoor],
    references: [
      { id: "tplref-talk-v1", kind: "video", thumb: "https://picsum.photos/seed/tplv1/300/200", name: "口播节奏参考", source: "template" },
    ],
    settings: { ratio: "9:16", duration: 30, model: "Seedance 2", resolution: "720P" },
  },
  {
    id: "tpl-unboxing",
    name: "沉浸式开箱",
    tag: "开箱测评",
    cover: "https://picsum.photos/seed/tpl-unbox/480/600",
    description: "第一视角开箱，ASMR 质感音效 + 细节特写 + 上手体验",
    prompt:
      "{hook}。{scene}。第一视角拆开包装，指尖划过 {product} 中商品的金属表面，" +
      "微距镜头扫过接口与开关细节，安静环境音突出撕膜与咔哒声，整体布光参考 {image1}。" +
      "最后一镜上手点亮，光束打在墙面形成光斑。",
    hooks: [HOOKS.result, HOOKS.question, HOOKS.price],
    scenes: [SCENES.unbox, SCENES.home],
    references: [
      { id: "tplref-unbox-v1", kind: "video", thumb: "https://picsum.photos/seed/tplv2/300/200", name: "开箱运镜参考", source: "template" },
      { id: "tplref-unbox-i1", kind: "image", thumb: "https://picsum.photos/seed/tpli1/300/300", name: "布光参考", source: "template" },
    ],
    settings: { ratio: "9:16", duration: 20, model: "Seedance 2", resolution: "720P" },
  },
  {
    id: "tpl-compare",
    name: "痛点对比实测",
    tag: "对比实测",
    cover: "https://picsum.photos/seed/tpl-comp/480/600",
    description: "旧方案 vs 新方案分屏对比，用结果差距说服",
    prompt:
      "{hook}。{scene}。左右分屏对比：左侧普通手电照明范围小、频繁没电；" +
      "右侧 {product} 中的商品广角泛光 + 磁吸固定解放双手。" +
      "中段插入亮度实测数据字幕，参考 {video1} 的对比剪辑节奏收尾。",
    hooks: [HOOKS.conflict, HOOKS.pain, HOOKS.result],
    scenes: [SCENES.repair, SCENES.street, SCENES.outdoor],
    references: [
      { id: "tplref-comp-v1", kind: "video", thumb: "https://picsum.photos/seed/tplv3/300/200", name: "对比节奏参考", source: "template" },
    ],
    settings: { ratio: "9:16", duration: 30, model: "Seedance 2", resolution: "720P" },
  },
  {
    id: "tpl-scene-story",
    name: "场景剧情带货",
    tag: "剧情种草",
    cover: "https://picsum.photos/seed/tpl-story/480/600",
    description: "生活化小剧情植入商品，先共情后种草",
    prompt:
      "{hook}。{scene}。剧情推进中自然带出 {product} 中的商品救场，" +
      "人物表情从抓狂到松弛，商品使用过程给足 3 秒特写。" +
      "结尾定格商品 + 价格贴纸，画外音一句「早买早享受」。",
    hooks: [HOOKS.conflict, HOOKS.question, HOOKS.pain],
    scenes: [SCENES.home, SCENES.street, SCENES.repair],
    references: [],
    settings: { ratio: "9:16", duration: 45, model: "Veo 3", resolution: "720P" },
  },
  {
    id: "tpl-fast-cut",
    name: "卖点快剪",
    tag: "快节奏",
    cover: "https://picsum.photos/seed/tpl-cut/480/600",
    description: "3 秒一个卖点的高密度快剪，适合信息流强曝光",
    prompt:
      "{hook}。{scene}。以 {product} 中的商品为主体做高密度快剪：" +
      "每 3 秒切一个卖点（亮度 / 磁吸 / 续航 / 防水），" +
      "每个卖点配大号动态字幕与音效重音，参考 {video1} 的卡点节奏。",
    hooks: [HOOKS.price, HOOKS.result, HOOKS.question],
    scenes: [SCENES.repair, SCENES.outdoor, SCENES.unbox],
    references: [
      { id: "tplref-cut-v1", kind: "video", thumb: "https://picsum.photos/seed/tplv4/300/200", name: "卡点节奏参考", source: "template" },
    ],
    settings: { ratio: "9:16", duration: 15, model: "Kling 2.1", resolution: "720P" },
  },
  {
    id: "tpl-creator-review",
    name: "素人真实测评",
    tag: "信任背书",
    cover: "https://picsum.photos/seed/tpl-review/480/600",
    description: "素人视角的真实使用反馈，弱广告感强信任感",
    prompt:
      "{hook}。{scene}。手机手持拍摄质感，素人边用边聊 {product} 中的商品，" +
      "保留自然口误和环境噪音，穿插两段使用一周后的真实画面，" +
      "结尾给出「买前必看的 1 个缺点」增强可信度。",
    hooks: [HOOKS.question, HOOKS.pain, HOOKS.result],
    scenes: [SCENES.home, SCENES.repair, SCENES.street],
    references: [],
    settings: { ratio: "9:16", duration: 40, model: "Seedance 1 Pro", resolution: "720P" },
  },
]

// ─── 模板应用 ────────────────────────────────────────────────────────────────

export interface TemplateApplication {
  text: string
  references: Reference[]
  hook: SlotOption
  scene: SlotOption
}

/**
 * 应用模板：保留既有商品图引用（重新编号在前），拼上模板自带参考，
 * 解析 {product}/{videoN}/{imageN} 占位符，并用默认 Hook/场景渲染句段。
 * 若提示词需要商品图而参考区没有，用 fallbackProduct 的主图自动补一张。
 */
export function applyTemplate(
  template: Template,
  keptProductRefs: Reference[],
  fallbackProduct: Product | null
): TemplateApplication {
  // 1. 商品图引用打头
  let productRefs = renumber(keptProductRefs.filter((r) => r.source === "product" && r.kind === "image"))
  if (productRefs.length === 0 && template.prompt.includes("{product}") && fallbackProduct) {
    productRefs = [{
      id: `ref-${fallbackProduct.id}-auto`,
      kind: "image",
      index: 1,
      thumb: fallbackProduct.images[0].src,
      name: fallbackProduct.title,
      source: "product",
      productId: fallbackProduct.id,
    }]
  }

  // 2. 模板自带参考顺延编号
  const counters = { image: productRefs.length, video: 0 }
  const templateRefs: Reference[] = template.references.map((r) => ({
    ...r,
    id: `${template.id}-${r.id}`,
    index: ++counters[r.kind],
  }))
  const references = [...productRefs, ...templateRefs]

  // 3. 解析占位符
  const hook = template.hooks[0]
  const scene = template.scenes[0]
  const ownImages = templateRefs.filter((r) => r.kind === "image")
  const ownVideos = templateRefs.filter((r) => r.kind === "video")
  const text = template.prompt
    .replace("{hook}", hook.sentence)
    .replace("{scene}", scene.sentence)
    .replaceAll("{product}", productRefs[0] ? tokenOf(productRefs[0]) : "[Image #1]")
    .replace(/\{(image|video)(\d+)\}/g, (_, kind: string, n: string) => {
      const pool = kind === "image" ? ownImages : ownVideos
      const ref = pool[Number(n) - 1]
      return ref ? tokenOf(ref) : ""
    })

  return { text, references, hook, scene }
}

// ─── 句段工具（见 docs/adr/0002）──────────────────────────────────────────────

/**
 * 在现有文本中把旧句段替换为新句段。
 * 若旧句段已被用户手改（找不到完全匹配），降级为末尾追加，返回 replaced: false。
 */
export function replaceSegment(
  text: string,
  oldSentence: string,
  newSentence: string
): { text: string; replaced: boolean } {
  if (oldSentence && text.includes(oldSentence)) {
    return { text: text.replace(oldSentence, newSentence), replaced: true }
  }
  const trimmed = text.trimEnd()
  const sep = trimmed === "" ? "" : trimmed.endsWith("。") ? "" : "。"
  return { text: `${trimmed}${sep}${newSentence}。`, replaced: false }
}
