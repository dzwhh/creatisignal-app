"use client"

import { useCallback, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Clapperboard, Info, Sparkles, X } from "lucide-react"

// ─── 购买加量包积分：短剧等高级生成能力的付费弹窗 ────────────────────────────
// 定价：1000 积分 = ¥129（¥0.129/积分）；短剧默认 15 秒消耗 210 积分

const MIN_CREDITS = 1000
const MAX_CREDITS = 10000
const STEP = 100
const PRICE_PER_CREDIT = 0.129
const DRAMA_15S_COST = 210

function fmt(n: number) {
  return n.toLocaleString("en-US")
}

// ─── 半圆积分表盘（可拖动）──────────────────────────────────────────────────

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

function CreditGauge({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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
      const raw = MIN_CREDITS + t * (MAX_CREDITS - MIN_CREDITS)
      onChange(Math.min(MAX_CREDITS, Math.max(MIN_CREDITS, Math.round(raw / STEP) * STEP)))
    },
    [onChange]
  )

  const t = (value - MIN_CREDITS) / (MAX_CREDITS - MIN_CREDITS)
  const knobAngle = 180 - t * 180
  // 最低档也保留一小段进度，视觉上可感知起点
  const progressEnd = 180 - Math.max(0.035, t) * 180
  const knob = pt(knobAngle)

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
        onPointerUp={() => {
          draggingRef.current = false
        }}
        onPointerCancel={() => {
          draggingRef.current = false
        }}
      >
        <path d={arcPath(180, 0)} stroke="#272b20" strokeWidth={14} strokeLinecap="round" fill="none" />
        {Array.from({ length: 9 }, (_, i) => {
          const p = pt(162 - i * 18)
          return <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#454a3a" />
        })}
        <path d={arcPath(180, progressEnd)} stroke="var(--lime)" strokeWidth={14} strokeLinecap="round" fill="none" />
        <g transform={`translate(${knob.x} ${knob.y}) rotate(${-knobAngle})`}>
          <rect x={-14} y={-9} width={28} height={18} rx={9} fill="#ffffff" />
        </g>
      </svg>

      {/* 中心数值 */}
      <div className="absolute inset-x-0 top-[72px] text-center pointer-events-none">
        <p className="text-[42px] leading-none font-extrabold text-[var(--lime)] tabular-nums">{fmt(value)}</p>
        <p className="mt-1.5 text-[12px] font-bold text-[#8b8e85]">积分</p>
      </div>

      {/* 两端刻度 */}
      <span className="absolute left-[20px] bottom-0 text-[11.5px] font-semibold text-[#8b8e85] tabular-nums">
        {fmt(MIN_CREDITS)}
      </span>
      <span className="absolute right-[8px] bottom-0 text-[11.5px] font-semibold text-[#8b8e85] tabular-nums">
        {fmt(MAX_CREDITS)}
      </span>
    </div>
  )
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export function CreditPurchaseModal({ open, onOpenChange, onPurchased }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** 点击「立即购买」（mock 支付成功）后回调 */
  onPurchased?: () => void
}) {
  const [credits, setCredits] = useState(MIN_CREDITS)
  const price = Math.round(credits * PRICE_PER_CREDIT)
  const dramaCount = Math.floor(credits / DRAMA_15S_COST)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[90] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] w-[760px] max-w-[calc(100vw-48px)] rounded-2xl bg-[#101208] text-white shadow-[0_32px_80px_rgba(0,0,0,0.45)] overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* 头部：标题 + 短剧识别提示 */}
          <div className="px-7 pt-6 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-[17px] font-extrabold">购买加量包积分</Dialog.Title>
              <Dialog.Description className="mt-2.5 inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full border border-[#c9ff29]/50 text-[var(--lime)] text-[11.5px] font-bold">
                <Clapperboard size={12} strokeWidth={2.2} className="shrink-0" />
                检测到「短剧」创意 · 短剧生成为高级能力，1000 积分起
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-8 h-8 -mr-2 rounded-full flex items-center justify-center text-[#8b8e85] hover:bg-white/10 hover:text-white cursor-pointer">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* 主体：左表盘 + 右价格权益 */}
          <div className="px-7 py-6 flex items-center gap-8">
            <div className="flex-1 flex flex-col items-center gap-3">
              <CreditGauge value={credits} onChange={setCredits} />
              <span className="inline-flex items-center gap-1.5 h-[28px] px-3 rounded-full bg-[#1a2010] border border-[#c9ff29]/35 text-[var(--lime)] text-[12px] font-bold">
                <Sparkles size={11} strokeWidth={2.4} />
                ¥{PRICE_PER_CREDIT}/积分
              </span>
              <p className="text-[12px] text-[#8b8e85]">拖动选择积分数量</p>
            </div>

            <div className="w-[280px] shrink-0 border-l border-white/10 pl-8 py-2">
              <p className="text-[40px] leading-none font-extrabold tabular-nums">¥{fmt(price)}</p>
              <div className="my-5 border-t border-white/10" />
              <p className="text-[13px] font-bold text-[#c6c9bf]">最多可创作：</p>
              <div className="mt-2.5 space-y-1.5 text-[13.5px]">
                <p>
                  <span className="font-extrabold tabular-nums">~{dramaCount}</span>{" "}
                  <span className="text-[#c6c9bf]">条 15s 短剧视频</span>
                </p>
                <p>
                  <span className="font-extrabold tabular-nums">~{fmt(credits)}</span>{" "}
                  <span className="text-[#c6c9bf]">张图片</span>
                </p>
              </div>
              <p className="mt-3 text-[11.5px] text-[#8b8e85] leading-relaxed">
                短剧默认 15 秒 · 消耗 210 积分（约 0.1 元/秒），实际消耗视模型参数而定
              </p>
              <button
                type="button"
                onClick={onPurchased}
                className="mt-5 w-full h-11 rounded-full bg-white text-[#101208] text-[14px] font-extrabold cursor-pointer hover:opacity-90 transition-opacity"
              >
                立即购买
              </button>
            </div>
          </div>

          {/* 底部说明 */}
          <div className="px-7 py-3.5 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11.5px] text-[#8b8e85]">
            <Info size={12} className="shrink-0" />
            加量积分永不过期，但需在订阅有效期内才能使用；加量包购买后不支持退款。
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
