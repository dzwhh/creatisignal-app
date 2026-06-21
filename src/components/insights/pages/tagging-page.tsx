"use client"

import { useMemo, useState } from "react"
import { ArrowRight, BarChart3, Cpu, Layers, Play, Sparkles, Star, Tags } from "lucide-react"
import { SettingsCard } from "@/components/settings/settings-card"
import { MATERIALS } from "@/lib/insights/mock"
import { cn } from "@/lib/utils"

type TagCategory = "hook" | "structure" | "cta" | "selling" | "scene"

const CATEGORY_META: Record<TagCategory, { label: string; color: string; bg: string }> = {
  hook:      { label: "Hooks",         color: "#7c3aed", bg: "#f5f3ff" },
  structure: { label: "内容结构",       color: "#f97316", bg: "#fffbeb" },
  cta:       { label: "CTA",           color: "#dc2626", bg: "#fef2f2" },
  selling:   { label: "Selling Point", color: "#16a34a", bg: "#f0fdf4" },
  scene:     { label: "Scene",         color: "#0ea5e9", bg: "#eff6ff" },
}

const CATEGORY_ORDER: TagCategory[] = ["hook", "structure", "cta", "selling", "scene"]

type Tag = { name: string; assets: number; orders: number; roi: number; ctr: number; trend: number[] }

