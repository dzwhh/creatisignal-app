"use client"

import { useState, useRef, useEffect } from "react"
import {
  Globe,
  Tag,
  Monitor,
  Link2,
  ChevronDown,
  RefreshCw,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SendButton } from "../send-button"

type ReportKind = "link" | "hot"

// ── data ──────────────────────────────────────────────────────────────
const reportKinds = [
  { id: "link" as ReportKind, label: "链接生报告" },
  { id: "hot" as ReportKind, label: "热门品类报告" },
]

const categoryGroups = [
  {
    title: "美妆个护",
    items: ["护肤", "彩妆", "洗护"],
  },
  {
    title: "食品饮料",
    items: ["营养补剂", "咖啡饮品", "零食"],
  },
  {
    title: "服饰鞋包",
    items: ["运动服饰", "女装", "配饰"],
  },
]

const platformOptions = ["TikTok", "Meta", "YouTube", "Google Ads"]
const countryOptions = ["美国", "英国", "德国", "法国", "日本", "东南亚"]

// ── helpers ────────────────────────────────────────────────────────────
function formatSelection(selected: string[], label: string) {
  if (selected.length === 0) return label
  if (selected.length === 1) return selected[0]
  return `${selected[0]} +${selected.length - 1}`
}

// ── MultiCheckPill: grouped or flat multi-select popover ───────────────
interface MultiCheckPillProps {
  icon: React.ElementType
  label: string
  selected: string[]
  onChange: (v: string[]) => void
  groups?: { title: string; items: string[] }[]
  options?: string[]
  openKey: string
  currentOpen: string | null
  onOpenChange: (key: string | null) => void
}

