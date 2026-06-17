"use client"

import { useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, FolderOpen, Image as ImageIcon, Package, Sparkles, Upload, Users, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type AssetTab = "uploaded" | "ai_gen" | "digital_human" | "product"

const TABS: { id: AssetTab; label: string; icon: LucideIcon }[] = [
  { id: "uploaded",      label: "上传资产", icon: FolderOpen },
  { id: "ai_gen",        label: "AI 生成",  icon: Sparkles },
  { id: "digital_human", label: "数字人",   icon: Users },
  { id: "product",       label: "商品",     icon: Package },
]

// 各 tab 下的 mock 资产
const ASSETS: Record<AssetTab, { id: string; thumb: string; label: string }[]> = {
  uploaded: [
    { id: "up_1", thumb: "https://picsum.photos/seed/asset_up_1/320/320", label: "Bathroom Sign 01" },
    { id: "up_2", thumb: "https://picsum.photos/seed/asset_up_2/320/320", label: "Bathroom Sign 02" },
    { id: "up_3", thumb: "https://picsum.photos/seed/asset_up_3/320/320", label: "Bathroom Sign 03（白底）" },
  ],
  ai_gen: [
    { id: "ai_1", thumb: "https://picsum.photos/seed/asset_ai_1/320/320", label: "AI 生成 · 复古做旧" },
    { id: "ai_2", thumb: "https://picsum.photos/seed/asset_ai_2/320/320", label: "AI 生成 · 工业风" },
  ],
  digital_human: [
    { id: "dh_1", thumb: "https://picsum.photos/seed/asset_dh_1/320/320", label: "Alex · 男 · 30 岁" },
    { id: "dh_2", thumb: "https://picsum.photos/seed/asset_dh_2/320/320", label: "Sarah · 女 · 26 岁" },
  ],
  product: [
    { id: "pd_1", thumb: "https://picsum.photos/seed/asset_pd_1/320/320", label: "Hotligh ZF7899" },
    { id: "pd_2", thumb: "https://picsum.photos/seed/asset_pd_2/320/320", label: "Hotligh ZF8313" },
    { id: "pd_3", thumb: "https://picsum.photos/seed/asset_pd_3/320/320", label: "Bathroom Wall Sign" },
  ],
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** 已选资产数额度（外层若已选其他图片）—— 决定"已选 X / N" */
  maxSelect?: number
  onConfirm: (thumbUrls: string[]) => void
  /** 触发"从本地上传"占位回调（外层处理实际上传 mock） */
  onLocalUpload?: () => string                // 返回新增的 url
}

export function AssetLibraryModal({ open, onOpenChange, maxSelect = 1, onConfirm, onLocalUpload }: Props) {
  const [tab, setTab] = useState<AssetTab>("uploaded")
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const currentAssets = ASSETS[tab]

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= maxSelect) {
        // 单选模式：替换；多选模式：阻止超额
        if (maxSelect === 1) return [id]
        return prev
      }
      return [...prev, id]
    })
  }

  function handleConfirm() {
    const urls = currentAssets.filter((a) => selectedIds.includes(a.id)).map((a) => a.thumb)
    onConfirm(urls)
    setSelectedIds([])
    onOpenChange(false)
  }

  function handleCancel() {
    setSelectedIds([])
    onOpenChange(false)
  }

  function handleLocalUploadClick() {
    const newUrl = onLocalUpload?.() ?? ""
    if (newUrl) {
      onConfirm([newUrl])
      onOpenChange(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[80] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[85]",
            "w-[min(720px,calc(100vw-32px))] h-[min(640px,calc(100vh-48px))] rounded-2xl bg-white shadow-[0_32px_80px_rgba(9,9,11,0.32)] flex flex-col overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          )}
        >
          {/* Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-[var(--line)]">
            <Dialog.Title className="text-[16px] font-extrabold text-[var(--text)]">从资产库选择</Dialog.Title>
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Tabs + 已选计数 */}
          <div className="px-6 py-3 flex items-center justify-between border-b border-[var(--line)]">
            <div className="flex items-center gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "h-8 px-3 rounded-full text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors",
                    tab === id
                      ? "bg-[var(--near-black)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--soft-2)]"
                  )}
                >
                  <Icon size={11} strokeWidth={2.4} />
                  {label}
                </button>
              ))}
            </div>
            <span className="text-[11.5px] text-[var(--muted)] font-bold">
              已选 <span className="text-[var(--text)] font-extrabold">{selectedIds.length}</span> / {maxSelect}
            </span>
          </div>

          {/* Asset grid */}
          <div className="flex-1 overflow-y-auto p-5 bg-[var(--soft-2)]">
            <div className="grid grid-cols-4 gap-3">
              {/* 第一个 slot 永远是"从本地上传" */}
              <button
                type="button"
                onClick={handleLocalUploadClick}
                className="aspect-square rounded-xl border-2 border-dashed border-[var(--line-strong)] bg-white flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--soft)] hover:border-[var(--near-black)] transition-colors"
              >
                <Upload size={20} className="text-[var(--muted)]" />
                <span className="text-[11.5px] font-bold text-[var(--muted)]">从本地上传</span>
              </button>

              {currentAssets.map((a) => {
                const selected = selectedIds.includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggle(a.id)}
                    className={cn(
                      "aspect-square rounded-xl border bg-white overflow-hidden cursor-pointer transition-all relative group",
                      selected
                        ? "border-[var(--near-black)] shadow-[0_0_0_3px_rgba(24,24,27,0.18)]"
                        : "border-[var(--line)] hover:border-[var(--line-strong)]"
                    )}
                  >
                    <img src={a.thumb} alt={a.label} className="w-full h-full object-cover" />
                    {selected && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--near-black)] text-white flex items-center justify-center shadow-lg">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                    <span className="absolute left-0 right-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/70 to-transparent text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                      {a.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {currentAssets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ImageIcon size={28} className="text-[var(--muted-2)] mb-2" />
                <p className="text-[12px] font-bold text-[var(--muted)]">这个分类还没有资产</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="h-9 px-4 rounded-full border border-[var(--line)] text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className={cn(
                "h-9 px-4 rounded-full text-[12.5px] font-extrabold transition-opacity",
                selectedIds.length === 0
                  ? "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
                  : "bg-[var(--near-black)] text-white cursor-pointer hover:opacity-90"
              )}
            >
              确认选择 ({selectedIds.length})
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
