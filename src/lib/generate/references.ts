import type { Reference } from "./types"

// ─── 引用 token 工具（[Image #n] / [Video #n]）───────────────────────────────

export function tokenOf(ref: Pick<Reference, "kind" | "index">): string {
  return `[${ref.kind === "image" ? "Image" : "Video"} #${ref.index}]`
}

/** 同类引用的下一个可用编号 */
export function nextIndex(refs: Reference[], kind: Reference["kind"]): number {
  return refs.filter((r) => r.kind === kind).reduce((max, r) => Math.max(max, r.index), 0) + 1
}

/** 按 kind 重新从 1 编号（保持相对顺序），返回新引用数组 */
export function renumber(refs: Reference[]): Reference[] {
  const counters: Record<Reference["kind"], number> = { image: 0, video: 0 }
  return refs.map((r) => ({ ...r, index: ++counters[r.kind] }))
}

/**
 * 移除一条引用：从文本中删掉它的 token，
 * 并把同类中编号更大的引用依次前移（文本内 token 同步改写）。
 */
export function removeReference(
  refs: Reference[],
  id: string,
  text: string
): { refs: Reference[]; text: string } {
  const target = refs.find((r) => r.id === id)
  if (!target) return { refs, text }

  // 删除 token（连同紧邻的一个空格，避免留双空格）
  const token = tokenOf(target)
  let nextText = text.split(`${token} `).join("").split(` ${token}`).join("").split(token).join("")

  // 同类后续引用前移，升序替换避免碰撞
  const shifted = refs
    .filter((r) => r.kind === target.kind && r.index > target.index)
    .sort((a, b) => a.index - b.index)
  for (const r of shifted) {
    nextText = nextText.split(tokenOf(r)).join(tokenOf({ kind: r.kind, index: r.index - 1 }))
  }

  const nextRefs = refs
    .filter((r) => r.id !== id)
    .map((r) => (r.kind === target.kind && r.index > target.index ? { ...r, index: r.index - 1 } : r))

  return { refs: nextRefs, text: nextText }
}
