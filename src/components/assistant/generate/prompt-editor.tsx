"use client"

import { useMemo, useRef, useState, useEffect, type RefObject } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Reference } from "@/lib/generate/types"
import { tokenOf } from "@/lib/generate/references"

// ─── 引用 token 与结构化标签高亮 ─────────────────────────────────────────────

// [Image #n]/[Video #n] 引用 token；【Hook】等结构化段落标签
const PART_RE = /\[(Image|Video) #(\d+)\]|【(创意模板|Hook|场景|产品展示|卖点证明|节奏与风格|CTA)】/g

const CLICKABLE_LABELS: Record<string, "hooks" | "scenes"> = { Hook: "hooks", 场景: "scenes" }

// ─── 高亮层渲染 ──────────────────────────────────────────────────────────────

function TokenizedText({ text, hoveredToken, onLabelClick }: {
  text: string
  hoveredToken: string | null
  onLabelClick?: (slot: "hooks" | "scenes") => void
}) {
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  const re = new RegExp(PART_RE.source, "g")
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const part = m[0]
    if (m[3]) {
      // 结构化标签：【Hook】【场景】可点击跳转底部对应 tab
      const slot = CLICKABLE_LABELS[m[3]]
      parts.push(
        slot && onLabelClick ? (
          <span
            key={`${m.index}-${part}`}
            role="button"
            tabIndex={-1}
            onClick={() => onLabelClick(slot)}
            title={`点击选择${m[3] === "Hook" ? "开场 Hook" : "场景"}`}
            className="relative z-10 pointer-events-auto cursor-pointer font-bold text-[var(--text)] hover:underline decoration-[var(--lime)] decoration-2 underline-offset-2"
          >
            {part}
          </span>
        ) : (
          <span key={`${m.index}-${part}`} className="font-bold text-[var(--text)]">{part}</span>
        )
      )
    } else {
      const isImage = m[1] === "Image"
      parts.push(
        <span
          key={`${m.index}-${part}`}
          className={cn(
            "rounded-[4px] box-decoration-clone transition-colors duration-150",
            isImage ? "bg-[var(--lime-soft)] text-[#3a4a10]" : "bg-[#e8e8ec] text-[#3f3f46]",
            hoveredToken === part && (isImage ? "bg-[var(--lime)] text-[#1a2010]" : "bg-[#d4d4d8] text-[#18181b]")
          )}
        >
          {part}
        </span>
      )
    }
    last = m.index + part.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

function HighlightLayer({ text, flash, hoveredToken, onLabelClick }: {
  text: string
  flash: { text: string; nonce: number } | null
  hoveredToken: string | null
  onLabelClick?: (slot: "hooks" | "scenes") => void
}) {
  // 句段替换后：找到新句段范围，包一层 seg-flash 扫光
  let pre = text
  let flashPart: string | null = null
  let post = ""
  if (flash && flash.text) {
    const at = text.indexOf(flash.text)
    if (at >= 0) {
      pre = text.slice(0, at)
      flashPart = flash.text
      post = text.slice(at + flash.text.length)
    }
  }
  return (
    <>
      <TokenizedText text={pre} hoveredToken={hoveredToken} onLabelClick={onLabelClick} />
      {flashPart !== null && (
        <span key={flash!.nonce} className="seg-flash box-decoration-clone">
          <TokenizedText text={flashPart} hoveredToken={hoveredToken} onLabelClick={onLabelClick} />
        </span>
      )}
      {post && <TokenizedText text={post} hoveredToken={hoveredToken} onLabelClick={onLabelClick} />}
      {/* 尾随换行占位，保证高度与 textarea 一致 */}
      {text.endsWith("\n") && "​"}
    </>
  )
}

// ─── 参考区：统一名称胶囊（商品 lime，其他灰）────────────────────────────────

function ReferenceChip({ reference, onRemove, onHover }: {
  reference: Reference
  onRemove: () => void
  onHover: (token: string | null) => void
}) {
  const token = tokenOf(reference)
  const isVideo = reference.kind === "video"
  const isProduct = reference.source === "product"
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.6, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: 8 }}
      transition={{ type: "spring", stiffness: 480, damping: 30 }}
      onMouseEnter={() => onHover(token)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "flex items-center gap-2 h-[46px] pl-1.5 pr-1.5 rounded-[12px] border shrink-0 group",
        isProduct ? "border-[#c8dd7f] bg-[var(--lime-soft)]/50" : "border-[var(--line)] bg-white"
      )}
    >
      <div className={cn(
        "relative h-[34px] rounded-[8px] overflow-hidden bg-[var(--soft)] shrink-0",
        isVideo ? "w-[50px]" : "w-[34px]"
      )}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={reference.thumb} alt={reference.name} className="w-full h-full object-cover" />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-black/50 flex items-center justify-center">
              <Play size={7} fill="white" className="text-white ml-[1px]" />
            </div>
          </div>
        )}
      </div>
      <span className={cn(
        "text-[12.5px] font-semibold max-w-[130px] truncate",
        isProduct ? "text-[#3a4a10]" : "text-[var(--text)]"
      )}>
        {reference.name}
      </span>
      {/* 编号：与提示词 token 对应 */}
      <span className={cn(
        "h-[18px] px-1.5 rounded-md text-[10px] font-black flex items-center shrink-0",
        reference.kind === "image"
          ? "bg-[var(--lime)] text-[#1a2010]"
          : "bg-[var(--soft)] text-[#3f3f46]"
      )}>
        #{reference.index}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`移除 ${reference.name}`}
        className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center cursor-pointer shrink-0 transition-colors",
          isProduct ? "text-[#5a6b1a] hover:bg-[#dff0a8]" : "text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--text)]"
        )}
      >
        <X size={11} strokeWidth={2.5} />
      </button>
    </motion.div>
  )
}

