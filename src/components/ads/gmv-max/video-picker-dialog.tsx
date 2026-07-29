"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Film } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockVideos } from "@/lib/ads/gmv-max-mock"
import type { VideoSource } from "@/lib/ads/gmv-max-types"

// ─── 选择视频弹窗：按来源分 tab 挑选，确认后回写已选列表 ─────────────────────

const SOURCE_TABS: { value: VideoSource; label: string }[] = [
  { value: "creative", label: "我的创意视频" },
  { value: "private", label: "私域素材库" },
  { value: "tiktok", label: "TikTok 直发帖" },
]

interface VideoPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  onConfirm: (ids: string[]) => void
}

export function VideoPickerDialog({ open, onOpenChange, selectedIds, onConfirm }: VideoPickerDialogProps) {
  const [tab, setTab] = useState<VideoSource>("creative")
  // 弹窗内的临时选择，确认后才提交
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds)

  const videos = mockVideos.filter((v) => v.source === tab)

  const toggle = (id: string) => {
    setDraftIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  // 打开时用外部已选同步草稿
  const handleOpenChange = (next: boolean) => {
    if (next) setDraftIds(selectedIds)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-[720px] flex flex-col max-h-[85dvh]">
        <DialogHeader>
          <DialogTitle>选择视频</DialogTitle>
        </DialogHeader>

        {/* 来源 tab：lime 下划线 */}
        <div className="flex items-center gap-6 px-6 border-b border-[var(--line)]">
          {SOURCE_TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                "relative py-3 text-sm transition-colors duration-200 cursor-pointer",
                tab === value
                  ? "font-medium text-[var(--text)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-full after:bg-[var(--lime)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 视频网格 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-2)]">
              <Film size={28} strokeWidth={1.5} />
              <p className="mt-2 text-sm">该来源下暂无视频</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {videos.map((video) => {
                const selected = draftIds.includes(video.id)
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => toggle(video.id)}
                    className="group text-left cursor-pointer"
                  >
                    <div
                      className={cn(
                        "relative aspect-[3/4] rounded-lg overflow-hidden bg-[var(--near-black)] transition-shadow duration-200",
                        selected
                          ? "ring-2 ring-[var(--lime)] ring-offset-2"
                          : "group-hover:ring-2 group-hover:ring-[var(--line-strong)]"
                      )}
                    >
                      {video.cover ? (
                        <Image
                          src={video.cover}
                          alt={video.title}
                          fill
                          sizes="140px"
                          className="object-cover opacity-90"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a30] to-[#111114] flex items-center justify-center">
                          <Film size={20} strokeWidth={1.5} className="text-white/30" />
                        </div>
                      )}
                      <span className="absolute bottom-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white font-mono">
                        {video.duration}
                      </span>
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--lime)] flex items-center justify-center">
                          <Check size={12} strokeWidth={3} className="text-[var(--near-black)]" />
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[13px] text-[var(--text)] truncate">{video.title}</p>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 底部：已选统计 + 操作 */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[var(--line)]">
          <span className="text-sm text-[var(--muted)]">
            已选 <span className="font-medium text-[var(--text)]">{draftIds.length}</span> 个视频
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onConfirm(draftIds)
                onOpenChange(false)
              }}
            >
              确认选择
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
