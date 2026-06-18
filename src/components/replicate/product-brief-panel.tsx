"use client"

import { useMemo, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Folder,
  Link2,
  Loader2,
  Package,
  Plus,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ProductBrief } from "@/lib/insights/types"
import { AssetLibraryModal } from "./asset-library-modal"

interface Props {
  brief: Partial<ProductBrief>
  onChange: (next: Partial<ProductBrief>) => void
}

// 国家选项（带旗帜）
const COUNTRIES: { code: string; flag: string; name: string }[] = [
  { code: "US", flag: "🇺🇸", name: "美国" },
  { code: "CA", flag: "🇨🇦", name: "加拿大" },
  { code: "MX", flag: "🇲🇽", name: "墨西哥" },
  { code: "UK", flag: "🇬🇧", name: "英国" },
  { code: "DE", flag: "🇩🇪", name: "德国" },
  { code: "FR", flag: "🇫🇷", name: "法国" },
  { code: "ES", flag: "🇪🇸", name: "西班牙" },
  { code: "JP", flag: "🇯🇵", name: "日本" },
  { code: "SG", flag: "🇸🇬", name: "新加坡" },
  { code: "TH", flag: "🇹🇭", name: "泰国" },
  { code: "BR", flag: "🇧🇷", name: "巴西" },
  { code: "AU", flag: "🇦🇺", name: "澳大利亚" },
]

// 主卖点预设（按用户图）
const MAIN_SP_PRESETS: { title: string; desc: string }[] = [
  { title: "经典复古做旧质感",   desc: "边缘带有仿锈迹的复古设计，赋予产品独特的工业风和农舍风艺术感，能完美融入多种家装风格。" },
  { title: "幽默风趣的警示设计", desc: "独特的标语配合生动的插图，能瞬间提升空间趣味性，缓解尴尬气氛，极具社交传播属性。" },
  { title: "坚固耐用的铝制材质", desc: "采用优质铝材制作，具有良好的韧性和防变形能力，且防水防锈，非常适合长期使用。" },
]

// 次卖点预设候选
const SECONDARY_SP_PRESETS = [
  "安全圆角保护设计",
  "多场景适用装饰品",
  "完美的创意礼品选择",
  "易于安装挂墙",
  "防潮防霉",
  "环保印刷工艺",
]

const MAX_IMAGES = 3
const MAX_SECONDARY_SP = 2

