"use client"

import { useMemo, useState } from "react"
import {
  Copy,
  Download,
  Send,
  Check,
  Sparkles,
  Target,
  AlertTriangle,
  Wand2,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCOUNTS, BRAND_KPI, BRIEF_SEEDS, DIAGNOSTIC_ISSUES, MATERIALS, SCENE_MATRIX } from "@/lib/insights/mock"
import { type DateRange } from "@/lib/insights/types"
import { ActionBadge, MaterialThumb, MoneyShort } from "../shared"
import { BriefDrawer, type BriefSeedTrigger } from "../brief-drawer"

export function ReportPage({ accountIds, dateRange }: { accountIds: string[]; dateRange: DateRange }) {
  const [copied, setCopied] = useState(false)
  const [briefSeed, setBriefSeed] = useState<BriefSeedTrigger>(null)

  const filteredAccounts = useMemo(() => {
    const set = new Set(accountIds)
    return ACCOUNTS.filter((a) => set.has(a.id))
  }, [accountIds])

  const tightAccounts = filteredAccounts.filter((a) => a.suggestedTargetRoi !== undefined && a.roiTarget > (a.suggestedTargetRoi + 0.5))
  const topMaterials = [...MATERIALS].sort((a, b) => b.metrics.roi * b.metrics.spend - a.metrics.roi * a.metrics.spend).slice(0, 5)
  const opportunities = SCENE_MATRIX.filter((c) => c.materialCount === 0).slice(0, 6)

  function copyCustomerSummary() {
    const text = `Hotligh 投放复盘（${dateRange}）

KPI: 日均订单 ${BRAND_KPI.dailyOrders}（目标 ${BRAND_KPI.dailyOrdersTarget}+），ROI ${BRAND_KPI.roi}（目标 ${BRAND_KPI.roiTarget}+），CPO $${BRAND_KPI.cpo}（目标 $${BRAND_KPI.cpoTargetLow}-$${BRAND_KPI.cpoTargetHigh}）。

诊断结论：${BRAND_KPI.conclusion}

下一轮素材方向：
${BRIEF_SEEDS.map((s, i) => `${i + 1}. ${s.title} × ${s.count} 条`).join("\n")}`
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-8 py-6 max-w-[920px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-[20px] font-extrabold text-[var(--text)] tracking-tight">洞察报告</h2>
          <p className="text-[12.5px] text-[var(--muted)] mt-1">
            {BRAND_KPI.brand} · {BRAND_KPI.channel} · {dateRange === "7d" ? "近 7 天" : dateRange === "14d" ? "近 14 天" : "近 30 天"} · {filteredAccounts.length} 账户
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyCustomerSummary}
            className={cn(
              "h-9 px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 cursor-pointer transition-all",
              copied ? "bg-[#16a34a] text-white" : "border border-[var(--line)] bg-white text-[var(--text)] hover:bg-[var(--soft-2)]"
            )}
          >
            {copied ? <><Check size={14} strokeWidth={2.5} /> 已复制</> : <><Copy size={13} strokeWidth={2.2} /> 复制客户摘要</>}
          </button>
          <button
            type="button"
            className="h-9 px-4 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)]"
          >
            <Download size={13} strokeWidth={2.2} />
            导出 PDF
          </button>
          <button
            type="button"
            onClick={() => setBriefSeed({})}
            className="h-9 px-4 rounded-full bg-[#18181b] text-white text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90"
          >
            <Send size={13} strokeWidth={2.2} />
            发送到视频创作
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <ReportSection number={1} title="当前目标差距" icon={Target}>
          <div className="grid grid-cols-3 gap-3">
            <Gap label="日均订单" current={BRAND_KPI.dailyOrders.toString()} target={`${BRAND_KPI.dailyOrdersTarget}+`} note="需约 3.8 倍放量" tone={BRAND_KPI.dailyOrders >= BRAND_KPI.dailyOrdersTarget ? "ok" : "bad"} />
            <Gap label="ROI" current={BRAND_KPI.roi.toFixed(2)} target={`${BRAND_KPI.roiTarget}+`} note="先提升到 2.0 再拉高" tone={BRAND_KPI.roi >= BRAND_KPI.roiTarget ? "ok" : "warn"} />
            <Gap label="CPO" current={`$${BRAND_KPI.cpo.toFixed(2)}`} target={`$${BRAND_KPI.cpoTargetLow}-$${BRAND_KPI.cpoTargetHigh}`} note="需下降约 20%" tone={BRAND_KPI.cpo <= BRAND_KPI.cpoTargetHigh ? "ok" : "warn"} />
          </div>
        </ReportSection>

        <ReportSection number={2} title="素材表现总结" icon={Sparkles}>
          <p className="text-[12.5px] text-[var(--muted)] leading-relaxed mb-3">
            综合 {MATERIALS.length} 条素材在 {filteredAccounts.length} 个账户上的表现，Top 5 素材贡献了主要 ROI。
          </p>
          <div className="space-y-1.5">
            {topMaterials.map((m, i) => (
              <div key={m.fingerprint} className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-[var(--soft-2)]">
                <span className="text-[12px] font-mono text-[var(--muted)] w-5">{i + 1}.</span>
                <MaterialThumb material={m} size={32} showPlay={false} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-[var(--text)] truncate">{m.name}</p>
                  <p className="text-[10.5px] text-[var(--muted)] font-mono">
                    ROI {m.metrics.roi.toFixed(2)} · 花费 <MoneyShort value={m.metrics.spend} /> · ▣ {m.accountCount}
                  </p>
                </div>
                <ActionBadge action={m.recommendation} />
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection number={3} title="高 CPO 原因" icon={AlertTriangle}>
          <div className="space-y-2.5">
            {DIAGNOSTIC_ISSUES.map((iss) => (
              <div key={iss.id} className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-3">
                <p className="text-[13px] font-extrabold text-[#9a3412]">{iss.title}</p>
                <p className="text-[12px] text-[var(--text)] mt-1 leading-relaxed">{iss.detail}</p>
                {iss.affectedAccountIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {iss.affectedAccountIds.slice(0, 6).map((id) => {
                      const acc = ACCOUNTS.find((a) => a.id === id)
                      if (!acc) return null
                      return (
                        <span key={id} className="h-5 px-1.5 rounded text-[10.5px] font-semibold bg-white border border-[var(--line)] text-[var(--text)]">
                          {acc.name}
                        </span>
                      )
                    })}
                    {iss.affectedAccountIds.length > 6 && <span className="text-[10.5px] text-[var(--muted)] self-center">还有 {iss.affectedAccountIds.length - 6} 个</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection number={4} title="高潜力场景和卖点" icon={TrendingUp}>
          {opportunities.length > 0 ? (
            <div>
              <p className="text-[12.5px] text-[var(--muted)] leading-relaxed mb-3">
                以下场景 × 卖点组合当前尚无素材覆盖，建议优先填充：
              </p>
              <div className="grid grid-cols-2 gap-2">
                {opportunities.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBriefSeed({ scene: c.scene, sellingPoint: c.sellingPoint })}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] hover:border-[var(--muted)] hover:bg-white cursor-pointer text-left transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-[var(--text)] truncate">{c.scene} × {c.sellingPoint}</p>
                      <p className="text-[10.5px] text-[var(--muted)]">创意机会 · 暂无素材</p>
                    </div>
                    <ChevronRight size={13} className="text-[var(--muted)] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[12.5px] text-[var(--muted)]">主要场景 × 卖点组合已覆盖。</p>
          )}
        </ReportSection>

        <ReportSection number={5} title="下一轮素材生成方向" icon={Wand2}>
          <div className="space-y-2">
            {BRIEF_SEEDS.map((s, i) => (
              <div key={i} className="rounded-lg border border-[var(--line)] bg-white p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-extrabold text-[var(--text)]">{s.title}</p>
                    <p className="text-[11.5px] text-[var(--muted)] mt-0.5">{s.product} · {s.scene}</p>
                  </div>
                  <span className="h-6 px-2 rounded-full bg-[#dff9e7] text-[#16a34a] text-[11px] font-bold shrink-0">
                    × {s.count}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text)] leading-relaxed">{s.proposition}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[11px] text-[var(--muted)] font-mono italic">&ldquo;{s.hook}&rdquo;</p>
                  <button
                    type="button"
                    onClick={() => setBriefSeed({ scene: s.scene })}
                    className="h-7 px-2.5 rounded-full bg-[var(--soft)] text-[var(--text)] text-[11.5px] font-bold cursor-pointer hover:bg-[var(--line)] flex items-center gap-1"
                  >
                    生成 Brief
                    <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection number={6} title="GMV Max 投放建议" icon={Target}>
          <div className="space-y-2 text-[12.5px] text-[var(--text)] leading-relaxed">
            <p>• 将以下 {tightAccounts.length} 个账户的 ROI target 下调到 <strong>2.0</strong> 学习，连续 3 天观察后再回升：</p>
            {tightAccounts.length > 0 && (
              <div className="flex flex-wrap gap-1 ml-3">
                {tightAccounts.slice(0, 10).map((a) => (
                  <span key={a.id} className="h-5 px-1.5 rounded text-[10.5px] font-semibold bg-[#fff7ed] text-[#9a3412]">
                    {a.name}
                  </span>
                ))}
                {tightAccounts.length > 10 && <span className="text-[10.5px] text-[var(--muted)] self-center">还有 {tightAccounts.length - 10} 个</span>}
              </div>
            )}
            <p>• 把 ROI ≥ 2.0 的 Top 5 素材复制到 US Main / US Scale 账户池，预算上调 +15-20%。</p>
            <p>• 暂停 ROI &lt; 0.8 的素材在所有账户上的投放，集中预算到学习中的高潜力素材。</p>
          </div>
        </ReportSection>

        <ReportSection number={7} title="3 天实验计划" icon={Sparkles}>
          <div className="space-y-1.5 text-[12.5px] text-[var(--text)]">
            <p>• <strong>Day 1</strong>：批量发送上面 4 类 Brief 到视频创作，预计产出 34 条新素材，分配到 5 个测试账户。</p>
            <p>• <strong>Day 2</strong>：观察 CTR / CVR / CPO 表现，剔除 CTR &lt; 1.2% 的素材。</p>
            <p>• <strong>Day 3</strong>：保留 ROI ≥ 1.5 的素材，复制到 Main 池放量；Brief 表现差的场景反向调整下一轮方向。</p>
          </div>
        </ReportSection>
      </div>

      <BriefDrawer seed={briefSeed} onClose={() => setBriefSeed(null)} />
    </div>
  )
}

function ReportSection({
  number,
  title,
  icon: Icon,
  children,
}: {
  number: number
  title: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <h3 className="text-[15px] font-extrabold text-[var(--text)] flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-full bg-[#18181b] text-white text-[11px] font-black flex items-center justify-center">{number}</span>
        <Icon size={14} strokeWidth={2} className="text-[var(--muted)]" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function Gap({ label, current, target, note, tone }: { label: string; current: string; target: string; note: string; tone: "ok" | "warn" | "bad" }) {
  const cls: Record<string, string> = {
    ok:   "border-[#dff9e7] bg-[#f0fdf4]",
    warn: "border-[#fde68a] bg-[#fffbea]",
    bad:  "border-[#fee2e2] bg-[#fef2f2]",
  }
  const textCls: Record<string, string> = {
    ok:   "text-[#16a34a]",
    warn: "text-[#a16207]",
    bad:  "text-[#dc2626]",
  }
  return (
    <div className={cn("rounded-xl border p-3", cls[tone])}>
      <p className="text-[11.5px] font-semibold text-[var(--muted)]">{label}</p>
      <div className="flex items-baseline gap-2 mt-1 mb-1">
        <p className={cn("text-[20px] font-extrabold", textCls[tone])}>{current}</p>
        <p className="text-[11.5px] text-[var(--muted)]">/ {target}</p>
      </div>
      <p className="text-[11px] text-[var(--text)]">{note}</p>
    </div>
  )
}