const TAGS: Record<TagCategory, Tag[]> = {
  hook: [
    { name: "强反差开头",   assets: 86, orders: 1240, roi: 2.4, ctr: 0.058, trend: [3, 4, 5, 4, 6, 7, 8, 9] },
    { name: "痛点提问",     assets: 64, orders:  968, roi: 2.1, ctr: 0.048, trend: [2, 3, 4, 5, 5, 4, 5, 6] },
    { name: "数字震撼",     assets: 52, orders:  742, roi: 1.9, ctr: 0.045, trend: [4, 5, 4, 6, 7, 6, 5, 6] },
    { name: "悬念铺垫",     assets: 41, orders:  564, roi: 1.7, ctr: 0.041, trend: [3, 3, 4, 4, 5, 5, 4, 4] },
    { name: "口播自爆",     assets: 38, orders:  616, roi: 2.2, ctr: 0.050, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
    { name: "第一人称口吻", assets: 29, orders:  398, roi: 1.8, ctr: 0.039, trend: [3, 3, 3, 4, 4, 5, 5, 4] },
    { name: "音效抓耳",     assets: 24, orders:  287, roi: 1.6, ctr: 0.035, trend: [2, 3, 3, 4, 3, 3, 4, 4] },
    { name: "字幕弹幕",     assets: 18, orders:  201, roi: 1.5, ctr: 0.032, trend: [2, 2, 2, 3, 3, 3, 3, 3] },
  ],
  structure: [
    { name: "三段式",        assets: 96, orders: 1452, roi: 2.3, ctr: 0.048, trend: [5, 5, 6, 7, 7, 8, 8, 9] },
    { name: "Before/After",  assets: 73, orders: 1242, roi: 2.6, ctr: 0.053, trend: [5, 6, 7, 7, 8, 8, 9, 10] },
    { name: "口播 + 演示",    assets: 64, orders:  864, roi: 2.1, ctr: 0.045, trend: [4, 4, 5, 5, 6, 6, 7, 7] },
    { name: "纯演示无对白",   assets: 48, orders:  571, roi: 1.9, ctr: 0.041, trend: [3, 4, 4, 5, 5, 5, 6, 6] },
    { name: "测评对比",       assets: 36, orders:  468, roi: 2.0, ctr: 0.043, trend: [4, 4, 5, 5, 5, 6, 6, 6] },
    { name: "UGC 第一人称",   assets: 28, orders:  328, roi: 1.8, ctr: 0.039, trend: [3, 3, 4, 4, 4, 5, 5, 5] },
  ],
  cta: [
    { name: "限时优惠",       assets: 58, orders:  812, roi: 2.2, ctr: 0.047, trend: [3, 4, 5, 5, 6, 6, 7, 7] },
    { name: "下方链接 Shop",  assets: 47, orders:  696, roi: 2.0, ctr: 0.043, trend: [3, 3, 4, 4, 5, 5, 5, 6] },
    { name: "评论区领取",     assets: 34, orders:  482, roi: 1.9, ctr: 0.041, trend: [2, 3, 3, 4, 4, 5, 5, 5] },
    { name: "扫码立即购买",   assets: 28, orders:  386, roi: 1.7, ctr: 0.038, trend: [2, 3, 3, 3, 4, 4, 4, 5] },
    { name: "粉丝专属价",     assets: 22, orders:  297, roi: 1.6, ctr: 0.036, trend: [2, 2, 3, 3, 3, 4, 4, 4] },
    { name: "立即抢购",       assets: 18, orders:  236, roi: 1.5, ctr: 0.033, trend: [2, 2, 2, 3, 3, 3, 3, 4] },
  ],
  selling: [
    { name: "防水耐用",   assets: 81, orders: 1146, roi: 2.3, ctr: 0.049, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
    { name: "持久续航",   assets: 67, orders: 1014, roi: 2.4, ctr: 0.051, trend: [4, 5, 6, 6, 7, 7, 8, 8] },
    { name: "便携设计",   assets: 54, orders:  702, roi: 2.0, ctr: 0.044, trend: [3, 4, 4, 5, 5, 6, 6, 7] },
    { name: "强光照明",   assets: 48, orders:  690, roi: 2.2, ctr: 0.047, trend: [4, 4, 5, 5, 6, 6, 7, 7] },
    { name: "多场景适用", assets: 39, orders:  482, roi: 1.9, ctr: 0.041, trend: [3, 3, 4, 4, 5, 5, 5, 6] },
    { name: "性价比",     assets: 33, orders:  368, roi: 1.7, ctr: 0.038, trend: [3, 3, 3, 4, 4, 4, 5, 5] },
    { name: "易于安装",   assets: 22, orders:  242, roi: 1.6, ctr: 0.036, trend: [2, 3, 3, 3, 4, 4, 4, 4] },
  ],
  scene: [
    { name: "户外通勤",   assets: 72, orders:  984, roi: 2.2, ctr: 0.046, trend: [3, 4, 5, 5, 6, 6, 7, 8] },
    { name: "厨房日常",   assets: 58, orders:  728, roi: 1.9, ctr: 0.043, trend: [4, 4, 5, 5, 6, 6, 6, 7] },
    { name: "车内场景",   assets: 49, orders:  792, roi: 2.5, ctr: 0.052, trend: [5, 5, 6, 6, 7, 7, 8, 9] },
    { name: "户外露营",   assets: 42, orders:  548, roi: 2.1, ctr: 0.045, trend: [3, 4, 4, 5, 5, 5, 6, 6] },
    { name: "夜间使用",   assets: 38, orders:  496, roi: 2.0, ctr: 0.044, trend: [4, 4, 5, 5, 6, 6, 6, 7] },
    { name: "雨天测试",   assets: 27, orders:  328, roi: 1.8, ctr: 0.040, trend: [3, 3, 4, 4, 4, 4, 5, 5] },
    { name: "运动健身",   assets: 21, orders:  254, roi: 1.7, ctr: 0.038, trend: [2, 3, 3, 3, 4, 4, 4, 5] },
  ],
}

type FlatTag = Tag & { category: TagCategory }
type CategoryFilter = TagCategory | "all"

function topMaterialsForTag(tag: FlatTag): typeof MATERIALS {
  const seed = tag.name.charCodeAt(0) + tag.assets
  const offset = seed % Math.max(1, MATERIALS.length - 5)
  return MATERIALS.slice(offset, offset + 5)
}

export function TaggingPage() {
  const [activeCat, setActiveCat] = useState<CategoryFilter>("all")

  const allTags = useMemo<FlatTag[]>(() => {
    return CATEGORY_ORDER.flatMap((cat) =>
      TAGS[cat].map((t) => ({ ...t, category: cat }))
    )
  }, [])

  const visibleTags = useMemo<FlatTag[]>(() => {
    const list = activeCat === "all" ? allTags : allTags.filter((t) => t.category === activeCat)
    return [...list].sort((a, b) => b.assets - a.assets)
  }, [activeCat, allTags])

  const [selectedTagName, setSelectedTagName] = useState<string>(allTags[0].name)
  const selectedTag = useMemo<FlatTag>(() => {
    const found = visibleTags.find((t) => t.name === selectedTagName)
    return found ?? visibleTags[0] ?? allTags[0]
  }, [selectedTagName, visibleTags, allTags])

  const topMaterials = useMemo(() => topMaterialsForTag(selectedTag), [selectedTag])

  const performanceTags = useMemo(() => {
    return [...allTags].sort((a, b) => b.roi - a.roi).slice(0, 10)
  }, [allTags])

  const totalTagged = allTags.reduce((s, t) => s + t.assets, 0)
  const untagged = MATERIALS.slice(0, 8)

  return (
    <div className="px-8 py-6 space-y-5 max-w-[1240px] mx-auto">
      <div className="grid grid-cols-4 gap-3">
        <KPI label="已打标素材" value={totalTagged.toLocaleString()} delta="+128 本周" tone="violet" icon={Tags} />
        <KPI label="标签总数"   value={allTags.length.toString()} delta={`${CATEGORY_ORDER.length} 类目`} tone="blue" icon={Layers} />
        <KPI label="本周新增标签" value="9" delta="+5 vs 上周" tone="green" icon={Sparkles} />
        <KPI label="待标素材"   value={untagged.length.toString()} delta="自动队列中" tone="amber" icon={Cpu} />
      </div>

      <SettingsCard
        icon={Layers}
        title="标签透视"
        description="选择类目浏览全部标签，点击任一标签查看 TOP 5 联动素材。"
        noPad
      >
        <div className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-center gap-1 flex-wrap">
          <CatPill active={activeCat === "all"} onClick={() => setActiveCat("all")} label="ALL" count={allTags.length} />
          {CATEGORY_ORDER.map((c) => {
            const meta = CATEGORY_META[c]
            return (
              <CatPill
                key={c}
                active={activeCat === c}
                onClick={() => setActiveCat(c)}
                label={meta.label}
                count={TAGS[c].length}
                color={meta.color}
              />
            )
          })}
        </div>

        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] divide-x divide-[var(--line)]">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="bg-[var(--soft-2)] text-[var(--muted)] text-[10.5px] font-extrabold uppercase tracking-wide">
                  <th className="text-left whitespace-nowrap px-5 py-2.5 border-b border-[var(--line)]">标签</th>
                  <th className="text-left whitespace-nowrap px-3 py-2.5 border-b border-[var(--line)]">类目</th>
                  <th className="text-right whitespace-nowrap px-3 py-2.5 border-b border-[var(--line)]">素材数</th>
                  <th className="text-right whitespace-nowrap px-3 py-2.5 border-b border-[var(--line)]">Orders</th>
                  <th className="text-right whitespace-nowrap px-5 py-2.5 border-b border-[var(--line)]">ROI</th>
                </tr>
              </thead>
              <tbody>
                {visibleTags.map((t) => {
                  const meta = CATEGORY_META[t.category]
                  const isSelected = t.name === selectedTag.name
                  return (
                    <tr
                      key={`${t.category}_${t.name}`}
                      onClick={() => setSelectedTagName(t.name)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isSelected ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                      )}
                    >
                      <td className="whitespace-nowrap px-5 py-3 border-b border-[var(--line)] font-extrabold text-[var(--text)]">
                        {t.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 border-b border-[var(--line)]">
                        <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold" style={{ backgroundColor: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 border-b border-[var(--line)] text-right tabular-nums">
                        {t.assets}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 border-b border-[var(--line)] text-right tabular-nums font-extrabold text-[var(--text)]">
                        {t.orders.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 border-b border-[var(--line)] text-right tabular-nums font-extrabold text-[#15803d]">
                        {t.roi.toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[var(--soft-2)]">
            <div className="flex items-center gap-2 mb-3">
              <Star size={12} strokeWidth={2.6} className="text-[#facc15]" fill="#facc15" />
              <p className="text-[11.5px] font-extrabold text-[var(--text)]">
                TOP 5 素材 · {selectedTag.name}
              </p>
              <span className="ml-auto text-[10.5px] text-[var(--muted)] font-bold">
                {selectedTag.assets} 条命中
              </span>
            </div>
            <ul className="space-y-2">
              {topMaterials.map((m, i) => (
                <li
                  key={m.fingerprint}
                  className="flex items-center gap-2.5 rounded-xl border border-[var(--line)] bg-white p-2 hover:border-[var(--line-strong)] cursor-pointer transition-colors"
                >
                  <span className="w-5 h-5 rounded-md bg-[var(--soft)] text-[var(--text)] text-[10.5px] font-extrabold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="w-9 h-11 rounded-md overflow-hidden bg-[var(--soft)] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.thumb} alt={m.name} className="w-full h-full object-cover" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-extrabold text-[var(--text)] truncate">{m.name}</p>
                    <p className="text-[10.5px] text-[var(--muted)] mt-0.5 flex items-center gap-1.5 tabular-nums">
                      <span>ROI <span className="text-[#15803d] font-extrabold">{m.metrics.roi.toFixed(2)}</span></span>
                      <span className="text-[var(--muted-2)]">·</span>
                      <span>{m.metrics.orders} orders</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard icon={BarChart3} title="标签性能 TOP 10" description="按平均 ROI 排序，含 7 天 sparkline 趋势。" noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                <th className="text-left px-5 py-2.5">标签</th>
                <th className="text-left px-5 py-2.5">类目</th>
                <th className="text-right px-5 py-2.5">素材数</th>
                <th className="text-right px-5 py-2.5">平均 ROI</th>
                <th className="text-right px-5 py-2.5">平均 CTR</th>
                <th className="text-center px-5 py-2.5">趋势</th>
              </tr>
            </thead>
            <tbody>
              {performanceTags.map((t, i) => {
                const meta = CATEGORY_META[t.category]
                return (
                  <tr key={t.name} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                    <td className="px-5 py-2.5 font-extrabold text-[var(--text)]">{t.name}</td>
                    <td className="px-5 py-2.5">
                      <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold" style={{ backgroundColor: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{t.assets}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-extrabold text-[#15803d]">{t.roi.toFixed(2)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{(t.ctr * 100).toFixed(2)}%</td>
                    <td className="px-5 py-2.5">
                      <Sparkline points={t.trend} color={meta.color} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Cpu}
        title="未打标 backlog"
        description="待 AI 自动打标的素材列表。"
        actions={
          <button
            type="button"
            className="h-8 px-3 rounded-full bg-[#7c3aed] text-white text-[11.5px] font-extrabold cursor-pointer hover:opacity-90 flex items-center gap-1.5"
          >
            <Sparkles size={11} strokeWidth={2.4} />
            AI 自动打标
          </button>
        }
      >
        <div className="overflow-x-auto">
          <div className="flex gap-2.5">
            {untagged.map((m) => (
              <article key={m.fingerprint} className="w-[120px] shrink-0 rounded-xl overflow-hidden border border-[var(--line)] bg-white">
                <div className="aspect-[9/14] bg-[var(--soft)] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.thumb} alt={m.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                    <span className="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow">
                      <Play size={12} className="text-[#18181b] translate-x-0.5" fill="#18181b" />
                    </span>
                  </div>
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center h-5 px-1.5 rounded-md text-[9.5px] font-extrabold bg-[#fff7ed] text-[#9a3412] border border-[#fed7aa]">
                    待标
                  </span>
                </div>
                <div className="p-2">
                  <p className="text-[10.5px] font-extrabold text-[var(--text)] truncate">{m.name}</p>
                  <button
                    type="button"
                    className="mt-1.5 w-full h-6 rounded-md border border-[var(--line)] text-[10px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center justify-center gap-1"
                  >
                    打标 <ArrowRight size={9} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function CatPill({ active, onClick, label, count, color }: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-full text-[12px] font-extrabold cursor-pointer transition-colors flex items-center gap-1.5 border",
        active
          ? "bg-[var(--near-black)] text-white border-[var(--near-black)]"
          : "bg-white text-[var(--muted)] border-[var(--line)] hover:text-[var(--text)] hover:border-[var(--line-strong)]"
      )}
    >
      {color && !active && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />}
      {label}
      <span className={cn("text-[10.5px] font-bold tabular-nums", active ? "opacity-80" : "text-[var(--muted-2)]")}>
        {count}
      </span>
    </button>
  )
}

function KPI({ label, value, delta, tone, icon: Icon }: {
  label: string; value: string; delta: string; tone: "violet" | "blue" | "green" | "amber"; icon: typeof Tags
}) {
  const toneMap: Record<typeof tone, { bg: string; color: string }> = {
    violet: { bg: "#f5f3ff", color: "#7c3aed" },
    blue:   { bg: "#eff6ff", color: "#2563eb" },
    green:  { bg: "#f0fdf4", color: "#16a34a" },
    amber:  { bg: "#fffbeb", color: "#d97706" },
  }
  const meta = toneMap[tone]
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: meta.bg, color: meta.color }}>
        <Icon size={14} strokeWidth={2.4} />
      </span>
      <p className="text-[11px] text-[var(--muted)] font-semibold mt-2">{label}</p>
      <p className="text-[22px] font-extrabold text-[var(--text)] mt-1 leading-none tabular-nums">{value}</p>
      <p className="text-[10.5px] text-[var(--muted-2)] mt-1 font-bold">{delta}</p>
    </div>
  )
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 80
  const h = 22
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = Math.max(max - min, 0.0001)
  const xStep = w / (points.length - 1)
  const d = points.map((p, i) => {
    const x = i * xStep
    const y = (h - 2) * (1 - (p - min) / span) + 1
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(" ")
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[80px] h-[22px] inline-block">
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
