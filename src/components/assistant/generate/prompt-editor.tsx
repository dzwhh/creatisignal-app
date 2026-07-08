"use client"

import { useMemo, useRef, useState, useEffect, type RefObject } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Reference } from "@/lib/generate/types"
import { tokenOf } from "@/lib/generate/references"

// ─── 引用 token 高亮 ─────────────────────────────────────────────────────────

const TOKEN_RE = /\[(Image|Video) #(\d+)\]/g

// ─── 高亮层渲染 ──────────────────────────────────────────────────────────────

function TokenizedText({ text, hoveredToken }: { text: string; hoveredToken: string | null }) {
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  const re = new RegExp(TOKEN_RE.source, "g")
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const token = m[0]
    const isImage = m[1] === "Image"
    parts.push(
      <span
        key={`${m.index}-${token}`}
        className={cn(
          "rounded-[4px] box-decoration-clone transition-colors duration-150",
          isImage ? "bg-[var(--lime-soft)] text-[#3a4a10]" : "bg-[#e8e8ec] text-[#3f3f46]",
          hoveredToken === token && (isImage ? "bg-[var(--lime)] text-[#1a2010]" : "bg-[#d4d4d8] text-[#18181b]")
        )}
      >
        {token}
      </span>
    )
    last = m.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}

function HighlightLayer({ text, flash, hoveredToken }: {
  text: string
  flash: { text: string; nonce: number } | null
  hoveredToken: string | null
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
      <TokenizedText text={pre} hoveredToken={hoveredToken} />
      {flashPart !== null && (
        <span key={flash!.nonce} className="seg-flash box-decoration-clone">
          <TokenizedText text={flashPart} hoveredToken={hoveredToken} />
        </span>
      )}
      {post && <TokenizedText text={post} hoveredToken={hoveredToken} />}
      {/* 尾随换行占位，保证高度与 textarea 一致 */}
      {text.endsWith("\n") && "​"}
    </>
  )
}

// ─── 参考区缩略图 ────────────────────────────────────────────────────────────

function RefThumb({ reference, onRemove, onHover }: {
  reference: Reference
  onRemove: () => void
  onHover: (token: string | null) => void
}) {
  const token = tokenOf(reference)
  const isVideo = reference.kind === "video"
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.6, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6, y: 8 }}
      transition={{ type: "spring", stiffness: 480, damping: 30 }}
      className="relative shrink-0 group"
      onMouseEnter={() => onHover(token)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={cn(
        "overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--soft)]",
        isVideo ? "w-[62px] h-[42px]" : "w-[42px] h-[42px]"
      )}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={reference.thumb} alt={reference.name} className="w-full h-full object-cover" />
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
              <Play size={9} fill="white" className="text-white ml-[1px]" />
            </div>
          </div>
        )}
      </div>
      {/* 编号角标：与提示词 token 对应 */}
      <span className={cn(
        "absolute -top-1.5 -left-1.5 min-w-4 h-4 px-[3px] rounded-full text-[9px] font-black flex items-center justify-center shadow-sm pointer-events-none",
        reference.kind === "image" ? "bg-[var(--lime)] text-[#1a2010]" : "bg-[#3f3f46] text-white"
      )}>
        {reference.index}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`移除 ${reference.name}`}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#18181b] text-white items-center justify-center cursor-pointer hover:bg-[#444] z-10 shadow-sm hidden group-hover:flex"
      >
        <X size={8} strokeWidth={2.5} />
      </button>
    </motion.div>
  )
}

// ─── 主组件：textarea + 同步高亮层 + 参考区 ──────────────────────────────────

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
  /** 参考区末尾的额外 chip（如数字人，不参与 token 编号） */
  extraChips?: React.ReactNode
}

export function PromptEditor({
  value, onChange, references, onRemoveReference,
  placeholder, maxLength, textareaRef, flash = null, extraChips = null,
}: PromptEditorProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const [hoveredToken, setHoveredToken] = useState<string | null>(null)

  // 字体度量必须与 textarea 完全一致，否则高亮错位
  const sharedTypography = "text-[15px] leading-[1.5] font-[inherit] whitespace-pre-wrap break-words"

  // 自动增高（上限 220px 后内部滚动）
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`
    if (backdropRef.current) backdropRef.current.scrollTop = el.scrollTop
  }, [value, textareaRef])

  const sortedRefs = useMemo(
    () => [...references].sort((a, b) => (a.kind === b.kind ? a.index - b.index : a.kind === "image" ? -1 : 1)),
    [references]
  )

  return (
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      {/* 参考区 */}
      <AnimatePresence initial={false}>
        {(sortedRefs.length > 0 || extraChips) && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2.5 pt-0.5"
          >
            <AnimatePresence initial={false}>
              {sortedRefs.map((ref) => (
                <RefThumb key={ref.id} reference={ref} onRemove={() => onRemoveReference(ref.id)} onHover={setHoveredToken} />
              ))}
            </AnimatePresence>
            {extraChips}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入框 + 高亮叠层 */}
      <div className="relative">
        <div
          ref={backdropRef}
          aria-hidden
          className={cn(
            "absolute inset-0 overflow-hidden pointer-events-none text-[#24272f] select-none",
            sharedTypography
          )}
        >
          <HighlightLayer text={value} flash={flash} hoveredToken={hoveredToken} />
        </div>
        <textarea
          ref={textareaRef}
          className={cn(
            "relative w-full min-h-[52px] max-h-[220px] border-0 outline-none resize-none bg-transparent",
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
    </div>
  )
}
