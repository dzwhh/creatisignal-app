"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Plus, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Topbar } from "@/components/layout/topbar"
import { NL_EXAMPLES, PLATFORMS, SCENARIOS, type PlatformId } from "@/lib/insights/auto-report-data"
import { PlatformLogo } from "@/components/insights/auto-report/platform-logo"

type FilterValue = PlatformId | "all"

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all",    label: "All" },
  { value: "tiktok", label: "TikTok" },
  { value: "meta",   label: "Meta" },
  { value: "google", label: "Google" },
  { value: "amazon", label: "Amazon" },
  { value: "cross",  label: "Cross-platform" },
]

export default function CustomReportPage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [filter, setFilter] = useState<FilterValue>("all")

  const filtered = useMemo(() => {
    if (filter === "all") return SCENARIOS
    if (filter === "cross") return SCENARIOS.filter((s) => s.platforms.length > 1)
    return SCENARIOS.filter((s) => s.platforms.length === 1 && s.platforms[0] === filter)
  }, [filter])

  function useExample(i: number) {
    setPrompt(NL_EXAMPLES[i])
  }

  function handleGenerate() {
    const text = prompt.trim()
    if (!text) return
    // 启发式：根据文本命中关键词推断 scenario，再跳到预览
    const t = text.toLowerCase()
    let scenarioId = "gmv_max_product_daily"
    if (/疲劳|fatigue/i.test(t)) scenarioId = "gmv_max_creative_fatigue"
    else if (/观看|view rate|hook/i.test(t)) scenarioId = "gmv_max_video_diagnose"
    else if (/creator|达人|spark/i.test(t)) scenarioId = "tiktok_spark_creator"
    else if (/国家|geo|country/i.test(t)) scenarioId = "gmv_max_geo_distribution"
    else if (/标签|tagging|hook|cta/i.test(t)) scenarioId = "tiktok_creative_tagging_roi"
    else if (/对比|跨平台|cross|meta/i.test(t)) scenarioId = "cross_tiktok_meta"
    router.push(`/insights/custom-report/preview?scenario=${scenarioId}&nl=${encodeURIComponent(text)}`)
  }

  function openTemplate(scenarioId: string) {
    router.push(`/insights/custom-report/preview?scenario=${scenarioId}`)
  }

  return (
    <>
      <Topbar title="自定义报表" />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-[24px] font-semibold tracking-tight mb-1.5 text-[var(--text)]">Auto Report</h1>
            <p className="text-[13px] text-[var(--muted)]">用一句话描述你想要的报表，系统将自动完成数据授权、拉取、处理和报表生成。</p>
          </header>

          {/* NL input card */}
          <section className="bg-white border border-[var(--line)] rounded-lg p-5 mb-3">
            <label htmlFor="nl-input" className="text-[13px] font-medium mb-2 block text-[var(--text)]">
              描述你的需求
            </label>
            <textarea
              id="nl-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：帮我生成 TikTok GMV Max 商品 × 素材的疲劳分层报表，按疲劳分倒序，含建议动作"
              className="w-full text-[13px] text-[var(--text)] placeholder:text-[var(--muted-2)] bg-white border border-[var(--line)] rounded-md px-3 py-2 resize-none outline-none focus:border-[var(--line-strong)] transition"
            />
            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
              <div className="flex flex-wrap gap-1.5">
                {NL_EXAMPLES.slice(0, 3).map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => useExample(i)}
                    className="text-[12px] px-2.5 h-7 border border-[var(--line)] rounded-md text-[var(--muted)] hover:bg-[var(--soft-2)] hover:text-[var(--text)] cursor-pointer transition"
                  >
                    {ex.slice(0, 18)}…
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="inline-flex items-center gap-1.5 px-4 h-9 bg-[var(--near-black)] text-white text-[13px] font-medium rounded-md hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                生成报表
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>
          </section>
          <p className="text-[12px] text-[var(--muted)] text-center mb-10">
            输入越具体，配置越精准。或者从下面的场景模板开始
          </p>

          {/* Scenario templates */}
          <section className="mb-10">
            <div className="flex items-end justify-between mb-3">
              <div>
                <h3 className="text-[13px] font-semibold text-[var(--text)]">从场景模板开始</h3>
                <p className="text-[12px] text-[var(--muted)] mt-1">
                  按数据平台快速选择，TikTok GMV Max 维度优先，支持单平台与跨平台联合分析
                </p>
              </div>
              <span className="text-[11px] text-[var(--muted)]">{filtered.length} 个模板</span>
            </div>

            <div className="flex items-center mb-3">
              <div className="flex flex-wrap gap-1.5">
                {FILTER_OPTIONS.map((opt) => {
                  const active = filter === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFilter(opt.value)}
                      className={cn(
                        "h-9 px-3 rounded-md text-[12px] font-medium border transition",
                        active
                          ? "bg-[var(--soft)] text-[var(--text)] border-[var(--near-black)] shadow-[inset_0_0_0_1px_var(--near-black)]"
                          : "bg-white text-[var(--muted)] border-[var(--line)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
                      )}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {filtered.map((s) => {
                const isCross = s.platforms.length > 1
                const firstPlatform = PLATFORMS.find((p) => p.id === s.platforms[0])
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openTemplate(s.id)}
                    className="text-left bg-white border border-[var(--line)] hover:border-[var(--text)]/30 hover:bg-[var(--soft-2)]/40 rounded-lg p-4 transition cursor-pointer flex flex-col min-h-[210px] relative overflow-hidden group"
                  >
                    {/* top accent line on hover */}
                    <span className="absolute top-0 inset-x-0 h-[2px] bg-[var(--near-black)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        {isCross ? (
                          <span className="flex items-center pl-2">
                            {s.platforms.map((pid, i) => (
                              <span
                                key={pid}
                                className="w-[30px] h-[30px] border border-[var(--line)] rounded-[7px] bg-white inline-flex items-center justify-center -ml-2"
                                style={{ boxShadow: "0 0 0 2px white" }}
                              >
                                <PlatformLogo id={pid} size={16} />
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="w-[30px] h-[30px] border border-[var(--line)] rounded-[7px] bg-white inline-flex items-center justify-center">
                            <PlatformLogo id={s.platforms[0]} size={16} />
                          </span>
                        )}
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">
                            {isCross ? "跨平台" : "单平台"}
                          </div>
                          <div className="text-[13px] font-semibold leading-tight text-[var(--text)]">
                            {isCross ? s.platforms.map((p) => PLATFORMS.find((x) => x.id === p)?.short).join(" × ") : firstPlatform?.name}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={14} strokeWidth={1.8} className="text-[var(--muted)]" />
                    </div>
                    <h4 className="font-medium text-[13px] mb-1.5 text-[var(--text)]">{s.name}</h4>
                    <p className="text-[12px] text-[var(--muted)] leading-relaxed">{s.description}</p>
                    <div className="mt-auto pt-4 flex items-center justify-end">
                      <span className="text-[10px] text-[var(--muted)] tabular-nums">
                        {s.fields} 字段 · {s.metrics.length} 指标
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="mt-3 inline-flex items-center gap-1 h-9 px-3 border border-[var(--line)] rounded-md text-[12px] font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer transition"
            >
              <Plus size={12} strokeWidth={2} />
              添加模板
            </button>
          </section>
        </div>
      </main>
    </>
  )
}
