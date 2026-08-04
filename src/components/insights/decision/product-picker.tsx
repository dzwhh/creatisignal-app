"use client"

/**
 * 商品选择器 —— 素材诊断页的商品级取数范围（单选）。
 *
 * 单选而非多选：表格按商品分组，分组头会给出「目标 ROI / 当前 ROI / 当前商品可放量」
 * 这类商品级结论，多选会让这些结论失去意义。
 *
 * 每行的数量都从 CREATIVES 实算，而不是读 PRODUCTS[].statusCounts —— 后者是手写近似值，
 * 与实际素材数不一致，用它会导致「选之前看到 8 条、选之后表格 11 条」。
 */

import { useEffect, useMemo, useRef, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { Check, ChevronDown, Package, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CREATIVES,
  DECISION_ACTIONABLE_ORDER,
  DECISION_PASSIVE_ORDER,
  DECISION_STATUS_META,
  PRODUCTS,
  PRODUCT_TAIL_SUMMARY,
  countByStatus,
  type DecisionStatus,
} from "@/lib/insights/decision-mock"
import { ProductThumb } from "./decision-ui"

const ALL = "all"

type Option = {
  id: string
  label: string
  /** 副标题：SKU · 国家，或全部商品的说明 */
  sub: string
  total: number
  pending: number
  counts: Record<DecisionStatus, number>
  accent?: string
  /** 搜索匹配用的额外关键词 */
  keywords: string
}

/** 只在模块加载时算一次：商品维度的素材数与状态分布 */
const OPTIONS: Option[] = (() => {
  const all = countByStatus(CREATIVES)
  const allPending = DECISION_ACTIONABLE_ORDER.reduce((sum, key) => sum + all[key], 0)

  return [
    {
      id: ALL,
      label: "全部商品",
      sub: `${PRODUCTS.length} 个在投商品进入今日诊断队列`,
      total: CREATIVES.length,
      pending: allPending,
      counts: all,
      keywords: "all 全部",
    },
    ...PRODUCTS.map((product) => {
      const creatives = CREATIVES.filter((creative) => creative.productId === product.id)
      const counts = countByStatus(creatives)
      return {
        id: product.id,
        label: product.name,
        sub: `${product.sku} · ${product.country}`,
        total: creatives.length,
        pending: DECISION_ACTIONABLE_ORDER.reduce((sum, key) => sum + counts[key], 0),
        counts,
        accent: product.accent,
        keywords: `${product.name} ${product.shortName} ${product.sku} ${product.category}`.toLowerCase(),
      }
    }),
  ]
})()

export function ProductPicker({
  value,
  onChange,
  fromOverview,
}: {
  /** "all" 或商品 id */
  value: string
  onChange: (value: string) => void
  /** 当前筛选是否由经营总览带入 */
  fromOverview?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return OPTIONS
    return OPTIONS.filter((option) => option.id === ALL || option.keywords.includes(q))
  }, [query])

  const current = OPTIONS.find((option) => option.id === value) ?? OPTIONS[0]
  const isAll = value === ALL

  // 高亮项滚进可视区域：这是同步 DOM，不是派生 state
  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" })
  }, [activeIndex])

  /** 开合时重置搜索，并把高亮落在当前选中项上 */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    setQuery("")
    if (next) {
      const index = OPTIONS.findIndex((option) => option.id === value)
      setActiveIndex(index >= 0 ? index : 0)
    }
  }

  const handleQueryChange = (next: string) => {
    setQuery(next)
    setActiveIndex(0)
  }

  const clearQuery = () => {
    handleQueryChange("")
    inputRef.current?.focus()
  }

  const pick = (id: string) => {
    onChange(id)
    setOpen(false)
    setQuery("")
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      const option = filtered[activeIndex]
      if (option) pick(option.id)
    }
  }

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <div
        className={cn(
          "flex h-8 shrink-0 items-center rounded-full border bg-white transition-colors",
          open ? "border-[var(--line-strong)] bg-[var(--soft-2)]" : "border-[var(--line)] hover:border-[var(--line-strong)]"
        )}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label="选择商品"
            className={cn(
              "flex h-full cursor-pointer items-center gap-1.5 pl-3 text-[11.5px] font-semibold text-[var(--text)]",
              isAll ? "pr-3" : "pr-2"
            )}
          >
            <Package size={12} strokeWidth={2.2} className="text-[var(--muted)]" />
            <span className="text-[var(--muted)]">商品</span>
            <span
              className={cn(
                "flex h-5 max-w-[168px] items-center rounded-full px-1.5 text-[11px] font-bold",
                isAll ? "bg-[var(--soft)] text-[var(--text)]" : "bg-[var(--lime-soft)] text-[#5c7a00]"
              )}
            >
              <span className="truncate">{isAll ? `全部 ${PRODUCTS.length}` : current.label}</span>
            </span>
            <ChevronDown size={11} className="text-[var(--muted)]" />
          </button>
        </Popover.Trigger>
        {isAll ? null : (
          <button
            type="button"
            onClick={() => onChange(ALL)}
            aria-label="清除商品筛选"
            className="mr-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--soft)] hover:text-[var(--text)]"
          >
            <X size={11} strokeWidth={2.6} />
          </button>
        )}
      </div>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            inputRef.current?.focus()
          }}
          className="z-50 flex max-h-[460px] w-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_18px_42px_rgba(9,9,11,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {fromOverview && !isAll ? (
            <div className="flex items-center gap-1.5 border-b border-[var(--line)] bg-[var(--lime-soft)]/50 px-3 py-2 text-[10.5px] text-[#5c7a00]">
              <span className="rounded bg-[var(--lime-soft)] px-1.5 py-0.5 font-bold">来自经营总览</span>
              已带入商品筛选，可在下方切换或清除
            </div>
          ) : null}

          <div className="border-b border-[var(--line)] p-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="搜索商品名 / SKU…"
                className="h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--soft-2)] pl-9 pr-9 text-[12.5px] outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--line-strong)]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={clearQuery}
                  aria-label="清空搜索"
                  className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--soft)]"
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>
          </div>

          <div role="listbox" aria-label="商品列表" className="flex-1 overflow-y-auto p-1.5">
            {filtered.length === 1 && query.trim() ? (
              <div className="px-2.5 py-8 text-center">
                <p className="text-[12px] font-bold text-[var(--text)]">无匹配商品</p>
                <button
                  type="button"
                  onClick={clearQuery}
                  className="mt-1.5 cursor-pointer text-[10.5px] font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:underline"
                >
                  清空搜索
                </button>
              </div>
            ) : (
              filtered.map((option, index) => (
                <OptionRow
                  key={option.id}
                  ref={(node) => {
                    itemRefs.current[index] = node
                  }}
                  option={option}
                  selected={option.id === value}
                  highlighted={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => pick(option.id)}
                />
              ))
            )}
          </div>

          <div className="border-t border-[var(--line)] bg-[var(--soft-2)] px-3 py-2 text-[10px] text-[var(--muted)]">
            另有 {PRODUCT_TAIL_SUMMARY.total - PRODUCTS.length} 个商品未进入今日诊断队列 · 其中{" "}
            {PRODUCT_TAIL_SUMMARY.observing} 个待观察
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── 列表行 ──────────────────────────────────────────────────────────────────

