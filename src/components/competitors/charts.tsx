// 手写 SVG 图表小元件(lime 配色,无第三方依赖)

export function Sparkline({
  data,
  width = 96,
  height = 28,
  color = "#84cc16",
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
}) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const range = Math.max(max - min, 1)
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(height - 3 - ((v - min) / range) * (height - 6)).toFixed(1)}`)
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={(data.length - 1) * step}
        cy={height - 3 - ((data[data.length - 1] - min) / range) * (height - 6)}
        r={2.2}
        fill={color}
      />
    </svg>
  )
}

type Pt = { x: number; y: number }

// Catmull-Rom → cubic bezier,让折线变平滑曲线
function smoothPath(pts: Pt[]): string {
  if (pts.length < 3) return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

export function AreaLine({
  data,
  width = 640,
  height = 180,
  color = "#84cc16",
  gradientId,
  showGrid = false,
  showPeak = false,
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
  gradientId: string
  showGrid?: boolean
  showPeak?: boolean
}) {
  const max = Math.max(...data, 1)
  const step = width / (data.length - 1)
  const padTop = showPeak ? 18 : 6
  const padBottom = 4
  const y = (v: number) => height - padBottom - (v / max) * (height - padTop - padBottom)
  const pts: Pt[] = data.map((v, i) => ({ x: i * step, y: y(v) }))
  const line = smoothPath(pts)
  const area = `${line} L${width},${height} L0,${height} Z`
  const peakIdx = data.indexOf(max)
  const peakX = peakIdx * step
  const peakOnRight = peakIdx > data.length * 0.72

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.32} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {showGrid &&
        [0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0}
            x2={width}
            y1={y(max * f)}
            y2={y(max * f)}
            stroke="#e4e4e7"
            strokeWidth={1}
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {showPeak && (
        <g>
          <line
            x1={peakX}
            x2={peakX}
            y1={y(max)}
            y2={height - padBottom}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="2 4"
            opacity={0.5}
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={peakX} cy={y(max)} r={3.4} fill="#fff" stroke={color} strokeWidth={2} />
          <text
            x={peakOnRight ? peakX - 8 : peakX + 8}
            y={y(max) - 7}
            textAnchor={peakOnRight ? "end" : "start"}
            fontSize={11}
            fontWeight={800}
            fill="#3f6212"
          >
            峰值 {max}
          </text>
        </g>
      )}
    </svg>
  )
}

export function Donut({
  slices,
  size = 148,
  thickness = 16,
  gap = 2.5,
  centerTitle,
  centerSub,
}: {
  slices: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
  gap?: number
  centerTitle: string
  centerSub?: string
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1
  const r = (size - thickness) / 2
  const c = size / 2
  const circumference = 2 * Math.PI * r
  const visible = slices.filter((s) => s.value > 0)
  const useGap = visible.length > 1 ? gap : 0
  const segments = visible.reduce<{ slice: (typeof visible)[number]; dash: number; offset: number }[]>((acc, s) => {
    const prev = acc[acc.length - 1]
    const offset = prev ? prev.offset + (prev.slice.value / total) * circumference : 0
    acc.push({ slice: s, dash: Math.max((s.value / total) * circumference - useGap, 1), offset })
    return acc
  }, [])
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#f4f4f5" strokeWidth={thickness} />
      {segments.map(({ slice: s, dash, offset }) => (
        <circle
          key={s.label}
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={-(offset + useGap / 2)}
          transform={`rotate(-90 ${c} ${c})`}
          strokeLinecap="butt"
        />
      ))}
      <text x={c} y={c - 2} textAnchor="middle" className="fill-[var(--text)]" fontSize={24} fontWeight={800}>
        {centerTitle}
      </text>
      {centerSub && (
        <text x={c} y={c + 16} textAnchor="middle" className="fill-[var(--muted)]" fontSize={11}>
          {centerSub}
        </text>
      )}
    </svg>
  )
}
