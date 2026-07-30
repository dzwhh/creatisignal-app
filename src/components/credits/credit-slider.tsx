"use client"

import { useCallback, useRef } from "react"
import { cn } from "@/lib/utils"

interface Props {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  /** 轨道下方的刻度标签 */
  ticks?: { at: number; label: string }[]
  format?: (v: number) => string
}

/**
 * 横向拖动选择器（Codex 切模型式交互）：
 * 一条带刻度的横轨 + 可拖动滑块，点击轨道任意位置直接跳档，
 * 也支持键盘左右方向键微调。
 */
export function CreditSlider({
  value, onChange, min, max, step, ticks = [], format = (v) => v.toLocaleString("en-US"),
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const applyPointer = useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const raw = min + t * (max - min)
      onChange(Math.min(max, Math.max(min, Math.round(raw / step) * step)))
    },
    [onChange, min, max, step]
  )

  const t = (value - min) / (max - min)
  const pct = t * 100

  return (
    <div className="w-full select-none">
      {/* 当前值 */}
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[11.5px] text-[var(--muted)]">选择积分数量</p>
          <p className="mt-1 text-[32px] font-[850] text-[var(--text)] tabular-nums leading-none tracking-tight">
            {format(value)}
            <span className="ml-1.5 text-[13px] font-bold text-[var(--muted)]">积分</span>
          </p>
        </div>
        <p className="text-[11.5px] text-[var(--muted-2)] pb-1.5">拖动或点击选择</p>
      </div>

      {/* 轨道 */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label="积分数量"
        onPointerDown={(e) => {
          draggingRef.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          applyPointer(e.clientX)
        }}
        onPointerMove={(e) => { if (draggingRef.current) applyPointer(e.clientX) }}
        onPointerUp={() => { draggingRef.current = false }}
        onPointerCancel={() => { draggingRef.current = false }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft")  { e.preventDefault(); onChange(Math.max(min, value - step)) }
          if (e.key === "ArrowRight") { e.preventDefault(); onChange(Math.min(max, value + step)) }
          if (e.key === "Home")       { e.preventDefault(); onChange(min) }
          if (e.key === "End")        { e.preventDefault(); onChange(max) }
        }}
        className="relative h-11 flex items-center cursor-pointer touch-none outline-none group"
      >
        {/* 底轨 */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-[var(--soft)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#c9ff29,#84cc16)] transition-[width] duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* 刻度点 */}
        {ticks.map((tk) => {
          const p = ((tk.at - min) / (max - min)) * 100
          const passed = value >= tk.at
          return (
            <span
              key={tk.at}
              className={cn(
                "absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 pointer-events-none transition-colors",
                passed ? "bg-[#3f6212]/40" : "bg-[var(--line-strong)]"
              )}
              style={{ left: `${p}%` }}
            />
          )
        })}

        {/* 滑块 */}
        <span
          className="absolute w-6 h-6 -translate-x-1/2 rounded-full bg-white border-2 border-[#84cc16] shadow-[0_2px_8px_rgba(9,9,11,0.16)] transition-transform group-active:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-[#c9ff29]/40 pointer-events-none"
          style={{ left: `${pct}%` }}
        />
      </div>

      {/* 刻度标签 */}
      {ticks.length > 0 && (
        <div className="relative h-4 mt-1">
          {ticks.map((tk) => {
            const p = ((tk.at - min) / (max - min)) * 100
            const edge = p < 4 ? "left" : p > 96 ? "right" : "mid"
            return (
              <span
                key={tk.at}
                className={cn(
                  "absolute text-[10.5px] font-semibold text-[var(--muted-2)] tabular-nums whitespace-nowrap",
                  edge === "mid" && "-translate-x-1/2"
                )}
                style={
                  edge === "right"
                    ? { right: 0 }
                    : edge === "left"
                      ? { left: 0 }
                      : { left: `${p}%` }
                }
              >
                {tk.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