export function ProductBriefPanel({ brief, onChange }: Props) {
  const [linkUrl, setLinkUrl] = useState(brief.url ?? "")
  const [analyzing, setAnalyzing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // 派生：商品图片列表
  const images = useMemo(() => {
    const arr: string[] = []
    if (brief.image) arr.push(brief.image)
    return arr
  }, [brief.image])

  function handleRecognize() {
    if (!linkUrl.trim() || analyzing) return
    setAnalyzing(true)
    onChange({ ...brief, url: linkUrl, sellingPointMode: "link_ai_analysis" })
    window.setTimeout(() => {
      onChange({
        ...brief,
        url: linkUrl,
        image: brief.image || "https://picsum.photos/seed/bathroom_sign/240/240",
        name: brief.name || "Funny Bathroom Wall Decor Metal Sign Vintage This Is A Bathroom Not An Internet Cafe",
        category: brief.category || "家居装饰 / 墙面装饰",
        sellingPoints: brief.sellingPoints && brief.sellingPoints.length > 0
          ? brief.sellingPoints
          : ["幽默风趣的警示设计"],
        sellingPointMode: "link_ai_analysis",
        audience: brief.audience || "追求趣味生活的家居装修者",
        scenes: brief.scenes && brief.scenes.length > 0 ? brief.scenes : ["浴室", "厨房", "卫生间"],
        forbidden: brief.forbidden && brief.forbidden.length > 0 ? brief.forbidden : ["医疗承诺", "竞品对比"],
      })
      setAnalyzing(false)
      setExpanded(true)
    }, 1000)
  }

  return (
    <aside className="rounded-2xl border border-[var(--line)] bg-white p-4 space-y-3 sticky top-3 self-start max-h-[calc(100vh-180px)] overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Package size={16} className="text-[var(--text)]" />
          <h3 className="text-[15.5px] font-extrabold text-[var(--text)]">你的商品</h3>
        </div>
        <p className="text-[11.5px] text-[var(--muted)]">补充商品信息可提升分镜匹配度</p>
      </div>

      {/* 商品链接 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[11.5px] font-bold text-[var(--text)] flex items-center gap-1">
            <Link2 size={11} className="text-[var(--muted)]" />
            商品链接
          </p>
          <button
            type="button"
            onClick={() => setLinkUrl("https://shop.tiktok.com/@homedeco/product/funny-bathroom-wall-decor-metal-sign-vintage-1734567890123")}
            title="点击试用示例链接（再点「识别」自动填入下方所有信息）"
            className="text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer underline decoration-dotted underline-offset-2"
          >
            示例
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="粘贴商品链接"
            className="flex-1 h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[var(--line-strong)]"
          />
          <button
            type="button"
            onClick={handleRecognize}
            disabled={!linkUrl.trim() || analyzing}
            className={cn(
              "h-9 px-3 rounded-lg text-[12px] font-extrabold flex items-center gap-1 transition-opacity shrink-0",
              !linkUrl.trim() || analyzing
                ? "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
                : "bg-[var(--near-black)] text-white cursor-pointer hover:opacity-90"
            )}
          >
            {analyzing && <Loader2 size={11} className="animate-spin" />}
            识别
          </button>
        </div>
        <p className="text-[10.5px] text-[var(--muted-2)]">粘贴后将自动识别；也可以点击「识别」。</p>
      </div>

      {/* 手动填写折叠开关 — 左右 horizontal divider 居中 */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 text-[12px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer group"
      >
        <span className="flex-1 h-px bg-[var(--line)]" />
        <span className="flex items-center gap-1 whitespace-nowrap">
          {expanded ? "收起" : "手动填写"}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
        <span className="flex-1 h-px bg-[var(--line)]" />
      </button>

      {/* 展开后内容 */}
      {expanded && (
        <div className="space-y-3.5">
          {/* 商品图片 */}
          <ImageSection
            images={images}
            onSetMain={(url) => onChange({ ...brief, image: url })}
            onClear={() => onChange({ ...brief, image: undefined })}
            onAnalyze={handleRecognize}
            analyzing={analyzing}
          />

          {/* 商品名称 */}
          <Field
            label="商品名称"
            value={brief.name ?? ""}
            onChange={(v) => onChange({ ...brief, name: v })}
            placeholder="例：Hotligh 1200LM..."
          />

          {/* 目标人群 + 目标市场 */}
          <div className="grid grid-cols-2 gap-2.5">
            <Field
              label="目标人群"
              value={brief.audience ?? ""}
              onChange={(v) => onChange({ ...brief, audience: v })}
              placeholder="例：户外通勤"
            />
            <div>
              <p className="text-[11px] font-bold text-[var(--text)] mb-1.5">目标市场</p>
              <CountryPicker
                value={brief.category ?? "US"}
                onChange={(code) => onChange({ ...brief, category: code })}
              />
            </div>
          </div>

          {/* 主卖点（1 个） */}
          <MainSellingPointPicker
            value={brief.sellingPoints?.[0] ?? ""}
            customDesc={brief.price ?? ""}
            onChange={(value, customDesc) => {
              onChange({
                ...brief,
                sellingPoints: value ? [value, ...(brief.sellingPoints ?? []).slice(1)] : (brief.sellingPoints ?? []).slice(1),
                price: customDesc,
              })
            }}
          />

          {/* 次卖点（最多 2 个） */}
          <SecondarySellingPointTags
            selected={brief.scenes ?? []}
            onChange={(arr) => onChange({ ...brief, scenes: arr })}
          />
        </div>
      )}
    </aside>
  )
}

// ─── Image section ──────────────────────────────────────────────────────────

function ImageSection({
  images,
  onSetMain,
  onClear,
  onAnalyze,
  analyzing,
}: {
  images: string[]
  onSetMain: (url: string) => void
  onClear: () => void
  onAnalyze: () => void
  analyzing: boolean
}) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const slots = Array.from({ length: MAX_IMAGES }, (_, i) => images[i] ?? null)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11.5px] font-bold text-[var(--text)] flex items-center gap-1">
          <Folder size={11} className="text-[var(--muted)]" />
          商品图片
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10.5px] font-extrabold text-[#1a2010] border border-[#cdf066]"
            style={{
              backgroundColor: "var(--lime)",
              opacity: analyzing ? 0.6 : 1,
              cursor: analyzing ? "not-allowed" : "pointer",
            }}
          >
            <Sparkles size={9} strokeWidth={2.6} />
            一键分析商品
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-[10.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            清空
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {slots.map((url, i) => {
          if (url) {
            return (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--soft)] border border-[var(--line)] group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={onClear}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/55 text-white flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={9} strokeWidth={3} />
                </button>
              </div>
            )
          }
          // 后两个空 slot 分别是 "本地上传" / "资产库"
          if (i === slots.length - 2) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSetMain("https://picsum.photos/seed/uploaded_" + i + "/240/240")}
                className="aspect-square rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:bg-[var(--soft)]"
              >
                <Upload size={14} className="text-[var(--muted)]" />
                <span className="text-[9.5px] font-bold text-[var(--muted)]">本地上传</span>
              </button>
            )
          }
          if (i === slots.length - 1) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => setLibraryOpen(true)}
                className="aspect-square rounded-lg border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:bg-[var(--soft)]"
              >
                <Folder size={14} className="text-[var(--muted)]" />
                <span className="text-[9.5px] font-bold text-[var(--muted)]">资产库</span>
              </button>
            )
          }
          // 中间空 slot
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSetMain("https://picsum.photos/seed/slot_" + i + "/240/240")}
              className="aspect-square rounded-lg border border-dashed border-[var(--line)] bg-[var(--soft-2)] flex items-center justify-center cursor-pointer hover:bg-[var(--soft)]"
            >
              <Plus size={14} className="text-[var(--muted-2)]" />
            </button>
          )
        })}
      </div>
      <p className="text-[10.5px] text-[var(--muted-2)] mt-1.5">最多 {MAX_IMAGES} 张；可点击或拖拽到上传方块</p>

      {/* 资产库弹框 */}
      <AssetLibraryModal
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        maxSelect={1}
        onConfirm={(urls) => { if (urls[0]) onSetMain(urls[0]) }}
        onLocalUpload={() => "https://picsum.photos/seed/lib_upload_" + Date.now() + "/240/240"}
      />
    </div>
  )
}

