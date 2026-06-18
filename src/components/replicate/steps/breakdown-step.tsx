"use client"

import { useMemo, useRef, useState } from "react"
import { Ban, CheckCircle2, Edit3, RefreshCw, ShieldCheck } from "lucide-react"
import { BOUNDARY_META, type BoundaryKind, type VideoBreakdown } from "@/lib/replicate/breakdown-types"
import { aggregateBoundary, findActiveSceneId, getElementKey } from "@/lib/replicate/breakdown-utils"
import { VideoBreakdownPlayer, type VideoBreakdownPlayerHandle } from "../video-breakdown-player"
import { SceneCard } from "../scene-card"
import { cn } from "@/lib/utils"

interface Props {
  data: VideoBreakdown
}

export function BreakdownStep({ data }: Props) {
  // 用户对边界的手动覆盖（key = `${sceneId}_${elemId}`）
  const [overrides, setOverrides] = useState<Record<string, BoundaryKind>>({})
  const [currentTime, setCurrentTime] = useState(0)
  const playerRef = useRef<VideoBreakdownPlayerHandle>(null)

  const stats = useMemo(() => aggregateBoundary(data.scenes, overrides), [data.scenes, overrides])
  const total = stats.keep + stats.change + stats.ban
  const activeSceneId = useMemo(() => findActiveSceneId(data.scenes, currentTime), [data.scenes, currentTime])

  function handleSetBoundary(sceneId: number, elemId: number, b: BoundaryKind) {
    setOverrides((prev) => ({ ...prev, [getElementKey(sceneId, elemId)]: b }))
  }

  function handleReset() {
    setOverrides({})
  }

  function handleSceneHeaderClick(sceneId: number, startTime: number) {
    playerRef.current?.seekTo(startTime)
    playerRef.current?.play()
  }

  return (
    <div className="space-y-4">
      {/* 顶部 sticky 复刻边界 */}
      <section className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 sticky top-3 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[var(--muted)]" />
            <h3 className="text-[13px] font-extrabold text-[var(--text)]">复刻边界</h3>
            <span className="text-[10.5px] text-[var(--muted-2)] font-bold">{total} 个元素</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={Object.keys(overrides).length === 0}
            className={cn(
              "h-7 px-2.5 rounded-full border text-[11px] font-bold flex items-center gap-1 transition-colors",
              Object.keys(overrides).length === 0
                ? "border-[var(--line)] text-[var(--muted-2)] cursor-not-allowed"
                : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
            )}
          >
            <RefreshCw size={10} />
            重置 AI 判定
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <BoundaryStatBlock kind="keep"   icon={<CheckCircle2 size={11} />} count={stats.keep} total={total} />
          <BoundaryStatBlock kind="change" icon={<Edit3 size={11} />}        count={stats.change} total={total} />
          <BoundaryStatBlock kind="ban"    icon={<Ban size={11} />}          count={stats.ban} total={total} />
        </div>
      </section>

      {/* 左视频 sticky + 右 scene 列表 */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        {/* 左：sticky 视频播放器 */}
        <aside className="sticky top-[170px] self-start max-h-[calc(100vh-200px)] overflow-y-auto">
          <VideoBreakdownPlayer
            ref={playerRef}
            data={data}
            onTimeUpdate={setCurrentTime}
            activeSceneId={activeSceneId}
          />
        </aside>

        {/* 右：5 个 scene 折叠卡 */}
        <main className="space-y-3">
          <div>
            <h2 className="text-[16px] font-extrabold text-[var(--text)] mb-1">场景拆解 ({data.scenes.length})</h2>
            <p className="text-[11.5px] text-[var(--muted)]">每个场景列出旁白 / 镜头 / 视觉 / 动态元素；点击卡片头部跳转视频；点击右侧三色 chip 调整复刻边界</p>
          </div>

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

          {/* 受众 + 叙事大纲 */}
          <section className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--soft-2)] p-3.5 mt-4">
            <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">叙事策略全景</p>
            <div className="space-y-1.5 text-[11.5px] text-[var(--text)] leading-relaxed">
              <p><span className="font-bold text-[var(--muted)]">受众：</span>{data.narrative_overview.target_audience}</p>
              <p><span className="font-bold text-[var(--muted)]">情绪：</span>{data.narrative_overview.emotional_journey}</p>
              <p><span className="font-bold text-[var(--muted)]">Hook 机制：</span>{data.narrative_overview.viral_analysis.hook_trigger_mechanism} · {data.narrative_overview.viral_analysis.hook_sentence_pattern}</p>
              <p><span className="font-bold text-[var(--muted)]">说服路径：</span>{data.narrative_overview.viral_analysis.persuasion_type} → {data.narrative_overview.viral_analysis.conversion_trigger}</p>
              <p><span className="font-bold text-[var(--muted)]">节奏：</span>
                Hook {data.narrative_overview.viral_analysis.rhythm_profile.hook_pace}
                · Body {data.narrative_overview.viral_analysis.rhythm_profile.body_pace}
                · CTA {data.narrative_overview.viral_analysis.rhythm_profile.cta_pace}
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

// ─── Top stat block ─────────────────────────────────────────────────────────

function BoundaryStatBlock({ kind, icon, count, total }: {
  kind: BoundaryKind
  icon: React.ReactNode
  count: number
  total: number
}) {
  const meta = BOUNDARY_META[kind]
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div
      className="rounded-lg border p-2 flex items-center gap-2"
      style={{ backgroundColor: meta.bg, borderColor: meta.border }}
    >
      <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: meta.dot, color: "white" }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10.5px] font-extrabold uppercase tracking-wide" style={{ color: meta.text }}>{meta.label}</p>
        <p className="text-[15px] font-extrabold leading-none mt-0.5" style={{ color: meta.text }}>
          {count}
          <span className="text-[10px] font-bold ml-1 opacity-70">/ {total}（{pct}%）</span>
        </p>
      </div>
    </div>
  )
}
