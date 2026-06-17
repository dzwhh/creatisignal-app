"use client"

import { AlertTriangle, Ban, BarChart3, CheckCircle2, Clock3, Info, TrendingDown, Users } from "lucide-react"
import { HOT_VERDICT_META, LIFECYCLE_META, MATERIAL_SOURCE_META, type HotItemVerdict, type HotVerdictDataSupport } from "@/lib/insights/types"

interface Props {
  verdict: HotItemVerdict
}

export function VerdictStep({ verdict }: Props) {
  const meta = HOT_VERDICT_META[verdict.verdict]
  const srcMeta = MATERIAL_SOURCE_META[verdict.source]
  const lcMeta = LIFECYCLE_META[verdict.lifecyclePhase]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[19px] font-extrabold text-[var(--text)] mb-1">这条素材是否值得复刻？</h2>
        <p className="text-[12.5px] text-[var(--muted)]">系统按「{srcMeta.label}」判定模型给出 3 层结论</p>
      </div>

      {/* 3 层结论卡 */}
      <section
        className="rounded-2xl border p-5"
        style={{ backgroundColor: meta.bg, borderColor: meta.border }}
      >
        <div className="flex items-start gap-3">
          <span
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold text-[18px]"
            style={{ backgroundColor: meta.dot }}
          >
            {meta.short}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-[18px] font-extrabold" style={{ color: meta.dot }}>
                {meta.label}
              </h3>
              <span className="inline-flex items-center h-5 px-2 rounded-md text-[10.5px] font-extrabold bg-white/85" style={{ color: meta.dot }}>
                爆款类型：{verdict.category}
              </span>
              <span
                className="inline-flex items-center gap-1 h-5 px-2 rounded-md text-[10.5px] font-extrabold border"
                style={{ backgroundColor: lcMeta.dot + "15", borderColor: lcMeta.dot + "55", color: lcMeta.dot }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lcMeta.dot }} />
                {lcMeta.label}
              </span>
              {verdict.lowConfidence && (
                <span className="inline-flex items-center gap-1 h-5 px-2 rounded-md text-[10.5px] font-extrabold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                  <AlertTriangle size={9} />
                  低置信
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-[var(--text)] leading-relaxed">{meta.desc}</p>
          </div>
        </div>

        {/* 推荐原因（最多 3 条） */}
        <div className="mt-4 pt-4 border-t border-dashed" style={{ borderColor: meta.border }}>
          <p className="text-[10.5px] font-extrabold uppercase tracking-wide mb-2" style={{ color: meta.dot }}>
            判断依据
          </p>
          <ul className="space-y-1.5">
            {verdict.reasons.map((r, i) => (
              <li key={i} className="text-[12.5px] text-[var(--text)] flex items-start gap-2">
                <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-extrabold text-white" style={{ backgroundColor: meta.dot }}>
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 数据支撑（4 来源不同） */}
      <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
        <h3 className="text-[13.5px] font-extrabold text-[var(--text)] mb-3 flex items-center gap-1.5">
          <BarChart3 size={14} className="text-[var(--muted)]" />
          数据支撑
        </h3>
        <DataSupportPanel ds={verdict.dataSupport} />
      </section>

      {/* 低置信/数据不足提醒条 */}
      {(verdict.lowConfidence || verdict.verdict === "not_enough_data") && (
        <div className="rounded-xl border border-dashed border-[#fde68a] bg-[#fffbeb] p-3 flex items-start gap-2">
          <Info size={14} className="text-[#a16207] mt-0.5 shrink-0" />
          <p className="text-[11.5px] text-[#9a3412] font-semibold leading-relaxed">
            数据不足提醒：本次结论置信度有限，可继续走拆解 + 生成流程，但建议小预算先测试再放量。
          </p>
        </div>
      )}
    </div>
  )
}

function DataSupportPanel({ ds }: { ds: HotVerdictDataSupport }) {
  if (ds.source === "market_hot") {
    return (
      <div className="grid grid-cols-5 gap-3">
        <MetricBlock label="热度分" value={`${ds.popularityScore}`} sub="/ 100" />
        <MetricBlock label="互动率" value={`${ds.engagementRate.toFixed(1)}%`} sub="同类 +22%" accent="ok" />
        <MetricBlock label="生命周期" value={`${ds.lifecycleDays} 天`} sub="未拐点" />
        <MetricBlock label="品类匹配度" value={`${ds.categoryMatch}`} sub="/ 100" />
        <MetricBlock label="可借鉴性" value={`${ds.reusability}`} sub="/ 100" />
      </div>
    )
  }
  if (ds.source === "competitor_hot") {
    const riskMeta = {
      low:  { label: "低", color: "#16a34a" },
      mid:  { label: "中", color: "#a16207" },
      high: { label: "高", color: "#dc2626" },
    }[ds.differentiationRisk]
    return (
      <div className="grid grid-cols-5 gap-3">
        <MetricBlock label="竞品类目" value={ds.competitorCategory} small />
        <MetricBlock label="相似 SKU" value={`${ds.similarSkus} 个`} />
        <MetricBlock label="投放持续" value={`${ds.runDays} 天`} accent="ok" />
        <MetricBlock label="结构模式" value={ds.structurePattern} small />
        <MetricBlock label="差异化风险" value={riskMeta.label} sub={ds.differentiationRisk} accent={ds.differentiationRisk === "high" ? "bad" : ds.differentiationRisk === "mid" ? "warn" : "ok"} />
      </div>
    )
  }
  if (ds.source === "owned_hot") {
    return (
      <div className="grid grid-cols-5 gap-3">
        <MetricBlock label="日均出单" value={`${ds.dailyOrders}`} sub="GMV Max" accent="ok" />
        <MetricBlock label="ROI" value={ds.roi.toFixed(2)} accent={ds.roi >= 2.4 ? "ok" : "warn"} />
        <MetricBlock label="消耗" value={`$${ds.spend}`} />
        <MetricBlock label="稳定天数" value={`${ds.stableDays} 天`} accent="ok" />
        <MetricBlock label="衰退速度" value={`${(ds.declineRate * 100).toFixed(1)}%/天`} accent={ds.declineRate > 0.08 ? "warn" : "ok"} />
      </div>
    )
  }
  // local_upload
  return (
    <div className="space-y-2">
      <p className="text-[11.5px] text-[var(--muted)]">仅做结构识别，无投放数据 — 置信度 <span className="font-extrabold text-[#dc2626]">低</span></p>
      <div className="flex flex-wrap gap-1.5">
        {ds.structureIdentified.map((s) => (
          <span key={s} className="h-6 px-2 rounded-md bg-[var(--soft)] text-[var(--text)] text-[11px] font-bold">{s}</span>
        ))}
      </div>
    </div>
  )
}

function MetricBlock({ label, value, sub, accent, small }: {
  label: string
  value: string
  sub?: string
  accent?: "ok" | "warn" | "bad"
  small?: boolean
}) {
  const color = accent === "ok" ? "#15803d" : accent === "warn" ? "#a16207" : accent === "bad" ? "#b91c1c" : "var(--text)"
  return (
    <div className="rounded-lg bg-[var(--soft-2)] border border-[var(--line)] px-2.5 py-2">
      <p className="text-[10px] font-bold text-[var(--muted-2)] uppercase tracking-wide">{label}</p>
      <p className={small ? "text-[12px] font-bold mt-0.5" : "text-[15px] font-extrabold mt-0.5"} style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-[var(--muted)] mt-0.5">{sub}</p>}
    </div>
  )
}
