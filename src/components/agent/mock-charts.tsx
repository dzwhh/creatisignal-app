"use client"

import * as React from "react"
import type { ChartBlock } from "@/lib/agent/state"

// ─── PieChart ────────────────────────────────────────────────────────────────

export function PieChart({ data, size = 180 }: { data: ChartBlock["data"]; size?: number }) {
  const total = data.reduce((s, d) => s + d.values[0], 0) || 1
  const radius = size / 2 - 4
  const cx = size / 2
  const cy = size / 2
  let angle = -Math.PI / 2
  const slices = data.map((d) => {
    const slice = (d.values[0] / total) * Math.PI * 2
    const start = angle
    const end = angle + slice
    angle = end
    const x1 = cx + radius * Math.cos(start)
    const y1 = cy + radius * Math.sin(start)
    const x2 = cx + radius * Math.cos(end)
    const y2 = cy + radius * Math.sin(end)
    const large = slice > Math.PI ? 1 : 0
    const path = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`
    return { path, color: d.color ?? "#a1a1aa", label: d.label, pct: ((d.values[0] / total) * 100).toFixed(0) }
  })
  return (
    <div className="flex items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="shrink-0" style={{ width: size, height: size }}>
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="white" strokeWidth={1} />)}
        <circle cx={cx} cy={cy} r={radius * 0.42} fill="white" />
      </svg>
      <ul className="space-y-1.5">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-[11.5px]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-[var(--text)] font-bold">{s.label}</span>
            <span className="text-[var(--muted)] font-mono tabular-nums">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── RadarChart ──────────────────────────────────────────────────────────────

export function RadarChart({ data, domainLabels = [], size = 220 }: { data: ChartBlock["data"]; domainLabels?: string[]; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 30
  const n = domainLabels.length || data[0]?.values.length || 0
  if (n === 0) return null
  function pointAt(i: number, value: number, max: number) {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2
    const r = (value / max) * radius
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }
  const max = 100
  const rings = [0.25, 0.5, 0.75, 1]
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
        {/* rings */}
        {rings.map((r) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const p = pointAt(i, max * r, max)
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
          }).join(" ")
          return <polygon key={r} points={pts} fill="none" stroke="var(--line)" strokeWidth={0.8} />
        })}
        {/* axes */}
        {Array.from({ length: n }, (_, i) => {
          const p = pointAt(i, max, max)
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--line)" strokeWidth={0.6} />
        })}
        {/* data polygons */}
        {data.map((d, idx) => {
          const pts = d.values.map((v, i) => {
            const p = pointAt(i, v, max)
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
          }).join(" ")
          const color = d.color ?? "#7c3aed"
          return (
            <g key={idx}>
              <polygon points={pts} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
              {d.values.map((v, i) => {
                const p = pointAt(i, v, max)
                return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color} />
              })}
            </g>
          )
        })}
        {/* labels */}
        {domainLabels.map((label, i) => {
          const angle = -Math.PI / 2 + (i / n) * Math.PI * 2
          const r = radius + 14
          const x = cx + r * Math.cos(angle)
          const y = cy + r * Math.sin(angle)
          return (
            <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[9.5px] font-bold fill-[var(--muted)]">
              {label}
            </text>
          )
        })}
      </svg>
      <ul className="flex items-center gap-3">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.color ?? "#a1a1aa" }} />
            <span className="text-[var(--text)] font-bold">{d.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── LineChart ───────────────────────────────────────────────────────────────

export function LineChart({ data, labels = [] }: { data: ChartBlock["data"]; labels?: string[] }) {
  const w = 440
  const h = 180
  const pad = 24
  const all = data.flatMap((d) => d.values)
  const max = Math.max(...all, 1)
  const min = Math.min(...all, 0)
  const span = Math.max(max - min, 0.0001)
  const xStep = (w - pad * 2) / Math.max(1, (data[0]?.values.length ?? 1) - 1)
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const y = pad + (h - pad * 2) * r
          return <line key={r} x1={pad} y1={y} x2={w - pad} y2={y} stroke="var(--line)" strokeWidth={0.8} strokeDasharray={r === 0 || r === 1 ? "" : "2 3"} />
        })}
        {/* lines */}
        {data.map((d, idx) => {
          const path = d.values.map((v, i) => {
            const x = pad + i * xStep
            const y = pad + (h - pad * 2) * (1 - (v - min) / span)
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
          }).join(" ")
          const color = d.color ?? "#0ea5e9"
          return (
            <g key={idx}>
              <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {d.values.map((v, i) => {
                const x = pad + i * xStep
                const y = pad + (h - pad * 2) * (1 - (v - min) / span)
                return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />
              })}
            </g>
          )
        })}
        {/* x labels */}
        {labels.map((label, i) => {
          const x = pad + i * xStep
          return (
            <text key={label} x={x} y={h - 4} textAnchor="middle" className="text-[9px] fill-[var(--muted-2)]">
              {label}
            </text>
          )
        })}
      </svg>
      <ul className="flex items-center gap-3 mt-1">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.color ?? "#a1a1aa" }} />
            <span className="text-[var(--text)] font-bold">{d.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── BarChart ────────────────────────────────────────────────────────────────

export function BarChart({ data, labels = [] }: { data: ChartBlock["data"]; labels?: string[] }) {
  const w = 440
  const h = 160
  const pad = 24
  const all = data.flatMap((d) => d.values)
  const max = Math.max(...all, 1)
  const groupCount = data[0]?.values.length ?? 0
  const groupWidth = (w - pad * 2) / Math.max(1, groupCount)
  const barWidth = (groupWidth - 4) / data.length
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[160px]">
      {Array.from({ length: groupCount }, (_, gi) =>
        data.map((d, di) => {
          const x = pad + gi * groupWidth + 2 + di * barWidth
          const v = d.values[gi]
          const barH = ((h - pad * 2) * v) / max
          const y = h - pad - barH
          return <rect key={`${gi}-${di}`} x={x} y={y} width={barWidth - 1} height={barH} fill={d.color ?? "#0ea5e9"} rx={1.5} />
        })
      )}
      {labels.map((label, i) => {
        const x = pad + i * groupWidth + groupWidth / 2
        return (
          <text key={label} x={x} y={h - 4} textAnchor="middle" className="text-[9px] fill-[var(--muted-2)]">
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Generic Chart switch ────────────────────────────────────────────────────

export function ChartView({ block }: { block: ChartBlock }) {
  switch (block.kind) {
    case "pie":   return <PieChart   data={block.data} />
    case "radar": return <RadarChart data={block.data} domainLabels={block.domainLabels} />
    case "line":  return <LineChart  data={block.data} labels={block.labels} />
    case "bar":   return <BarChart   data={block.data} labels={block.labels} />
  }
}
