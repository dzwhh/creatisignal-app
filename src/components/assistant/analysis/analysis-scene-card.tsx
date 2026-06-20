"use client"

import { useMemo, useState } from "react"
import {
  Camera,
  ChevronDown,
  Eye,
  Hash,
  LayoutDashboard,
  Layers,
  Lightbulb,
  MessageSquare,
  Mic,
  PenLine,
  Play,
  Shapes,
  Sparkles,
  Type,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DYNAMIC_CATEGORY_META,
  type DynamicCategory,
  type DynamicCategoryIconName,
  type DynamicElement,
  type Scene,
} from "@/lib/replicate/breakdown-types"

const ICON_MAP: Record<DynamicCategoryIconName, LucideIcon> = {
  MessageSquare,
  Shapes,
  LayoutDashboard,
  Type,
  Sparkles,
  PenLine,
  Hash,
}

interface Props {
  scene: Scene
  isActive: boolean                            // 视频当前正在播这一段
  defaultExpanded: boolean
  insight?: string                              // 该场景为什么有效（手写洞察）
  onHeaderClick: (scene: Scene) => void        // 点击 header 视频跳转
}

/**
 * 用于「创意分析结果」详情页的场景卡 —— 与 SceneCard 结构一致，但去掉
 * boundary 编辑控件，去多色 narrative_role chip，整体配色收敛到中性灰 +
 * 单 lime accent，强调阅读理解而非决策。
 */
