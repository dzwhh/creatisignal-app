"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Search, Check, Play } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "all" | "ai" | "uploaded"

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "ai", label: "AI 生成" },
  { id: "uploaded", label: "已上传" },
]

const mockVideos = Array.from({ length: 8 }, (_, i) => ({
  id: `vid-${i + 1}`,
  thumb: `https://picsum.photos/seed/vid${i + 1}/400/300`,
  name: `视频素材 ${i + 1}`,
  duration: `00:${String(10 + i * 5).padStart(2, "0")}`,
  category: i < 3 ? "ai" : i < 6 ? "uploaded" : "ai",
}))

export interface VideoItem { id: string; thumb: string; name: string; duration: string }

export function VideoSelectModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm?: (items: VideoItem[]) => void
}) {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<Tab>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = mockVideos.filter((v) => {
    if (tab !== "all" && v.category !== tab) return false
    if (search && !v.name.includes(search)) return false
    return true
  })

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleConfirm() {
    const items = mockVideos
      .filter((v) => selected.has(v.id))
      .map((v) => ({ id: v.id, thumb: v.thumb, name: v.name, duration: v.duration }))
    onConfirm?.(items)
    setSelected(new Set())
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[720px] max-h-[80vh] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <Dialog.Title className="text-[17px] font-bold text-[var(--text)]">
              选择视频
            </Dialog.Title>
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Search */}
          <div className="px-6 pb-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                type="text"
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--line)] bg-[var(--soft-2)] text-[14px] placeholder:text-[var(--muted-2)] outline-none focus:border-[var(--line-strong)]"
                placeholder="搜索视频素材..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 pb-3 flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "h-8 px-3 rounded-full text-[13px] font-semibold cursor-pointer transition-colors",
                  tab === t.id
                    ? "bg-[var(--near-black)] text-white"
                    : "bg-[var(--soft)] text-[var(--muted)] hover:bg-[var(--line)]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((vid) => {
                const isSelected = selected.has(vid.id)
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => toggle(vid.id)}
                    className={cn(
                      "relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer group",
                      isSelected ? "border-[var(--near-black)]" : "border-transparent hover:border-[var(--line-strong)]"
                    )}
                  >
                    <img
                      src={vid.thumb}
                      alt={vid.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Play icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <Play size={16} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    {/* Duration */}
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[11px] font-medium">
                      {vid.duration}
                    </span>
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-[var(--near-black)] border-[var(--near-black)] text-white"
                          : "bg-white/80 border-[var(--line-strong)] text-transparent group-hover:border-[var(--muted)]"
                      )}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </button>
                )
              })}
            </div>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-[14px] text-[var(--muted)]">
                暂无匹配素材
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--line)]">
            <span className="text-[13px] text-[var(--muted)]">
              已选 {selected.size} 条
            </span>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selected.size === 0}
              className="h-9 px-5 rounded-full bg-[var(--near-black)] text-white text-[13px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              确认选择
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
