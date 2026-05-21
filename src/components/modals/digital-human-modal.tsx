"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Plus, Upload, ArrowLeft, User } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DHItem { id: string; thumb: string; name: string }

const mockAvatars: (DHItem & { desc: string })[] = [
  { id: "dh-1", name: "Amy",  thumb: "https://picsum.photos/seed/dh1/200/280", desc: "职业女性，适合商务场景" },
  { id: "dh-2", name: "Leo",  thumb: "https://picsum.photos/seed/dh2/200/280", desc: "年轻男性，适合潮流推荐" },
  { id: "dh-3", name: "Mia",  thumb: "https://picsum.photos/seed/dh3/200/280", desc: "活泼女性，适合生活分享" },
  { id: "dh-4", name: "Jack", thumb: "https://picsum.photos/seed/dh4/200/280", desc: "成熟男性，适合测评讲解" },
  { id: "dh-5", name: "Lily", thumb: "https://picsum.photos/seed/dh5/200/280", desc: "甜美女性，适合美妆种草" },
]

// ─── Human silhouette SVG ────────────────────────────────────────────────────

function HumanSilhouette({ dim }: { dim?: boolean }) {
  const fill = dim ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.18)"
  return (
    <svg
      viewBox="0 0 100 200"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      style={{ animation: dim ? undefined : "dh-fade-in 0.5s ease both" }}
    >
      <g fill={fill}>
        {/* Head */}
        <ellipse cx="50" cy="14" rx="12" ry="13" />
        {/* Neck */}
        <rect x="44" y="26" width="12" height="10" rx="3" />
        {/* Torso — shoulders, subtle waist, hips */}
        <path d="M43,34 Q27,37 18,50 C15,60 15,76 18,88 C20,97 20,106 22,116 L78,116 C80,106 80,97 82,88 C85,76 85,60 82,50 Q73,37 57,34 Z" />
        {/* Left arm — sits outside the torso outline with a clean armpit gap */}
        <path d="M16,52 C10,66 7,84 7,102 C7,112 8,120 10,128 C9,134 8,140 10,144 C12,147 16,147 17,143 C18,136 17,130 18,124 C16,116 15,104 14,92 C14,76 14,64 14,54 Z" />
        {/* Right arm */}
        <path d="M84,52 C90,66 93,84 93,102 C93,112 92,120 90,128 C91,134 92,140 90,144 C88,147 84,147 83,143 C82,136 83,130 82,124 C84,116 85,104 86,92 C86,76 86,64 86,54 Z" />
        {/* Left leg */}
        <path d="M22,116 C19,130 18,146 20,162 C20,172 22,180 22,192 C22,197 25,199 29,199 C35,199 37,197 37,192 C37,185 35,175 34,162 C36,146 38,130 38,116 Z" />
        {/* Right leg */}
        <path d="M78,116 C81,130 82,146 80,162 C80,172 78,180 78,192 C78,197 75,199 71,199 C65,199 63,197 63,192 C63,185 65,175 66,162 C64,146 62,130 62,116 Z" />
      </g>
    </svg>
  )
}

// ─── Scanning animation panel ────────────────────────────────────────────────

function GeneratingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full h-full">
      {/* Silhouette + scan line */}
      <div className="relative w-24 h-48 shrink-0">
        <HumanSilhouette />
        {/* Scan line */}
        <div
          className="absolute left-[-6px] right-[-6px] h-px pointer-events-none"
          style={{
            top: 0,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(201,255,41,0.4) 20%, #c9ff29 50%, rgba(201,255,41,0.4) 80%, transparent 100%)",
            boxShadow: "0 0 6px 3px rgba(201,255,41,0.35)",
            animation: "dh-scan 1.8s ease-in-out infinite",
          }}
        />
        {/* Subtle grid lines overlay */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 14px, rgba(201,255,41,0.6) 14px, rgba(201,255,41,0.6) 15px)",
          }}
        />
      </div>

      {/* Loading text */}
      <div className="flex flex-col items-center gap-1.5">
        <p
          className="text-white/70 text-[13px] font-medium tracking-widest"
          style={{ animation: "dh-fade-in 0.4s ease both" }}
        >
          生成中
          <DotsLoader />
        </p>
        <p className="text-white/30 text-[11px]">数字人克隆通常需要 2~5 分钟</p>
      </div>
    </div>
  )
}

function DotsLoader() {
  const [dots, setDots] = useState(1)
  // cycle dots 1→2→3→1
  useState(() => {
    const id = setInterval(() => setDots((d) => (d % 3) + 1), 500)
    return () => clearInterval(id)
  })
  return <span className="inline-block w-5 text-left">{".".repeat(dots)}</span>
}

function IdleView() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full opacity-30">
      <div className="w-20 h-40">
        <HumanSilhouette dim />
      </div>
      <p className="text-white text-[12px] tracking-wide">点击「创建」开始生成</p>
    </div>
  )
}

// ─── Create view (split layout) ──────────────────────────────────────────────

