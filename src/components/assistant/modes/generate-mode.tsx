"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Video, Image, Link2, Wand2, Plus, ChevronDown, SlidersHorizontal, Hash, Star, X, Play, Package, Sparkles, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SendButton } from "../send-button"
import { ImageSelectModal, type ImageItem } from "@/components/modals/image-select-modal"
import { VideoSelectModal, type VideoItem } from "@/components/modals/video-select-modal"
import { DigitalHumanModal, type DHItem } from "@/components/modals/digital-human-modal"
import { PromptEditor } from "../generate/prompt-editor"
import { TemplateStrip } from "../generate/template-strip"
import { TemplateGalleryModal } from "../generate/template-gallery-modal"
import { ProductModal } from "../generate/product-modal"
import { HookSceneBar } from "../generate/hook-scene-bar"
import { applyTemplate, replaceSegment } from "@/lib/generate/templates"
import { tokenOf, nextIndex, renumber, removeReference } from "@/lib/generate/references"
import { PRESET_PRODUCTS } from "@/lib/generate/products"
import type { Template, SlotOption, Reference, Product } from "@/lib/generate/types"

// ─── Types & Data ────────────────────────────────────────────────────────────

type GenType = "video" | "image" | "remix" | "reverse"
type VideoMode = "reference" | "frames"
type ActivePopup = "genType" | "model" | "settings" | "count" | null

const genTypes = [
  { id: "video" as GenType, label: "视频生成", icon: Video },
  { id: "image" as GenType, label: "图片生成", icon: Image },
  { id: "remix" as GenType, label: "爆款复刻", icon: Link2 },
  { id: "reverse" as GenType, label: "提示词反推", icon: Wand2 },
]

const videoModels = ["Seedance 2", "Seedance 1 Pro", "Veo 3", "Kling 2.1"]
const imageModels = ["Nano Banana Pro", "GPT Image 1", "Seedream 4.0"]
const reverseModels = ["GPT-5.5", "GPT-5.4", "Claude Sonnet 4.5"]

const VIDEO_RESOLUTIONS = ["480P", "720P"]
const IMAGE_RESOLUTIONS = ["1K", "2K", "4K"]
const VIDEO_RATIOS = ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16", "自动"]
const IMAGE_RATIOS = ["Auto", "1:1", "3:4", "4:3", "9:16", "16:9", "21:9"]

function getRectDims(ratio: string, maxDim: number): { w: number; h: number } | null {
  if (ratio === "自动" || ratio === "Auto") return null
  const [wp, hp] = ratio.split(":").map(Number)
  return wp >= hp
    ? { w: maxDim, h: Math.max(3, Math.round((maxDim * hp) / wp)) }
    : { w: Math.max(3, Math.round((maxDim * wp) / hp)), h: maxDim }
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function RatioRect({ ratio, maxDim }: { ratio: string; maxDim: number }) {
  const d = getRectDims(ratio, maxDim)
  if (!d) return null
  return <div style={{ width: d.w, height: d.h }} className="border-[1.5px] border-current rounded-[1.5px] shrink-0" />
}

function PopupCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "absolute bottom-[calc(100%+8px)] left-0 z-30 bg-white border border-[var(--line)] rounded-[14px] shadow-[0_18px_42px_rgba(9,9,11,0.14)]",
      className
    )}>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold text-[var(--muted)] mb-2 tracking-wide">{children}</p>
}

// ─── Popups ──────────────────────────────────────────────────────────────────

function GenTypePopup({ value, onChange }: { value: GenType; onChange: (v: GenType) => void }) {
  return (
    <PopupCard className="w-[176px] p-1.5">
      {genTypes.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" onClick={() => onChange(id)}
          className={cn("w-full h-[34px] rounded-[9px] text-left px-[9px] flex items-center gap-2 text-[13px] font-[650] cursor-pointer", value === id ? "bg-[var(--soft)]" : "hover:bg-[var(--soft)]")}>
          <Icon size={14} strokeWidth={2} />{label}
        </button>
      ))}
    </PopupCard>
  )
}

