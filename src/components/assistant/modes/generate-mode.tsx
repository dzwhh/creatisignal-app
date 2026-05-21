"use client"

import { useState, useRef, useEffect } from "react"
import { Video, Image, Link2, Wand2, Plus, ChevronDown, SlidersHorizontal, Hash, Star, X, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { SendButton } from "../send-button"
import { ImageSelectModal, type ImageItem } from "@/components/modals/image-select-modal"
import { VideoSelectModal, type VideoItem } from "@/components/modals/video-select-modal"
import { DigitalHumanModal, type DHItem } from "@/components/modals/digital-human-modal"

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
            className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer accent-[#18181b]" />
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

// ─── Media thumbnail ──────────────────────────────────────────────────────────

function MediaThumb({ src, type, label, onRemove }: {
  src: string; type: "image" | "video" | "dh"; label?: string; onRemove: () => void
}) {
  return (
    <div className="relative shrink-0 group">
      <div className={cn(
        "overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--soft)]",
        type === "video" ? "w-[60px] h-[38px]" : type === "dh" ? "w-[30px] h-[42px]" : "w-[42px] h-[42px]"
      )}>
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

function UploadSlot({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      className="w-[40px] h-[40px] border border-dashed border-[var(--line-strong)] rounded-[10px] bg-white/60 text-[var(--muted)] flex items-center justify-center cursor-pointer hover:border-[var(--muted)] hover:text-[var(--text)] transition-colors">
      <Icon size={16} strokeWidth={2} />
    </button>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function GenerateMode() {
  const [genType, setGenType] = useState<GenType>("video")
  const [videoMode, setVideoMode] = useState<VideoMode>("reference")
  const [text, setText] = useState("")
  const [activePopup, setActivePopup] = useState<ActivePopup>(null)

  // Video/remix settings
  const [videoResolution, setVideoResolution] = useState("480P")
  const [videoRatio, setVideoRatio] = useState("9:16")
  const [videoDuration, setVideoDuration] = useState(15)

  // Image settings
  const [imageResolution, setImageResolution] = useState("1K")
  const [imageRatio, setImageRatio] = useState("Auto")

  // Model
  const [model, setModel] = useState(videoModels[0])

  // Count
  const [count, setCount] = useState(1)

  // Selected media
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

  const toggle = (popup: ActivePopup) => setActivePopup((prev) => (prev === popup ? null : popup))

  const handleGenTypeChange = (v: GenType) => {
    setGenType(v)
    setActivePopup(null)
    setCount(1)
    const opts = v === "image" ? imageModels : v === "reverse" ? reverseModels : videoModels
    setModel(opts[0])
  }

  const models = genType === "image" ? imageModels : genType === "reverse" ? reverseModels : videoModels
  const maxLen = genType === "video" ? 8000 : 2000
  const countUnit = genType === "image" ? "张" : "条"
  const settingsLabel = genType === "image" ? `${imageResolution} · ${imageRatio}` : `${videoResolution} · ${videoRatio} · ${videoDuration}s`

  const placeholders: Record<GenType, string> = {
    video: "描述视频画面内容和动态过程，使用 @ 指定参考图或参考视频",
    image: "描述你想生成的图片内容、构图、风格与商品信息",
    remix: "粘贴爆款素材链接，或描述想复刻的画面结构、卖点与节奏",
    reverse: "贴入视频链接，或上传图片 / 视频，反推出可复用提示词",
  }

  const hasMedia = selectedImages.length > 0 || selectedVideos.length > 0 || !!digitalHuman

  return (
    <div className="flex flex-col gap-3.5">
      {/* Video mode tabs */}
      {genType === "video" && (
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

      {/* Upload slots + input area */}
      <div className="flex items-start gap-3.5 min-h-[52px]">
        {/* Upload slots */}
        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          {genType === "video" && videoMode === "reference" && (
            <>
              <UploadSlot label="图片" icon={Image} onClick={() => setImageModalOpen(true)} />
              <UploadSlot label="视频" icon={Video} onClick={() => setVideoModalOpen(true)} />
              <UploadSlot label="数字人" icon={Plus} onClick={() => setDhModalOpen(true)} />
            </>
          )}
          {genType === "video" && videoMode === "frames" && (
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

        {/* Input area: media previews + textarea */}
        <div className="flex-1 flex flex-col gap-2">
          {hasMedia && (
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
            className="w-full min-h-[52px] border-0 outline-none resize-none text-[#24272f] text-[15px] leading-[1.5] bg-transparent placeholder:text-[var(--muted-2)]"
            placeholder={placeholders[genType]}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={maxLen}
            rows={2}
          />
        </div>
      </div>

      {/* Config row */}
      <div ref={configRef} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">

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
            <button type="button" onClick={() => toggle("model")} className={pickerBtn}>
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
              <button type="button" onClick={() => toggle("settings")} className={pickerBtn}>
                <SlidersHorizontal size={15} strokeWidth={2} />
                <span>{settingsLabel}</span>
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
          <SendButton disabled={!text.trim()} />
        </div>
      </div>

      {/* Modals */}
      <ImageSelectModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        onConfirm={(items) => setSelectedImages((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          return [...prev, ...items.filter((i) => !existingIds.has(i.id))]
        })}
      />
      <VideoSelectModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        onConfirm={(items) => setSelectedVideos((prev) => {
          const existingIds = new Set(prev.map((v) => v.id))
          return [...prev, ...items.filter((v) => !existingIds.has(v.id))]
        })}
      />
      <DigitalHumanModal
        open={dhModalOpen}
        onOpenChange={setDhModalOpen}
        onConfirm={(item) => setDigitalHuman(item)}
      />
    </div>
  )
}