function CreateView({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("")
  const [generating, setGenerating] = useState(false)

  function handleCreate() {
    if (!name.trim()) return
    setGenerating(true)
  }

  return (
    <div className="flex w-full h-full">
      {/* Left: form */}
      <div className="w-[268px] shrink-0 border-r border-[var(--line)] flex flex-col">
        <div className="flex items-center gap-2 px-4 pt-5 pb-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer"
          >
            <ArrowLeft size={17} />
          </button>
          <span className="text-[15px] font-bold text-[var(--text)]">新建数字人</span>
        </div>

        <div className="flex-1 px-4 pb-5 flex flex-col gap-4 overflow-y-auto">
          {/* Upload zone */}
          <label className="shrink-0 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-[var(--line-strong)] rounded-2xl py-3.5 px-4 bg-[var(--soft-2)] cursor-pointer hover:border-[var(--muted)] transition-colors">
            <input type="file" accept="image/*,video/*" className="hidden" />
            <div className="w-8 h-8 rounded-full bg-[var(--soft)] flex items-center justify-center text-[var(--muted)]">
              <Upload size={15} />
            </div>
            <p className="text-[12px] font-semibold text-[var(--text)]">上传照片或视频</p>
            <p className="text-[10px] text-[var(--muted)] text-center leading-snug">
              JPG / PNG / MP4 · 正面半身 ≥ 512×512
            </p>
          </label>

          {/* Name */}
          <div className="shrink-0 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--text)]">名称</label>
            <input
              type="text"
              className="h-9 px-3 rounded-lg border border-[var(--line)] bg-white text-[13px] placeholder:text-[var(--muted-2)] outline-none focus:border-[var(--line-strong)]"
              placeholder="为数字人起个名字"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Prompt */}
          <div className="shrink-0 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-[var(--text)]">生成提示词</label>
            <textarea
              className="px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-[13px] placeholder:text-[var(--muted-2)] outline-none focus:border-[var(--line-strong)] resize-none leading-relaxed"
              rows={3}
              placeholder="描述数字人的外貌、风格与用途…"
            />
          </div>

          {/* Create button */}
          <button
            type="button"
            disabled={!name.trim()}
            onClick={handleCreate}
            className="mt-auto shrink-0 h-9 rounded-full bg-[var(--near-black)] text-white text-[13px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            创建
          </button>
        </div>
      </div>

      {/* Right: dark preview */}
      <div className="flex-1 bg-[#0d0d0f] rounded-r-2xl overflow-hidden flex items-center justify-center">
        {generating ? <GeneratingView /> : <IdleView />}
      </div>
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function DigitalHumanModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm?: (item: DHItem) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(mockAvatars[0].id)
  const [view, setView] = useState<"list" | "create">("list")
  const selectedAvatar = mockAvatars.find((a) => a.id === selectedId)

  function handleConfirm() {
    if (!selectedAvatar) return
    onConfirm?.({ id: selectedAvatar.id, thumb: selectedAvatar.thumb, name: selectedAvatar.name })
    onOpenChange(false)
  }

  function handleOpenChange(v: boolean) {
    if (!v) setView("list")
    onOpenChange(v)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[640px] h-[520px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {view === "create" ? (
            <CreateView onBack={() => setView("list")} />
          ) : (
            <>
              {/* Left panel: avatar list */}
              <div className="w-[220px] border-r border-[var(--line)] flex flex-col">
                <div className="flex items-center justify-between px-4 pt-5 pb-3">
                  <Dialog.Title className="text-[15px] font-bold text-[var(--text)]">数字人</Dialog.Title>
                  <button
                    type="button"
                    onClick={() => setView("create")}
                    className="h-7 px-2.5 rounded-full bg-[var(--soft)] text-[12px] font-semibold text-[var(--text)] flex items-center gap-1 cursor-pointer hover:bg-[var(--line)]"
                  >
                    <Plus size={13} />
                    新建
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                  {mockAvatars.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl cursor-pointer transition-colors",
                        selectedId === a.id ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--soft)] shrink-0">
                        <img src={a.thumb} alt={a.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--text)] truncate">{a.name}</p>
                        <p className="text-[11px] text-[var(--muted)] truncate">{a.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right panel: preview */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-end px-4 pt-4">
                  <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
                    <X size={18} />
                  </Dialog.Close>
                </div>
                <div className="flex-1 flex items-center justify-center px-8 pb-4">
                  {selectedAvatar ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-44 h-60 rounded-2xl overflow-hidden bg-[var(--soft)]">
                        <img src={selectedAvatar.thumb} alt={selectedAvatar.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center">
                        <p className="text-[16px] font-bold text-[var(--text)]">{selectedAvatar.name}</p>
                        <p className="text-[13px] text-[var(--muted)] mt-1">{selectedAvatar.desc}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-[var(--muted)]">
                      <User size={40} strokeWidth={1.5} />
                      <p className="text-[14px]">选择一个数字人</p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-[var(--line)] flex justify-end">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedId}
                    className="h-9 px-5 rounded-full bg-[var(--near-black)] text-white text-[13px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    确认选择
                  </button>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
