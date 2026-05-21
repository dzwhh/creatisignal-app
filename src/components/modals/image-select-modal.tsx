"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "all" | "ai" | "uploaded"

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "ai", label: "AI 生成" },
  { id: "uploaded", label: "已上传" },
]

const mockImages = Array.from({ length: 12 }, (_, i) => ({
  id: `img-${i + 1}`,
  src: `https://picsum.photos/seed/cs${i + 1}/300/300`,
  name: `素材 ${i + 1}`,
  category: i < 4 ? "ai" : i < 8 ? "uploaded" : "ai",
}))

export interface ImageItem { id: string; thumb: string; name: string }

export function ImageSelectModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm?: (items: ImageItem[]) => void
}) {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<Tab>("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = mockImages.filter((img) => {
    if (tab !== "all" && img.category !== tab) return false
    if (search && !img.name.includes(search)) return false
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
    const items = mockImages
      .filter((img) => selected.has(img.id))
      .map((img) => ({ id: img.id, thumb: img.src, name: img.name }))
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
              选择图片
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
                placeholder="搜索图片素材..."
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
            <div className="grid grid-cols-4 gap-3">
              {filtered.map((img) => {
                const isSelected = selected.has(img.id)
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => toggle(img.id)}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group",
                      isSelected ? "border-[var(--near-black)]" : "border-transparent hover:border-[var(--line-strong)]"
                    )}
                  >
                    <img
                      src={img.src}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
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
              已选 {selected.size} 张
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
