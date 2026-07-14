import type { Template, SlotOption, Reference, Product } from "./types"
import { tokenOf, renumber } from "./references"

// ─── Mock 创意模板（Playbook）─────────────────────────────────────────────────
// 结构化提示词七段式：【创意模板】【Hook】【场景】【产品展示】【卖点证明】【节奏与风格】【CTA】。
// 【Hook】【场景】行的 {hook}/{scene} 为可替换句段（标签保留，切换时整行句子替换）；
// {product} 指向商品图引用；{video1}/{image1} 指向模板自带参考。

const HOOKS = {
  pain: { id: "hook-pain", label: "痛点开场", sentence: "开头 3 秒直击痛点：昏暗车底找不到螺丝，用户焦急摸索", cover: "https://picsum.photos/seed/hook-pain/300/380" },
  price: { id: "hook-price", label: "价格先出", sentence: "开头 3 秒价格冲击：字幕砸出「不到一顿外卖钱」", cover: "https://picsum.photos/seed/hook-price/300/380" },
  conflict: { id: "hook-conflict", label: "冲突反转", sentence: "开头 3 秒制造冲突：同事的灯突然没电，主角淡定掏出备用", cover: "https://picsum.photos/seed/hook-conflict/300/380" },
  result: { id: "hook-result", label: "结果前置", sentence: "开头 3 秒先给结果：漆黑机舱被瞬间照亮的前后对比", cover: "https://picsum.photos/seed/hook-result/300/380" },
  question: { id: "hook-question", label: "提问开场", sentence: "开头 3 秒抛出问题：「你还在用嘴咬着手电干活吗？」", cover: "https://picsum.photos/seed/hook-question/300/380" },
} satisfies Record<string, SlotOption>

const SCENES = {
  repair: { id: "scene-repair", label: "维修间", sentence: "场景设定在昏暗维修间：用户戴手套在发动机舱内操作，突出光线不足和双手被占用", cover: "https://picsum.photos/seed/scene-repair/300/380" },
  home: { id: "scene-home", label: "居家夜修", sentence: "场景设定在深夜居家：橱柜底下检修水管的狭小空间", cover: "https://picsum.photos/seed/scene-home/300/380" },
  outdoor: { id: "scene-outdoor", label: "户外露营", sentence: "场景设定在户外露营地：夜间帐篷旁的挂灯与手持照明", cover: "https://picsum.photos/seed/scene-outdoor/300/380" },
  unbox: { id: "scene-unbox", label: "开箱桌面", sentence: "场景设定在开箱桌面：牛皮纸箱、气泡膜与商品特写", cover: "https://picsum.photos/seed/scene-unbox/300/380" },
  street: { id: "scene-street", label: "街头实测", sentence: "场景设定在夜晚街头：路边应急换胎的真实实测", cover: "https://picsum.photos/seed/scene-street/300/380" },
} satisfies Record<string, SlotOption>

// 全量选项（底部 Hooks/场景 tab 与画廊弹窗直接消费，不依赖模板）
export const HOOK_OPTIONS: SlotOption[] = Object.values(HOOKS)
export const SCENE_OPTIONS: SlotOption[] = Object.values(SCENES)

