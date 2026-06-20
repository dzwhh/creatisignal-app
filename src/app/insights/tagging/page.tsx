"use client"

import { useMemo, useState } from "react"
import { ArrowRight, BarChart3, Cpu, Layers, Play, Sparkles, Tags } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { MATERIALS } from "@/lib/insights/mock"
import { cn } from "@/lib/utils"

type TagCategory = "hook" | "scene" | "selling" | "structure"

const CATEGORY_META: Record<TagCategory, { label: string; color: string; bg: string }> = {
  hook:      { label: "Hook",          color: "#7c3aed", bg: "#f5f3ff" },
  scene:     { label: "Scene",         color: "#0ea5e9", bg: "#eff6ff" },
  selling:   { label: "Selling Point", color: "#16a34a", bg: "#f0fdf4" },
  structure: { label: "Structure",     color: "#f97316", bg: "#fffbeb" },
}

type Tag = { name: string; assets: number; roi: number; ctr: number; trend: number[] }

const TAGS: Record<TagCategory, Tag[]> = {
  hook: [
    { name: "强反差开头",   assets: 86, roi: 2.4, ctr: 0.058, trend: [3, 4, 5, 4, 6, 7, 8, 9] },
    { name: "痛点提问",     assets: 64, roi: 2.1, ctr: 0.048, trend: [2, 3, 4, 5, 5, 4, 5, 6] },
    { name: "数字震撼",     assets: 52, roi: 1.9, ctr: 0.045, trend: [4, 5, 4, 6, 7, 6, 5, 6] },
    { name: "悬念铺垫",     assets: 41, roi: 1.7, ctr: 0.041, trend: [3, 3, 4, 4, 5, 5, 4, 4] },
    { name: "口播自爆",     assets: 38, roi: 2.2, ctr: 0.050, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
    { name: "第一人称口吻", assets: 29, roi: 1.8, ctr: 0.039, trend: [3, 3, 3, 4, 4, 5, 5, 4] },
    { name: "音效抓耳",     assets: 24, roi: 1.6, ctr: 0.035, trend: [2, 3, 3, 4, 3, 3, 4, 4] },
    { name: "字幕弹幕",     assets: 18, roi: 1.5, ctr: 0.032, trend: [2, 2, 2, 3, 3, 3, 3, 3] },
  ],
  scene: [
    { name: "户外通勤",   assets: 72, roi: 2.2, ctr: 0.046, trend: [3, 4, 5, 5, 6, 6, 7, 8] },
    { name: "厨房日常",   assets: 58, roi: 1.9, ctr: 0.043, trend: [4, 4, 5, 5, 6, 6, 6, 7] },
    { name: "车内场景",   assets: 49, roi: 2.5, ctr: 0.052, trend: [5, 5, 6, 6, 7, 7, 8, 9] },
    { name: "户外露营",   assets: 42, roi: 2.1, ctr: 0.045, trend: [3, 4, 4, 5, 5, 5, 6, 6] },
    { name: "夜间使用",   assets: 38, roi: 2.0, ctr: 0.044, trend: [4, 4, 5, 5, 6, 6, 6, 7] },
    { name: "雨天测试",   assets: 27, roi: 1.8, ctr: 0.040, trend: [3, 3, 4, 4, 4, 4, 5, 5] },
    { name: "运动健身",   assets: 21, roi: 1.7, ctr: 0.038, trend: [2, 3, 3, 3, 4, 4, 4, 5] },
  ],
  selling: [
    { name: "防水耐用",   assets: 81, roi: 2.3, ctr: 0.049, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
    { name: "持久续航",   assets: 67, roi: 2.4, ctr: 0.051, trend: [4, 5, 6, 6, 7, 7, 8, 8] },
    { name: "便携设计",   assets: 54, roi: 2.0, ctr: 0.044, trend: [3, 4, 4, 5, 5, 6, 6, 7] },
    { name: "强光照明",   assets: 48, roi: 2.2, ctr: 0.047, trend: [4, 4, 5, 5, 6, 6, 7, 7] },
    { name: "多场景适用", assets: 39, roi: 1.9, ctr: 0.041, trend: [3, 3, 4, 4, 5, 5, 5, 6] },
    { name: "性价比",     assets: 33, roi: 1.7, ctr: 0.038, trend: [3, 3, 3, 4, 4, 4, 5, 5] },
    { name: "易于安装",   assets: 22, roi: 1.6, ctr: 0.036, trend: [2, 3, 3, 3, 4, 4, 4, 4] },
  ],
  structure: [
    { name: "三段式",       assets: 96, roi: 2.3, ctr: 0.048, trend: [5, 5, 6, 7, 7, 8, 8, 9] },
    { name: "Before/After", assets: 73, roi: 2.6, ctr: 0.053, trend: [5, 6, 7, 7, 8, 8, 9, 10] },
    { name: "口播 + 演示",   assets: 64, roi: 2.1, ctr: 0.045, trend: [4, 4, 5, 5, 6, 6, 7, 7] },
    { name: "纯演示无对白",  assets: 48, roi: 1.9, ctr: 0.041, trend: [3, 4, 4, 5, 5, 5, 6, 6] },
    { name: "测评对比",       assets: 36, roi: 2.0, ctr: 0.043, trend: [4, 4, 5, 5, 5, 6, 6, 6] },
    { name: "UGC 第一人称",   assets: 28, roi: 1.8, ctr: 0.039, trend: [3, 3, 4, 4, 4, 5, 5, 5] },
  ],
}

export default function CreativeTaggingPage() {
  const [activeCat, setActiveCat] = useState<TagCategory>("hook")

  const allTags = useMemo(() => {
    return (Object.keys(TAGS) as TagCategory[]).flatMap((cat) =>
      TAGS[cat].map((t) => ({ ...t, category: cat }))
    )
  }, [])

  const performanceTags = useMemo(() => {
    return [...allTags].sort((a, b) => b.roi - a.roi).slice(0, 10)
  }, [allTags])

  const totalTagged = allTags.reduce((s, t) => s + t.assets, 0)
  const untagged = MATERIALS.slice(0, 8)

  return (
    <>
      <Topbar title="Creative Tagging" />
      <SettingsShell title="Creative Tagging" subtitle="AI 自动给素材打标 + 标签性能透视，找到爆款共性。">
        {/* KPI 4 张 */}
        <div className="grid grid-cols-4 gap-3">
          <KPI label="已打标素材" value={totalTagged.toLocaleString()} delta="+128 本周" tone="violet" icon={Tags} />
          <KPI label="标签总数"   value={allTags.length.toString()} delta={`${Object.keys(TAGS).length} 类目`} tone="blue" icon={Layers} />
          <KPI label="本周新增标签" value="9" delta="+5 vs 上周" tone="green" icon={Sparkles} />
          <KPI label="待标素材"   value={untagged.length.toString()} delta="自动队列中" tone="amber" icon={Cpu} />
        </div>

        {/* 标签分类浏览器 */}
        <SettingsCard
          icon={Layers}
          title="标签分类浏览器"
          description="按类目浏览全部标签，点击 chip 查看素材列表。"
          actions={
            <div className="flex items-center gap-1 p-0.5 bg-[var(--soft)] rounded-md border border-[var(--line)]">
              {(Object.keys(CATEGORY_META) as TagCategory[]).map((c) => {
                const meta = CATEGORY_META[c]
                const active = activeCat === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCat(c)}
                    className={cn(
                      "h-7 px-2.5 rounded-[5px] text-[11.5px] font-bold cursor-pointer transition-colors",
                      active ? "bg-white text-[var(--text)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                    )}
                  >
                    {meta.label}
                  </button>
                )
              })}
            </div>
          }
        >
          <div className="flex flex-wrap gap-1.5">
            {TAGS[activeCat].map((t) => {
              const meta = CATEGORY_META[activeCat]
              return (
                <button
                  key={t.name}
                  type="button"
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11.5px] font-bold cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: meta.bg, color: meta.color }}
                >
                  {t.name}
                  <span className="text-[10px] font-extrabold opacity-70">{t.assets}</span>
                </button>
              )
            })}
          </div>
        </SettingsCard>

        {/* 标签性能表 */}
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

        {/* 未打标 backlog */}
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
      </SettingsShell>
    </>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────

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
