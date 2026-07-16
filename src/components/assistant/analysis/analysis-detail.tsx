"use client"

import { useMemo, useRef, useState } from "react"
import {
  BarChart3,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Languages,
  Layers,
  Lightbulb,
  Play,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { type VideoBreakdown } from "@/lib/replicate/breakdown-types"
import { findActiveSceneId } from "@/lib/replicate/breakdown-utils"
import { LANGUAGES, type LangCode, translatePrompt } from "@/lib/replicate/prompt-translations"
import { VideoBreakdownPlayer, type VideoBreakdownPlayerHandle } from "@/components/replicate/video-breakdown-player"
import { useAssetsState } from "@/lib/assets/state"
import { AnalysisSceneCard } from "./analysis-scene-card"
import { EnterReplicateDrawer } from "./enter-replicate-drawer"

interface Props {
  data: VideoBreakdown
  /** 任务标题（来自 task-result-section） */
  title?: string
  /** 任务生成时间 */
  generatedAt?: string
}

// 手写的场景洞察（按 scene_id 索引），让分析视角更具体
const SCENE_INSIGHTS: Record<number, string> = {
  0: "用「问题反问 + 强视觉对比」直接命中目标用户痛点，前 3 秒留存比同行业基准高 38%。",
  1: "解决方案出场时机精准（5–9s），落在用户注意力峰值，为后续 CTA 铺垫信任。",
  2: "产品演示过程加入 UI 动画 + 真实场景同时呈现，混合证据强化「真的可用」感知。",
  3: "异议消解段落把法律 / 资质 / 利率信息高亮，对存疑用户的转化率提升 22%。",
  4: "CTA 收尾节奏放缓 + 大幅字幕重复关键词，符合金融品类「放慢 + 多次提醒」最佳实践。",
}

// 提示词反推 —— 通过视频理解后生成的可复用 prompt
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

// 建议动作（后两项为外链 a；进入爆款复刻在组件内单独渲染为 button，触发抽屉）
const LINK_ACTIONS = [
  { label: "保存到资产库",     icon: Bookmark, href: "/assets/uploaded" },
  { label: "重新分析一遍",     icon: RefreshCw, href: "/assistant" },
]

// 相似创意推荐（mock）：与被分析素材同赛道、结构相近的高表现创意
const SIMILAR_CREATIVES = [
  {
    id: "sim_001",
    title: "5-Minute Cash Loan · @pesoquick",
    thumb: "https://picsum.photos/seed/sim_loan_001/480/854",
    meta: "TikTok · PH · 21s",
    match: 92,
    reason: "同款「痛点反问 Hook + UI 实证」结构，CTA 同为放缓节奏",
    stats: "CTR 3.1% · ROAS 3.4",
  },
  {
    id: "sim_002",
    title: "Low Monthly Payment Explainer · @lendingpal",
    thumb: "https://picsum.photos/seed/sim_loan_002/480/854",
    meta: "TikTok · PH · 24s",
    match: 87,
    reason: "情绪曲线一致（焦虑→安心→信任），合规资质高亮手法相同",
    stats: "CTR 2.7% · ROAS 2.9",
  },
  {
    id: "sim_003",
    title: "Salary Day Rescue Skit · @cashnowph",
    thumb: "https://picsum.photos/seed/sim_loan_003/480/854",
    meta: "Reels · SEA · 19s",
    match: 81,
    reason: "同受众不同打法：情景短剧演绎痛点，可作变体方向参考",
    stats: "CTR 2.4% · ROAS 2.6",
  },
]

export function AnalysisDetail({ data, title = "高 CTR 素材分析", generatedAt = "刚刚" }: Props) {
  const playerRef = useRef<VideoBreakdownPlayerHandle>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const activeSceneId = useMemo(() => findActiveSceneId(data.scenes, currentTime), [data.scenes, currentTime])

  // 保存到资产库（uploaded tab）
  const { addAsset } = useAssetsState()
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle")
  const [replicateOpen, setReplicateOpen] = useState(false)
  function handleSaveToLibrary() {
    const now = Date.now()
    addAsset("uploaded", {
      id: `analysis_save_${now.toString(36)}`,
      kind: "video",
      thumb: `https://picsum.photos/seed/analysis_${now}/480/854`,
      ratio: "9:14",
      timeLabel: "刚刚",
      sizeKB: 4280,
      caption: `${title} · 参考视频`,
    })
    setSaveState("saved")
    window.setTimeout(() => setSaveState("idle"), 2400)
  }

  function handleSceneHeaderClick(sceneId: number, startTime: number) {
    playerRef.current?.seekTo(startTime)
    playerRef.current?.play()
  }

  const totalDuration = data.scenes[data.scenes.length - 1]?.end_time ?? 22
  const elementCount = data.scenes.reduce((sum, s) => sum + s.dynamic_elements.length, 0)

  return (
    <main className="flex-1 overflow-y-auto bg-[var(--soft-2)]">
      {/* 顶部 hero */}
      <section className="bg-white border-b border-[var(--line)]">
        <div className="max-w-[1280px] mx-auto px-8 py-5 flex items-start justify-between gap-5 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-[var(--lime-soft)] border border-[#cdf066] text-[#3a4b1f] text-[10.5px] font-extrabold">
                <BarChart3 size={10} strokeWidth={2.6} />
                创意分析
              </span>
              <span className="inline-flex items-center h-5 px-1.5 rounded-md bg-[#dcfce7] text-[#15803d] text-[10.5px] font-extrabold">
                <CheckCircle2 size={10} strokeWidth={2.6} className="mr-0.5" />
                已完成
              </span>
            </div>
            <h1 className="text-[22px] font-extrabold text-[var(--text)] tracking-tight leading-tight">{title}</h1>
            <p className="text-[12px] text-[var(--muted)] mt-1.5 flex items-center gap-2 flex-wrap">
              <span>生成于 <span className="font-bold text-[var(--text)]">{generatedAt}</span></span>
              <span className="text-[var(--muted-2)]">·</span>
              <span>{totalDuration.toFixed(1)}s 视频</span>
              <span className="text-[var(--muted-2)]">·</span>
              <span>{data.scenes.length} 场景 / {elementCount} 元素</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ActionBtn icon={Share2}   label="分享" />
            <ActionBtn icon={Download} label="导出 PDF" />
            <ActionBtn
              icon={saveState === "saved" ? Check : Bookmark}
              label={saveState === "saved" ? "已保存到资产库" : "保存到资产库"}
              primary
              onClick={handleSaveToLibrary}
            />
          </div>
        </div>
      </section>

      {/* 主体 grid */}
      <div className="max-w-[1280px] mx-auto px-8 py-6">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-6">
          {/* 左：视频 + 提示词反推 + 建议下一步 —— 跟随页面流，无内嵌滚动 */}
          <aside className="space-y-3">
            {/* 视频 + 时间轴 */}
            <VideoBreakdownPlayer
              ref={playerRef}
              data={data}
              onTimeUpdate={setCurrentTime}
              activeSceneId={activeSceneId}
            />

            {/* 提示词反推 */}
            <ReversePromptCard prompt={REVERSE_PROMPT} />

            {/* 建议下一步 */}
            <section className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="text-[12.5px] font-extrabold text-[var(--text)] mb-2.5">
                <span className="relative inline-block pb-1">
                  建议下一步
                  <HandDrawnUnderline />
                </span>
              </p>
              <div className="space-y-1.5">
                {/* 进入爆款复刻 —— 抽屉触发 */}
                <button
                  type="button"
                  onClick={() => setReplicateOpen(true)}
                  className="w-full flex items-center gap-2.5 h-9 px-2.5 rounded-lg border border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--soft-2)] cursor-pointer transition-colors group text-left"
                >
                  <span className="w-6 h-6 rounded-md bg-[var(--soft)] text-[var(--text)] flex items-center justify-center shrink-0">
                    <Zap size={11} strokeWidth={2.4} />
                  </span>
                  <span className="flex-1 text-[12px] font-extrabold text-[var(--text)]">进入爆款复刻 →</span>
                </button>
                {/* 其余外链 */}
                {LINK_ACTIONS.map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg border border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--soft-2)] cursor-pointer transition-colors group"
                  >
                    <span className="w-6 h-6 rounded-md bg-[var(--soft)] text-[var(--text)] flex items-center justify-center shrink-0">
                      <a.icon size={11} strokeWidth={2.4} />
                    </span>
                    <span className="flex-1 text-[12px] font-extrabold text-[var(--text)]">{a.label}</span>
                  </a>
                ))}
              </div>
            </section>
          </aside>

          {/* 右：叙事策略 + 场景拆解 */}
          <div className="space-y-4 min-w-0">
            {/* 故事策略全景 — 默认展开 + 可折叠 */}
            <NarrativeStrategyCard data={data} />

            {/* 场景拆解 */}
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

            {/* 相似创意推荐 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg bg-[var(--lime-soft)] text-[#5a7821] flex items-center justify-center">
                  <Lightbulb size={13} strokeWidth={2.4} />
                </span>
                <h2 className="text-[14px] font-extrabold text-[var(--text)] flex-1">相似创意推荐</h2>
                <span className="text-[11px] text-[var(--muted)] font-bold tabular-nums">{SIMILAR_CREATIVES.length} 条</span>
              </div>
              <p className="text-[11.5px] text-[var(--muted)] mb-3">
                基于本条素材的结构、受众与情绪曲线，从市场素材库匹配的高表现创意
              </p>
              <div className="grid grid-cols-3 gap-3">
                {SIMILAR_CREATIVES.map((c) => (
                  <SimilarCreativeCard key={c.id} creative={c} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 进入爆款复刻 —— 右侧抽屉 */}
      <EnterReplicateDrawer
        open={replicateOpen}
        onClose={() => setReplicateOpen(false)}
      />
    </main>
  )
}

