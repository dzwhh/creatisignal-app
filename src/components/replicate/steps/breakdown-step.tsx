"use client"

import { useMemo, useRef, useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { type BoundaryKind, type VideoBreakdown } from "@/lib/replicate/breakdown-types"
import { findActiveSceneId, getElementKey } from "@/lib/replicate/breakdown-utils"
import { VideoBreakdownPlayer, type VideoBreakdownPlayerHandle } from "../video-breakdown-player"
import { SceneCard } from "../scene-card"

interface Props {
  data: VideoBreakdown
}

export function BreakdownStep({ data }: Props) {
  // 用户对边界的手动覆盖（key = `${sceneId}_${elemId}`）
  const [overrides, setOverrides] = useState<Record<string, BoundaryKind>>({})
  const [currentTime, setCurrentTime] = useState(0)
  // 整体策略板块折叠（默认展开）
  const [strategyExpanded, setStrategyExpanded] = useState(true)
  const playerRef = useRef<VideoBreakdownPlayerHandle>(null)

  const activeSceneId = useMemo(() => findActiveSceneId(data.scenes, currentTime), [data.scenes, currentTime])

  function handleSetBoundary(sceneId: number, elemId: number, b: BoundaryKind) {
    setOverrides((prev) => ({ ...prev, [getElementKey(sceneId, elemId)]: b }))
  }

  function handleSceneHeaderClick(sceneId: number, startTime: number) {
    playerRef.current?.seekTo(startTime)
    playerRef.current?.play()
  }

  return (
    <div className="grid grid-cols-[1fr_1.6fr] gap-5">
      {/* 左：sticky 视频（9:16 竖屏） */}
      <aside className="sticky top-3 self-start max-h-[calc(100vh-180px)] overflow-y-auto">
        <VideoBreakdownPlayer
          ref={playerRef}
          data={data}
          onTimeUpdate={setCurrentTime}
          activeSceneId={activeSceneId}
        />
      </aside>

      {/* 右：叙事策略全景（顶部）+ 场景拆解 */}
      <main className="space-y-4">
        {/* 叙事策略全景 — 可折叠，默认展开 */}
        <section className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setStrategyExpanded((v) => !v)}
            className="w-full p-4 flex items-center gap-2 cursor-pointer hover:bg-[var(--soft-2)] transition-colors text-left"
          >
            <Sparkles size={14} className="text-[var(--muted)] shrink-0" />
            <h3 className="text-[13.5px] font-extrabold text-[var(--text)] flex-1">叙事策略全景</h3>
            <span className="text-[11px] text-[var(--muted)] font-bold">
              {strategyExpanded ? "收起" : "展开"}
            </span>
            <span className={cn("text-[var(--muted)] transition-transform shrink-0", strategyExpanded && "rotate-180")}>
              <ChevronDown size={14} />
            </span>
          </button>

          {strategyExpanded && (
            <div className="px-4 pb-4 border-t border-[var(--line)] pt-3 space-y-3">
              <div>
                <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">整体策略</p>
                <p className="text-[12px] text-[var(--text)] leading-relaxed">{data.narrative_overview.overall_strategy}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoBlock label="目标受众" value={data.narrative_overview.target_audience} />
                <InfoBlock label="情绪旅程" value={data.narrative_overview.emotional_journey} />
              </div>

              <div>
                <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">情绪曲线</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {data.narrative_overview.viral_analysis.emotion_curve.map((e, i, arr) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <span className="h-6 px-2 rounded-md bg-[var(--lime-soft)] border border-[#cdf066] text-[11px] font-bold text-[#3a4b1f]">{e}</span>
                      {i < arr.length - 1 && <span className="text-[var(--muted-2)] text-[11px]">→</span>}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <InfoBlock label="Hook 机制" value={`${data.narrative_overview.viral_analysis.hook_trigger_mechanism} · ${data.narrative_overview.viral_analysis.hook_sentence_pattern}`} />
                <InfoBlock label="说服路径" value={`${data.narrative_overview.viral_analysis.persuasion_type} → ${data.narrative_overview.viral_analysis.conversion_trigger}`} />
              </div>

              <div>
                <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">节奏</p>
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <RhythmPill label="Hook" value={data.narrative_overview.viral_analysis.rhythm_profile.hook_pace} />
                  <RhythmPill label="Body" value={data.narrative_overview.viral_analysis.rhythm_profile.body_pace} />
                  <RhythmPill label="CTA"  value={data.narrative_overview.viral_analysis.rhythm_profile.cta_pace} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 场景拆解 */}
        <div>
          <h2 className="text-[16px] font-extrabold text-[var(--text)] mb-1">场景拆解 ({data.scenes.length})</h2>
          <p className="text-[11.5px] text-[var(--muted)] mb-3">点击场景跳转视频 · 右侧三色 chip 调整复刻边界</p>

          <div className="space-y-3">
            {data.scenes.map((scene) => (
              <SceneCard
                key={scene.scene_id}
                scene={scene}
                isActive={activeSceneId === scene.scene_id}
                defaultExpanded={scene.scene_id === 0}
                overrides={overrides}
                onSetBoundary={handleSetBoundary}
                onHeaderClick={(s) => handleSceneHeaderClick(s.scene_id, s.start_time)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── helpers ────────────────────────────────────────────────────────────────

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[11.5px] text-[var(--text)] leading-relaxed">{value}</p>
    </div>
  )
}

function RhythmPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md border border-[var(--line)] bg-white text-[11px]">
      <span className="font-bold text-[var(--muted-2)]">{label}</span>
      <span className="font-bold text-[var(--text)]">{value}</span>
    </span>
  )
}