function OptionRow({
  option,
  selected,
  highlighted,
  onClick,
  onMouseEnter,
  ref,
}: {
  option: Option
  selected: boolean
  highlighted: boolean
  onClick: () => void
  onMouseEnter: () => void
  ref: React.Ref<HTMLButtonElement>
}) {
  const breakdown = option.pending > 0 ? DECISION_ACTIONABLE_ORDER : DECISION_PASSIVE_ORDER

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-2 py-2 text-left transition-colors",
        highlighted ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
      )}
    >
      {option.accent ? (
        <ProductThumb accent={option.accent} label={option.label} className="size-9 rounded-lg" />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--soft)] text-[var(--muted)]">
          <Package size={15} strokeWidth={1.9} />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[12.5px] font-extrabold text-[var(--text)]">{option.label}</span>
        <span className="mt-0.5 block truncate text-[10px] text-[var(--muted)]">{option.sub}</span>
        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {breakdown
            .filter((key) => option.counts[key] > 0)
            .map((key) => (
              <span key={key} className="flex items-center gap-1 text-[10px] tabular-nums text-[var(--muted)]">
                <span className="size-1.5 rounded-full" style={{ backgroundColor: DECISION_STATUS_META[key].dot }} />
                {option.counts[key]} {DECISION_STATUS_META[key].label}
              </span>
            ))}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
            option.pending > 0 ? "bg-[var(--near-black)] text-white" : "bg-[var(--soft)] text-[var(--muted)]"
          )}
        >
          {option.pending > 0 ? `${option.pending} 待处理` : "无需处理"}
        </span>
        <span className="text-[9.5px] tabular-nums text-[var(--muted-2)]">共 {option.total} 条</span>
      </span>

      {selected ? <Check size={13} strokeWidth={2.8} className="shrink-0 text-[var(--text)]" /> : null}
    </button>
  )
}
