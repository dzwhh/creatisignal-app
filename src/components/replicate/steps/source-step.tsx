"use client"

import { useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Popover from "@radix-ui/react-popover"
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  Flame,
  Search,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
} from "lucide-react"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { cn } from "@/lib/utils"
import {
  LIFECYCLE_META,
  MATERIAL_SOURCE_META,
  type Material,
  type MaterialSource,
  type ProductBrief,
} from "@/lib/insights/types"
import { MATERIALS } from "@/lib/insights/mock"
import { ProductBriefPanel } from "../product-brief-panel"

interface Props {
  source: MaterialSource | null
  onSourceChange: (s: MaterialSource) => void
  selectedMaterialId: string | null
  onSelectMaterial: (fp: string) => void
  uploadedFileName: string | null
  onUploadFile: (name: string) => void
  productBrief: Partial<ProductBrief>
  onProductBriefChange: (next: Partial<ProductBrief>) => void
}

const SOURCE_TABS: MaterialSource[] = ["market_hot", "competitor_hot", "owned_hot", "local_upload"]

// 筛选项预设（shadcn 风格下拉）
const FILTER_OPTIONS: Record<string, string[]> = {
  平台:     ["TikTok", "Meta", "YouTube", "Snap"],
  广告产品: ["GMV Max", "Manual Ads", "Live Shopping"],
  国家:     ["US", "UK", "DE", "JP", "SG", "MX", "BR", "AU"],
  行业品类: ["工具户外", "家居装饰", "美妆个护", "3C 数码", "服饰配饰", "运动健身"],
}

// 推荐指数 = rating 加权 + 生命周期 bonus
function recommendIndex(m: Material): number {
  const phaseBonus = m.lifecyclePhase === "peak" ? 14
    : m.lifecyclePhase === "scaling" ? 8
    : m.lifecyclePhase === "potential" ? 4
    : m.lifecyclePhase === "declining" ? -6
    : -10
  return Math.max(45, Math.min(99, Math.round(m.rating * 0.85 + phaseBonus + 12)))
}

