"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { RainbowButton, rainbowButtonClassName } from "@/components/ui/rainbow-button"

export interface SpotlightProps {
  /** CSS selector for the element to spotlight. Tour stays hidden until it resolves. */
  targetSelector: string
  /** Tooltip title — usually "你的第一份报告出来了！" */
  title: string
  /** Tooltip description — usually "下一步：xxx" */
  description: string
  primaryAction: { label: string; href?: string; onClick?: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  /** Called when user closes via X or backdrop — also from primary/secondary CTAs */
  onClose: () => void
  /** Tooltip placement; default "bottom" with auto-flip when target near viewport bottom */
  preferredPlacement?: "top" | "bottom"
}

type Rect = { top: number; left: number; width: number; height: number }

const PADDING = 8         // spotlight 框比目标外扩这么多 px
const RADIUS = 14         // 高亮框圆角
const TOOLTIP_GAP = 14    // tooltip 距高亮框
const TOOLTIP_WIDTH = 340

export function SpotlightTour({
  targetSelector,
  title,
  description,
  primaryAction,
  secondaryAction,
  onClose,
  preferredPlacement = "bottom",
}: SpotlightProps) {
  const [rect, setRect] = useState<Rect | null>(null)
  const [mounted, setMounted] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Measure target + keep updating on resize/scroll
  useLayoutEffect(() => {
    if (!mounted) return
    let raf = 0
    let cancelled = false

    function measure() {
      if (cancelled) return
      const el = document.querySelector(targetSelector) as HTMLElement | null
      if (!el) {
        // Target not yet in DOM — try again next frame
        raf = window.requestAnimationFrame(measure)
        return
      }
      const r = el.getBoundingClientRect()
      const next: Rect = { top: r.top, left: r.left, width: r.width, height: r.height }
      setRect((prev) => {
        if (prev && prev.top === next.top && prev.left === next.left && prev.width === next.width && prev.height === next.height) return prev
        return next
      })
      // Scroll into view first time
      el.scrollIntoView({ block: "center", behavior: "smooth" })
    }

    measure()
    const onResize = () => measure()
    const onScroll = () => measure()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll, true)

    // Re-measure on a short interval until target is stable (handles layout shifts after view change)
    const interval = window.setInterval(measure, 240)

    return () => {
      cancelled = true
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll, true)
      window.clearInterval(interval)
    }
  }, [mounted, targetSelector])

  if (!mounted || !rect) return null

  // Position tooltip below target by default, flip above if not enough room
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 800
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200
  const wantBelow = preferredPlacement === "bottom"
  const spaceBelow = viewportH - (rect.top + rect.height + PADDING + TOOLTIP_GAP)
  const place: "top" | "bottom" = wantBelow && spaceBelow > 200 ? "bottom" : "top"

  const tooltipTop = place === "bottom"
    ? rect.top + rect.height + PADDING + TOOLTIP_GAP
    : rect.top - PADDING - TOOLTIP_GAP // we'll subtract tooltip height after render via translate
  const tooltipLeftRaw = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2
  const tooltipLeft = Math.max(16, Math.min(viewportW - TOOLTIP_WIDTH - 16, tooltipLeftRaw))

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {/* 4-piece mask creating a "hole" around the target */}
      <Mask top={0}                       left={0}                                width="100%"                              height={Math.max(0, rect.top - PADDING)} />
      <Mask top={rect.top - PADDING}      left={0}                                width={Math.max(0, rect.left - PADDING)} height={rect.height + PADDING * 2} />
      <Mask top={rect.top - PADDING}      left={rect.left + rect.width + PADDING} right={0}                                  height={rect.height + PADDING * 2} />
      <Mask top={rect.top + rect.height + PADDING} left={0}                       width="100%"                              bottom={0} />

      {/* Highlighted ring around the target — pointer-events:none so it doesn't block clicks */}
      <div
        className="absolute pointer-events-none animate-cs-spot-pulse"
        style={{
          top:    rect.top - PADDING,
          left:   rect.left - PADDING,
          width:  rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
          borderRadius: RADIUS,
          boxShadow: "0 0 0 2px rgba(201, 255, 41, 0.95), 0 0 0 6px rgba(201, 255, 41, 0.32), 0 14px 32px rgba(9, 9, 11, 0.35)",
          background: "transparent",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute pointer-events-auto w-[340px] rounded-2xl bg-white border border-[var(--line)] p-4 pr-3 shadow-[0_24px_60px_rgba(9,9,11,0.28)]",
          "animate-cs-spot-tooltip-in"
        )}
        style={{
          top:  place === "top" ? `calc(${tooltipTop}px - 100%)` : tooltipTop,
          left: tooltipLeft,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cs-spot-title"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭引导"
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--green)" }}>
            <CheckCircle2 size={18} strokeWidth={2.4} style={{ color: "var(--green-text)" }} />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p id="cs-spot-title" className="text-[13.5px] font-extrabold text-[var(--text)] leading-snug">{title}</p>
            <p className="text-[11.5px] text-[var(--muted)] mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 justify-end">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="h-8 px-3 rounded-full text-[12px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction.href ? (
            <Link
              href={primaryAction.href}
              onClick={onClose}
              className={cn(rainbowButtonClassName, "h-8 px-3 text-[12px]")}
            >
              {primaryAction.label}
              <ArrowRight size={12} strokeWidth={2.4} className="ml-1" />
            </Link>
          ) : (
            <RainbowButton
              type="button"
              onClick={() => { primaryAction.onClick?.(); onClose() }}
              className="h-8 px-3 text-[12px]"
            >
              {primaryAction.label}
              <ArrowRight size={12} strokeWidth={2.4} className="ml-1" />
            </RainbowButton>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes csSpotPulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(201,255,41,0.95), 0 0 0 6px rgba(201,255,41,0.32), 0 14px 32px rgba(9,9,11,0.35); }
          50%      { box-shadow: 0 0 0 2px rgba(201,255,41,1),    0 0 0 12px rgba(201,255,41,0.22), 0 18px 40px rgba(9,9,11,0.45); }
        }
        @keyframes csSpotTooltipIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        :global(.animate-cs-spot-pulse)       { animation: csSpotPulse 1800ms ease-in-out infinite; }
        :global(.animate-cs-spot-tooltip-in)  { animation: csSpotTooltipIn 240ms ease-out both; }
      `}</style>
    </div>
  )
}

// ─── Mask piece ──────────────────────────────────────────────────────────────

function Mask({ top, left, right, bottom, width, height }: {
  top: number
  left?: number
  right?: number
  bottom?: number
  width?: number | string
  height?: number | string
}) {
  return (
    <div
      className="absolute bg-black/45 backdrop-blur-[1px] pointer-events-auto"
      style={{ top, left, right, bottom, width, height }}
    />
  )
}
