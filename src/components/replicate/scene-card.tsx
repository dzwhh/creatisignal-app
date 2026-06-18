"use client"

import { useMemo, useState } from "react"
import { Camera, ChevronDown, Layers, Mic, Play, User } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DYNAMIC_CATEGORY_META,
  NARRATIVE_ROLE_META,
  type BoundaryKind,
  type DynamicCategory,
  type DynamicElement,
  type Scene,
} from "@/lib/replicate/breakdown-types"
import { getElementKey, resolveBoundary } from "@/lib/replicate/breakdown-utils"
import { BoundaryChip } from "./boundary-chip"

interface Props {
  scene: Scene
  isActive: boolean                            // 视频当前正在播这一段
  defaultExpanded: boolean
  overrides: Record<string, BoundaryKind>
  onSetBoundary: (sceneId: number, elemId: number, b: BoundaryKind) => void
  onHeaderClick: (scene: Scene) => void        // 点击 header 视频跳转
}

export function SceneCard({ scene, isActive, defaultExpanded, overrides, onSetBoundary, onHeaderClick }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  // 当前命中时自动 ring，但不自动展开（避免抢用户滚动）
  // 按 category 分组的 dynamic_elements
  const groupedElements = useMemo(() => {
    const map = new Map<DynamicCategory, DynamicElement[]>()
    for (const e of scene.dynamic_elements) {
      if (!map.has(e.category)) map.set(e.category, [])
      map.get(e.category)!.push(e)
    }
    return Array.from(map.entries())
  }, [scene.dynamic_elements])

  const primaryRole = scene.narrative_role[0]
  const roleMeta = NARRATIVE_ROLE_META[primaryRole]

  function handleHeaderClick() {
    setExpanded((v) => !v)
    onHeaderClick(scene)
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white overflow-hidden transition-all",
        isActive ? "border-[var(--lime)] shadow-[0_0_0_3px_rgba(201,255,41,0.32)]" : "border-[var(--line)]"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleHeaderClick}
        className="w-full text-left p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[var(--soft-2)]"
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-extrabold shrink-0"
          style={{ backgroundColor: roleMeta.color }}
        >
          {scene.scene_id}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            {scene.narrative_role.map((r) => {
              const m = NARRATIVE_ROLE_META[r]
              return (
                <span key={r}
                  className="inline-flex items-center h-5 px-1.5 rounded-md text-[10px] font-extrabold border"
                  style={{ backgroundColor: m.bg, borderColor: m.border, color: m.text }}
                >
                  {m.label}
                </span>
              )
            })}
            {isActive && (
              <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-[var(--lime)] text-[#1a2010] text-[10px] font-extrabold">
                <Play size={9} strokeWidth={2.6} fill="#1a2010" />
                播放中
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-[var(--muted)] font-bold">
            Scene {scene.scene_id} · {formatTime(scene.start_time)}–{formatTime(scene.end_time)} · {scene.duration.toFixed(1)}s · {scene.dynamic_elements.length} 元素
          </p>
        </div>
        <span className={cn("text-[var(--muted)] transition-transform shrink-0", expanded && "rotate-180")}>
          <ChevronDown size={16} />
        </span>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 border-t border-[var(--line)] pt-3 space-y-3">
          {/* 旁白 transcript */}
          {scene.transcript.length > 0 && (
            <section>
              <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5 flex items-center gap-1">
                <Mic size={10} />
                旁白
              </p>
              <div className="space-y-1.5">
                {scene.transcript.map((t, i) => (
                  <div key={i} className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] p-2.5">
                    <p className="text-[10px] text-[var(--muted-2)] font-bold mb-1">{t.time} · {t.speaker}</p>
                    <p className="text-[12.5px] font-semibold text-[var(--text)] leading-relaxed">{t.content}</p>
                    <p className="text-[11.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{t.content_chinese}</p>
                    <p className="text-[10.5px] text-[var(--muted-2)] mt-1 italic">语气：{t.state}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 镜头 profile */}
          <section>
            <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Camera size={10} />
              镜头
            </p>
            <div className="flex flex-wrap gap-1.5">
              <ProfilePill label="景别" value={scene.profile.shot.shot_size} />
              <ProfilePill label="运镜" value={scene.profile.shot.camera_movement} />
              <ProfilePill label="角度" value={scene.profile.shot.camera_angle} />
              <ProfilePill label="主持人" value={scene.profile.host.present ? "在场" : "缺席"} />
              {scene.profile.host.pip_mode && <ProfilePill label="模式" value="画中画" highlight />}
              <ProfilePill label="场景类型" value={
                scene.profile.scene_type === "hybrid" ? "实拍+UI" :
                scene.profile.scene_type === "hyperframes" ? "纯 UI" : "纯视频"
              } />
            </div>
          </section>

          {/* 视觉描述 */}
          <section>
            <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Layers size={10} />
              视觉描述
            </p>
            <div className="space-y-1.5">
              <DescBlock label="超帧层 (Hyperframes)" text={scene.profile.visual_description.hyperframes_layer} />
              {scene.profile.visual_description.video_layer && (
                <DescBlock label="视频层 (Video)" text={scene.profile.visual_description.video_layer} />
              )}
            </div>
          </section>

          {/* Dynamic Elements 表格（按 category 分组） */}
          <section>
            <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <User size={10} />
              动态元素 ({scene.dynamic_elements.length})
            </p>
            <div className="space-y-2">
              {groupedElements.map(([cat, elems]) => {
                const cMeta = DYNAMIC_CATEGORY_META[cat]
                return (
                  <div key={cat} className="rounded-lg border border-[var(--line)] overflow-hidden">
                    <div className="px-2.5 py-1.5 bg-[var(--soft-2)] flex items-center gap-1.5">
                      <span className="text-[12px]">{cMeta.emoji}</span>
                      <span className="text-[10.5px] font-extrabold text-[var(--text)]">{cMeta.label}</span>
                      <span className="text-[10px] text-[var(--muted-2)]">×{elems.length}</span>
                    </div>
                    <ul className="divide-y divide-[var(--line)]">
                      {elems.map((elem) => {
                        const b = resolveBoundary(scene, elem, overrides)
                        const k = getElementKey(scene.scene_id, elem.id)
                        return (
                          <li key={k} className="px-2.5 py-2 flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[11.5px] font-extrabold text-[var(--text)] leading-snug">{elem.content}</p>
                              <p className="text-[10.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{elem.visual_description}</p>
                              <p className="text-[10px] text-[var(--muted-2)] mt-0.5">
                                动画：{elem.animation} · {elem.start.toFixed(1)}–{elem.end.toFixed(1)}s
                                {elem.narration_relation === "keyword_emphasis" && " · 关键词强调"}
                              </p>
                            </div>
                            <BoundaryChip
                              value={b}
                              onChange={(next) => onSetBoundary(scene.scene_id, elem.id, next)}
                              compact
                            />
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      )}
    </article>
  )
}

function ProfilePill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-bold border",
        highlight
          ? "bg-[var(--lime-soft)] border-[#cdf066] text-[#1a2010]"
          : "bg-white border-[var(--line)] text-[var(--text)]"
      )}
    >
      <span className="text-[var(--muted-2)] font-semibold">{label}</span>
      {value}
    </span>
  )
}

function DescBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] p-2.5">
      <p className="text-[10px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[11.5px] text-[var(--text)] leading-relaxed">{text}</p>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(1)
  return `${m}:${s.padStart(4, "0")}`
}
