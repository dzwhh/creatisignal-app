"use client"

import { useEffect, useLayoutEffect, useState } from "react"

type Rect = { top: number; left: number; width: number; height: number }

interface Props {
  /** CSS selector for the send button (its bounding rect is used) */
  targetSelector?: string
  onClose: () => void
}

const STROKE = "#88a868"      // 手绘箭头颜色
const TEXT_COLOR = "#6a8a4a"  // 手写文字色
const RING = "rgba(201, 255, 41, 0.95)"
const RING_HALO = "rgba(201, 255, 41, 0.32)"

export function SubmitArrowTip({ targetSelector = '[aria-label="提交生成"]' }: Props) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useLayoutEffect(() => {
    if (!mounted) return
    let raf = 0
    let cancelled = false
    function measure() {
      if (cancelled) return
      const el = document.querySelector(targetSelector) as HTMLElement | null
      if (!el) {
        raf = window.requestAnimationFrame(measure)
        return
      }
      const r = el.getBoundingClientRect()
      const next: Rect = { top: r.top, left: r.left, width: r.width, height: r.height }
      setRect((prev) =>
        prev && prev.top === next.top && prev.left === next.left && prev.width === next.width && prev.height === next.height
          ? prev
          : next
      )
    }
    measure()
    const onResize = () => measure()
    const onScroll = () => measure()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll, true)
    const interval = window.setInterval(measure, 320)
    return () => {
      cancelled = true
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll, true)
      window.clearInterval(interval)
    }
  }, [mounted, targetSelector])

  if (!mounted || !rect) return null

  // ─── 1. 按钮高亮 ring（lime pulse） ──────────────────────────────────────
  const ringPad = 5
  const ringTop = rect.top - ringPad
  const ringLeft = rect.left - ringPad
  const ringSize = rect.width + ringPad * 2
  // SendButton 圆形，所以 ring 也用圆角
  const ringRadius = ringSize / 2

  // ─── 2. 手绘提示位置 ─────────────────────────────────────────────────────
  // 整体 tip 容器放在按钮下方
  // SVG 箭头：起点在文字附近，向右上画一个 loop（绕一圈），再上指按钮
  // 文字：容器左下（即箭头线"尾端"远离按钮那侧）
  const TIP_W = 160
  const TIP_H = 64
  const SVG_W = 92
  const SVG_H = 56
  // SVG 内箭头尖端坐标（曲线终点 = 箭头分叉中点）
  const ARROW_TIP_X = 80
  const tipTop = rect.top + rect.height + 6
  const buttonCenterX = rect.left + rect.width / 2
  const tipLeft = buttonCenterX - (TIP_W - SVG_W) - ARROW_TIP_X

  return (
    <div className="fixed inset-0 z-[80] pointer-events-none">
      {/* 按钮高亮 ring */}
      <div
        className="absolute pointer-events-none animate-cs-btn-pulse"
        style={{
          top: ringTop,
          left: ringLeft,
          width: ringSize,
          height: ringSize,
          borderRadius: ringRadius,
        }}
      />

      {/* 手绘箭头 + 手写文字 */}
      <div
        className="absolute select-none animate-cs-tip-bob"
        style={{ top: tipTop, left: tipLeft, width: TIP_W, height: TIP_H }}
        role="status"
        aria-live="polite"
      >
        {/* 文字 — 左下角（箭头线尾端） */}
        <span
          className="absolute"
          style={{
            bottom: 0,
            left: 4,
            color: TEXT_COLOR,
            fontFamily:
              "'Caveat','Marker Felt','Comic Sans MS','PingFang SC','Hiragino Sans GB','Microsoft YaHei',cursive",
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: 18,
            lineHeight: 1,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            transform: "rotate(-4deg)",
          }}
        >
          点这里试试
        </span>

        {/* 手绘短曲线 — 控制点在下方让曲线"凹"起来（反方向于此前的凸起）+ 对称 V 形箭头 */}
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          fill="none"
          className="absolute pointer-events-none"
          style={{ top: 0, right: 0 }}
          aria-hidden="true"
        >
          {/*
            主曲线：起点左下 (8, 46) → 控制点 (44, 50) 在连线下方让弧度凹陷 → 终点 (80, 8)
            手感像是从下方"甩"上来
          */}
          <path
            d="M 8 46 Q 44 50, 80 8"
            stroke={STROKE}
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          {/* 对称 V 形箭头 — 尖端 (80, 8)，左分叉 (71, 16)，右分叉 (89, 16)，朝上指 */}
          <path
            d="M 71 16 L 80 8 L 89 16"
            stroke={STROKE}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes csBtnPulse {
          0%, 100% { box-shadow: 0 0 0 2px ${RING}, 0 0 0 6px ${RING_HALO}, 0 8px 22px rgba(9,9,11,0.18); }
          50%      { box-shadow: 0 0 0 2px ${RING}, 0 0 0 12px rgba(201,255,41,0.22), 0 12px 28px rgba(9,9,11,0.24); }
        }
        @keyframes csTipBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          45%      { transform: translateY(3px) rotate(-1deg); }
          75%      { transform: translateY(-1px) rotate(0.6deg); }
        }
        :global(.animate-cs-btn-pulse) { animation: csBtnPulse 1600ms ease-in-out infinite; }
        :global(.animate-cs-tip-bob)   { animation: csTipBob 1500ms ease-in-out infinite; transform-origin: 75% 30%; }
      `}</style>
    </div>
  )
}