export function SourceStep({
  source,
  onSourceChange,
  selectedMaterialId,
  onSelectMaterial,
  uploadedFileName,
  onUploadFile,
  productBrief,
  onProductBriefChange,
}: Props) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({
    平台: "TikTok",
    广告产品: "GMV Max",
    国家: "US",
    行业品类: "工具户外",
  })
  const [drawerMaterial, setDrawerMaterial] = useState<Material | null>(null)
  const [matching, setMatching] = useState(false)
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())

  const productReady = Boolean(productBrief.name && productBrief.sellingPoints?.length)

  const materials = useMemo(() => {
    let list: Material[]
    if (source === "competitor_hot") list = MATERIALS.filter((m) => m.bucket === "potential").slice(0, 12)
    else if (source === "owned_hot") list = MATERIALS.filter((m) => m.bucket === "core").slice(0, 12)
    else list = MATERIALS.slice(0, 12)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.sceneTags.some((t) => t.includes(q)))
    }
    // 智能匹配完成后，仅保留匹配命中的素材
    if (matchedIds.size > 0) {
      list = list.filter((m) => matchedIds.has(m.fingerprint))
    }
    return list
  }, [source, query, matchedIds])

  function handleSmartMatch() {
    if (!productReady || matching) return
    setMatching(true)
    setMatchedIds(new Set())
    window.setTimeout(() => {
      // 取推荐指数 top 4 作为匹配结果
      const top = [...materials].sort((a, b) => recommendIndex(b) - recommendIndex(a)).slice(0, 4)
      setMatchedIds(new Set(top.map((m) => m.fingerprint)))
      setMatching(false)
    }, 900)
  }

  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      {/* 左：来源 + 素材选择 */}
      <main className="space-y-4">
        <div>
          <h2 className="text-[19px] font-extrabold text-[var(--text)] mb-1">这次要复刻哪类素材？</h2>
          <p className="text-[12.5px] text-[var(--muted)]">选个来源，再选一条素材作为复刻骨架</p>
        </div>

        {/* 4 来源 Tab */}
        <div className="grid grid-cols-4 gap-2">
          {SOURCE_TABS.map((s) => {
            const meta = MATERIAL_SOURCE_META[s]
            const active = source === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSourceChange(s)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all cursor-pointer",
                  active
                    ? "border-[var(--near-black)] bg-white shadow-[0_4px_16px_rgba(9,9,11,0.08)]"
                    : "border-[var(--line)] bg-white hover:border-[var(--line-strong)]"
                )}
              >
                <span
                  className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-extrabold mb-1.5"
                  style={{ backgroundColor: meta.dot + "15", color: meta.dot }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
                  {meta.short}
                </span>
                <p className="text-[12.5px] font-extrabold text-[var(--text)] leading-snug">{meta.label}</p>
                <p className="text-[10.5px] text-[var(--muted)] mt-0.5 line-clamp-2">{meta.desc}</p>
              </button>
            )
          })}
        </div>


        {/* 筛选 + 搜索 */}
        {source !== "local_upload" ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(FILTER_OPTIONS).map(([label, options]) => (
                <FilterDropdown
                  key={label}
                  label={label}
                  options={options}
                  value={filters[label]}
                  onChange={(v) => setFilters((f) => ({ ...f, [label]: v }))}
                />
              ))}
              <div className="flex-1 min-w-[200px] relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="关键词 / 商品链接 / 自然语言 / 以图搜图"
                  className="w-full h-9 pl-7 pr-3 rounded-full border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[var(--line-strong)]"
                />
              </div>
            </div>

            {/* 智能匹配结果提示 */}
            {matchedIds.size > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-[#ddd6fe] bg-[#f5f3ff] px-3 py-2">
                <p className="text-[11.5px] text-[#6d28d9] font-bold flex items-center gap-1.5">
                  <Sparkles size={11} strokeWidth={2.6} />
                  AI 匹配出 {matchedIds.size} 条素材
                </p>
                <button
                  type="button"
                  onClick={() => setMatchedIds(new Set())}
                  className="text-[11px] font-bold text-[#6d28d9] hover:text-[#4c1d95] cursor-pointer"
                >
                  显示全部 ×
                </button>
              </div>
            )}

            {/* 素材网格 */}
            <div className="grid grid-cols-4 gap-3">
              {materials.map((m) => {
                const selected = selectedMaterialId === m.fingerprint
                const matched = matchedIds.has(m.fingerprint)
                const idx = recommendIndex(m)
                const phaseMeta = LIFECYCLE_META[m.lifecyclePhase]
                return (
                  <div
                    key={m.fingerprint}
                    onClick={() => onSelectMaterial(m.fingerprint)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectMaterial(m.fingerprint) } }}
                    className={cn(
                      "rounded-xl border bg-white overflow-hidden text-left cursor-pointer transition-all relative flex flex-col",
                      selected
                        ? "border-[var(--near-black)] shadow-[0_0_0_3px_rgba(24,24,27,0.16)]"
                        : matched
                          ? "border-[#7c3aed] shadow-[0_0_0_2px_rgba(124,58,237,0.18)]"
                          : "border-[var(--line)] hover:border-[var(--line-strong)]"
                    )}
                  >
                    <div className="aspect-[9/14] bg-[var(--soft)] relative">
                      <img src={m.thumb} alt={m.name} className="w-full h-full object-cover" />
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--near-black)] text-white flex items-center justify-center">
                          <CheckCircle2 size={12} strokeWidth={2.6} />
                        </span>
                      )}
                      {matched && !selected && (
                        <span className="absolute top-1.5 right-1.5 inline-flex h-5 px-1.5 rounded-full bg-[#7c3aed] text-white text-[9px] font-extrabold items-center gap-0.5">
                          <Sparkles size={8} strokeWidth={2.8} />
                          AI 匹配
                        </span>
                      )}
                      {/* 推荐指数 + 投放天数 */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1">
                        <span className="inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md text-[10px] font-extrabold bg-black/65 text-white backdrop-blur">
                          <Star size={9} strokeWidth={2.6} className="text-[#facc15]" fill="#facc15" />
                          {idx}
                        </span>
                        <span className="inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md text-[10px] font-extrabold bg-black/65 text-white backdrop-blur">
                          <Clock3 size={9} strokeWidth={2.6} />
                          {m.ageDays}d
                        </span>
                      </div>
                    </div>
                    <div className="p-2 flex flex-col gap-1.5">
                      <p className="text-[11.5px] font-extrabold text-[var(--text)] truncate">{m.name}</p>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="inline-flex items-center gap-0.5 h-4 px-1 rounded text-[9.5px] font-bold shrink-0"
                            style={{ backgroundColor: phaseMeta.dot + "1a", color: phaseMeta.dot }}
                          >
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: phaseMeta.dot }} />
                            {phaseMeta.short}
                          </span>
                          <span className="text-[10px] text-[var(--muted)] truncate">{m.sceneTags[0]}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDrawerMaterial(m) }}
                          className="inline-flex items-center gap-0.5 h-6 px-1.5 rounded-md border border-[var(--line)] text-[10px] font-extrabold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer shrink-0"
                        >
                          <Eye size={10} strokeWidth={2.6} />
                          详情
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          /* 本地上传 */
          <div className="rounded-2xl border-2 border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] p-8 text-center">
            {uploadedFileName ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 size={20} className="text-[#16a34a]" />
                <div>
                  <p className="text-[13px] font-extrabold text-[var(--text)]">{uploadedFileName}</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">上传完成</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUploadFile("")}
                  className="text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  重新选择
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onUploadFile("Outdoor_Speaker_UGC_01.mp4")}
                className="cursor-pointer"
              >
                <Upload size={32} className="mx-auto text-[var(--muted)] mb-2" />
                <p className="text-[13px] font-extrabold text-[var(--text)]">拖拽素材到这里</p>
                <p className="text-[11.5px] text-[var(--muted)] mt-1">或点击选择文件（支持 MP4 / MOV / JPG / PNG，单文件 ≤ 500MB）</p>
                <span className="inline-block mt-3 h-9 px-4 rounded-full bg-[var(--near-black)] text-white text-[12.5px] font-extrabold">
                  选择文件
                </span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* 右：商品信息 + 智能匹配 */}
      <div className="self-start sticky top-3 space-y-3">
        <ProductBriefPanel brief={productBrief} onChange={onProductBriefChange} />
        {source !== "local_upload" && (
          <RainbowButton
            type="button"
            onClick={handleSmartMatch}
            disabled={!productReady || matching}
            className="w-full h-11 rounded-xl px-4 text-[13px]"
          >
            {matching ? "匹配中..." : "智能匹配"}
            <Sparkles size={12} strokeWidth={2.4} className="ml-1.5" />
          </RainbowButton>
        )}
      </div>

      {/* 素材详情抽屉 */}
      <MaterialDetailDrawer
        material={drawerMaterial}
        source={source}
        productBrief={productBrief}
        onClose={() => setDrawerMaterial(null)}
        onUseAsSource={(fp) => {
          onSelectMaterial(fp)
          setDrawerMaterial(null)
        }}
      />
    </div>
  )
}

