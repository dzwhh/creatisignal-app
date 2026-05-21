"use client"

import { useState, useRef, useEffect } from "react"
import { Topbar } from "@/components/layout/topbar"
import { cn } from "@/lib/utils"
import { FileText, ChevronDown, Search, X } from "lucide-react"

// ─── Data ───────────────────────────────────────────────────────────────────

const TABS = ["热门电商洞察", "热门赛道洞察"]

const CATEGORIES = [
  { group: "美妆个护", items: ["美妆", "个护"] },
  { group: "女装", items: ["女士连衣裙", "女士内衣", "女士套装与连体衣", "女士睡衣和家居服"] },
  { group: "手机数码", items: ["摄影摄像", "影音设备", "智能穿戴", "手机平板", "游戏设备"] },
  { group: "家电", items: ["大家电", "生活家电", "厨房家电"] },
  { group: "其他行业", items: ["时尚配件", "食品饮料", "宠物用品", "运动与户外", "保健品"] },
]

const PLATFORMS = [
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
]

const REGIONS = [
  { area: "北美", items: ["美国", "加拿大", "墨西哥"] },
  { area: "东亚", items: ["日本", "韩国"] },
  { area: "东南亚", items: ["泰国", "印尼", "新加坡", "马来西亚", "越南", "菲律宾"] },
  {
    area: "欧洲",
    items: ["英国", "德国", "法国", "意大利", "西班牙", "荷兰", "挪威", "波兰", "葡萄牙", "比利时", "瑞士", "奥地利", "瑞典", "丹麦", "土耳其"],
  },
  { area: "中东", items: ["阿联酋", "沙特阿拉伯", "卡塔尔", "科威特", "以色列"] },
]

const COUNTRIES = [
  "美国 (US)", "加拿大", "墨西哥", "日本", "韩国",
  "泰国", "印尼", "新加坡", "马来西亚", "越南", "菲律宾",
  "英国", "德国", "法国", "意大利", "西班牙", "荷兰", "挪威",
  "波兰", "葡萄牙", "比利时", "瑞士", "奥地利", "瑞典", "丹麦", "土耳其",
  "阿联酋", "沙特阿拉伯", "卡塔尔", "科威特", "以色列",
]

const TRACK_CATEGORIES = [
  "IT服务", "美妆", "个护", "女士连衣裙", "女士内衣", "女士套装与连体衣",
  "摄影摄像", "影音设备", "智能穿戴", "手机平板", "游戏设备",
  "大家电", "生活家电", "厨房家电",
  "时尚配件", "食品饮料", "宠物用品", "运动与户外", "保健品",
]

const MAX_CATEGORIES = 3

// ─── Shared sub-components ───────────────────────────────────────────────────

function Checkbox({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: () => void
  label: string
  disabled?: boolean
}) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm cursor-pointer select-none",
        disabled && !checked ? "opacity-40 cursor-not-allowed" : "text-[var(--text)]"
      )}
    >
      <span
        onClick={disabled && !checked ? undefined : onChange}
        className={cn(
          "w-[15px] h-[15px] rounded-[3px] border flex items-center justify-center shrink-0 transition-colors",
          checked ? "bg-[#18181b] border-[#18181b]" : "bg-white border-[var(--line-strong)]",
          disabled && !checked ? "pointer-events-none" : "cursor-pointer"
        )}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span onClick={disabled && !checked ? undefined : onChange}>{label}</span>
    </label>
  )
}

function SectionCard({ title, hint, children }: { title: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[var(--line)] rounded-xl px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-[var(--text)]">{title}</h3>
        {hint}
      </div>
      {children}
    </div>
  )
}

// ─── Multi-select dropdown ───────────────────────────────────────────────────

