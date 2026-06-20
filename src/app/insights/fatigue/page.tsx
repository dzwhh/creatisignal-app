"use client"

import { useState } from "react"
import { AlertTriangle, Battery, BatteryLow, Clock3, Eye, Flame, HeartPulse, Pause, Play, RefreshCw, ScrollText, Settings2, TrendingDown, Users } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { MATERIALS } from "@/lib/insights/mock"
import { cn } from "@/lib/utils"

type FatigueLevel = "healthy" | "aging" | "fatigued" | "declining"

const LEVEL_META: Record<FatigueLevel, { label: string; color: string; bg: string; pct: number }> = {
  healthy:   { label: "健康",   color: "#16a34a", bg: "#dcfce7", pct: 58 },
  aging:     { label: "老化",   color: "#facc15", bg: "#fef9c3", pct: 24 },
  fatigued:  { label: "疲劳",   color: "#f97316", bg: "#fff7ed", pct: 12 },
  declining: { label: "衰退",   color: "#dc2626", bg: "#fee2e2", pct: 6 },
}

type SuggestedAction = "pause" | "rewrite_hook" | "replace_scene" | "rotate_audience"

const ACTION_META: Record<SuggestedAction, { label: string; color: string; bg: string; icon: typeof Pause }> = {
  pause:           { label: "暂停",       color: "#b91c1c", bg: "#fee2e2", icon: Pause },
  rewrite_hook:    { label: "改 Hook",   color: "#a16207", bg: "#fef3c7", icon: Flame },
  replace_scene:   { label: "换场景",     color: "#1d4ed8", bg: "#dbeafe", icon: Eye },
  rotate_audience: { label: "换受众",     color: "#6d28d9", bg: "#ede9fe", icon: Users },
}

type FatigueRow = {
  material: typeof MATERIALS[number]
  days: number
  trend: number[]
  level: FatigueLevel
  action: SuggestedAction
  detail: string
}

const TOP_FATIGUE: FatigueRow[] = MATERIALS.slice(0, 5).map((m, i) => ({
  material: m,
  days: 18 + i * 3,
  trend: [9, 8, 7, 7, 6, 5, 4, 4, 3, 3, 2, 2, 1, 1],
  level: i < 2 ? "declining" : i < 4 ? "fatigued" : "aging",
  action: (["pause", "rewrite_hook", "replace_scene", "rotate_audience", "rewrite_hook"] as SuggestedAction[])[i],
  detail: [
    "CTR 连续 7 天下滑 38%",
    "频次 > 5.2，受众已饱和",
    "ROI 跌破账户均值 60%",
    "互动率连续 5 天下行",
    "前 3 秒留存率下滑 22%",
  ][i],
}))

type Trigger = {
  id: string
  title: string
  desc: string
  hit: number
  icon: typeof TrendingDown
  color: string
  bg: string
}

const TRIGGERS: Trigger[] = [
  { id: "ctr",     title: "CTR 持续下降",   desc: "连续 7 天 CTR 环比下降 ≥ 15%，注意力疲劳。",      hit: 18, icon: TrendingDown, color: "#dc2626", bg: "#fee2e2" },
  { id: "freq",    title: "频次饱和",       desc: "曝光频次 > 5，同一用户重复看到太多次。",          hit: 14, icon: BatteryLow,   color: "#f97316", bg: "#fff7ed" },
  { id: "overlap", title: "受众重叠",       desc: "目标人群与近期素材高度重叠，需轮换受众。",        hit: 9,  icon: Users,        color: "#7c3aed", bg: "#f5f3ff" },
  { id: "season",  title: "季节性失效",     desc: "季节关键词流量下降，场景不再匹配当前热度。",      hit: 6,  icon: Clock3,       color: "#facc15", bg: "#fef9c3" },
]

const REFRESH_QUEUE = MATERIALS.slice(8, 14)