// ─── primitives ──────────────────────────────────────────────────────────────

function ActionBtn({ icon: Icon, label, primary, onClick }: { icon: typeof Bookmark; label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 px-3.5 rounded-lg text-[12.5px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer",
        primary
          ? "bg-[#18181b] text-white hover:opacity-90"
          : "border border-[var(--line)] text-[var(--text)] bg-white hover:bg-[var(--soft-2)]"
      )}
    >
      <Icon size={12} strokeWidth={2.4} />
      {label}
    </button>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[12px] text-[var(--text)] leading-relaxed">{value}</p>
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

// ─── 提示词反推卡（含一键复制 + 多语翻译） ─────────────────────────────────

function ReversePromptCard({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)
  const [lang, setLang] = useState<LangCode>("zh")
  const [langOpen, setLangOpen] = useState(false)

  const activeLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]
  const displayPrompt = translatePrompt(prompt, lang)

  function copy() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(displayPrompt).catch(() => {})
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
        <div className="flex items-center gap-1.5">
          <Popover.Root open={langOpen} onOpenChange={setLangOpen}>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="h-7 px-2.5 rounded-md border border-[var(--line)] bg-white text-[11px] font-extrabold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] flex items-center gap-1 cursor-pointer transition-colors data-[state=open]:bg-[var(--soft-2)] data-[state=open]:text-[var(--text)] data-[state=open]:border-[var(--line-strong)]"
              >
                <Languages size={10} strokeWidth={2.4} />
                {activeLang.label}
                <ChevronDown size={10} strokeWidth={2.4} className="-mr-0.5" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={6}
                className="z-50 w-[180px] p-1 bg-white border border-[var(--line)] rounded-[10px] shadow-[0_18px_42px_rgba(9,9,11,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
              >
                <p className="px-2 pt-1 pb-1 text-[9.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide">
                  翻译为
                </p>
                <div className="max-h-[280px] overflow-y-auto">
                  {LANGUAGES.map((l) => {
                    const active = l.code === lang
                    return (
                      <Popover.Close key={l.code} asChild>
                        <button
                          type="button"
                          onClick={() => setLang(l.code)}
                          className={cn(
                            "w-full px-2 py-1.5 rounded-[7px] flex items-center gap-2 cursor-pointer text-left transition-colors",
                            active ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[11.5px] font-extrabold text-[var(--text)] truncate">{l.label}</p>
                            <p className="text-[9.5px] text-[var(--muted)] leading-tight truncate">{l.native}</p>
                          </div>
                          {active && <Check size={11} strokeWidth={2.8} className="text-[var(--text)] shrink-0" />}
                        </button>
                      </Popover.Close>
                    )
                  })}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
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
      </div>
      <pre className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] p-3 text-[11.5px] leading-relaxed text-[var(--text)] whitespace-pre-wrap font-sans">
        {displayPrompt}
      </pre>
    </section>
  )
}

