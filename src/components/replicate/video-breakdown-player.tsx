"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { NARRATIVE_ROLE_META, type Scene, type VideoBreakdown } from "@/lib/replicate/breakdown-types"
import { cn } from "@/lib/utils"

interface Props {
  data: VideoBreakdown
  onTimeUpdate?: (currentTime: number) => void
  onSceneClick?: (sceneId: number) => void
  activeSceneId?: number | null
}

export interface VideoBreakdownPlayerHandle {
  seekTo: (seconds: number) => void
  play: () => void
}

export const VideoBreakdownPlayer = forwardRef<VideoBreakdownPlayerHandle, Props>(
  function VideoBreakdownPlayer({ data, onTimeUpdate, onSceneClick, activeSceneId }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [currentTime, setCurrentTime] = useState(0)
    const totalDuration = data.scenes[data.scenes.length - 1]?.end_time ?? 22

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        const v = videoRef.current
        if (!v) return
        v.currentTime = seconds
      },
      play: () => {
        videoRef.current?.play().catch(() => {})
      },
    }))

    function handleTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
      const t = e.currentTarget.currentTime
      setCurrentTime(t)
      onTimeUpdate?.(t)
    }

    function handleSeekClick(scene: Scene) {
      if (videoRef.current) {
        videoRef.current.currentTime = scene.start_time
        videoRef.current.play().catch(() => {})
      }
      onSceneClick?.(scene.scene_id)
    }

    return (
      <div className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden flex flex-col">
        {/* Video — 9:16 竖屏（TikTok 平台尺寸） */}
        <div className="relative bg-black aspect-[9/16] max-h-[560px] mx-auto w-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={data.source_video_url}
            controls
            playsInline
            preload="metadata"
            suppressHydrationWarning
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain"
          />
        </div>

        {/* 时间轴：5 段，统一灰底 + 当前 active 段 lime 高亮 */}
        <div className="p-3 space-y-2 border-t border-[var(--line)]">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-[var(--muted-2)]">
            <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
            <span>{data.scenes.length} 个场景 · {formatDurationLabel(totalDuration)}</span>
          </div>

          {/* 主时间轴：低饱和 + 主题色强调 active */}
          <div className="relative h-9 rounded-lg overflow-hidden bg-[var(--soft)] flex shadow-[inset_0_0_0_1px_var(--line)]">
            {data.scenes.map((scene) => {
              const widthPct = (scene.duration / totalDuration) * 100
              const role = scene.narrative_role[0]
              const meta = NARRATIVE_ROLE_META[role]
              const isActive = activeSceneId === scene.scene_id
              return (
                <button
                  key={scene.scene_id}
                  type="button"
                  onClick={() => handleSeekClick(scene)}
                  title={`Scene ${scene.scene_id} · ${meta.label} · ${formatTime(scene.start_time)}–${formatTime(scene.end_time)}`}
                  className={cn(
                    "relative h-full flex items-center justify-center text-[10px] font-extrabold transition-all cursor-pointer overflow-hidden border-r border-white last:border-r-0 group",
                    isActive
                      ? "bg-[var(--lime)] text-[#1a2010]"
                      : "bg-[var(--soft-2)] text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--text)]"
                  )}
                  style={{ width: `${widthPct}%` }}
                >
                  <span className="truncate px-1.5">{meta.short}</span>
                  {/* 底部细条 — 与 lime 主题协调：默认中性灰，active 段变 lime 深绿 */}
                  <span
                    className="absolute left-0 right-0 bottom-0 h-[2.5px] transition-colors"
                    style={{ backgroundColor: isActive ? "#1a2010" : "var(--muted-2)" }}
                  />
                </button>
              )
            })}

            {/* 当前时间游标 */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[var(--near-black)] pointer-events-none"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>

          {/* 提示 */}
          <p className="text-[10.5px] text-[var(--muted-2)] text-center">
            点击任一段跳转到对应场景
          </p>
        </div>
      </div>
    )
  }
)

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatDurationLabel(seconds: number): string {
  const rounded = Number(seconds.toFixed(2))
  return Number.isInteger(rounded) ? `${rounded}s` : `${rounded.toFixed(2)}s`
}
