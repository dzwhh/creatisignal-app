"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, Search, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { MATERIAL_SOURCE_META, type MaterialSource, type ProductBrief } from "@/lib/insights/types"
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

  const materials = useMemo(() => {
    let list = MATERIALS.slice(0, 12)
    if (source === "competitor_hot") list = MATERIALS.filter((m) => m.bucket === "potential").slice(0, 12)
    else if (source === "owned_hot") list = MATERIALS.filter((m) => m.bucket === "core").slice(0, 12)
    else if (source === "market_hot") list = MATERIALS.slice(0, 12)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.sceneTags.some((t) => t.includes(q)))
    }
    return list
  }, [source, query])

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
                  style={{
                    backgroundColor: meta.dot + "15",
                    color: meta.dot,
                  }}
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
              <FilterPill label="平台" value="TikTok" />
              <FilterPill label="广告产品" value="GMV Max" />
              <FilterPill label="国家" value="US" />
              <FilterPill label="行业品类" value="工具户外" />
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

            {/* 素材网格 */}
            <div className="grid grid-cols-4 gap-3">
              {materials.map((m) => {
                const selected = selectedMaterialId === m.fingerprint
                return (
                  <button
                    key={m.fingerprint}
                    type="button"
                    onClick={() => onSelectMaterial(m.fingerprint)}
                    className={cn(
                      "rounded-xl border bg-white overflow-hidden text-left cursor-pointer transition-all relative",
                      selected
                        ? "border-[var(--near-black)] shadow-[0_0_0_3px_rgba(24,24,27,0.16)]"
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
                    </div>
                    <div className="p-2">
                      <p className="text-[11.5px] font-extrabold text-[var(--text)] truncate">{m.name}</p>
                      <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate">{m.sceneTags[0]}</p>
                    </div>
                  </button>
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

      {/* 右：商品信息 */}
      <ProductBriefPanel brief={productBrief} onChange={onProductBriefChange} />
    </div>
  )
}

function FilterPill({ label, value }: { label: string; value: string }) {
  return (
    <button className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)]">
      <span className="text-[var(--muted-2)] font-semibold">{label}</span>
      <span className="text-[var(--text)]">{value}</span>
    </button>
  )
}