export default function FatiguePage() {
  const [paused, setPaused] = useState<Set<string>>(new Set())

  function togglePause(fp: string) {
    setPaused((prev) => {
      const next = new Set(prev)
      if (next.has(fp)) next.delete(fp); else next.add(fp)
      return next
    })
  }

  return (
    <>
      <Topbar title="疲劳度监测" />
      <SettingsShell title="疲劳度监测" subtitle="监测素材生命周期，及时识别疲劳并给出动作建议。">
        {/* 总览 3 KPI */}
        <div className="grid grid-cols-3 gap-3">
          <KPI label="疲劳素材" value="22" sub={`${(22 / 200 * 100).toFixed(1)}% 占比`} icon={BatteryLow} color="#f97316" bg="#fff7ed" />
          <KPI label="即将进入疲劳" value="48" sub="未来 7 天预测" icon={AlertTriangle} color="#facc15" bg="#fef9c3" />
          <KPI label="健康素材占比" value="58%" sub="账户均值 51%" icon={HeartPulse} color="#16a34a" bg="#dcfce7" />
        </div>

        {/* 疲劳分布柱状 */}
        <SettingsCard icon={Battery} title="生命周期分布" description="本账户共 200 条投放中素材的疲劳分级。">
          <div className="space-y-2">
            <div className="h-4 rounded-full overflow-hidden flex border border-[var(--line)]">
              {(Object.keys(LEVEL_META) as FatigueLevel[]).map((l) => {
                const meta = LEVEL_META[l]
                return (
                  <div
                    key={l}
                    className="h-full transition-all duration-200"
                    style={{ width: `${meta.pct}%`, backgroundColor: meta.color }}
                    title={`${meta.label} ${meta.pct}%`}
                  />
                )
              })}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {(Object.keys(LEVEL_META) as FatigueLevel[]).map((l) => {
                const meta = LEVEL_META[l]
                return (
                  <div key={l} className="rounded-lg border border-[var(--line)] bg-white p-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-[11px] font-extrabold text-[var(--text)]">{meta.label}</span>
                    </div>
                    <p className="text-[18px] font-extrabold text-[var(--text)] leading-none tabular-nums">
                      {Math.round((meta.pct / 100) * 200)}
                      <span className="text-[10px] text-[var(--muted-2)] font-bold ml-1">/ 200</span>
                    </p>
                    <p className="text-[10px] text-[var(--muted)] mt-1 font-bold">{meta.pct}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        </SettingsCard>

        {/* TOP 5 疲劳 */}
        <SettingsCard
          icon={Flame}
          title="疲劳 TOP 5 素材"
          description="按下行幅度排序，给出建议动作。"
        >
          <ul className="divide-y divide-[var(--line)]">
            {TOP_FATIGUE.map((row) => {
              const meta = LEVEL_META[row.level]
              const actionMeta = ACTION_META[row.action]
              const isPaused = paused.has(row.material.fingerprint)
              return (
                <li key={row.material.fingerprint} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                  <div className="relative w-12 h-16 rounded-md overflow-hidden bg-[var(--soft)] shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.material.thumb} alt={row.material.name} className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 inline-flex items-center h-3.5 px-1 rounded text-[8.5px] font-extrabold" style={{ backgroundColor: meta.color, color: "white" }}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-extrabold text-[var(--text)] truncate">{row.material.name}</p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">投放 {row.days} 天 · {row.detail}</p>
                  </div>
                  <DescendingSpark points={row.trend} />
                  <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10.5px] font-extrabold shrink-0" style={{ backgroundColor: actionMeta.bg, color: actionMeta.color }}>
                    <actionMeta.icon size={10} strokeWidth={2.6} />
                    {actionMeta.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePause(row.material.fingerprint)}
                    className={cn(
                      "h-8 px-2.5 rounded-full text-[11px] font-extrabold cursor-pointer transition-colors shrink-0 flex items-center gap-1",
                      isPaused
                        ? "bg-[#dcfce7] text-[#15803d]"
                        : "bg-[#18181b] text-white hover:opacity-90"
                    )}
                  >
                    {isPaused ? <><RefreshCw size={10} strokeWidth={2.6} /> 已应用</> : <>应用动作</>}
                  </button>
                </li>
              )
            })}
          </ul>
        </SettingsCard>

        {/* 疲劳触发器分类 */}
        <SettingsCard icon={Settings2} title="疲劳触发器" description="系统在哪些维度感知到疲劳。">
          <div className="grid grid-cols-2 gap-3">
            {TRIGGERS.map((t) => (
              <article key={t.id} className="rounded-xl border border-[var(--line)] bg-white p-3 flex gap-3">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: t.bg, color: t.color }}>
                  <t.icon size={14} strokeWidth={2.4} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-[12.5px] font-extrabold text-[var(--text)]">{t.title}</p>
                    <span className="text-[11px] font-extrabold text-[var(--muted)] tabular-nums shrink-0">命中 {t.hit}</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">{t.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </SettingsCard>

        {/* 刷新队列 */}
        <SettingsCard icon={ScrollText} title="待刷新队列" description="建议优先生成替代素材的列表。" noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5">素材</th>
                  <th className="text-left px-5 py-2.5">触发器</th>
                  <th className="text-right px-5 py-2.5">建议时间</th>
                  <th className="text-right px-5 py-2.5">操作</th>
                </tr>
              </thead>
              <tbody>
                {REFRESH_QUEUE.map((m, i) => (
                  <tr key={m.fingerprint} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-10 rounded overflow-hidden bg-[var(--soft)] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.thumb} alt={m.name} className="w-full h-full object-cover" />
                        </span>
                        <span className="font-extrabold text-[var(--text)]">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-[var(--muted)]">{TRIGGERS[i % TRIGGERS.length].title}</td>
                    <td className="px-5 py-2.5 text-right text-[var(--muted)]">未来 {1 + i} 天</td>
                    <td className="px-5 py-2.5 text-right">
                      <button
                        type="button"
                        className="h-7 px-2.5 rounded-md border border-[var(--line)] text-[11px] font-bold text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer inline-flex items-center gap-1"
                      >
                        <Play size={10} strokeWidth={2.6} />
                        生成替代
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </SettingsShell>
    </>
  )
}

function KPI({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string; sub: string; icon: typeof Battery; color: string; bg: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
      <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg, color }}>
        <Icon size={14} strokeWidth={2.4} />
      </span>
      <p className="text-[11px] text-[var(--muted)] font-semibold mt-2">{label}</p>
      <p className="text-[22px] font-extrabold text-[var(--text)] mt-1 leading-none tabular-nums">{value}</p>
      <p className="text-[10.5px] text-[var(--muted-2)] mt-1 font-bold">{sub}</p>
    </div>
  )
}

function DescendingSpark({ points }: { points: number[] }) {
  const w = 100
  const h = 32
  const pad = 2
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = Math.max(max - min, 0.0001)
  const xStep = (w - pad * 2) / (points.length - 1)
  const d = points.map((p, i) => {
    const x = pad + i * xStep
    const y = pad + (h - pad * 2) * (1 - (p - min) / span)
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(" ")
  const area = d + ` L ${(pad + (points.length - 1) * xStep).toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[100px] h-[32px] shrink-0">
      <path d={area} fill="#fecaca" fillOpacity={0.55} />
      <path d={d} fill="none" stroke="#dc2626" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
