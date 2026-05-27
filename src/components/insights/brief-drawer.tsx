"use client"

import { useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Send, Wand2, Check, ChevronDown, Search } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { ACCOUNTS, BRIEF_SEEDS } from "@/lib/insights/mock"
import { STATUS_META } from "@/lib/insights/types"

export type BriefSeedTrigger = { scene?: string; sellingPoint?: string; tag?: string } | null

export function BriefDrawer({
  seed,
  onClose,
}: {
  seed: BriefSeedTrigger
  onClose: () => void
}) {
  const [productSku, setProductSku] = useState("ZF7899")
  const [scene, setScene] = useState("")
  const [pain, setPain] = useState("")
  const [proposition, setProposition] = useState("")
  const [hook, setHook] = useState("")
  const [visuals, setVisuals] = useState("")
  const [sellingPriority, setSellingPriority] = useState("")
  const [cta, setCta] = useState("")
  const [count, setCount] = useState(10)
  const [targetAccountIds, setTargetAccountIds] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  // Pre-fill from trigger
  useEffect(() => {
    if (!seed) return
    setSubmitted(false)
    // If we have a scene or selling point or tag, find best matching brief seed
    const match = BRIEF_SEEDS.find((s) =>
      (seed.scene && s.scene === seed.scene) ||
      (seed.sellingPoint && s.sellingPriority.includes(seed.sellingPoint)) ||
      (seed.tag && (s.scene === seed.tag || s.sellingPriority.includes(seed.tag)))
    ) ?? BRIEF_SEEDS[0]
    setProductSku(match.product.split(" ")[0])
    setScene(seed.scene ?? match.scene)
    setPain(match.pain)
    setProposition(match.proposition)
    setHook(match.hook)
    setVisuals(match.visuals.join(" → "))
    setSellingPriority(seed.sellingPoint ? [seed.sellingPoint, ...match.sellingPriority].slice(0, 4).join(" > ") : match.sellingPriority.join(" > "))
    setCta(match.cta)
    setCount(match.count)
  }, [seed])

  const targetCount = targetAccountIds.size

  function handleSubmit() {
    setSubmitted(true)
    setTimeout(() => {
      onClose()
      setSubmitted(false)
    }, 1400)
  }

  return (
    <Dialog.Root open={seed !== null} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-[520px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2">
          <div className="px-6 pt-5 pb-4 border-b border-[var(--line)] flex items-start justify-between">
            <div>
              <Dialog.Title className="text-[17px] font-extrabold text-[var(--text)]">生成素材 Brief</Dialog.Title>
              <Dialog.Description className="text-[12px] text-[var(--muted)] mt-0.5">
                确认 Brief 字段后一键发送到「视频创作」批量生成。
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 text-[12.5px]">
            <Field label="商品 SKU" value={productSku} onChange={setProductSku} />
            <Field label="核心场景" value={scene} onChange={setScene} />
            <Field label="用户痛点" value={pain} onChange={setPain} multi />
            <Field label="单一传播主张" value={proposition} onChange={setProposition} multi />
            <Field label="开头钩子" value={hook} onChange={setHook} multi />
            <Field label="必须展示画面" value={visuals} onChange={setVisuals} multi />
            <Field label="卖点优先级" value={sellingPriority} onChange={setSellingPriority} />
            <Field label="CTA" value={cta} onChange={setCta} />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-[11.5px] font-bold text-[var(--text)] mb-1.5">生成数量</p>
                <div className="h-9 flex items-center gap-1 border border-[var(--line)] rounded-lg overflow-hidden bg-white">
                  <button type="button" onClick={() => setCount(Math.max(1, count - 1))} className="w-9 h-full hover:bg-[var(--soft-2)] cursor-pointer">−</button>
                  <span className="flex-1 text-center text-[14px] font-bold">{count}</span>
                  <button type="button" onClick={() => setCount(Math.min(30, count + 1))} className="w-9 h-full hover:bg-[var(--soft-2)] cursor-pointer">+</button>
                </div>
              </div>
              <div>
                <p className="text-[11.5px] font-bold text-[var(--text)] mb-1.5">目标账户</p>
                <TargetAccountPicker selected={targetAccountIds} onChange={setTargetAccountIds} />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] p-3 text-[11.5px] text-[var(--muted)] leading-relaxed mt-2">
              💡 Brief 会同时携带账户的 ROI target、预算上限与地区语言，避免下游创作环节再次手填。
            </div>
          </div>

          <div className="px-6 py-3 border-t border-[var(--line)] flex items-center gap-2">
            <button
              type="button"
              className="h-10 px-4 rounded-full border border-[var(--line)] bg-white text-[var(--text)] text-[13px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)]"
            >
              保存草稿
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={cn(
                "flex-1 h-10 rounded-full text-white text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity",
                submitted ? "bg-[#16a34a]" : "bg-[#18181b] hover:opacity-90"
              )}
            >
              {submitted ? <><Check size={15} strokeWidth={2.5} /> 已发送到视频创作</> : <><Send size={14} strokeWidth={2.2} /> 发送到视频创作 · 生成 {count} 条</>}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Field({ label, value, onChange, multi }: { label: string; value: string; onChange: (v: string) => void; multi?: boolean }) {
  return (
    <div>
      <p className="text-[11.5px] font-bold text-[var(--text)] mb-1.5">{label}</p>
      {multi ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-[var(--line)] bg-white text-[13px] resize-none outline-none focus:border-[var(--line-strong)] leading-relaxed"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-[var(--line)] bg-white text-[13px] outline-none focus:border-[var(--line-strong)]"
        />
      )}
    </div>
  )
}

function TargetAccountPicker({ selected, onChange }: { selected: Set<string>; onChange: (s: Set<string>) => void }) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const active = ACCOUNTS.filter((a) => a.status !== "paused")
    if (!q) return active.sort((a, b) => b.metrics7d.spend - a.metrics7d.spend).slice(0, 20)
    return active.filter((a) => a.name.toLowerCase().includes(q) || a.id.includes(q)).slice(0, 20)
  }, [query])

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="w-full h-9 px-3 rounded-lg border border-[var(--line)] bg-white text-[13px] font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)]"
        >
          <span className="flex-1 text-left">
            {selected.size === 0 ? "选择账户..." : `已选 ${selected.size} 个账户`}
          </span>
          <ChevronDown size={12} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-[60] w-[300px] max-h-[400px] bg-white border border-[var(--line)] rounded-2xl shadow-[0_18px_42px_rgba(9,9,11,0.14)] overflow-hidden flex flex-col"
        >
          <div className="p-2 border-b border-[var(--line)]">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索账户..."
                className="w-full h-8 pl-7 pr-2 rounded-md border border-[var(--line)] bg-[var(--soft-2)] text-[12px] outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((a) => {
              const checked = selected.has(a.id)
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    const next = new Set(selected)
                    if (next.has(a.id)) next.delete(a.id)
                    else next.add(a.id)
                    onChange(next)
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-left cursor-pointer",
                    checked ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
                  )}
                >
                  <span className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center", checked ? "bg-[var(--text)] border-[var(--text)] text-white" : "border-[var(--line-strong)] text-transparent")}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_META[a.status].dot }} />
                  <span className="text-[11.5px] font-semibold text-[var(--text)] truncate flex-1">{a.name}</span>
                  <span className="text-[10.5px] text-[var(--muted)] shrink-0">ROI {a.metrics7d.roi.toFixed(1)}</span>
                </button>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