// ─── Country picker ─────────────────────────────────────────────────────────

function CountryPicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [query, setQuery] = useState("")
  const current = COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[0]

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTRIES
    const q = query.toLowerCase()
    return COUNTRIES.filter((c) => c.name.includes(query) || c.code.toLowerCase().includes(q))
  }, [query])

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="w-full h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] font-bold text-[var(--text)] flex items-center justify-between cursor-pointer hover:border-[var(--line-strong)]"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-[15px] leading-none">{current.flag}</span>
            <span>{current.name}</span>
          </span>
          <ChevronDown size={11} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[60] w-[200px] bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)] overflow-hidden"
        >
          <div className="p-2 border-b border-[var(--line)]">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索国家..."
                className="w-full h-8 pl-7 pr-2 rounded-md bg-[var(--soft-2)] border border-[var(--line)] text-[11.5px] outline-none"
              />
            </div>
          </div>
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filtered.map((c) => {
              const active = c.code === value
              return (
                <Popover.Close key={c.code} asChild>
                  <button
                    type="button"
                    onClick={() => onChange(c.code)}
                    className={cn(
                      "w-full px-3 py-1.5 text-left flex items-center gap-2 cursor-pointer transition-colors",
                      active ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                    )}
                  >
                    {active ? <Check size={11} strokeWidth={2.6} className="text-[var(--text)]" /> : <span className="w-[11px]" />}
                    <span className="text-[15px] leading-none">{c.flag}</span>
                    <span className="text-[12.5px] font-semibold text-[var(--text)]">{c.name}</span>
                  </button>
                </Popover.Close>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── Main selling point picker ──────────────────────────────────────────────

function MainSellingPointPicker({
  value,
  customDesc,
  onChange,
}: {
  value: string
  customDesc: string
  onChange: (value: string, customDesc: string) => void
}) {
  const isCustom = value && !MAIN_SP_PRESETS.some((p) => p.title === value)
  const currentPreset = MAIN_SP_PRESETS.find((p) => p.title === value)

  return (
    <div>
      <p className="text-[11px] font-bold text-[var(--text)] mb-1.5">主卖点（1 个）</p>

      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="w-full rounded-lg border border-[var(--line)] bg-white p-2.5 text-left cursor-pointer hover:border-[var(--line-strong)]"
          >
            {value ? (
              <div>
                <p className="text-[12.5px] font-extrabold text-[var(--text)]">{value}</p>
                {currentPreset && (
                  <p className="text-[10.5px] text-[var(--muted)] mt-0.5 line-clamp-2 leading-relaxed">{currentPreset.desc}</p>
                )}
                {isCustom && customDesc && (
                  <p className="text-[10.5px] text-[var(--muted)] mt-0.5 line-clamp-2 leading-relaxed">{customDesc}</p>
                )}
              </div>
            ) : (
              <p className="text-[12px] text-[var(--muted-2)]">选择或自定义一个主卖点</p>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-[60] w-[var(--radix-popover-trigger-width)] bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)] p-1.5 max-h-[280px] overflow-y-auto"
          >
            {MAIN_SP_PRESETS.map((p) => {
              const selected = p.title === value
              return (
                <Popover.Close key={p.title} asChild>
                  <button
                    type="button"
                    onClick={() => onChange(p.title, "")}
                    className={cn(
                      "w-full px-2.5 py-2 rounded-lg text-left cursor-pointer transition-colors flex items-start gap-2",
                      selected ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                    )}
                  >
                    <span className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-extrabold text-[var(--text)]">{p.title}</p>
                      <p className="text-[10.5px] text-[var(--muted)] mt-0.5 leading-relaxed">{p.desc}</p>
                    </span>
                    {selected && <Check size={12} strokeWidth={2.6} className="text-[var(--text)] mt-1 shrink-0" />}
                  </button>
                </Popover.Close>
              )
            })}
            <button
              type="button"
              onClick={() => onChange(customDesc || "自定义卖点", customDesc)}
              className={cn(
                "w-full px-2.5 py-2 rounded-lg text-left cursor-pointer transition-colors flex items-center gap-2",
                isCustom ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
              )}
            >
              <Plus size={11} className="text-[var(--muted)]" />
              <span className="text-[12.5px] font-bold text-[var(--text)]">自定义</span>
              {isCustom && <Check size={11} strokeWidth={2.6} className="text-[var(--text)] ml-auto" />}
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* 自定义输入区 */}
      {isCustom && (
        <textarea
          value={customDesc}
          onChange={(e) => onChange(value || "自定义卖点", e.target.value)}
          placeholder="写一句话描述这个卖点..."
          rows={2}
          className="w-full mt-1.5 rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-[11.5px] outline-none resize-none focus:border-[var(--line-strong)]"
        />
      )}
    </div>
  )
}

// ─── Secondary selling point tags ───────────────────────────────────────────

function SecondarySellingPointTags({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (arr: string[]) => void
}) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customInput, setCustomInput] = useState("")

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      if (selected.length >= MAX_SECONDARY_SP) return
      onChange([...selected, tag])
    }
  }

  function addCustom() {
    const v = customInput.trim()
    if (!v) return
    if (selected.includes(v)) {
      setCustomInput("")
      return
    }
    if (selected.length >= MAX_SECONDARY_SP) return
    onChange([...selected, v])
    setCustomInput("")
    setShowCustomInput(false)
  }

  const reachedMax = selected.length >= MAX_SECONDARY_SP

  return (
    <div>
      <p className="text-[11px] font-bold text-[var(--text)] mb-1.5">次卖点（最多 {MAX_SECONDARY_SP} 个）</p>

      {/* 预设候选 + "+ 自定义" 按钮 */}
      <div className="flex flex-wrap gap-1 mb-2">
        {SECONDARY_SP_PRESETS.map((tag) => {
          const isSelected = selected.includes(tag)
          const disabled = !isSelected && reachedMax
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              disabled={disabled}
              className={cn(
                "h-6 px-2 rounded-md text-[10.5px] font-bold border transition-colors",
                isSelected
                  ? "bg-[#fff7ed] border-[#fed7aa] text-[#9a3412] cursor-pointer"
                  : disabled
                    ? "bg-[var(--soft-2)] border-[var(--line)] text-[var(--muted-2)] cursor-not-allowed"
                    : "bg-white border-[var(--line)] text-[var(--muted)] cursor-pointer hover:bg-[var(--soft-2)]"
              )}
            >
              {tag}
            </button>
          )
        })}
        {/* + 自定义 触发按钮 */}
        <button
          type="button"
          onClick={() => setShowCustomInput((v) => !v)}
          disabled={reachedMax && !showCustomInput}
          className={cn(
            "h-6 px-2 rounded-md text-[10.5px] font-bold border transition-colors flex items-center gap-0.5",
            showCustomInput
              ? "bg-[var(--near-black)] border-[var(--near-black)] text-white cursor-pointer"
              : reachedMax
                ? "bg-[var(--soft-2)] border-[var(--line)] text-[var(--muted-2)] cursor-not-allowed"
                : "bg-white border-[var(--line)] text-[var(--muted)] cursor-pointer hover:bg-[var(--soft-2)]"
          )}
        >
          <Plus size={9} strokeWidth={2.6} />
          自定义
        </button>
      </div>

      {/* 已选 chip 区 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-[var(--soft)] border border-[var(--line-strong)] text-[10.5px] font-bold text-[var(--text)]"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggle(tag)}
                className="hover:text-[#dc2626] cursor-pointer"
              >
                <X size={9} strokeWidth={2.6} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 自定义输入框（点"+ 自定义"按钮后才显示） */}
      {showCustomInput && !reachedMax && (
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addCustom()
              } else if (e.key === "Escape") {
                setShowCustomInput(false)
                setCustomInput("")
              }
            }}
            placeholder="输入自定义次卖点"
            className="flex-1 h-8 px-2 rounded-md border border-[var(--line)] bg-white text-[11.5px] outline-none focus:border-[var(--line-strong)]"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className={cn(
              "h-8 px-2.5 rounded-md text-[10.5px] font-extrabold transition-opacity flex items-center gap-1",
              customInput.trim()
                ? "bg-[var(--near-black)] text-white cursor-pointer hover:opacity-90"
                : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
            )}
          >
            <Plus size={10} strokeWidth={2.6} />
            添加
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Field helper ───────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-[var(--text)] mb-1.5">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[var(--line-strong)]"
      />
    </div>
  )
}
