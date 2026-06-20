"use client"

import { Activity, Film, Image as ImageIcon, Layers, Network, ScrollText, TrendingUp, Wand2 } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"

const KPIS = [
  { key: "video",   label: "视频生成", value: 142,  quota: 200,  icon: Film,      color: "#7c3aed" },
  { key: "image",   label: "图片生成", value: 488,  quota: 1000, icon: ImageIcon, color: "#0ea5e9" },
  { key: "api",     label: "API 调用", value: 12480, quota: 20000, icon: Network, color: "#16a34a" },
  { key: "storage", label: "存储用量", value: 48,   quota: 100,  icon: Layers,    color: "#f97316", suffix: " GB" },
]

const TASK_DIST = [
  { name: "Report 报告生成",    count: 86, color: "#7c3aed" },
  { name: "Video 视频生成",     count: 142, color: "#0ea5e9" },
  { name: "Brief 创意 Brief",   count: 64, color: "#16a34a" },
  { name: "Analysis 创意分析",  count: 38, color: "#f97316" },
  { name: "Replicate 爆款推荐", count: 12, color: "#dc2626" },
]

const HISTORY = [
  { month: "2026-06", video: 142, image: 488, api: 12480, credits: 3640 },
  { month: "2026-05", video: 128, image: 401, api: 11220, credits: 3200 },
  { month: "2026-04", video: 96,  image: 351, api: 9810,  credits: 2780 },
  { month: "2026-03", video: 82,  image: 290, api: 8120,  credits: 2350 },
  { month: "2026-02", video: 64,  image: 240, api: 6780,  credits: 1890 },
  { month: "2026-01", video: 48,  image: 198, api: 5640,  credits: 1520 },
]

function mockTrend(): number[] {
  return Array.from({ length: 30 }, (_, i) => {
    return Math.max(0, Math.round(2 + Math.sin(i * 0.5) * 4 + (i * 0.18) + Math.cos(i * 0.7) * 2))
  })
}

export default function UsagePage() {
  const trend = mockTrend()
  const distTotal = TASK_DIST.reduce((s, x) => s + x.count, 0)

  return (
    <>
      <Topbar title="用量" />
      <SettingsShell title="用量" subtitle="本月配额与近 30 天活跃趋势。配额会在每月 1 日重置。">
        {/* KPI 4 卡 */}
        <div className="grid grid-cols-4 gap-3">
          {KPIS.map((k) => {
            const pct = Math.round((k.value / k.quota) * 100)
            return (
              <div key={k.key} className="rounded-2xl border border-[var(--line)] bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: k.color + "15", color: k.color }}>
                    <k.icon size={14} strokeWidth={2.4} />
                  </span>
                  <span className="text-[10.5px] font-extrabold" style={{ color: k.color }}>
                    {pct}%
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)] font-semibold">{k.label}</p>
                <p className="text-[22px] font-extrabold text-[var(--text)] leading-none mt-1">
                  {k.value.toLocaleString()}
                  <span className="text-[11px] text-[var(--muted-2)] font-bold ml-1">/ {k.quota.toLocaleString()}{k.suffix ?? ""}</span>
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-[var(--soft)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: k.color }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* 近 30 天趋势 */}
        <SettingsCard
          icon={TrendingUp}
          title="近 30 天活跃趋势"
          description="按天聚合的任务调用数。"
        >
          <TrendChart points={trend} />
          <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--muted-2)]">
            <span>30 天前</span>
            <span>今天</span>
          </div>
        </SettingsCard>

        {/* 按任务类型分布 */}
        <SettingsCard icon={Wand2} title="按任务类型分布" description="本月共 340 次任务调用。">
          <ul className="space-y-2">
            {TASK_DIST.map((t) => {
              const pct = Math.round((t.count / distTotal) * 100)
              return (
                <li key={t.name} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <p className="text-[12px] font-bold text-[var(--text)] w-[180px] truncate">{t.name}</p>
                  <div className="flex-1 h-2 rounded-full bg-[var(--soft)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                  </div>
                  <span className="text-[11.5px] font-extrabold text-[var(--text)] w-[40px] text-right">{t.count}</span>
                  <span className="text-[10.5px] text-[var(--muted-2)] w-[36px] text-right">{pct}%</span>
                </li>
              )
            })}
          </ul>
        </SettingsCard>

        {/* 历史月份 */}
        <SettingsCard icon={ScrollText} title="历史月份" description="过去 6 个月用量明细。" noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5">月份</th>
                  <th className="text-right px-5 py-2.5">视频生成</th>
                  <th className="text-right px-5 py-2.5">图片生成</th>
                  <th className="text-right px-5 py-2.5">API 调用</th>
                  <th className="text-right px-5 py-2.5">积分消耗</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((h, i) => (
                  <tr key={h.month} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                    <td className="px-5 py-2.5 font-bold text-[var(--text)]">{h.month}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{h.video}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{h.image}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{h.api.toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-extrabold text-[var(--text)]">{h.credits.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>

        {/* 配额提示 */}
        <div className="rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] px-4 py-3 flex items-center gap-3">
          <Activity size={14} className="text-[var(--muted)] shrink-0" />
          <p className="text-[12px] text-[var(--muted)] leading-relaxed flex-1">
            用量接近 70% 时会通过邮件提醒；超出时部分高级模型将自动降级到标准模型，确保任务不中断。
          </p>
          <a href="/settings/billing" className="text-[12px] font-extrabold text-[var(--text)] cursor-pointer hover:underline">
            升级套餐 →
          </a>
        </div>
      </SettingsShell>
    </>
  )
}

// ─── inline trend chart (svg) ────────────────────────────────────────────────

function TrendChart({ points }: { points: number[] }) {
  const w = 880
  const h = 140
  const pad = 12
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = Math.max(max - min, 0.0001)
  const xStep = (w - pad * 2) / (points.length - 1)
  const path = points.map((p, i) => {
    const x = pad + i * xStep
    const y = pad + (h - pad * 2) * (1 - (p - min) / span)
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(" ")
  const area = path + ` L ${(pad + (points.length - 1) * xStep).toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[140px]">
      <defs>
        <linearGradient id="usage-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9ff29" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#c9ff29" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#usage-grad)" />
      <path d={path} fill="none" stroke="#1a2010" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