// ─── 故事策略全景卡（默认展开 + 可折叠） ───────────────────────────────────

export function NarrativeStrategyCard({ data }: { data: VideoBreakdown }) {
  const [expanded, setExpanded] = useState(true)
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-5 flex items-center gap-2 cursor-pointer hover:bg-[var(--soft-2)] transition-colors text-left"
      >
        <span className="w-7 h-7 rounded-lg bg-[var(--lime-soft)] text-[#5a7821] flex items-center justify-center shrink-0">
          <Sparkles size={13} strokeWidth={2.4} />
        </span>
        <h2 className="text-[14px] font-extrabold text-[var(--text)] flex-1">故事策略全景</h2>
        <span className="text-[11px] text-[var(--muted)] font-bold">
          {expanded ? "收起" : "展开"}
        </span>
        <span className={cn("text-[var(--muted)] transition-transform shrink-0", expanded && "rotate-180")}>
          <ChevronDown size={14} />
        </span>
      </button>
      {expanded && (
        <div className="px-5 pb-5 pt-1 space-y-3.5 border-t border-[var(--line)]">
          <div className="pt-3.5">
            <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">整体策略</p>
            <p className="text-[12.5px] text-[var(--text)] leading-relaxed">{data.narrative_overview.overall_strategy}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoBlock label="目标受众"  value={data.narrative_overview.target_audience} />
            <InfoBlock label="情绪旅程"  value={data.narrative_overview.emotional_journey} />
          </div>

          <div>
            <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">情绪曲线</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {data.narrative_overview.viral_analysis.emotion_curve.map((e, i, arr) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <span className="inline-flex items-center h-6 px-2 rounded-md bg-[var(--soft)] border border-[var(--line)] text-[11px] font-bold text-[var(--text)]">
                    {e}
                  </span>
                  {i < arr.length - 1 && <span className="text-[var(--muted-2)] text-[11px]">→</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <InfoBlock
              label="Hook 机制"
              value={`${data.narrative_overview.viral_analysis.hook_trigger_mechanism} · ${data.narrative_overview.viral_analysis.hook_sentence_pattern}`}
            />
            <InfoBlock
              label="说服路径"
              value={`${data.narrative_overview.viral_analysis.persuasion_type} → ${data.narrative_overview.viral_analysis.conversion_trigger}`}
            />
          </div>

          <div>
            <p className="text-[10.5px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">节奏档位</p>
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <RhythmPill label="Hook" value={data.narrative_overview.viral_analysis.rhythm_profile.hook_pace} />
              <RhythmPill label="Body" value={data.narrative_overview.viral_analysis.rhythm_profile.body_pace} />
              <RhythmPill label="CTA"  value={data.narrative_overview.viral_analysis.rhythm_profile.cta_pace} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── 相似创意推荐卡 ─────────────────────────────────────────────────────────

function SimilarCreativeCard({ creative }: { creative: (typeof SIMILAR_CREATIVES)[number] }) {
  return (
    <article className="group rounded-2xl border border-[var(--line)] bg-white overflow-hidden hover:border-[var(--line-strong)] hover:shadow-[0_8px_24px_rgba(9,9,11,0.08)] transition-all cursor-pointer">
      <div className="relative aspect-[9/12] bg-[var(--soft)] overflow-hidden">
        <img src={creative.thumb} alt={creative.title} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-[var(--lime)] text-[#1a2010] text-[10px] font-extrabold shadow-sm">
          <TrendingUp size={9} strokeWidth={2.6} />
          相似度 {creative.match}%
        </span>
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
            <Play size={14} className="text-[#18181b] translate-x-0.5" fill="#18181b" />
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[12px] font-extrabold text-[var(--text)] leading-snug line-clamp-1">{creative.title}</p>
        <p className="text-[10.5px] text-[var(--muted)] mt-0.5">{creative.meta}</p>
        <p className="text-[11px] text-[var(--text)] leading-relaxed mt-2 line-clamp-2">{creative.reason}</p>
        <p className="mt-2 pt-2 border-t border-dashed border-[var(--line)] text-[10.5px] font-bold text-[var(--green-text)]">
          {creative.stats}
        </p>
      </div>
    </article>
  )
}

// 手绘风下划线 — 与上方 icon 容器同款 lime，给标题加一笔轻松的强调
function HandDrawnUnderline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 10"
      preserveAspectRatio="none"
      className="absolute left-0 right-0 -bottom-0.5 w-full h-2.5 pointer-events-none"
    >
      <path
        d="M 3 5.5 C 25 4.8, 50 6.2, 75 5.3 S 110 4.6, 117 5.6"
        stroke="#c9ff29"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