function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onChange: (val: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
  const selectedArr = Array.from(selected)

  return (
    <div className="flex flex-col gap-1.5" ref={ref}>
      <span className="text-[12px] font-medium text-[var(--muted)]">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-[200px] h-9 border border-[var(--line-strong)] rounded-lg bg-white px-3 flex items-center justify-between text-[13px] text-[var(--text)] hover:border-[#18181b] transition-colors"
        >
          <span className="truncate text-left flex-1">
            {selectedArr.length === 0
              ? <span className="text-[var(--muted-2)]">{placeholder}</span>
              : selectedArr.length === 1
              ? selectedArr[0]
              : `已选 ${selectedArr.length} 项`}
          </span>
          <ChevronDown
            size={14}
            className={cn("text-[var(--muted)] shrink-0 ml-1 transition-transform", open && "rotate-180")}
          />
        </button>

        {open && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-[220px] bg-white border border-[var(--line)] rounded-xl shadow-[var(--shadow-sm)] z-50 overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--line)]">
              <Search size={13} className="text-[var(--muted-2)] shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索..."
                className="flex-1 text-[13px] outline-none placeholder:text-[var(--muted-2)] bg-transparent"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")}>
                  <X size={12} className="text-[var(--muted-2)]" />
                </button>
              )}
            </div>

            {/* Options */}
            <div className="max-h-[220px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-3 text-[12px] text-[var(--muted-2)] text-center">无结果</div>
              ) : (
                filtered.map((opt) => {
                  const isChecked = selected.has(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChange(opt)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text)] hover:bg-[var(--soft)] transition-colors text-left"
                    >
                      <span
                        className={cn(
                          "w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center shrink-0",
                          isChecked ? "bg-[#18181b] border-[#18181b]" : "bg-white border-[var(--line-strong)]"
                        )}
                      >
                        {isChecked && (
                          <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {opt}
                    </button>
                  )
                })
              )}
            </div>

            {/* Selected tags */}
            {selected.size > 0 && (
              <div className="border-t border-[var(--line)] px-3 py-2 flex flex-wrap gap-1">
                {selectedArr.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 bg-[var(--soft)] text-[11px] text-[var(--text)] px-2 py-0.5 rounded-md"
                  >
                    {s}
                    <button type="button" onClick={() => onChange(s)} className="text-[var(--muted-2)] hover:text-[var(--text)]">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Tab contents ────────────────────────────────────────────────────────────

function EcommerceTab() {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set(["tiktok"]))
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())

  const toggleCategory = (item: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else if (next.size < MAX_CATEGORIES) next.add(item)
      return next
    })
  }

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { if (next.size > 1) next.delete(id) }
      else next.add(id)
      return next
    })
  }

  const toggleRegion = (item: string) => {
    setSelectedRegions((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  const toggleAllInArea = (items: string[]) => {
    const allSelected = items.every((i) => selectedRegions.has(i))
    setSelectedRegions((prev) => {
      const next = new Set(prev)
      if (allSelected) items.forEach((i) => next.delete(i))
      else items.forEach((i) => next.add(i))
      return next
    })
  }

  const canSubmit = selectedCategories.size > 0 && selectedPlatforms.size > 0

  return (
    <div className="flex gap-4">
      {/* Left form */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* 选择品类 */}
        <SectionCard
          title={`选择品类（最多 ${MAX_CATEGORIES} 个）`}
          hint={
            <a href="#" className="text-[12px] text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 transition-colors">
              · 有官网？智能识别品类
            </a>
          }
        >
          <div className="flex flex-col divide-y divide-[var(--line)]">
            {CATEGORIES.map(({ group, items }) => (
              <div key={group} className="py-3 first:pt-0 last:pb-0">
                <div className="text-[12px] font-medium text-[var(--muted)] mb-2.5">{group}</div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {items.map((item) => (
                    <Checkbox
                      key={item}
                      label={item}
                      checked={selectedCategories.has(item)}
                      onChange={() => toggleCategory(item)}
                      disabled={selectedCategories.size >= MAX_CATEGORIES && !selectedCategories.has(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 选择平台 */}
        <SectionCard title="选择平台">
          <div className="flex items-center gap-2 mb-2.5">
            {PLATFORMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => togglePlatform(id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md border text-[13px] font-medium transition-colors",
                  selectedPlatforms.has(id)
                    ? "bg-[#f4f4f5] border-[#18181b] text-[#18181b]"
                    : "bg-white border-[var(--line-strong)] text-[var(--muted)]"
                )}
              >
                <span
                  className={cn(
                    "w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center shrink-0 transition-colors",
                    selectedPlatforms.has(id) ? "bg-[#18181b] border-[#18181b]" : "bg-white border-[var(--line-strong)]"
                  )}
                >
                  {selectedPlatforms.has(id) && (
                    <svg width="8" height="6" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {label}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-[var(--muted-2)]">
            至少选择一个平台：Facebook 数据以曝光人数排序
          </p>
        </SectionCard>

        {/* 选择区域 */}
        <SectionCard title="选择区域">
          <div className="flex flex-col gap-3">
            {REGIONS.map(({ area, items }) => {
              const allSelected = items.every((i) => selectedRegions.has(i))
              return (
                <div key={area} className="flex items-start gap-3">
                  <div className="flex items-center gap-1.5 w-[64px] shrink-0 pt-[1px]">
                    <span className="text-[12px] text-[var(--muted)] whitespace-nowrap">{area}</span>
                    <button
                      type="button"
                      onClick={() => toggleAllInArea(items)}
                      className="text-[12px] text-[var(--text)] font-medium hover:underline whitespace-nowrap"
                    >
                      {allSelected ? "取消" : "全选"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {items.map((item) => (
                      <Checkbox
                        key={item}
                        label={item}
                        checked={selectedRegions.has(item)}
                        onChange={() => toggleRegion(item)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

        {/* Submit */}
        <button
          type="button"
          disabled={!canSubmit}
          className={cn(
            "w-full h-11 rounded-xl text-[14px] font-semibold transition-colors",
            canSubmit
              ? "bg-[#18181b] text-white hover:bg-[#333] cursor-pointer"
              : "bg-[#d4d4d8] text-white cursor-not-allowed"
          )}
        >
          提交申请
        </button>
      </div>

      {/* Right: history */}
      <div className="w-[220px] shrink-0">
        <div className="bg-white border border-[var(--line)] rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[var(--text)] mb-4">历史报告</h3>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FileText size={28} className="text-[var(--muted-2)] mb-2.5" strokeWidth={1.5} />
            <p className="text-[12px] text-[var(--muted-2)]">暂无历史报告</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrackTab() {
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set())
  const [selectedTrackCategories, setSelectedTrackCategories] = useState<Set<string>>(new Set())

  const toggleCountry = (val: string) => {
    setSelectedCountries((prev) => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return next
    })
  }

  const toggleTrackCategory = (val: string) => {
    setSelectedTrackCategories((prev) => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return next
    })
  }

  const canSubmit = selectedCountries.size > 0 && selectedTrackCategories.size > 0

  return (
    <div className="max-w-[640px]">
      <h2 className="text-[20px] font-bold text-[var(--text)] mb-6">赛道洞察</h2>

      {/* Filters row */}
      <div className="flex items-end gap-3 mb-8">
        <MultiSelect
          label="国家"
          options={COUNTRIES}
          selected={selectedCountries}
          onChange={toggleCountry}
          placeholder="选择国家"
        />
        <MultiSelect
          label="品类"
          options={TRACK_CATEGORIES}
          selected={selectedTrackCategories}
          onChange={toggleTrackCategory}
          placeholder="选择品类"
        />
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => {}}
          className={cn(
            "h-9 px-5 rounded-lg text-[13px] font-semibold transition-colors mb-[1px]",
            canSubmit
              ? "bg-[#18181b] text-white hover:bg-[#333] cursor-pointer"
              : "bg-[#d4d4d8] text-white cursor-not-allowed"
          )}
        >
          生成报告
        </button>
      </div>

      {/* History */}
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--text)] mb-4">历史报告</h3>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={30} className="text-[var(--muted-2)] mb-2.5" strokeWidth={1.5} />
          <p className="text-[13px] text-[var(--muted-2)]">暂无历史报告</p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Page() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      <Topbar title="报告制作" />
      <main className="flex-1 overflow-y-auto bg-[var(--panel)]">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-0">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                activeTab === i
                  ? "bg-white border border-[var(--line)] text-[var(--text)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-8">
          {activeTab === 0 ? <EcommerceTab /> : <TrackTab />}
        </div>
      </main>
    </>
  )
}