// ─── 主组件：全宽 textarea + 同步高亮层，下方槽位与引用同行 ──────────────────

interface PromptEditorProps {
  value: string
  onChange: (v: string) => void
  references: Reference[]
  onRemoveReference: (id: string) => void
  placeholder: string
  maxLength: number
  textareaRef: RefObject<HTMLTextAreaElement | null>
  /** 句段替换后传入新句段文本触发扫光 */
  flash?: { text: string; nonce: number } | null
  /** 点击【Hook】/【场景】标签时回调（跳转底部对应 tab） */
  onLabelClick?: (slot: "hooks" | "scenes") => void
  /** 引用行最前的上传槽位（由 generate-mode 传入） */
  leadingSlots?: React.ReactNode
  /** 引用行末尾的额外 chip（如数字人，不参与 token 编号） */
  extraChips?: React.ReactNode
}

export function PromptEditor({
  value, onChange, references, onRemoveReference,
  placeholder, maxLength, textareaRef, flash = null, onLabelClick,
  leadingSlots = null, extraChips = null,
}: PromptEditorProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)

  // 字体度量必须与 textarea 完全一致，否则高亮错位
  const sharedTypography = "text-[15px] leading-[1.6] font-[inherit] whitespace-pre-wrap break-words"

  // 自动增高（上限 260px 后内部滚动）
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`
    if (backdropRef.current) backdropRef.current.scrollTop = el.scrollTop
  }, [value, textareaRef])

  // 商品引用（用户资产）打头，其余引用图片在前视频在后
  const { productRefs, otherRefs } = useMemo(() => {
    const products = references.filter((r) => r.source === "product")
    const others = [...references.filter((r) => r.source !== "product")]
      .sort((a, b) => (a.kind === b.kind ? a.index - b.index : a.kind === "image" ? -1 : 1))
    return { productRefs: products, otherRefs: others }
  }, [references])

  return (
    <div className="flex flex-col gap-2.5 min-w-0">
      {/* 提示词：全宽输入框 + 高亮叠层 */}
      <div className="relative">
        <div
          ref={backdropRef}
          aria-hidden
          className={cn(
            "absolute inset-0 overflow-hidden pointer-events-none text-[#24272f] select-none",
            sharedTypography
          )}
        >
          <HighlightLayer text={value} flash={flash} hoveredToken={hoveredToken} onLabelClick={onLabelClick} />
        </div>
        <textarea
          ref={textareaRef}
          className={cn(
            "relative w-full min-h-[52px] max-h-[260px] border-0 outline-none resize-none bg-transparent",
            "text-transparent caret-[#24272f] placeholder:text-[var(--muted-2)]",
            sharedTypography
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={(e) => { if (backdropRef.current) backdropRef.current.scrollTop = e.currentTarget.scrollTop }}
          maxLength={maxLength}
          rows={2}
        />
      </div>

      {/* 槽位 + 引用行：商品胶囊在前，分隔线，其余引用在后 */}
      <div className="flex flex-wrap items-center gap-2.5">
        {leadingSlots}
        <AnimatePresence initial={false}>
          {productRefs.map((ref) => (
            <ReferenceChip key={ref.id} reference={ref} onRemove={() => onRemoveReference(ref.id)} onHover={setHoveredToken} />
          ))}
          {productRefs.length > 0 && otherRefs.length > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-px h-8 bg-[var(--line)] shrink-0"
            />
          )}
          {otherRefs.map((ref) => (
            <ReferenceChip key={ref.id} reference={ref} onRemove={() => onRemoveReference(ref.id)} onHover={setHoveredToken} />
          ))}
        </AnimatePresence>
        {extraChips}
      </div>
    </div>
  )
}