function MultiCheckPill({
  icon: Icon,
  label,
  selected,
  onChange,
  groups,
  options,
  openKey,
  currentOpen,
  onOpenChange,
}: MultiCheckPillProps) {
  const open = currentOpen === openKey
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(null)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open, onOpenChange])

  function toggle(item: string) {
    onChange(
      selected.includes(item)
        ? selected.filter((s) => s !== item)
        : [...selected, item]
    )
  }

  const displayLabel = formatSelection(selected, label)
  const hasSelection = selected.length > 0

  const rows = groups
    ? groups.flatMap((g) => [{ type: "group" as const, title: g.title }, ...g.items.map((it) => ({ type: "item" as const, value: it }))])
    : (options ?? []).map((it) => ({ type: "item" as const, value: it }))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(open ? null : openKey)}
        className={cn(
          "h-[34px] border rounded-full px-[9px] flex items-center gap-1.5 text-[13px] font-[650] cursor-pointer whitespace-nowrap transition-colors",
          hasSelection
            ? "border-[#18181b] bg-[#f4f4f5] text-[#18181b]"
            : "border-transparent bg-white text-[#18181b] hover:bg-[var(--soft)]"
        )}
      >
        <Icon size={15} strokeWidth={2} />
        <span>{displayLabel}</span>
        <ChevronDown
          size={12}
          className={cn("text-[var(--muted)] -ml-0.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute bottom-[42px] left-0 z-30 w-[200px] border border-[var(--line)] rounded-[14px] bg-white shadow-[0_18px_42px_rgba(9,9,11,0.14)] overflow-hidden">
          <div className="max-h-[260px] overflow-y-auto p-1.5">
            {rows.map((row, i) =>
              row.type === "group" ? (
                <div
                  key={`g-${i}`}
                  className="px-[9px] pt-[10px] pb-[4px] text-[11px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide"
                >
                  {row.title}
                </div>
              ) : (
                <button
                  key={row.value}
                  type="button"
                  onClick={() => toggle(row.value)}
                  className="w-full h-[34px] rounded-[9px] flex items-center gap-2.5 px-[9px] text-[13px] text-[#18181b] cursor-pointer hover:bg-[var(--soft)] transition-colors"
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                      selected.includes(row.value)
                        ? "bg-[#18181b] border-[#18181b]"
                        : "border-[var(--line-strong)]"
                    )}
                  >
                    {selected.includes(row.value) && (
                      <Check size={10} strokeWidth={3} className="text-white" />
                    )}
                  </span>
                  <span className="font-[600]">{row.value}</span>
                </button>
              )
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-[var(--line)] px-3 py-2 flex justify-between items-center">
              <span className="text-[12px] text-[var(--muted)]">已选 {selected.length} 项</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[12px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                清空
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── KindPicker ─────────────────────────────────────────────────────────
function KindPicker({
  kind,
  onChange,
  openKey,
  currentOpen,
  onOpenChange,
}: {
  kind: ReportKind
  onChange: (k: ReportKind) => void
  openKey: string
  currentOpen: string | null
  onOpenChange: (key: string | null) => void
}) {
  const open = currentOpen === openKey
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(null)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [open, onOpenChange])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => onOpenChange(open ? null : openKey)}
        className="h-[34px] border border-transparent rounded-full bg-white text-[#18181b] px-[9px] flex items-center gap-1.5 text-[13px] font-[650] cursor-pointer hover:bg-[var(--soft)] whitespace-nowrap"
      >
        <Link2 size={15} strokeWidth={2} />
        <span>{reportKinds.find((k) => k.id === kind)?.label}</span>
        <ChevronDown
          size={12}
          className={cn("text-[var(--muted)] -ml-0.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="absolute bottom-[42px] left-0 z-30 w-[180px] border border-[var(--line)] rounded-[14px] bg-white p-1.5 shadow-[0_18px_42px_rgba(9,9,11,0.14)]">
          {reportKinds.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => { onChange(k.id); onOpenChange(null) }}
              className={cn(
                "w-full h-[34px] rounded-[9px] text-left px-[9px] flex items-center gap-2 text-[13px] font-[650] cursor-pointer",
                kind === k.id ? "bg-[var(--soft)]" : "hover:bg-[var(--soft)]"
              )}
            >
              {kind === k.id && <Check size={13} strokeWidth={2.5} className="text-[#18181b]" />}
              {kind !== k.id && <span className="w-[13px]" />}
              {k.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ReportMode (main) ──────────────────────────────────────────────────
export function ReportMode() {
  const [kind, setKind] = useState<ReportKind>("link")
  const [url, setUrl] = useState("")
  const [parsed, setParsed] = useState(false)
  const [parsing, setParsing] = useState(false)

  // multi-select state
  const [categories, setCategories] = useState<string[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [countries, setCountries] = useState<string[]>([])

  // single open popover key
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  const hasUrl = url.trim().length > 0
  const showConfig = parsed || kind === "hot"
  const canSubmit = kind === "hot"
    ? countries.length > 0 && categories.length > 0
    : parsed

  function handleParse() {
    if (!hasUrl || parsing) return
    setParsing(true)
    // simulate parse delay
    setTimeout(() => {
      setParsing(false)
      setParsed(true)
    }, 800)
  }

  function handleKindChange(k: ReportKind) {
    setKind(k)
    setParsed(false)
    setUrl("")
    setCategories([])
    setPlatforms([])
    setCountries([])
    setOpenPopover(null)
  }

  return (
    <>
      {/* Input area */}
      {kind === "link" ? (
        <input
          className="w-full border-0 outline-none text-[#24272f] text-[15px] leading-[1.5] bg-transparent placeholder:text-[var(--muted-2)]"
          placeholder="粘贴品牌官网、商品页或品类链接，自动生成创意素材洞察报告"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setParsed(false) }}
          aria-label="Link to report"
        />
      ) : (
        <div className="min-h-[44px] text-[15px] leading-[1.5] text-[var(--muted-2)]">
          选择国家地区和品类，直接生成热门品类创意报告
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between gap-3 mt-auto flex-wrap">
        {/* Left: kind + config pills (appear after parse) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <KindPicker
            kind={kind}
            onChange={handleKindChange}
            openKey="kind"
            currentOpen={openPopover}
            onOpenChange={setOpenPopover}
          />

          {showConfig && (
            <>
              <MultiCheckPill
                icon={Tag}
                label="行业品类"
                selected={categories}
                onChange={setCategories}
                groups={categoryGroups}
                openKey="category"
                currentOpen={openPopover}
                onOpenChange={setOpenPopover}
              />
              {kind === "link" && (
                <MultiCheckPill
                  icon={Monitor}
                  label="媒体平台"
                  selected={platforms}
                  onChange={setPlatforms}
                  options={platformOptions}
                  openKey="platform"
                  currentOpen={openPopover}
                  onOpenChange={setOpenPopover}
                />
              )}
              <MultiCheckPill
                icon={Globe}
                label="国家地区"
                selected={countries}
                onChange={setCountries}
                options={countryOptions}
                openKey="country"
                currentOpen={openPopover}
                onOpenChange={setOpenPopover}
              />
            </>
          )}
        </div>

        {/* Right: parse button + send */}
        <div className="flex items-center gap-2 shrink-0">
          {kind === "link" && (
            <button
              type="button"
              onClick={handleParse}
              disabled={!hasUrl || parsing}
              className={cn(
                "h-[34px] rounded-full px-3 flex items-center gap-1.5 text-[13px] font-[650] border transition-colors whitespace-nowrap",
                hasUrl && !parsing
                  ? "border-[var(--line-strong)] bg-white text-[#18181b] cursor-pointer hover:bg-[var(--soft)]"
                  : "border-[var(--line)] bg-transparent text-[var(--muted-2)] cursor-not-allowed"
              )}
            >
              <RefreshCw
                size={13}
                strokeWidth={2.5}
                className={cn(parsing && "animate-spin")}
              />
              <span>{parsing ? "解析中..." : "解析链接"}</span>
            </button>
          )}
          <SendButton disabled={!canSubmit} />
        </div>
      </div>
    </>
  )
}
