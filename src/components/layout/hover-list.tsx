"use client"

import * as React from "react"
import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface HoverListProps {
  /** Index of the currently active (route-matched) item; the highlight rests here when not hovering. */
  activeIndex: number | null
  /** Highlight background color; defaults to `var(--soft)`. */
  highlightClassName?: string
  /** Vertical gap between items, in px. */
  gap?: number
  className?: string
  children: React.ReactNode
}

/**
 * MuleRun / Linear / Raycast style menu list.
 *
 * A single absolutely-positioned highlight smoothly slides between items as the
 * cursor moves, instead of each item fading its own background in & out. Active
 * (route-matched) item keeps the highlight when nothing is hovered. Leaving the
 * list animates the highlight back to the active row (or fades out if none).
 */
export function HoverList({
  activeIndex,
  highlightClassName,
  gap = 2,
  className,
  children,
}: HoverListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [highlight, setHighlight] = useState<{ top: number; height: number; visible: boolean }>({
    top: 0,
    height: 0,
    visible: false,
  })
  // After first paint, allow CSS transitions; before that, place highlight without animating.
  const [mounted, setMounted] = useState(false)

  const focusIdx = hoveredIdx ?? activeIndex

  useLayoutEffect(() => {
    if (focusIdx == null || !containerRef.current) {
      setHighlight((h) => ({ ...h, visible: false }))
      return
    }
    const item = itemRefs.current[focusIdx]
    if (!item) {
      setHighlight((h) => ({ ...h, visible: false }))
      return
    }
    const containerRect = containerRef.current.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    setHighlight({
      top: itemRect.top - containerRect.top,
      height: itemRect.height,
      visible: true,
    })
  }, [focusIdx])

  // Flip mounted on next frame so the first highlight placement does not animate.
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const items = React.Children.toArray(children)

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseLeave={() => setHoveredIdx(null)}
      style={{ display: "flex", flexDirection: "column", gap }}
    >
      {/* The single sliding highlight */}
      <div
        aria-hidden
        className={cn(
          "absolute left-0 right-0 rounded-lg pointer-events-none",
          mounted && "transition-[transform,height,opacity] duration-200 ease-out",
          highlightClassName ?? "bg-[var(--soft)]"
        )}
        style={{
          transform: `translateY(${highlight.top}px)`,
          height: highlight.height,
          opacity: highlight.visible ? 1 : 0,
        }}
      />
      {items.map((child, idx) => (
        <div
          key={idx}
          ref={(el) => { itemRefs.current[idx] = el }}
          onMouseEnter={() => setHoveredIdx(idx)}
          className="relative"
        >
          {child}
        </div>
      ))}
    </div>
  )
}
