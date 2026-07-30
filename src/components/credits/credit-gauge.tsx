"use client"

import { useCallback, useRef } from "react"

// ─── 可拖动半圆积分表盘 ──────────────────────────────────────────────────────
// 从 credit-purchase-modal 抽出，供购买页「按需自选」与短剧付费弹窗共用。

const CX = 160
const CY = 150
const R = 118

function pt(angle: number) {
  const rad = (angle * Math.PI) / 180
  return { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad) }
}

function arcPath(from: number, to: number) {
  const a = pt(from)
  const b = pt(to)
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

interface Props {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  /** 深色底（默认）或浅色底 */
  theme?: "dark" | "light"
}

export function CreditGauge({ value, onChange, min, max, step, theme = "dark" }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const draggingRef = useRef(false)

  const applyPointer = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      const scale = 320 / rect.width
      const x = (clientX - rect.left) * scale
      const y = (clientY - rect.top) * scale
      let angle = (Math.atan2(CY - y, x - CX) * 180) / Math.PI
      if (angle < 0) angle = angle < -90 ? 180 : 0
      const t = (180 - angle) / 180
      const raw = min + t * (max - min)
      onChange(Math.min(max, Math.max(min, Math.round(raw / step) * step)))
    },
    [onChange, min, max, step]
  )

  const t = (value - min) / (max - min)
  const knobAngle = 180 - t * 180
  // 最低档也保留一小段进度，视觉上可感知起点
  const progressEnd = 180 - Math.max(0.035, t) * 180
  const knob = pt(knobAngle)

  const dark = theme === "dark"
  const trackColor = dark ? "#272b20" : "#e9eae4"
  const tickColor = dark ? "#454a3a" : "#c8cbbe"
  const labelColor = dark ? "text-[#8b8e85]" : "text-[var(--muted-2)]"
  const valueColor = dark ? "text-[var(--lime)]" : "text-[#3f6212]"

  return (
    <div className="relative w-[320px] select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 320 170"
        className="w-full touch-none cursor-pointer"
        onPointerDown={(e) => {
          draggingRef.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          applyPointer(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) applyPointer(e.clientX, e.clientY)
        }}
        onPointerUp={() => { draggingRef.current = false }}
        onPointerCancel={() => { draggingRef.current = false }}
      >
        <path d={arcPath(180, 0)} stroke={trackColor} strokeWidth={14} strokeLinecap="round" fill="none" />
        {Array.from({ length: 9 }, (_, i) => {
          const p = pt(162 - i * 18)
          return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={tickColor} />
        })}
        <path
          d={arcPath(180, progressEnd)}
          stroke="var(--lime)"
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
          className="transition-[d] duration-150"
        />
        <g transform={`translate(${knob.x} ${knob.y}) rotate(${-knobAngle})`}>
          <rect
            x={-14} y={-9} width={28} height={18} rx={9}
            fill="#ffffff"
            stroke={dark ? "none" : "#d4d4d8"}
            strokeWidth={dark ? 0 : 1}
          />
        </g>
      </svg>

      {/* 中心数值 */}
      <div className="absolute inset-x-0 top-[72px] text-center pointer-events-none">
        <p className={`text-[42px] leading-none font-extrabold tabular-nums ${valueColor}`}>
          {value.toLocaleString("en-US")}
        </p>
        <p className={`mt-1.5 text-[12px] font-bold ${labelColor}`}>积分</p>
      </div>

      {/* 两端刻度 */}
      <span className={`absolute left-[20px] bottom-0 text-[11.5px] font-semibold tabular-nums ${labelColor}`}>
        {min.toLocaleString("en-US")}
      </span>
      <span className={`absolute right-[8px] bottom-0 text-[11.5px] font-semibold tabular-nums ${labelColor}`}>
        {max.toLocaleString("en-US")}
      </span>
    </div>
  )
}
