"use client"

import { useMemo, useRef, useState } from "react"
import { Check, ChevronDown, Eye, Languages, Layers, Sparkles, Wand2 } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
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

// ─── 提示词反推卡（与 analysis-detail 同款，含一键复制 + 多语翻译） ─────────

type LangCode = "zh" | "en" | "es" | "pt" | "id" | "tl" | "ja" | "ko" | "vi" | "th"

const LANGUAGES: { code: LangCode; label: string; native: string }[] = [
  { code: "zh", label: "中文",            native: "简体中文" },
  { code: "en", label: "English",          native: "English" },
  { code: "es", label: "Español",          native: "Español" },
  { code: "pt", label: "Português",        native: "Português" },
  { code: "id", label: "Bahasa Indonesia", native: "Indonesia" },
  { code: "tl", label: "Tagalog",          native: "Filipino" },
  { code: "ja", label: "日本語",           native: "Japanese" },
  { code: "ko", label: "한국어",            native: "Korean" },
  { code: "vi", label: "Tiếng Việt",       native: "Vietnamese" },
  { code: "th", label: "ภาษาไทย",          native: "Thai" },
]

// Mock 多语翻译版本（仅 zh / en / es / tl 给出完整文案，其它语言演示用 EN）
const PROMPT_TRANSLATIONS: Partial<Record<LangCode, string>> = {
  en: `Make a 22-second Philippines inclusive-finance short video targeting adults with short-term funding needs who care about repayment pressure and platform compliance.

Shot structure:
- 0–4s: Female host delivers a frontal pain-point question ("Struggling with repayments?") over an overlay of dark-cloud stickers + focus lines.
- 4–9s: Cut to platform UI screenshots, walking through interest rate / credit limit / repayment plan.
- 9–14s: "Focus-line" motion converges onto the brand logo for memorability.
- 14–18s: Legal disclaimer fine print + centered fade-in of license ID.
- 18–22s: CTA "Apply now" + QR code + a closing line of reassurance from the host.

Style & pacing:
- Mid-close shots of the host, warm tones, captions sync to every keyword.
- Pace stages: fast_dense → moderate_escalating → urgent_push.
- Emotion arc: anxiety → relief → trust → urgency.

Selling-point priority: 1) low monthly payment 2) 5-minute funding 3) SEC-licensed compliant.
Don'ts: avoid interest-rate guarantees, avoid competitor comparisons, always keep legal disclaimer.`,
  es: `Crea un video corto de 22 segundos de finanzas inclusivas para Filipinas dirigido a adultos con necesidades de financiamiento a corto plazo, preocupados por la presión de pago y el cumplimiento de la plataforma.

Estructura de tomas:
- 0–4s: Anfitriona presenta una pregunta de dolor frontal ("¿Presión con los pagos?") sobre stickers de nubes + líneas de enfoque.
- 4–9s: Corte a capturas de la UI mostrando tasa / monto / plan de pago.
- 9–14s: Líneas de enfoque convergen al logo de marca.
- 14–18s: Aviso legal en letra pequeña + ID de licencia centrado con fade-in.
- 18–22s: CTA "Solicita ahora" + QR + cierre tranquilizador.

Estilo y ritmo:
- Plano medio-cerrado, tonos cálidos, subtítulos sincronizados.
- Ritmo: fast_dense → moderate_escalating → urgent_push.
- Arco emocional: ansiedad → calma → confianza → urgencia.

Prioridad de beneficios: 1) cuota baja 2) desembolso 5 min 3) licencia SEC.
Evitar: garantizar tasa, comparar competencia, omitir aviso legal.`,
  tl: `Gumawa ng 22-segundo Philippine inclusive-finance short video para sa mga adult na may panandaliang pangangailangan sa pondo at nag-aalala sa repayment at platform compliance.

Shot structure:
- 0–4s: Babaeng host na nagtatanong tungkol sa pain point ("Mahirap ba ang bayaran?") na may dark-cloud stickers + focus lines.
- 4–9s: Lipat sa platform UI screenshots: interes / limit / repayment plan.
- 9–14s: Focus-line motion na nagtatagpo sa brand logo.
- 14–18s: Legal disclaimer fine print + nakacentre na license ID na fade-in.
- 18–22s: CTA "Mag-apply na" + QR + reassuring na pangwakas ng host.

Style & pacing:
- Mid-close shots ng host, mainit na kulay, captions naka-sync.
- Pace: fast_dense → moderate_escalating → urgent_push.
- Emotion arc: pag-aalala → ginhawa → tiwala → urgency.

Selling-point priority: 1) mababang buwanan 2) 5-minuto release 3) SEC-licensed.
Iwasan: mag-promise ng rate, mag-compare ng kakumpitensya, alisin ang legal disclaimer.`,
}

function ReversePromptCard({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false)
  const [lang, setLang] = useState<LangCode>("zh")
  const [langOpen, setLangOpen] = useState(false)

  const activeLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]
  const displayPrompt =
    lang === "zh" ? prompt : PROMPT_TRANSLATIONS[lang] ?? PROMPT_TRANSLATIONS.en ?? prompt

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
