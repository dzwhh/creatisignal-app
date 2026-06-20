"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Clock3, Copy, Download, Edit3, Eye, FileText, ListChecks, ScrollText, Share2, Sparkles, Timer } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { Toggle } from "@/components/settings/toggle"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { cn } from "@/lib/utils"

type ReportType = "weekly" | "monthly" | "campaign" | "ad_hoc"
const TYPE_META: Record<ReportType, { label: string; bg: string; color: string }> = {
  weekly:   { label: "周报", bg: "#dbeafe", color: "#1d4ed8" },
  monthly:  { label: "月报", bg: "#ede9fe", color: "#6d28d9" },
  campaign: { label: "Campaign", bg: "#dcfce7", color: "#15803d" },
  ad_hoc:   { label: "临时", bg: "#fff7ed", color: "#9a3412" },
}

type ReportStatus = "draft" | "ready" | "shared"
const STATUS_META: Record<ReportStatus, { label: string; bg: string; color: string }> = {
  draft:  { label: "草稿",   bg: "#f4f4f5", color: "#71717a" },
  ready:  { label: "已就绪", bg: "#dcfce7", color: "#15803d" },
  shared: { label: "已共享", bg: "#dbeafe", color: "#1d4ed8" },
}

type Report = {
  id: string
  name: string
  type: ReportType
  range: string
  createdAt: string
  status: ReportStatus
}

const REPORTS: Report[] = [
  { id: "rp_008", name: "06-09 ~ 06-15 US 户外投放周报",   type: "weekly",   range: "06-09 ~ 06-15", createdAt: "2026-06-16 09:00", status: "shared" },
  { id: "rp_007", name: "2026 Q2 GMV Max 月度复盘",        type: "monthly",  range: "2026 Q2",       createdAt: "2026-06-15 11:24", status: "ready"  },
  { id: "rp_006", name: "夏季健身品类 campaign 复盘",      type: "campaign", range: "05-01 ~ 06-10", createdAt: "2026-06-12 17:48", status: "ready"  },
  { id: "rp_005", name: "06-02 ~ 06-08 UK 美妆投放周报",   type: "weekly",   range: "06-02 ~ 06-08", createdAt: "2026-06-09 09:00", status: "shared" },
  { id: "rp_004", name: "AB 测试：hook 改写效果分析",      type: "ad_hoc",   range: "05-22 ~ 06-05", createdAt: "2026-06-06 14:11", status: "ready"  },
  { id: "rp_003", name: "05-26 ~ 06-01 US 周报",           type: "weekly",   range: "05-26 ~ 06-01", createdAt: "2026-06-02 09:00", status: "shared" },
  { id: "rp_002", name: "EDC 类目素材聚类分析",            type: "ad_hoc",   range: "近 30 天",      createdAt: "2026-05-28 16:30", status: "draft"  },
  { id: "rp_001", name: "2026 Q1 全平台月报",              type: "monthly",  range: "2026 Q1",       createdAt: "2026-05-15 11:00", status: "shared" },
]

type ScheduledReport = {
  id: string
  title: string
  schedule: string
  template: string
  enabled: boolean
}

const INITIAL_SCHEDULED: ScheduledReport[] = [
  { id: "sch_1", title: "周一 09:00 投放周报",     schedule: "每周一 09:00",      template: "Weekly Performance", enabled: true  },
  { id: "sch_2", title: "每月 1 日 月度复盘",      schedule: "每月 1 日 09:30",   template: "Monthly Recap",      enabled: true  },
  { id: "sch_3", title: "实时红线警报（ROI < 1.2）", schedule: "ROI 触发 / 实时",   template: "Red Line Alert",     enabled: false },
]

const TEMPLATES = [
  "Weekly Performance",
  "Monthly Recap",
  "Campaign Wrap-up",
  "AB Test Analysis",
  "Audience Drilldown",
  "Custom (空白)",
]

const SCOPES = ["全部账户", "US", "UK", "DE", "JP", "SG"]

