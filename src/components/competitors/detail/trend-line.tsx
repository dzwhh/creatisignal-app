import { AreaLine } from "../charts"

function buildMonthLabels(): string[] {
  const out: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push(`${d.getMonth() + 1}月`)
  }
  return out
}

export function TrendLine({
  data,
  coveredDays,
  targetDays,
}: {
  data: number[]
  /** 传入后:未采集区间画斜线底纹,文案改为覆盖度叙事 */
  coveredDays?: number
  targetDays?: number
}) {
  const labels = buildMonthLabels()
  const partial = typeof coveredDays === "number" && typeof targetDays === "number" && coveredDays < targetDays
  const scan = partial ? data.slice(0, coveredDays) : data
  const total = scan.reduce((a, b) => a + b, 0)
  const peak = Math.max(...scan, 0)
  const active = scan.filter((v) => v > 0).length
  const remaining = partial ? targetDays! - coveredDays! : 0

  return (
    <div className="h-full rounded-2xl border border-[var(--line)] bg-white p-5 flex flex-col transition-colors hover:border-[var(--line-strong)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-extrabold text-[var(--text)]">投放日期分布</h2>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5">
            {partial ? `已采集 ${coveredDays}/${targetDays} 天 · 仍在回溯` : "最近 180 天上新节奏"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: partial ? "已采集上新" : "180 天上新", value: total },
            { label: partial ? "已覆盖投放天数" : "投放天数", value: active },
            { label: partial ? "当前单日峰值" : "单日峰值", value: peak, lime: true },
          ].map((s) => (
            <div
              key={s.label}
              className="h-[30px] px-3 rounded-full bg-[var(--soft-2)] border border-[var(--line)] flex items-center gap-1.5"
            >
              <span className="text-[10.5px] text-[var(--muted)]">{s.label}</span>
              <span className={`text-[13px] font-extrabold tabular-nums ${s.lime ? "text-[#3f6212]" : "text-[var(--text)]"}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 mt-4 min-h-[170px] relative">
        <AreaLine
          data={data}
          height={180}
          gradientId="brand-trend"
          showGrid
          showPeak
          coveredRatio={partial ? coveredDays! / targetDays! : undefined}
        />
        {partial && (
          <span
            className="absolute top-1 text-[10.5px] font-bold text-[var(--muted-2)] whitespace-nowrap"
            style={{ left: `calc(${(coveredDays! / targetDays!) * 100}% + 8px)` }}
          >
            采集中 · 剩余 {remaining} 天
          </span>
        )}
      </div>
      <div className="flex justify-between mt-2.5 text-[10.5px] text-[var(--muted-2)]">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  )
}