export function AnalysisSceneCard({ scene, isActive, defaultExpanded, insight, onHeaderClick }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const groupedElements = useMemo(() => {
    const map = new Map<DynamicCategory, DynamicElement[]>()
    for (const e of scene.dynamic_elements) {
      if (!map.has(e.category)) map.set(e.category, [])
      map.get(e.category)!.push(e)
    }
    return Array.from(map.entries())
  }, [scene.dynamic_elements])

  function handleHeaderClick() {
    setExpanded((v) => !v)
    onHeaderClick(scene)
  }

  // narrative_role 收敛为 1 个 neutral chip（取第一个，多个用 / 连接）
  const roleSummary = scene.narrative_role
    .map((r) => roleLabel(r))
    .join(" / ")

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white overflow-hidden transition-shadow",
        isActive
          ? "border-[var(--lime)] shadow-[0_0_0_3px_rgba(201,255,41,0.32)]"
          : "border-[var(--line)]"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleHeaderClick}
        className="w-full text-left p-4 flex items-center gap-3 cursor-pointer hover:bg-[var(--soft-2)] transition-colors"
      >
        <span className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--soft)] text-[var(--text)] text-[13px] font-extrabold shrink-0 border border-[var(--line)]">
          {scene.scene_id}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <p className="text-[13.5px] font-extrabold text-[var(--text)] truncate">{roleSummary}</p>
            {isActive && (
              <span className="inline-flex items-center gap-1 h-4 px-1.5 rounded-md bg-[var(--lime-soft)] text-[#3a4b1f] text-[9.5px] font-extrabold border border-[#cdf066]">
                <Play size={8} strokeWidth={2.6} fill="#3a4b1f" />
                播放中
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--muted)] font-semibold tabular-nums">
            {formatTime(scene.start_time)} – {formatTime(scene.end_time)} · {scene.duration.toFixed(1)}s · {scene.dynamic_elements.length} 元素
          </p>
        </div>
        <span className={cn("text-[var(--muted)] transition-transform shrink-0", expanded && "rotate-180")}>
          <ChevronDown size={16} />
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--line)] pt-3.5 space-y-3.5">
          {/* 洞察：为什么有效 */}
          {insight && (
            <section className="rounded-lg bg-[var(--lime-soft)] border border-[#cdf066] p-3 flex items-start gap-2">
              <Lightbulb size={12} className="text-[#5a7821] mt-0.5 shrink-0" strokeWidth={2.4} />
              <div className="flex-1 min-w-0">
                <p className="text-[10.5px] font-extrabold text-[#3a4b1f] uppercase tracking-wide mb-1">为什么有效</p>
                <p className="text-[12px] text-[#3a4b1f] leading-relaxed">{insight}</p>
              </div>
            </section>
          )}

          {/* 旁白 transcript */}
          {scene.transcript.length > 0 && (
            <Section icon={Mic} title="旁白">
              <div className="space-y-1.5">
                {scene.transcript.map((t, i) => (
                  <div key={i} className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] p-2.5">
                    <p className="text-[10px] text-[var(--muted-2)] font-bold mb-1 tabular-nums">{t.time} · {t.speaker}</p>
                    <p className="text-[12px] font-semibold text-[var(--text)] leading-relaxed">{t.content}</p>
                    {t.content_chinese && (
                      <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">{t.content_chinese}</p>
                    )}
                    <p className="text-[10.5px] text-[var(--muted-2)] mt-1 italic">语气：{t.state}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 镜头 profile */}
          <Section icon={Camera} title="镜头">
            <div className="flex flex-wrap gap-1.5">
              <ProfilePill label="景别"    value={scene.profile.shot.shot_size} />
              <ProfilePill label="运镜"    value={scene.profile.shot.camera_movement} />
              <ProfilePill label="角度"    value={scene.profile.shot.camera_angle} />
              <ProfilePill label="主持人"  value={scene.profile.host.present ? "在场" : "缺席"} />
              {scene.profile.host.pip_mode && <ProfilePill label="模式" value="画中画" />}
              <ProfilePill label="场景类型" value={
                scene.profile.scene_type === "hybrid" ? "实拍+UI" :
                scene.profile.scene_type === "hyperframes" ? "纯 UI" : "纯视频"
              } />
            </div>
          </Section>

          {/* 视觉描述 */}
          <Section icon={Eye} title="视觉描述">
            <div className="space-y-1.5">
              <DescBlock label="超帧层" text={scene.profile.visual_description.hyperframes_layer} />
              {scene.profile.visual_description.video_layer && (
                <DescBlock label="视频层" text={scene.profile.visual_description.video_layer} />
              )}
            </div>
          </Section>

          {/* Dynamic Elements — 按 category 分组，纯展示无操作 */}
          <Section icon={Layers} title={`动态元素 (${scene.dynamic_elements.length})`}>
            <div className="space-y-2">
              {groupedElements.map(([cat, elems]) => {
                const cMeta = DYNAMIC_CATEGORY_META[cat]
                const CatIcon = ICON_MAP[cMeta.iconName]
                return (
                  <div key={cat} className="rounded-lg border border-[var(--line)] overflow-hidden">
                    <div className="px-2.5 py-1.5 bg-[var(--soft-2)] flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded flex items-center justify-center shrink-0 bg-[var(--soft)] text-[var(--text)]">
                        <CatIcon size={10} strokeWidth={2.4} />
                      </span>
                      <span className="text-[10.5px] font-extrabold text-[var(--text)]">{cMeta.label}</span>
                      <span className="text-[10px] text-[var(--muted-2)] tabular-nums">×{elems.length}</span>
                    </div>
                    <ul className="divide-y divide-[var(--line)]">
                      {elems.map((elem) => (
                        <li key={elem.id} className="px-2.5 py-2">
                          <p className="text-[11.5px] font-extrabold text-[var(--text)] leading-snug">{elem.content}</p>
                          <p className="text-[10.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{elem.visual_description}</p>
                          <p className="text-[10px] text-[var(--muted-2)] mt-0.5 tabular-nums">
                            {elem.animation} · {elem.start.toFixed(1)}–{elem.end.toFixed(1)}s
                            {elem.narration_relation === "keyword_emphasis" && " · 关键词强调"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </Section>
        </div>
      )}
    </article>
  )
}

// ─── small primitives ───────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
        <Icon size={11} strokeWidth={2.2} />
        {title}
      </p>
      {children}
    </section>
  )
}

function ProfilePill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[11px] font-bold border bg-white border-[var(--line)] text-[var(--text)]">
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

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    hook: "Hook 钩子",
    problem_setup: "问题铺垫",
    solution_intro: "方案引入",
    benefit_highlight: "卖点强调",
    product_demo: "产品演示",
    objection_handling: "异议处理",
    social_proof: "社会证明",
    cta: "Call to Action",
  }
  return map[role] ?? role
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(1)
  return `${m}:${s.padStart(4, "0")}`
}
