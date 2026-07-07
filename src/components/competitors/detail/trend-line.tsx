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

export function TrendLine({ data }: { data: number[] }) {
  const labels = buildMonthLabels()
  const total = data.reduce((a, b) => a + b, 0)
  const peak = Math.max(...data)
  const active = data.filter((v) => v > 0).length
  return (
    <div className="h-full rounded-2xl border border-[var(--line)] bg-white p-5 flex flex-col transition-colors hover:border-[var(--line-strong)]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[15px] font-extrabold text-[var(--text)]">投放日期分布</h2>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5">最近 180 天上新节奏</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: "180 天上新", value: total },
            { label: "投放天数", value: active },
            { label: "单日峰值", value: peak, lime: true },
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
      <div className="flex-1 mt-4 min-h-[170px]">
        <AreaLine data={data} height={180} gradientId="brand-trend" showGrid showPeak />
      </div>
      <div className="flex justify-between mt-2.5 text-[10.5px] text-[var(--muted-2)]">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  )
}
