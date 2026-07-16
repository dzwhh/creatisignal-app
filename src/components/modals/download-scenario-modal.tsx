"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, Download, Megaphone, MonitorPlay, Share2, Users, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── 下载前选择使用场景：选中后才点亮下载按钮 ────────────────────────────────

type Scenario = {
  id: string
  label: string
  desc: string
  icon: LucideIcon
}

const SCENARIOS: Scenario[] = [
  { id: "ads",      label: "广告投放",     desc: "TikTok / Meta / Google 付费投放素材", icon: Megaphone },
  { id: "creator",  label: "达人合作",     desc: "提供给达人 / KOC 作为参考或直发",     icon: Users },
  { id: "social",   label: "社媒发布",     desc: "官方账号自然流量内容",                 icon: Share2 },
  { id: "internal", label: "客户/老板提案", desc: "用于汇报或方案展示",                 icon: MonitorPlay },
]

export function DownloadScenarioModal({ open, onOpenChange, onDownload }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** 确认下载（已选场景）回调，场景 id 供埋点/统计 */
  onDownload?: (scenarioId: string) => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleOpenChange(v: boolean) {
    onOpenChange(v)
    if (!v) setSelected(null)
  }

  function handleDownload() {
    if (!selected) return
    onDownload?.(selected)
    handleOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/55 z-[90] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] w-[440px] max-w-[calc(100vw-48px)] rounded-2xl bg-white shadow-[0_28px_72px_rgba(9,9,11,0.28)] overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="px-6 pt-5 pb-4 flex items-start justify-between">
            <div>
              <Dialog.Title className="text-[16px] font-extrabold text-[var(--text)]">选择使用场景</Dialog.Title>
              <Dialog.Description className="mt-1 text-[12.5px] text-[var(--muted)] leading-relaxed">
                这条创意主要会用在哪里？
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-7 h-7 -mt-1 -mr-2 shrink-0 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={15} />
            </Dialog.Close>
          </div>

          <div className="px-6 grid grid-cols-2 gap-2.5">
            {SCENARIOS.map(({ id, label, desc, icon: Icon }) => {
              const active = selected === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelected(id)}
                  className={cn(
                    "relative rounded-xl border p-3 text-left cursor-pointer transition-all",
                    active
                      ? "border-[#b8d94a] bg-[var(--lime-soft)]/60 shadow-[0_4px_14px_rgba(201,255,41,0.25)]"
                      : "border-[var(--line)] bg-white hover:border-[var(--line-strong)]"
                  )}
                >
                  {active && (
                    <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[var(--lime)] flex items-center justify-center">
                      <Check size={11} strokeWidth={3} className="text-[#1a2010]" />
                    </span>
                  )}
                  <Icon size={16} strokeWidth={2.2} className={active ? "text-[#3a4a10]" : "text-[var(--muted)]"} />
                  <p className={cn("mt-2 text-[13px] font-extrabold", active ? "text-[#3a4a10]" : "text-[var(--text)]")}>{label}</p>
                  <p className={cn("mt-0.5 text-[11px] leading-relaxed", active ? "text-[#5a6b1a]" : "text-[var(--muted)]")}>{desc}</p>
                </button>
              )
            })}
          </div>

          <div className="px-6 pt-5 pb-6">
            <button
              type="button"
              disabled={!selected}
              onClick={handleDownload}
              className="w-full h-11 rounded-full bg-[var(--near-black)] text-white text-[14px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed transition-opacity"
            >
              <Download size={14} strokeWidth={2.4} />
              {selected ? "下载" : "选择场景后可下载"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
