"use client"

import { useState } from "react"
import Image from "next/image"
import { Film, MousePointerClick, Plus, User, Wand2, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { mockVideos } from "@/lib/ads/gmv-max-mock"
import { ChoiceCard, FieldError, SectionCard, ToggleRow, type SectionProps } from "./section-card"
import { VideoPickerDialog } from "./video-picker-dialog"

// ─── 创意设置：视频素材来源与选择方式 ────────────────────────────────────────

export function CreativeSettings({ config, update, errors }: SectionProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const selectedVideos = config.videoIds
    .map((id) => mockVideos.find((v) => v.id === id))
    .filter((v) => v !== undefined)

  const removeVideo = (id: string) => {
    update("videoIds", config.videoIds.filter((v) => v !== id))
  }

  return (
    <SectionCard id="section-creative" icon={Film} title="创意设置" desc="配置视频素材来源与选择方式">
      <div>
        <Label>视频选择方式</Label>
        <div className="mt-2 grid grid-cols-1 @xl:grid-cols-2 gap-3">
          <ChoiceCard
            icon={MousePointerClick}
            title="手动选择"
            desc="从店铺关联的帖子中手动挑选特定的视频进行投放"
            selected={config.videoMode === "manual"}
            onClick={() => update("videoMode", "manual")}
          />
          <ChoiceCard
            icon={Wand2}
            title="智能选择"
            desc="系统将自动从店铺关联的身份和帖子中选择最优素材进行投放，无需手动选择"
            selected={config.videoMode === "smart"}
            onClick={() => update("videoMode", "smart")}
          />
        </div>
      </div>

      {config.videoMode === "manual" && (
        <div>
          <Label>已选视频（{config.videoIds.length}）</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {selectedVideos.map((video) => (
              <div key={video.id} className="group relative w-[104px]">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[var(--near-black)] border border-[var(--line)]">
                  {video.cover ? (
                    <Image
                      src={video.cover}
                      alt={video.title}
                      fill
                      sizes="104px"
                      className="object-cover opacity-90"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a30] to-[#111114] flex items-center justify-center">
                      <Film size={18} strokeWidth={1.5} className="text-white/30" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 text-[10px] px-1 py-0.5 rounded bg-black/60 text-white font-mono">
                    {video.duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVideo(video.id)}
                    aria-label="移除视频"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer hover:bg-black/80"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[var(--text)] truncate">{video.title}</p>
              </div>
            ))}

            {/* 虚线添加卡：打开选择视频弹窗 */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="w-[104px] aspect-[3/4] rounded-lg border border-dashed border-[var(--line-strong)] flex flex-col items-center justify-center gap-1.5 text-[var(--muted)] transition-colors duration-200 cursor-pointer hover:border-[var(--lime)] hover:text-[var(--text)] hover:bg-[var(--lime-soft)]/30"
            >
              <Plus size={18} strokeWidth={2} />
              <span className="text-xs">选择视频</span>
            </button>
          </div>
          <FieldError message={errors.videoIds} />

          <VideoPickerDialog
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            selectedIds={config.videoIds}
            onConfirm={(ids) => update("videoIds", ids)}
          />
        </div>
      )}

      {config.videoMode === "smart" && (
        <div className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] px-4 py-3 text-[13px] text-[var(--muted)]">
          系统将自动从店铺关联的身份和帖子中选择最优素材进行投放，无需手动选择。
        </div>
      )}

      <ToggleRow
        icon={User}
        title="达人帖子"
        desc="允许系统自动抓取并投放关联达人的优秀带货视频"
        checked={config.creatorPostEnabled}
        onCheckedChange={(v) => update("creatorPostEnabled", v)}
      />
    </SectionCard>
  )
}