// ─── shadcn-style filter dropdown ────────────────────────────────────────────

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)] data-[state=open]:border-[var(--text)]"
        >
          <span className="text-[var(--muted-2)] font-semibold">{label}</span>
          <span className="text-[var(--text)]">{value}</span>
          <ChevronDown size={11} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[180px] bg-white border border-[var(--line)] rounded-xl shadow-[0_18px_42px_rgba(9,9,11,0.14)] p-1 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {options.map((opt) => {
            const active = opt === value
            return (
              <Popover.Close key={opt} asChild>
                <button
                  type="button"
                  onClick={() => onChange(opt)}
                  className={cn(
                    "w-full h-8 px-2.5 rounded-lg text-[12.5px] font-bold text-left flex items-center gap-2 cursor-pointer transition-colors",
                    active ? "bg-[var(--soft)] text-[var(--text)]" : "text-[var(--muted)] hover:bg-[var(--soft-2)] hover:text-[var(--text)]"
                  )}
                >
                  {active ? <Check size={11} strokeWidth={2.6} className="text-[var(--text)]" /> : <span className="w-[11px]" />}
                  {opt}
                </button>
              </Popover.Close>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── Material detail drawer ──────────────────────────────────────────────────

function MaterialDetailDrawer({
  material,
  source,
  productBrief,
  onClose,
  onUseAsSource,
}: {
  material: Material | null
  source: MaterialSource | null
  productBrief: Partial<ProductBrief>
  onClose: () => void
  onUseAsSource: (fp: string) => void
}) {
  const isOwn = source === "owned_hot"

  return (
    <Dialog.Root open={material !== null} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/45 z-[80] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed right-3 top-3 bottom-3 z-[85] w-[min(620px,calc(100vw-24px))]",
            "rounded-2xl bg-white shadow-[0_28px_72px_rgba(9,9,11,0.28)] flex flex-col overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-2 data-[state=open]:fade-in-0"
          )}
        >
          {material && (
            <>
              <div className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Dialog.Title className="text-[16px] font-extrabold text-[var(--text)] truncate">{material.name}</Dialog.Title>
                    <PhaseBadge phase={material.lifecyclePhase} />
                  </div>
                  <p className="text-[11.5px] text-[var(--muted)] font-mono truncate">
                    {material.fingerprint} · SKU {material.sku} · {material.format}
                  </p>
                </div>
                <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
                  <X size={18} />
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[var(--soft-2)]">
                {/* 顶部：缩略图 + 推荐指数 + 投放天数 */}
                <div className="rounded-2xl bg-white border border-[var(--line)] p-4 flex gap-4">
                  <img src={material.thumb} alt={material.name} className="w-28 h-40 rounded-xl object-cover bg-[var(--soft)] shrink-0" />
                  <div className="flex-1 grid grid-cols-2 gap-3 content-start">
                    <BigStat label="推荐指数" value={recommendIndex(material).toString()} icon={<Star size={13} className="text-[#facc15]" fill="#facc15" />} />
                    <BigStat label="投放天数" value={`${material.ageDays} 天`} icon={<Clock3 size={13} className="text-[var(--muted)]" />} />
                  </div>
                </div>

                {isOwn ? (
                  <OwnDetailBlock material={material} />
                ) : (
                  <MarketDetailBlock material={material} productBrief={productBrief} />
                )}
              </div>

              <div className="bg-white border-t border-[var(--line)] px-5 py-3 flex items-center justify-end gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="h-9 px-3.5 rounded-full text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
                  >
                    关闭
                  </button>
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() => onUseAsSource(material.fingerprint)}
                  className="h-9 px-4 rounded-full bg-[var(--near-black)] text-white text-[12.5px] font-extrabold flex items-center gap-1 cursor-pointer hover:opacity-90"
                >
                  用此素材作为复刻骨架
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PhaseBadge({ phase }: { phase: Material["lifecyclePhase"] }) {
  const meta = LIFECYCLE_META[phase]
  return (
    <span
      className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-bold border"
      style={{ backgroundColor: meta.dot + "15", borderColor: meta.dot + "55", color: meta.dot }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
      {meta.label}
    </span>
  )
}

function BigStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold text-[var(--muted)] tracking-wide flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-[20px] font-extrabold text-[var(--text)] mt-0.5 leading-none">{value}</p>
    </div>
  )
}

// ─── Market / competitor detail block ────────────────────────────────────────

function MarketDetailBlock({ material, productBrief }: { material: Material; productBrief: Partial<ProductBrief> }) {
  const phaseMeta = LIFECYCLE_META[material.lifecyclePhase]
  const winAttr = inferWinAttribution(material)
  const estSpend = Math.round((material.metrics.spend / Math.max(1, material.ageDays)) * 30)
  const productMatch = computeProductMatch(material, productBrief)
  return (
    <>
      <Block title="所处生命周期">
        <div className="flex items-center gap-2">
          <PhaseBadge phase={material.lifecyclePhase} />
          <p className="text-[11.5px] text-[var(--muted)] flex-1">{phaseMeta.hint}</p>
        </div>
      </Block>

      <Block title="胜利归因">
        <div className="grid grid-cols-2 gap-2">
          {winAttr.map((w) => (
            <div key={w.label} className="rounded-lg border border-[var(--line)] bg-white p-2.5">
              <p className="text-[10.5px] font-semibold text-[var(--muted)]">{w.label}</p>
              <p className="text-[12.5px] font-extrabold text-[var(--text)] mt-0.5">{w.value}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="预估消耗（基于好素材的数据支撑）">
        <div className="rounded-lg border border-[var(--line)] bg-white p-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold text-[var(--muted)]">未来 30 天预估</p>
            <p className="text-[22px] font-extrabold text-[var(--text)] leading-none">${estSpend.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10.5px] font-semibold text-[var(--muted)]">参考 ROI</p>
            <p className="text-[18px] font-extrabold text-[#16a34a]">{material.metrics.roi.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10.5px] font-semibold text-[var(--muted)]">参考 CTR</p>
            <p className="text-[18px] font-extrabold text-[var(--text)]">{(material.metrics.ctr * 100).toFixed(2)}%</p>
          </div>
        </div>
      </Block>

      <Block title="与你商品的匹配度">
        <div className="rounded-lg border border-[var(--line)] bg-white p-3">
          <div className="flex items-baseline gap-3">
            <p className="text-[28px] font-extrabold text-[var(--text)] leading-none">{productMatch.score}</p>
            <p
              className="text-[12.5px] font-extrabold"
              style={{ color: productMatch.score >= 75 ? "#16a34a" : productMatch.score >= 55 ? "#a16207" : "#dc2626" }}
            >
              {productMatch.label}
            </p>
          </div>
          <ul className="mt-2 space-y-1">
            {productMatch.signals.map((s) => (
              <li key={s.label} className="text-[11.5px] flex items-center gap-1.5">
                {s.ok
                  ? <CheckCircle2 size={11} className="text-[#16a34a]" />
                  : <span className="w-2.5 h-2.5 rounded-full bg-[#fecaca] flex items-center justify-center"><X size={7} strokeWidth={3} className="text-[#dc2626]" /></span>}
                <span className="text-[var(--text)] font-semibold">{s.label}</span>
                <span className="text-[var(--muted)] truncate">· {s.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </Block>
    </>
  )
}

function inferWinAttribution(m: Material): Array<{ label: string; value: string }> {
  return [
    { label: "Hook 强度",    value: m.structureTags[0] ?? "强反差开头" },
    { label: "场景适配",     value: m.sceneTags[0] ?? "户外通勤" },
    { label: "主卖点",       value: m.sellingPointTags[0] ?? "防水 · 续航" },
    { label: "视频风格",     value: m.videoStyleTag },
  ]
}

function computeProductMatch(m: Material, brief: Partial<ProductBrief>): {
  score: number
  label: string
  signals: Array<{ label: string; ok: boolean; detail: string }>
} {
  const signals: Array<{ label: string; ok: boolean; detail: string }> = []
  const hasCategory = Boolean(brief.category)
  const hasSP = Boolean(brief.sellingPoints?.length)
  const hasScenes = Boolean(brief.scenes?.length)
  signals.push({ label: "品类匹配", ok: hasCategory, detail: hasCategory ? `已选 ${brief.category}` : "未填品类" })
  signals.push({ label: "卖点一致", ok: hasSP, detail: hasSP ? `${brief.sellingPoints![0]}` : "未填主卖点" })
  signals.push({ label: "场景重叠", ok: hasScenes, detail: hasScenes ? brief.scenes!.slice(0, 2).join(" · ") : "未填使用场景" })
  signals.push({ label: "生命周期", ok: m.lifecyclePhase === "peak" || m.lifecyclePhase === "scaling", detail: LIFECYCLE_META[m.lifecyclePhase].short })
  const score = Math.round((signals.filter((s) => s.ok).length / signals.length) * 100)
  const label = score >= 75 ? "高匹配" : score >= 55 ? "需注意差异" : "低匹配，慎复刻"
  return { score, label, signals }
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-[11px] font-extrabold text-[var(--muted)] uppercase tracking-wide mb-1.5">{title}</h4>
      {children}
    </section>
  )
}

// ─── Own detail block：metric cards + trend line + tags ──────────────────────

type OwnMetricKey = "orders" | "gmv" | "roi" | "spending"

function OwnDetailBlock({ material }: { material: Material }) {
  const [activeMetric, setActiveMetric] = useState<OwnMetricKey>("roi")

  const metrics: Record<OwnMetricKey, { label: string; value: string; trend: number[]; tags: string[]; benchmarkLabel: string; deltaPct: number }> = useMemo(() => {
    const orders = material.metrics.orders
    const spend = material.metrics.spend
    const gmv = Math.round(spend * material.metrics.roi)
    const roi = material.metrics.roi
    // 用 fingerprint 数字尾巴构造稳定 trend
    const seed = parseInt(material.fingerprint.replace(/\D/g, "")) || 1
    const mk = (base: number, amp: number) => Array.from({ length: 14 }, (_, i) => {
      const wave = Math.sin((i + seed) * 0.7) * amp + (i * amp * 0.05)
      return Math.max(0, Math.round((base + wave) * 100) / 100)
    })
    return {
      orders:   { label: "Orders（订单）",        value: orders.toLocaleString(),  trend: mk(orders / 14, orders / 80), tags: ["高于账户均值 +18%", "完成目标线"], benchmarkLabel: "账户均值 / 目标线", deltaPct: 18 },
      gmv:      { label: "Gross Revenue（GMV）",  value: `$${gmv.toLocaleString()}`, trend: mk(gmv / 14, gmv / 80),    tags: ["高于行业均值 +24%", "稳定增长"], benchmarkLabel: "行业均值",        deltaPct: 24 },
      roi:      { label: "ROI",                  value: roi.toFixed(2),            trend: mk(roi, 0.18),                tags: [roi >= 2 ? "高于账户均值" : "接近账户均值", roi >= 1.8 ? "达成 ROI 目标" : "未达 ROI 目标"], benchmarkLabel: "账户 ROI 目标 1.8", deltaPct: Math.round((roi - 1.8) * 100) },
      spending: { label: "Spending（消耗）",      value: `$${spend.toLocaleString()}`, trend: mk(spend / 14, spend / 80), tags: ["持续投入 7 天 +", "处于稳定区间"], benchmarkLabel: "近 14 天日均",     deltaPct: 12 },
    }
  }, [material])

  const cur = metrics[activeMetric]
  const up = cur.deltaPct >= 0

  return (
    <>
      <Block title="选择指标">
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(metrics) as OwnMetricKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setActiveMetric(k)}
              className={cn(
                "h-8 px-3 rounded-full text-[12px] font-bold cursor-pointer transition-colors",
                activeMetric === k
                  ? "bg-[var(--near-black)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-strong)]"
              )}
            >
              {k === "orders" ? "Orders" : k === "gmv" ? "Gross Revenue" : k === "roi" ? "ROI" : "Spending"}
            </button>
          ))}
        </div>
      </Block>

      {/* 大圆角指标牌 */}
      <div className="rounded-2xl border border-[var(--line)] bg-white p-4 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11.5px] font-semibold text-[var(--muted)]">{cur.label}</p>
            <p className="text-[32px] font-extrabold text-[var(--text)] leading-none mt-1">{cur.value}</p>
            <p className="text-[10.5px] text-[var(--muted-2)] mt-1 flex items-center gap-1">
              <span>对比：{cur.benchmarkLabel}</span>
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[12px] font-extrabold",
              up ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fef3c7] text-[#a16207]"
            )}
          >
            {up ? <TrendingUp size={12} strokeWidth={2.6} /> : <TrendingDown size={12} strokeWidth={2.6} />}
            {up ? "+" : ""}{cur.deltaPct}%
          </span>
        </div>

        {/* Trend line（svg） */}
        <TrendChart points={cur.trend} up={up} />

        <div className="flex flex-wrap gap-1.5 pt-1">
          {cur.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 h-5 px-2 rounded-md text-[10.5px] font-bold"
              style={{ backgroundColor: "var(--lime)", color: "#1a2010" }}
            >
              <Flame size={9} strokeWidth={2.6} />
              {t}
            </span>
          ))}
        </div>
      </div>

      <Block title="账户分布">
        <div className="rounded-lg border border-[var(--line)] bg-white p-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-[var(--muted)]">投放账户数</span>
            <span className="font-extrabold text-[var(--text)]">{material.accountCount}</span>
          </div>
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-[var(--muted)]">最佳账户</span>
            <span className="font-extrabold text-[var(--text)]">{material.bestAccount.accountName} · ROI {material.bestAccount.roi.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-[var(--muted)]">表现最差</span>
            <span className="font-extrabold text-[var(--text)]">{material.worstAccount.accountName} · ROI {material.worstAccount.roi.toFixed(2)}</span>
          </div>
        </div>
      </Block>

      <Block title="基础信息">
        <BasicInfoTable material={material} />
      </Block>
    </>
  )
}

// ─── 基础信息表（素材类型 / 达人 / 文案 / 国家 / 版位 / 币种 / 时长 / 分辨率 / 创建时间） ─

function BasicInfoTable({ material }: { material: Material }) {
  const seed = parseInt(material.fingerprint.replace(/\D/g, "")) || 1
  const CREATORS = ["Michael.TT", "Sarah_K", "ToolboxDan", "EveryDay.Lina", "FitCreator88", "OutdoorMax"]
  const COUNTRIES = ["GB", "US", "DE", "JP", "SG", "MX"]
  const RESOLUTIONS = ["1080 × 1920", "720 × 1280", "1080 × 1080", "1920 × 1080"]
  const COPIES = [
    "Such a good deal! Mini mystery where you get £30 worth of make up is currently £10! You get 3 items so best believe I grabbed multiple 😍 #madebymitchell #mysterybundle #cosydealdrops #dealdrops #tiktokmademebuyit",
    "Tried this for 30 days and the result speaks for itself — link in bio. #outdoorgear #everydaycarry #tiktokmademebuyit",
    "When your toolbox finally has the upgrade it deserves 🔧 perfect for late-night fixes #magnetic #worklight",
    "POV: you stop fumbling under the hood at night 🌙 #cartools #foryou #amazonfinds",
  ]

  const creator = CREATORS[seed % CREATORS.length]
  const country = COUNTRIES[seed % COUNTRIES.length]
  const resolution = RESOLUTIONS[seed % RESOLUTIONS.length]
  const copy = COPIES[seed % COPIES.length]
  const duration = (8 + (seed % 18) + Math.round(((seed * 13) % 10) / 10 * 10) / 10).toFixed(1)
  const createdAt = new Date(material.firstSeenAt).toLocaleDateString("en-CA")

  const rows: Array<{ label: string; value: React.ReactNode; longText?: boolean }> = [
    { label: "素材类型",      value: material.format === "video" ? "视频" : "图片" },
    { label: "达人名称",      value: creator },
    { label: "帖子文案",      value: copy, longText: true },
    { label: "投放国家",      value: country },
    { label: "投放版位",      value: "PLACEMENT_TIKTOK" },
    { label: "币种",          value: "USD" },
    { label: "视频时长",      value: `${duration}s` },
    { label: "分辨率",        value: resolution },
    { label: "广告创建时间",  value: createdAt },
  ]

  return (
    <div className="rounded-lg border border-[var(--line)] bg-white overflow-hidden">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={cn(
            "flex gap-3 px-3 py-2.5",
            i > 0 && "border-t border-[var(--line)]",
            row.longText ? "items-start" : "items-center"
          )}
        >
          <span className="text-[11.5px] text-[var(--muted)] font-semibold w-[88px] shrink-0">{row.label}</span>
          <span
            className={cn(
              "flex-1 min-w-0 text-[12px] font-extrabold text-[var(--text)] text-right",
              row.longText ? "leading-relaxed whitespace-pre-wrap break-words" : "truncate"
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function TrendChart({ points, up }: { points: number[]; up: boolean }) {
  const w = 540
  const h = 100
  const pad = 8
  const max = Math.max(...points, 0.0001)
  const min = Math.min(...points, 0)
  const span = Math.max(max - min, 0.0001)
  const xStep = (w - pad * 2) / (points.length - 1)
  const pathD = points
    .map((p, i) => {
      const x = pad + i * xStep
      const y = pad + (h - pad * 2) * (1 - (p - min) / span)
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
  const areaD = pathD + ` L ${(pad + (points.length - 1) * xStep).toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`
  const stroke = up ? "#16a34a" : "#a16207"
  const fill = up ? "#bbf7d0" : "#fed7aa"
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[100px]">
      <path d={areaD} fill={fill} fillOpacity={0.35} />
      <path d={pathD} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