export default function ReportsBoardPage() {
  const [scheduled, setScheduled] = useState(INITIAL_SCHEDULED)
  const [tpl, setTpl] = useState(TEMPLATES[0])
  const [tplOpen, setTplOpen] = useState(false)
  const [range, setRange] = useState("近 7 天")
  const [scopeSet, setScopeSet] = useState<Set<string>>(new Set(["US"]))

  function toggleSchedule(id: string) {
    setScheduled((prev) => prev.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x))
  }

  function toggleScope(s: string) {
    setScopeSet((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s); else next.add(s)
      return next
    })
  }

  return (
    <>
      <Topbar title="创意报表" />
      <SettingsShell title="创意报表" subtitle="把投放数据变成可分享的报告 — 周报、月报、Campaign 复盘、定时推送。">
        {/* 4 KPI */}
        <div className="grid grid-cols-4 gap-3">
          <KPI label="已生成报表" value="48"     sub="累计" icon={FileText}  color="#7c3aed" bg="#f5f3ff" />
          <KPI label="本周新增"   value="6"      sub="+3 vs 上周" icon={Sparkles} color="#16a34a" bg="#f0fdf4" />
          <KPI label="共享次数"   value="124"    sub="本月" icon={Share2}   color="#0ea5e9" bg="#eff6ff" />
          <KPI label="平均生成耗时" value="12.4s" sub="P95 18s" icon={Timer}    color="#f97316" bg="#fff7ed" />
        </div>

        {/* 报表库 */}
        <SettingsCard
          icon={ScrollText}
          title="报表库"
          description="最近 8 份报表。点击操作复用 / 下载。"
          noPad
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5">报表名</th>
                  <th className="text-left px-5 py-2.5">类型</th>
                  <th className="text-left px-5 py-2.5">范围</th>
                  <th className="text-left px-5 py-2.5">创建时间</th>
                  <th className="text-center px-5 py-2.5">状态</th>
                  <th className="text-right px-5 py-2.5">操作</th>
                </tr>
              </thead>
              <tbody>
                {REPORTS.map((r, i) => {
                  const tMeta = TYPE_META[r.type]
                  const sMeta = STATUS_META[r.status]
                  return (
                    <tr key={r.id} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                      <td className="px-5 py-2.5 font-extrabold text-[var(--text)]">{r.name}</td>
                      <td className="px-5 py-2.5">
                        <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold" style={{ backgroundColor: tMeta.bg, color: tMeta.color }}>
                          {tMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-[var(--muted)]">{r.range}</td>
                      <td className="px-5 py-2.5 text-[var(--muted)] font-mono text-[11.5px]">{r.createdAt}</td>
                      <td className="px-5 py-2.5 text-center">
                        <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold" style={{ backgroundColor: sMeta.bg, color: sMeta.color }}>
                          {sMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <IconBtn icon={Eye}      label="查看" />
                          <IconBtn icon={Copy}     label="复用" />
                          <IconBtn icon={Download} label="下载" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SettingsCard>

        {/* 定时报表 */}
        <SettingsCard icon={Clock3} title="定时报表" description="按计划自动生成，结果发到邮箱 + 站内。">
          <ul className="divide-y divide-[var(--line)]">
            {scheduled.map((s) => (
              <li key={s.id} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                <span className="w-9 h-9 rounded-lg bg-[var(--soft)] text-[var(--text)] flex items-center justify-center shrink-0">
                  <Clock3 size={14} strokeWidth={2.4} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-extrabold text-[var(--text)]">{s.title}</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    {s.schedule} · 模板 <span className="font-bold text-[var(--text)]">{s.template}</span>
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="编辑"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
                >
                  <Edit3 size={12} strokeWidth={2.4} />
                </button>
                <Toggle checked={s.enabled} onChange={() => toggleSchedule(s.id)} ariaLabel={s.title} />
              </li>
            ))}
          </ul>
        </SettingsCard>

        {/* 生成新报表 */}
        <SettingsCard icon={Sparkles} title="生成新报表" description="选择模板、范围与数据范围，AI 自动出稿。">
          <div className="space-y-4">
            {/* 模板 + 日期 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11.5px] font-bold text-[var(--text)] mb-1">模板</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTplOpen((v) => !v)}
                    className="w-full h-10 px-3 rounded-lg border border-[var(--line)] bg-white text-[12.5px] font-bold text-[var(--text)] flex items-center justify-between cursor-pointer hover:border-[var(--line-strong)]"
                  >
                    <span className="flex items-center gap-2"><FileText size={12} className="text-[var(--muted)]" />{tpl}</span>
                    <ChevronDown size={12} className="text-[var(--muted)]" />
                  </button>
                  {tplOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-[var(--line)] bg-white shadow-[0_18px_42px_rgba(9,9,11,0.14)] p-1 z-20">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => { setTpl(t); setTplOpen(false) }}
                          className={cn(
                            "w-full h-9 px-2.5 rounded-md text-left text-[12px] font-bold cursor-pointer transition-colors",
                            tpl === t ? "bg-[var(--soft)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)]"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[11.5px] font-bold text-[var(--text)] mb-1">日期范围</p>
                <button
                  type="button"
                  onClick={() => setRange((p) => p === "近 7 天" ? "近 30 天" : "近 7 天")}
                  className="w-full h-10 px-3 rounded-lg border border-[var(--line)] bg-white text-[12.5px] font-bold text-[var(--text)] flex items-center justify-between cursor-pointer hover:border-[var(--line-strong)]"
                >
                  <span className="flex items-center gap-2"><Calendar size={12} className="text-[var(--muted)]" />{range}</span>
                  <ChevronDown size={12} className="text-[var(--muted)]" />
                </button>
              </div>
            </div>

            {/* 范围 chip 多选 */}
            <div>
              <p className="text-[11.5px] font-bold text-[var(--text)] mb-2 flex items-center gap-1.5">
                <ListChecks size={11} className="text-[var(--muted)]" />
                数据范围（多选）
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SCOPES.map((s) => {
                  const active = scopeSet.has(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleScope(s)}
                      className={cn(
                        "h-7 px-2.5 rounded-md text-[11.5px] font-bold cursor-pointer border transition-colors",
                        active
                          ? "bg-[var(--text)] text-white border-[var(--text)]"
                          : "bg-white text-[var(--muted)] border-[var(--line)] hover:border-[var(--line-strong)]"
                      )}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-dashed border-[var(--line)]">
              <p className="text-[11px] text-[var(--muted)]">预计生成耗时 12.4s，结果会自动入库到上方报表库。</p>
              <RainbowButton
                type="button"
                disabled={scopeSet.size === 0}
                className="h-10 px-4 rounded-xl text-[12.5px]"
              >
                生成报表
                <Sparkles size={12} strokeWidth={2.4} className="ml-1.5" />
              </RainbowButton>
            </div>
          </div>
        </SettingsCard>
      </SettingsShell>
    </>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function KPI({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string; sub: string; icon: typeof FileText; color: string; bg: string
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

function IconBtn({ icon: Icon, label }: { icon: typeof Eye; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
    >
      <Icon size={12} strokeWidth={2.4} />
    </button>
  )
}