export const TEMPLATES: Template[] = [
  {
    id: "pb-pain-test",
    name: "痛点实测",
    tag: "痛点实测",
    cover: "https://picsum.photos/seed/pb-pain/480/600",
    description: "痛点引入 + 实测演示 + 限时优惠，转化型打法首选",
    prompt:
      "创作一条适合 TikTok 投放的 9:16 竖版短视频广告，推广 {product} 中的商品，围绕用户核心痛点展开，并突出产品带来的直接收益。\n" +
      "【创意模板】采用「痛点实测」打法：先呈现真实痛点，再展示产品解决过程，最后用实测效果增强说服力。\n" +
      "【Hook】{hook}。\n" +
      "【场景】{scene}。\n" +
      "【产品展示】使用 {product} 中的商品演示核心功能，展示磁吸固定、折叠调节、点亮瞬间和解放双手。\n" +
      "【卖点证明】通过特写或实测对比展示亮度强、磁吸稳固、防水耐用等卖点，并参考 {video1} 的节奏。\n" +
      "【节奏与风格】节奏紧凑，痛点与解决前后对比鲜明；实拍质感，关键卖点用字幕强调。\n" +
      "【CTA】结尾加入简短明确的购买引导；如有优惠信息，突出限时优惠。",
    hooks: [HOOKS.pain, HOOKS.conflict, HOOKS.question, HOOKS.price],
    scenes: [SCENES.repair, SCENES.home, SCENES.street],
    references: [
      { id: "pbref-pain-v1", kind: "video", thumb: "https://picsum.photos/seed/pbv1/300/200", name: "维修场景实拍", source: "template" },
    ],
    settings: { ratio: "9:16", duration: 30, model: "Seedance 2", resolution: "720P" },
  },
  {
    id: "pb-ugc-review",
    name: "UGC 测评",
    tag: "UGC",
    cover: "https://picsum.photos/seed/pb-ugc/480/600",
    description: "素人视角真实反馈，弱广告感强信任感",
    prompt:
      "创作一条适合 TikTok 投放的 9:16 竖版 UGC 风格测评视频，推广 {product} 中的商品，用素人真实反馈建立信任。\n" +
      "【创意模板】采用「UGC 测评」打法：素人视角边用边聊，弱化广告感，用真实细节增强可信度。\n" +
      "【Hook】{hook}。\n" +
      "【场景】{scene}。\n" +
      "【产品展示】素人边用边聊 {product} 中的商品，保留自然口误与环境噪音。\n" +
      "【卖点证明】穿插两段使用一周后的真实画面，引用一句好评「亮度够强，磁吸很稳！」。\n" +
      "【节奏与风格】手机手持拍摄质感，口语化生活流节奏，避免精修画面。\n" +
      "【CTA】结尾给出「买前必看的 1 个缺点」增强可信度，引导点击购物车。",
    hooks: [HOOKS.question, HOOKS.pain, HOOKS.result],
    scenes: [SCENES.home, SCENES.repair, SCENES.street],
    references: [],
    settings: { ratio: "9:16", duration: 30, model: "Seedance 1 Pro", resolution: "720P" },
  },
  {
    id: "pb-compare",
    name: "对比演示",
    tag: "对比",
    cover: "https://picsum.photos/seed/pb-compare/480/600",
    description: "BEFORE / AFTER 分屏对比，用结果差距说服",
    prompt:
      "创作一条适合 TikTok 投放的 9:16 竖版对比演示广告，推广 {product} 中的商品，用结果差距完成说服。\n" +
      "【创意模板】采用「对比演示」打法：BEFORE / AFTER 分屏结构，让新旧方案的差距肉眼可见。\n" +
      "【Hook】{hook}。\n" +
      "【场景】{scene}。\n" +
      "【产品展示】左侧普通手电照明范围小、频繁没电；右侧 {product} 中的商品广角泛光 + 磁吸固定。\n" +
      "【卖点证明】中段插入亮度实测数据字幕，参考 {video1} 的对比剪辑节奏。\n" +
      "【节奏与风格】分屏切换干脆利落，数据字幕醒目；整体冷静客观，让画面说话。\n" +
      "【CTA】字幕砸出「换掉你的旧手电」，引导评论区置顶链接。",
    hooks: [HOOKS.conflict, HOOKS.pain, HOOKS.result],
    scenes: [SCENES.repair, SCENES.street, SCENES.outdoor],
    references: [
      { id: "pbref-compare-v1", kind: "video", thumb: "https://picsum.photos/seed/pbv2/300/200", name: "对比节奏参考", source: "template" },
    ],
    settings: { ratio: "9:16", duration: 30, model: "Seedance 2", resolution: "720P" },
  },
  {
    id: "pb-unboxing",
    name: "开箱种草",
    tag: "开箱",
    cover: "https://picsum.photos/seed/pb-unbox/480/600",
    description: "第一视角沉浸开箱，ASMR 质感 + 细节特写",
    prompt:
      "创作一条适合 TikTok 投放的 9:16 竖版第一视角开箱种草视频，推广 {product} 中的商品，用细节质感完成种草。\n" +
      "【创意模板】采用「开箱种草」打法：第一视角沉浸开箱，用细节特写与声音质感激发购买欲。\n" +
      "【Hook】{hook}。\n" +
      "【场景】{scene}。\n" +
      "【产品展示】指尖划过 {product} 中商品的金属表面，微距扫过接口与开关细节。\n" +
      "【卖点证明】安静环境音突出撕膜与咔哒声，最后一镜上手点亮，光束在墙面形成光斑。\n" +
      "【节奏与风格】慢节奏微距运镜，ASMR 收音；参考 {video1} 的运镜与 {image1} 的布光。\n" +
      "【CTA】字幕弹出「点击下方链接立省 30%」。",
    hooks: [HOOKS.result, HOOKS.question, HOOKS.price],
    scenes: [SCENES.unbox, SCENES.home],
    references: [
      { id: "pbref-unbox-v1", kind: "video", thumb: "https://picsum.photos/seed/pbv3/300/200", name: "开箱运镜参考", source: "template" },
      { id: "pbref-unbox-i1", kind: "image", thumb: "https://picsum.photos/seed/pbi1/300/300", name: "布光参考", source: "template" },
    ],
    settings: { ratio: "9:16", duration: 20, model: "Seedance 2", resolution: "720P" },
  },
  {
    id: "pb-scene-rescue",
    name: "场景救场",
    tag: "剧情",
    cover: "https://picsum.photos/seed/pb-rescue/480/600",
    description: "生活化小剧情，商品关键时刻救场，先共情后种草",
    prompt:
      "创作一条适合 TikTok 投放的 9:16 竖版剧情式带货视频，推广 {product} 中的商品，先共情后种草。\n" +
      "【创意模板】采用「场景救场」打法：生活化小剧情制造冲突，商品在关键时刻救场。\n" +
      "【Hook】{hook}。\n" +
      "【场景】{scene}。\n" +
      "【产品展示】剧情推进中自然带出 {product} 中的商品救场，人物表情从抓狂到松弛。\n" +
      "【卖点证明】商品使用过程给足 3 秒特写，环境从昏暗到通亮的前后反差。\n" +
      "【节奏与风格】剧情节奏先抑后扬，前段代入感强，后段轻松明快；台词自然口语化。\n" +
      "【CTA】结尾定格商品 + 价格贴纸，画外音一句「早买早享受」。",
    hooks: [HOOKS.conflict, HOOKS.question, HOOKS.pain],
    scenes: [SCENES.home, SCENES.street, SCENES.repair],
    references: [],
    settings: { ratio: "9:16", duration: 30, model: "Veo 3", resolution: "720P" },
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
