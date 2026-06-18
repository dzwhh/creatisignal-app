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
        {/* Video */}
        <div className="aspect-video bg-black relative">
          <video
            ref={videoRef}
            src={data.source_video_url}
            controls
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full"
          />
        </div>

        {/* 时间轴：5 段彩色，按时长比例 */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-[var(--muted-2)]">
            <span>0:00</span>
            <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          {/* 主时间轴 */}
          <div className="relative h-7 rounded-md overflow-hidden bg-[var(--soft)] flex">
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
                    "h-full flex items-center justify-center text-[9px] font-extrabold transition-all cursor-pointer overflow-hidden border-r border-white/30 last:border-r-0",
                    isActive ? "ring-2 ring-inset ring-white" : ""
                  )}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: meta.color,
                    color: "white",
                    opacity: isActive ? 1 : 0.85,
                  }}
                >
                  <span className="truncate px-1">{meta.short}</span>
                </button>
              )
            })}

            {/* 当前时间游标 */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
              style={{ left: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>

          {/* 5 段图例 */}
          <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
            {data.scenes.map((s) => {
              const role = s.narrative_role[0]
              const meta = NARRATIVE_ROLE_META[role]
              return (
                <span key={s.scene_id} className="inline-flex items-center gap-1 text-[var(--muted)]">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: meta.color }} />
                  <span className="font-bold">{meta.short}</span>
                  <span className="text-[var(--muted-2)] text-[9.5px]">{s.duration.toFixed(1)}s</span>
                </span>
              )
            })}
          </div>
        </div>

        {/* 整体策略 + 情绪曲线（视频下方） */}
        <div className="px-3 pb-3 pt-1 border-t border-[var(--line)]">
          <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1">整体策略</p>
          <p className="text-[11.5px] text-[var(--text)] leading-relaxed mb-2">{data.narrative_overview.overall_strategy}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[var(--muted-2)]">情绪曲线：</span>
            {data.narrative_overview.viral_analysis.emotion_curve.map((e, i, arr) => (
              <span key={i} className="inline-flex items-center gap-1">
                <span className="h-5 px-1.5 rounded-md bg-[var(--soft)] text-[10px] font-bold text-[var(--text)]">{e}</span>
                {i < arr.length - 1 && <span className="text-[var(--muted-2)] text-[10px]">→</span>}
              </span>
            ))}
          </div>
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
