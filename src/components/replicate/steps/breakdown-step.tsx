"use client"

import { useMemo, useRef, useState } from "react"
import { Check, Eye, Layers, Sparkles, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { type VideoBreakdown } from "@/lib/replicate/breakdown-types"
import { findActiveSceneId } from "@/lib/replicate/breakdown-utils"
import { VideoBreakdownPlayer, type VideoBreakdownPlayerHandle } from "../video-breakdown-player"
import { AnalysisSceneCard } from "@/components/assistant/analysis/analysis-scene-card"
import { NarrativeStrategyCard } from "@/components/assistant/analysis/analysis-detail"

interface Props {
  data: VideoBreakdown
}

// 与分析详情同款手写场景洞察（按 scene_id 索引）
const SCENE_INSIGHTS: Record<number, string> = {
  0: "用「问题反问 + 强视觉对比」直接命中目标用户痛点，前 3 秒留存比同行业基准高 38%。",
  1: "解决方案出场时机精准（5–9s），落在用户注意力峰值，为后续 CTA 铺垫信任。",
  2: "产品演示过程加入 UI 动画 + 真实场景同时呈现，混合证据强化「真的可用」感知。",
  3: "异议消解段落把法律 / 资质 / 利率信息高亮，对存疑用户的转化率提升 22%。",
  4: "CTA 收尾节奏放缓 + 大幅字幕重复关键词，符合金融品类「放慢 + 多次提醒」最佳实践。",
}

// 提示词反推（mock —— 与分析详情同款）
const REVERSE_PROMPT = `帮我做一条 22 秒的菲律宾普惠金融短视频，目标受众为有短期资金需求、关注还款压力与平台合规的成年用户。

镜头结构：
- 0–4s：女主持人正面口播痛点反问（"还款压力大？"），背景叠加乌云贴纸 + 集中线
- 4–9s：切到平台 UI 截图，逐项展示利率 / 额度 / 还款方案
- 9–14s：动效"集中线"汇聚到品牌 Logo，强化记忆
- 14–18s：法律免责声明小字，资质 ID 居中淡入
- 18–22s：CTA「立即申请」+ 二维码 + 主持人最后一句安抚

风格 & 节奏：
- 主持人中近景为主，暖色调，字幕全程同步关键词
- 节奏档位 fast_dense → moderate_escalating → urgent_push
- 情绪曲线 焦虑 → 安心 → 信任 → 紧迫

卖点优先级：1) 月供低 2) 5 分钟到账 3) SEC 持牌合规
禁忌：避免对利率做承诺、避免对比竞品、保留法律免责声明`

export function BreakdownStep({ data }: Props) {
  const playerRef = useRef<VideoBreakdownPlayerHandle>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const activeSceneId = useMemo(() => findActiveSceneId(data.scenes, currentTime), [data.scenes, currentTime])

  function handleSceneHeaderClick(sceneId: number, startTime: number) {
    playerRef.current?.seekTo(startTime)
    playerRef.current?.play()
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-6">
      {/* 左：视频 + 提示词反推 —— 跟随页面流，无内嵌滚动 */}
      <aside className="space-y-3">
        <VideoBreakdownPlayer
          ref={playerRef}
          data={data}
          onTimeUpdate={setCurrentTime}
          activeSceneId={activeSceneId}
        />
        <ReversePromptCard prompt={REVERSE_PROMPT} />
      </aside>

      {/* 右：叙事策略全景 + 场景拆解 */}
      <main className="space-y-4 min-w-0">
        <NarrativeStrategyCard data={data} />

        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-7 h-7 rounded-lg bg-[var(--lime-soft)] text-[#5a7821] flex items-center justify-center">
              <Layers size={13} strokeWidth={2.4} />
            </span>
            <h2 className="text-[14px] font-extrabold text-[var(--text)] flex-1">场景拆解</h2>
            <span className="text-[11px] text-[var(--muted)] font-bold tabular-nums">{data.scenes.length} 段</span>
          </div>
          <p className="text-[11.5px] text-[var(--muted)] mb-3 flex items-center gap-1">
            <Eye size={11} className="text-[var(--muted-2)]" />
            点击 header 跳转视频 · 每段独立展开
          </p>

          <div className="space-y-3">
            {data.scenes.map((scene) => (
              <AnalysisSceneCard
                key={scene.scene_id}
                scene={scene}
                isActive={activeSceneId === scene.scene_id}
                defaultExpanded={scene.scene_id === 0}
                insight={SCENE_INSIGHTS[scene.scene_id]}
                onHeaderClick={(s) => handleSceneHeaderClick(s.scene_id, s.start_time)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

// ─── 提示词反推卡（与 analysis-detail 同款，含一键复制） ──────────────────

function ReversePromptCard({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(prompt).catch(() => {})
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[var(--lime-soft)] text-[#5a7821] flex items-center justify-center">
            <Wand2 size={13} strokeWidth={2.4} />
          </span>
          <p className="text-[12.5px] font-extrabold text-[var(--text)]">提示词反推</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "h-7 px-2.5 rounded-md text-[11px] font-extrabold cursor-pointer transition-colors flex items-center gap-1",
            copied
              ? "bg-[#dcfce7] text-[#15803d]"
              : "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)]"
          )}
        >
          {copied ? <Check size={10} strokeWidth={2.8} /> : <Sparkles size={10} strokeWidth={2.4} />}
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] p-3 text-[11.5px] leading-relaxed text-[var(--text)] whitespace-pre-wrap font-sans">
        {prompt}
      </pre>
    </section>
  )
}