function ModelPopup({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <PopupCard className="w-[200px] p-1.5">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onSelect(opt)}
          className={cn("w-full h-[34px] rounded-[9px] text-left px-[9px] flex items-center gap-2 text-[13px] font-[650] cursor-pointer", selected === opt ? "bg-[var(--soft)]" : "hover:bg-[var(--soft)]")}>
          <span className="w-4 h-4 rounded bg-[var(--soft)] text-[9px] font-black flex items-center justify-center shrink-0">{opt.slice(0, 2)}</span>
          {opt}
        </button>
      ))}
    </PopupCard>
  )
}

function VideoSettingsPopup({ resolution, setResolution, ratio, setRatio, duration, setDuration }: {
  resolution: string; setResolution: (v: string) => void
  ratio: string; setRatio: (v: string) => void
  duration: number; setDuration: (v: number) => void
}) {
  return (
    <PopupCard className="w-[288px] p-4">
      <div className="mb-4">
        <SectionLabel>分辨率</SectionLabel>
        <div className="flex gap-1 bg-[var(--soft)] rounded-lg p-1">
          {VIDEO_RESOLUTIONS.map((r) => (
            <button key={r} type="button" onClick={() => setResolution(r)}
              className={cn("flex-1 h-7 rounded-md text-[13px] font-semibold transition-colors", resolution === r ? "bg-white shadow-sm text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]")}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <SectionLabel>宽高比</SectionLabel>
        <div className="flex gap-1.5">
          {VIDEO_RATIOS.map((r) => (
            <button key={r} type="button" onClick={() => setRatio(r)}
              className={cn("flex flex-col items-center justify-center gap-[5px] flex-1 py-2 rounded-lg border text-[9px] font-semibold transition-colors",
                ratio === r ? "bg-[#18181b] border-[#18181b] text-white" : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]")}>
              {r === "自动" ? <span className="text-[10px] leading-none">自动</span> : <><RatioRect ratio={r} maxDim={14} /><span className="leading-none">{r}</span></>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>时长</SectionLabel>
        <div className="flex items-center gap-3">
          <input type="range" min={5} max={60} value={duration} onChange={(e) => setDuration(Number(e.target.value))}
            className="dh-range flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #18181b 0%, #18181b ${((duration - 5) / 55) * 100}%, var(--line) ${((duration - 5) / 55) * 100}%, var(--line) 100%)`,
            }} />
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-9 h-7 border border-[var(--line)] rounded-lg text-[13px] font-semibold text-[var(--text)] flex items-center justify-center">{duration}</div>
            <span className="text-[12px] text-[var(--muted)]">s</span>
          </div>
        </div>
      </div>
    </PopupCard>
  )
}

function ImageSettingsPopup({ resolution, setResolution, ratio, setRatio }: {
  resolution: string; setResolution: (v: string) => void
  ratio: string; setRatio: (v: string) => void
}) {
  return (
    <PopupCard className="w-[248px] p-4">
      <div className="mb-4">
        <SectionLabel>Resolution</SectionLabel>
        <div className="flex gap-2">
          {IMAGE_RESOLUTIONS.map((r) => (
            <button key={r} type="button" onClick={() => setResolution(r)}
              className={cn("flex-1 h-8 rounded-lg border text-[13px] font-semibold transition-colors",
                resolution === r ? "bg-[var(--soft)] border-[var(--line-strong)] text-[var(--text)] shadow-sm" : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]")}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Ratio</SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {IMAGE_RATIOS.map((r) => (
            <button key={r} type="button" onClick={() => setRatio(r)}
              className={cn("flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border text-[10px] font-semibold transition-colors",
                ratio === r ? "bg-[var(--soft)] border-[var(--line-strong)] text-[var(--text)] shadow-sm" : "bg-white border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]")}>
              {r === "Auto" ? <><Star size={14} strokeWidth={1.5} /><span>Auto</span></> : <><RatioRect ratio={r} maxDim={16} /><span>{r}</span></>}
            </button>
          ))}
        </div>
      </div>
    </PopupCard>
  )
}

function CountPopup({ count, setCount, unit }: { count: number; setCount: (v: number) => void; unit: "条" | "张" }) {
  return (
    <PopupCard className="w-[100px] p-1.5">
      {[1, 2, 3, 4].map((n) => (
        <button key={n} type="button" onClick={() => setCount(n)}
          className={cn("w-full h-9 rounded-[9px] text-left px-3 text-[13px] font-medium cursor-pointer transition-colors",
            count === n ? "bg-[var(--soft)] text-[var(--text)] font-semibold" : "text-[var(--muted)] hover:bg-[var(--soft)]")}>
          {n}{unit}
        </button>
      ))}
    </PopupCard>
  )
}

// ─── Media thumbnail（非视频类型沿用）────────────────────────────────────────

function MediaThumb({ src, type, label, onRemove }: {
  src: string; type: "image" | "video" | "dh"; label?: string; onRemove: () => void
}) {
  return (
    <div className="relative shrink-0 group">
      <div className={cn(
        "overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--soft)]",
        type === "video" ? "w-[60px] h-[38px]" : type === "dh" ? "w-[30px] h-[42px]" : "w-[42px] h-[42px]"
      )}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="w-full h-full object-cover" />
        {type === "video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
              <Play size={9} fill="white" className="text-white ml-[1px]" />
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#18181b] text-white flex items-center justify-center cursor-pointer hover:bg-[#444] z-10 shadow-sm"
      >
        <X size={8} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── Upload slot ──────────────────────────────────────────────────────────────

const pickerBtn = "h-[34px] border border-transparent rounded-full bg-white text-[#18181b] px-[9px] flex items-center gap-1.5 text-[13px] font-[650] cursor-pointer hover:bg-[var(--soft)] whitespace-nowrap"

function UploadSlot({ label, icon: Icon, onClick, accent }: { label: string; icon: React.ElementType; onClick?: () => void; accent?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className={cn(
        "w-[40px] h-[40px] border border-dashed rounded-[10px] flex items-center justify-center cursor-pointer transition-colors",
        accent
          ? "border-[#b8d94a] bg-[var(--lime-soft)]/60 text-[#5a6b1a] hover:border-[#9ab826] hover:bg-[var(--lime-soft)]"
          : "border-[var(--line-strong)] bg-white/60 text-[var(--muted)] hover:border-[var(--muted)] hover:text-[var(--text)]"
      )}>
      <Icon size={16} strokeWidth={2} />
    </button>
  )
}

// ─── 模板态快照（undo toast 用）──────────────────────────────────────────────

interface Snapshot {
  text: string
  references: Reference[]
  template: Template | null
  hook: SlotOption | null
  scene: SlotOption | null
  videoResolution: string
  videoRatio: string
  videoDuration: number
  model: string
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface GenerateModeProps {
  initialPrompt?: string
  onSubmit?: () => void
  submitting?: boolean
}

export function GenerateMode({ initialPrompt, onSubmit, submitting }: GenerateModeProps = {}) {
  const [genType, setGenType] = useState<GenType>("video")
  const [videoMode, setVideoMode] = useState<VideoMode>("reference")
  const [text, setText] = useState("")
  const [activePopup, setActivePopup] = useState<ActivePopup>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Pre-fill from props (e.g. OnboardingHero path B click)
  useEffect(() => {
    if (!initialPrompt) return
    setGenType("video")
    setText(initialPrompt)
    window.setTimeout(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.selectionStart = el.selectionEnd = el.value.length
    }, 0)
  }, [initialPrompt])

  function handleSend() {
    if (!text.trim()) return
    onSubmit?.()
  }

  // Video/remix settings — 默认拉满到新出的「720P · 9:16 · 30s」高质量组合
  const [videoResolution, setVideoResolution] = useState("720P")
  const [videoRatio, setVideoRatio] = useState("9:16")
  const [videoDuration, setVideoDuration] = useState(30)

  // Image settings
  const [imageResolution, setImageResolution] = useState("1K")
  const [imageRatio, setImageRatio] = useState("Auto")

  // Model
  const [model, setModel] = useState(videoModels[0])

  // Count
  const [count, setCount] = useState(1)

  // ── 模板态 ──
  const [template, setTemplate] = useState<Template | null>(null)
  const [hook, setHook] = useState<SlotOption | null>(null)
  const [scene, setScene] = useState<SlotOption | null>(null)
  const [flash, setFlash] = useState<{ text: string; nonce: number } | null>(null)
  const [glowKey, setGlowKey] = useState(0)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; snapshot: Snapshot } | null>(null)

  // ── 引用与商品（视频生成专用）──
  const [references, setReferences] = useState<Reference[]>([])
  const [products, setProducts] = useState<Product[]>(PRESET_PRODUCTS)
  const [productModalOpen, setProductModalOpen] = useState(false)

  // 旧版媒体选择（非视频类型沿用）
  const [selectedImages, setSelectedImages] = useState<ImageItem[]>([])
  const [selectedVideos, setSelectedVideos] = useState<VideoItem[]>([])
  const [digitalHuman, setDigitalHuman] = useState<DHItem | null>(null)

  // Modal open states
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [dhModalOpen, setDhModalOpen] = useState(false)

  const configRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activePopup) return
    function onOutside(e: MouseEvent) {
      if (configRef.current && !configRef.current.contains(e.target as Node)) setActivePopup(null)
    }
    document.addEventListener("mousedown", onOutside)
    return () => document.removeEventListener("mousedown", onOutside)
  }, [activePopup])

  // Toast 自动消失
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(t)
  }, [toast])

  const toggle = (popup: ActivePopup) => setActivePopup((prev) => (prev === popup ? null : popup))

  const handleGenTypeChange = (v: GenType) => {
    setGenType(v)
    setActivePopup(null)
    setCount(1)
    const opts = v === "image" ? imageModels : v === "reverse" ? reverseModels : videoModels
    setModel(opts[0])
  }

  // ── 模板机制 ──

  function takeSnapshot(): Snapshot {
    return { text, references, template, hook, scene, videoResolution, videoRatio, videoDuration, model }
  }

  function restoreSnapshot(s: Snapshot) {
    setText(s.text); setReferences(s.references)
    setTemplate(s.template); setHook(s.hook); setScene(s.scene)
    setVideoResolution(s.videoResolution); setVideoRatio(s.videoRatio); setVideoDuration(s.videoDuration)
    setModel(s.model)
    setFlash(null)
    setToast(null)
  }

  function handleApplyTemplate(t: Template) {
    const snapshot = takeSnapshot()
    const kept = references.filter((r) => r.source === "product" && r.kind === "image")
    const app = applyTemplate(t, kept, products[0] ?? null)
    setTemplate(t)
    setHook(app.hook)
    setScene(app.scene)
    setText(app.text)
    setReferences(app.references)
    setVideoResolution(t.settings.resolution)
    setVideoRatio(t.settings.ratio)
    setVideoDuration(t.settings.duration)
    setModel(t.settings.model)
    setFlash(null)
    setGlowKey((k) => k + 1)
    setToast({ message: `已应用「${t.name}」模板`, snapshot })
  }

  function handleClearTemplate() {
    const snapshot = takeSnapshot()
    setTemplate(null)
    setHook(null)
    setScene(null)
    setText("")
    // 商品图是用户资产，清模板时保留并重新编号
    setReferences(renumber(references.filter((r) => r.source === "product")))
    setFlash(null)
    setToast({ message: "已清除模板", snapshot })
  }

  function handleSelectHook(opt: SlotOption) {
    if (!hook || opt.id === hook.id) return
    const { text: nextText } = replaceSegment(text, hook.sentence, opt.sentence)
    setText(nextText)
    setHook(opt)
    setFlash({ text: opt.sentence, nonce: Date.now() })
  }

  function handleSelectScene(opt: SlotOption) {
    if (!scene || opt.id === scene.id) return
    const { text: nextText } = replaceSegment(text, scene.sentence, opt.sentence)
    setText(nextText)
    setScene(opt)
    setFlash({ text: opt.sentence, nonce: Date.now() })
  }

  // ── 引用插入 / 移除（视频生成）──

  function insertRefs(items: Omit<Reference, "index">[]) {
    const counters = {
      image: nextIndex(references, "image") - 1,
      video: nextIndex(references, "video") - 1,
    }
    const fresh: Reference[] = items
      .filter((it) => !references.some((r) => r.id === it.id))
      .map((it) => ({ ...it, index: ++counters[it.kind] }))
    if (fresh.length === 0) return
    const tokens = fresh.map(tokenOf).join(" ")
    setReferences([...references, ...fresh])
    // 追加到文本末尾（保持 token 与引用一致）
    setText((prev) => {
      const trimmed = prev.trimEnd()
      return trimmed ? `${trimmed} ${tokens} ` : `${tokens} `
    })
  }

  function handleRemoveReference(id: string) {
    const { refs, text: nextText } = removeReference(references, id, text)
    setReferences(refs)
    setText(nextText)
  }

  function handleInsertProduct(product: Product, imageIds: string[]) {
    insertRefs(
      product.images
        .filter((img) => imageIds.includes(img.id))
        .map((img) => ({
          id: `ref-${img.id}`,
          kind: "image" as const,
          thumb: img.src,
          name: product.title,
          source: "product" as const,
          productId: product.id,
        }))
    )
  }

  const isVideo = genType === "video"
  const models = genType === "image" ? imageModels : genType === "reverse" ? reverseModels : videoModels
  const maxLen = genType === "video" ? 8000 : 2000
  const countUnit = genType === "image" ? "张" : "条"
  const settingsLabel = genType === "image" ? `${imageResolution} · ${imageRatio}` : `${videoResolution} · ${videoRatio} · ${videoDuration}s`

  const placeholders: Record<GenType, string> = {
    video: "描述视频画面内容和动态过程，或从下方选择模板一键开始",
    image: "描述你想生成的图片内容、构图、风格与商品信息",
    remix: "粘贴爆款素材链接，或描述想复刻的画面结构、卖点与节奏",
    reverse: "贴入视频链接，或上传图片 / 视频，反推出可复用提示词",
  }

  const hasLegacyMedia = selectedImages.length > 0 || selectedVideos.length > 0 || !!digitalHuman

  return (
    <div className="flex flex-col gap-3.5">
      {/* Undo toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between h-9 px-3.5 rounded-[10px] bg-[#18181b] text-white">
              <span className="text-[12.5px] font-semibold flex items-center gap-1.5">
                <Sparkles size={13} className="text-[var(--lime)]" />
                {toast.message}
              </span>
              <button
                type="button"
                onClick={() => restoreSnapshot(toast.snapshot)}
                className="flex items-center gap-1 text-[12px] font-bold text-[var(--lime)] hover:brightness-110 cursor-pointer"
              >
                <Undo2 size={12} strokeWidth={2.4} />
                撤销
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video mode tabs */}
      {isVideo && (
        <div className="flex items-center gap-[3px] border border-[var(--line)] rounded-full bg-[var(--soft)] p-[3px] w-max">
          {(["reference", "frames"] as VideoMode[]).map((m) => (
            <button key={m} type="button" onClick={() => setVideoMode(m)}
              className={cn("h-7 rounded-full px-2.5 text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap",
                videoMode === m ? "bg-white text-[#18181b] shadow-[0_1px_2px_rgba(9,9,11,0.08)]" : "bg-transparent text-[var(--muted)]")}>
              {m === "reference" ? <><Image size={12} />参考</> : <><Hash size={12} />首尾帧</>}
            </button>
          ))}
        </div>
      )}

      {/* Hook / 场景（仅模板态）*/}
      <AnimatePresence initial={false}>
        {isVideo && template && hook && scene && (
          <HookSceneBar
            key={template.id}
            hooks={template.hooks}
            scenes={template.scenes}
            selectedHookId={hook.id}
            selectedSceneId={scene.id}
            onSelectHook={handleSelectHook}
            onSelectScene={handleSelectScene}
          />
        )}
      </AnimatePresence>

      {/* Upload slots + input area */}
      <div className="flex items-start gap-3.5 min-h-[52px]">
        {/* Upload slots */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {isVideo && videoMode === "reference" && (
            <>
              <UploadSlot label="商品" icon={Package} accent onClick={() => setProductModalOpen(true)} />
              <UploadSlot label="图片" icon={Image} onClick={() => setImageModalOpen(true)} />
              <UploadSlot label="视频" icon={Video} onClick={() => setVideoModalOpen(true)} />
              <UploadSlot label="数字人" icon={Plus} onClick={() => setDhModalOpen(true)} />
            </>
          )}
          {isVideo && videoMode === "frames" && (
            <>
              <UploadSlot label="首帧" icon={Plus} onClick={() => setImageModalOpen(true)} />
              <UploadSlot label="尾帧" icon={Plus} onClick={() => setImageModalOpen(true)} />
            </>
          )}
          {genType === "image" && <UploadSlot label="图片" icon={Image} onClick={() => setImageModalOpen(true)} />}
          {(genType === "remix" || genType === "reverse") && (
            <UploadSlot label="视频" icon={Video} onClick={() => setVideoModalOpen(true)} />
          )}
        </div>

        {/* 视频生成：带高亮叠层与参考区的编辑器 */}
        {isVideo ? (
          <PromptEditor
            value={text}
            onChange={setText}
            references={references}
            onRemoveReference={handleRemoveReference}
            placeholder={placeholders.video}
            maxLength={maxLen}
            textareaRef={textareaRef}
            flash={flash}
            extraChips={digitalHuman && (
              <MediaThumb
                src={digitalHuman.thumb} type="dh" label={digitalHuman.name}
                onRemove={() => setDigitalHuman(null)}
              />
            )}
          />
        ) : (
          <div className="flex-1 flex flex-col gap-2">
            {hasLegacyMedia && (
              <div className="flex flex-wrap gap-2">
                {selectedImages.map((img) => (
                  <MediaThumb
                    key={img.id} src={img.thumb} type="image" label={img.name}
                    onRemove={() => setSelectedImages((prev) => prev.filter((i) => i.id !== img.id))}
                  />
                ))}
                {selectedVideos.map((vid) => (
                  <MediaThumb
                    key={vid.id} src={vid.thumb} type="video" label={vid.name}
                    onRemove={() => setSelectedVideos((prev) => prev.filter((v) => v.id !== vid.id))}
                  />
                ))}
                {digitalHuman && (
                  <MediaThumb
                    src={digitalHuman.thumb} type="dh" label={digitalHuman.name}
                    onRemove={() => setDigitalHuman(null)}
                  />
                )}
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="w-full min-h-[52px] border-0 outline-none resize-none text-[#24272f] text-[15px] leading-[1.5] bg-transparent placeholder:text-[var(--muted-2)]"
              placeholder={placeholders[genType]}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={maxLen}
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Config row */}
      <div ref={configRef} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">

          {/* 模板 chip（模板态）*/}
          <AnimatePresence>
            {isVideo && template && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: -6 }}
                transition={{ type: "spring", stiffness: 480, damping: 30 }}
                className="flex items-center h-[34px] rounded-full bg-[var(--lime-soft)] border border-[#d4e89a] pl-[9px] pr-1"
              >
                <button
                  type="button"
                  onClick={() => setGalleryOpen(true)}
                  title="切换模板"
                  className="flex items-center gap-1.5 text-[13px] font-[650] text-[#3a4a10] cursor-pointer"
                >
                  <Sparkles size={13} strokeWidth={2.2} />
                  {template.name}
                </button>
                <button
                  type="button"
                  onClick={handleClearTemplate}
                  aria-label="清除模板"
                  className="ml-1 w-6 h-6 rounded-full flex items-center justify-center text-[#5a6b1a] hover:bg-[#dff0a8] cursor-pointer"
                >
                  <X size={12} strokeWidth={2.4} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gen type */}
          <div className="relative">
            <button type="button" onClick={() => toggle("genType")} className={pickerBtn}>
              {(() => { const { icon: Icon, label } = genTypes.find((t) => t.id === genType)!; return <><Icon size={15} strokeWidth={2} /><span>{label}</span></> })()}
              <ChevronDown size={12} className={cn("text-[var(--muted)] -ml-0.5 transition-transform", activePopup === "genType" && "rotate-180")} />
            </button>
            {activePopup === "genType" && <GenTypePopup value={genType} onChange={handleGenTypeChange} />}
          </div>

          {/* Model */}
          <div className="relative">
            <button key={`model-${glowKey}`} type="button" onClick={() => toggle("model")} className={cn(pickerBtn, glowKey > 0 && "picker-glow")}>
              <span className="w-4 h-4 rounded bg-[var(--soft)] text-[9px] font-black flex items-center justify-center shrink-0">{model.slice(0, 2)}</span>
              <span className="font-medium">{model}</span>
              <ChevronDown size={12} className={cn("text-[var(--muted)] -ml-0.5 transition-transform", activePopup === "model" && "rotate-180")} />
            </button>
            {activePopup === "model" && (
              <ModelPopup options={models} selected={model} onSelect={(v) => { setModel(v); setActivePopup(null) }} />
            )}
          </div>

          {/* Settings */}
          {genType !== "reverse" && (
            <div className="relative">
              <button key={`settings-${glowKey}`} type="button" onClick={() => toggle("settings")} className={cn(pickerBtn, glowKey > 0 && "picker-glow")}>
                <SlidersHorizontal size={15} strokeWidth={2} />
                <span>{settingsLabel}</span>
                {genType !== "image" && videoResolution === "720P" && videoRatio === "9:16" && videoDuration === 30 && (
                  <span
                    className="ml-1 inline-flex items-center h-[18px] px-1.5 rounded-md bg-[var(--lime)] text-[#1a2010] text-[9.5px] font-extrabold tracking-wide leading-none"
                    title="新推出的高质量默认配置"
                  >
                    NEW
                  </span>
                )}
                <ChevronDown size={12} className={cn("text-[var(--muted)] -ml-0.5 transition-transform", activePopup === "settings" && "rotate-180")} />
              </button>
              {activePopup === "settings" && (
                genType === "image" ? (
                  <ImageSettingsPopup resolution={imageResolution} setResolution={setImageResolution} ratio={imageRatio} setRatio={setImageRatio} />
                ) : (
                  <VideoSettingsPopup resolution={videoResolution} setResolution={setVideoResolution} ratio={videoRatio} setRatio={setVideoRatio} duration={videoDuration} setDuration={setVideoDuration} />
                )
              )}
            </div>
          )}

          {/* Count */}
          {genType !== "reverse" && (
            <div className="relative">
              <button type="button" onClick={() => toggle("count")} className={pickerBtn}>
                <Hash size={15} strokeWidth={2} />
                <span>生成 {count} {countUnit}</span>
                <ChevronDown size={12} className={cn("text-[var(--muted)] -ml-0.5 transition-transform", activePopup === "count" && "rotate-180")} />
              </button>
              {activePopup === "count" && (
                <CountPopup count={count} setCount={(n) => { setCount(n); setActivePopup(null) }} unit={countUnit} />
              )}
            </div>
          )}

        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#8a8d94] whitespace-nowrap">{text.length}/{maxLen}</span>
          <SendButton disabled={!text.trim()} loading={submitting} onClick={handleSend} />
        </div>
      </div>

      {/* 模板卡片流（仅视频生成）*/}
      {isVideo && (
        <TemplateStrip
          activeTemplateId={template?.id ?? null}
          onApply={handleApplyTemplate}
          onOpenGallery={() => setGalleryOpen(true)}
        />
      )}

      {/* Modals */}
      <ImageSelectModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        onConfirm={(items) => {
          if (isVideo) {
            insertRefs(items.map((i) => ({ id: `ref-${i.id}`, kind: "image" as const, thumb: i.thumb, name: i.name, source: "library" as const })))
          } else {
            setSelectedImages((prev) => {
              const existingIds = new Set(prev.map((i) => i.id))
              return [...prev, ...items.filter((i) => !existingIds.has(i.id))]
            })
          }
        }}
      />
      <VideoSelectModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        onConfirm={(items) => {
          if (isVideo) {
            insertRefs(items.map((v) => ({ id: `ref-${v.id}`, kind: "video" as const, thumb: v.thumb, name: v.name, source: "library" as const })))
          } else {
            setSelectedVideos((prev) => {
              const existingIds = new Set(prev.map((v) => v.id))
              return [...prev, ...items.filter((v) => !existingIds.has(v.id))]
            })
          }
        }}
      />
      <DigitalHumanModal
        open={dhModalOpen}
        onOpenChange={setDhModalOpen}
        onConfirm={(item) => setDigitalHuman(item)}
      />
      <TemplateGalleryModal
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        activeTemplateId={template?.id ?? null}
        onApply={handleApplyTemplate}
      />
      <ProductModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        products={products}
        onAddProduct={(p) => setProducts((prev) => [p, ...prev])}
        onInsert={handleInsertProduct}
      />
    </div>
  )
}
