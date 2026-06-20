"use client"

import { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowRight, Globe2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MARKET_CATEGORY_META, type MarketCategory } from "@/lib/discovery/state"

const COUNTRIES: { code: string; flag: string; name: string }[] = [
  { code: "US", flag: "🇺🇸", name: "美国" },
  { code: "UK", flag: "🇬🇧", name: "英国" },
  { code: "DE", flag: "🇩🇪", name: "德国" },
  { code: "FR", flag: "🇫🇷", name: "法国" },
  { code: "JP", flag: "🇯🇵", name: "日本" },
  { code: "SG", flag: "🇸🇬", name: "新加坡" },
  { code: "MX", flag: "🇲🇽", name: "墨西哥" },
  { code: "BR", flag: "🇧🇷", name: "巴西" },
  { code: "AU", flag: "🇦🇺", name: "澳大利亚" },
]

interface Props {
  open: boolean
  initial: { countries: string[]; categories: MarketCategory[]; description?: string }
  onOpenChange: (v: boolean) => void
  onSave: (prefs: { countries: string[]; categories: MarketCategory[]; description?: string }) => void
}

export function MarketPrefsDialog({ open, initial, onOpenChange, onSave }: Props) {
  const [countries, setCountries] = useState<Set<string>>(new Set(initial.countries))
  const [categories, setCategories] = useState<Set<MarketCategory>>(new Set(initial.categories))
  const [description, setDescription] = useState(initial.description ?? "")

  useEffect(() => {
    if (open) {
      setCountries(new Set(initial.countries))
      setCategories(new Set(initial.categories))
      setDescription(initial.description ?? "")
    }
  }, [open, initial.countries, initial.categories, initial.description])

  const canSave = countries.size > 0 && categories.size > 0

  function toggleCountry(c: string) {
    setCountries((prev) => { const next = new Set(prev); if (next.has(c)) next.delete(c); else next.add(c); return next })
  }
  function toggleCategory(c: MarketCategory) {
    setCategories((prev) => { const next = new Set(prev); if (next.has(c)) next.delete(c); else next.add(c); return next })
  }

  function submit() {
    if (!canSave) return
    onSave({
      countries: Array.from(countries),
      categories: Array.from(categories),
      description: description.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[520px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Dialog.Title className="text-[15px] font-extrabold text-[var(--text)] flex items-center gap-2">
                <Globe2 size={14} className="text-[#5a7821]" />
                设置市场爆款偏好
              </Dialog.Title>
              <Dialog.Description className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed">
                选定国家 + 品类，系统每日推送对应行业的近 24h 热门素材。
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={14} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11.5px] font-extrabold text-[var(--muted)] uppercase tracking-wide mb-1.5">投放国家</p>
              <div className="flex flex-wrap gap-1.5">
                {COUNTRIES.map((c) => {
                  const active = countries.has(c.code)
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => toggleCountry(c.code)}
                      className={cn(
                        "h-7 px-2 rounded-md text-[11.5px] font-bold flex items-center gap-1 cursor-pointer border transition-colors",
                        active
                          ? "bg-[var(--text)] text-white border-[var(--text)]"
                          : "bg-white text-[var(--muted)] border-[var(--line)] hover:border-[var(--line-strong)]"
                      )}
                    >
                      <span className="text-[13px] leading-none">{c.flag}</span>
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-[11.5px] font-extrabold text-[var(--muted)] uppercase tracking-wide mb-1.5">行业品类</p>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(MARKET_CATEGORY_META) as MarketCategory[]).map((k) => {
                  const active = categories.has(k)
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => toggleCategory(k)}
                      className={cn(
                        "h-7 px-2.5 rounded-md text-[11.5px] font-bold cursor-pointer border transition-colors",
                        active
                          ? "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]"
                          : "bg-white text-[var(--muted)] border-[var(--line)] hover:border-[var(--line-strong)]"
                      )}
                    >
                      {MARKET_CATEGORY_META[k].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-[11.5px] font-extrabold text-[var(--muted)] uppercase tracking-wide mb-1.5">一句话描述（可选）</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="例：我想看美区户外工具类目最近爆量的 UGC 素材"
                className="w-full rounded-lg border border-[var(--line)] bg-white px-2.5 py-2 text-[12px] outline-none resize-none focus:border-[var(--text)]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-3.5 rounded-full text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={submit}
              className={cn(
                "h-9 px-4 rounded-full text-[12.5px] font-extrabold flex items-center gap-1.5 transition-opacity",
                canSave ? "bg-[#18181b] text-white hover:opacity-90 cursor-pointer" : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
              )}
            >
              保存偏好
              <ArrowRight size={12} strokeWidth={2.4} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
