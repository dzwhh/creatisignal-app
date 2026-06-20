"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowRight, Package, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { rainbowButtonClassName } from "@/components/ui/rainbow-button"
import { ProductBriefPanel } from "@/components/replicate/product-brief-panel"
import type { ProductBrief } from "@/lib/insights/types"

interface Props {
  open: boolean
  onClose: () => void
}

// 从创意分析跳入爆款复刻时使用的默认参考素材（与 hub 的 REPLICA_PROJECT_FALLBACK_FP 对齐）
const DEFAULT_REFERENCE_FP = "fp_001"

// 抽屉 → workspace 之间传递商品 brief 的 sessionStorage key
export const REPLICATE_HANDOFF_KEY = "replicate.handoffBrief"

function buildAutoTitle(): string {
  const d = new Date()
  const m = (d.getMonth() + 1).toString().padStart(2, "0")
  const day = d.getDate().toString().padStart(2, "0")
  return `创意分析复刻 · ${d.getFullYear()}/${m}/${day}`
}

export function EnterReplicateDrawer({ open, onClose }: Props) {
  const router = useRouter()
  // 抽屉内自管理商品 brief —— 与 Step 1 同一份 ProductBriefPanel
  const [brief, setBrief] = useState<Partial<ProductBrief>>({ sellingPointMode: "manual" })

  function handleEnter() {
    // 仅当用户填了内容时才 handoff，避免覆盖默认素材带出的 pickDefaultProduct
    const hasContent = Boolean(
      brief.name || brief.image || (brief.sellingPoints && brief.sellingPoints.length > 0)
    )
    if (hasContent && typeof window !== "undefined") {
      try { window.sessionStorage.setItem(REPLICATE_HANDOFF_KEY, JSON.stringify(brief)) } catch {}
    }
    const title = buildAutoTitle()
    onClose()
    // 直达 Step 3 生成方向 —— 前两步默认走完
    router.push(
      `/replicate/${DEFAULT_REFERENCE_FP}?step=3&source=insights&title=${encodeURIComponent(title)}`
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/45 z-[80] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed right-3 top-3 bottom-3 z-[85] w-[min(620px,calc(100vw-24px))]",
            "rounded-2xl bg-white shadow-[0_28px_72px_rgba(9,9,11,0.28)] flex flex-col overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2"
          )}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[var(--lime-soft)] text-[#5a7821] flex items-center justify-center shrink-0">
              <Package size={13} strokeWidth={2.4} />
            </span>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-[14px] font-extrabold text-[var(--text)] leading-snug truncate">
                选择你的商品
              </Dialog.Title>
              <p className="text-[10.5px] text-[var(--muted)] mt-0.5 truncate">配置商品信息后直达「生成方向」</p>
            </div>
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Body — 直接嵌入 ProductBriefPanel（与 Step 1 同款配置） */}
          <div className="flex-1 overflow-y-auto p-4 bg-[var(--soft-2)]">
            <ProductBriefPanel brief={brief} onChange={setBrief} />
          </div>

          {/* Footer — RainbowButton 入口 */}
          <div className="px-5 py-3 border-t border-[var(--line)] flex items-center justify-end">
            <button
              type="button"
              onClick={handleEnter}
              className={cn(rainbowButtonClassName, "h-11 rounded-xl px-5 text-[13px]")}
            >
              进入爆款复刻
              <ArrowRight size={13} strokeWidth={2.4} className="ml-1.5" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
