"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Clapperboard, Info, Sparkles, X } from "lucide-react"
import { CreditGauge } from "@/components/credits/credit-gauge"

// ─── 购买加量包积分：短剧等高级生成能力的付费弹窗 ────────────────────────────
// 定价：1000 积分 = ¥129（¥0.129/积分）；短剧默认 15 秒消耗 210 积分

const MIN_CREDITS = 1000
const MAX_CREDITS = 10000
const STEP = 100
const PRICE_PER_CREDIT = 0.129
const DRAMA_15S_COST = 210

function fmt(n: number) {
  return n.toLocaleString("en-US")
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export function CreditPurchaseModal({ open, onOpenChange, onPurchased }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** 点击「立即购买」（mock 支付成功）后回调 */
  onPurchased?: () => void
}) {
  const [credits, setCredits] = useState(MIN_CREDITS)
  const price = Math.round(credits * PRICE_PER_CREDIT)
  const dramaCount = Math.floor(credits / DRAMA_15S_COST)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[90] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] w-[760px] max-w-[calc(100vw-48px)] rounded-2xl bg-[#101208] text-white shadow-[0_32px_80px_rgba(0,0,0,0.45)] overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* 头部：标题 + 短剧识别提示 */}
          <div className="px-7 pt-6 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-[17px] font-extrabold">购买加量包积分</Dialog.Title>
              <Dialog.Description className="mt-2.5 inline-flex items-center gap-1.5 h-[26px] px-2.5 rounded-full border border-[#c9ff29]/50 text-[var(--lime)] text-[11.5px] font-bold">
                <Clapperboard size={12} strokeWidth={2.2} className="shrink-0" />
                检测到「短剧」创意 · 短剧生成为高级能力，1000 积分起
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-8 h-8 -mr-2 rounded-full flex items-center justify-center text-[#8b8e85] hover:bg-white/10 hover:text-white cursor-pointer">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* 主体：左表盘 + 右价格权益 */}
          <div className="px-7 py-6 flex items-center gap-8">
            <div className="flex-1 flex flex-col items-center gap-3">
              <CreditGauge value={credits} onChange={setCredits} min={MIN_CREDITS} max={MAX_CREDITS} step={STEP} />
              <span className="inline-flex items-center gap-1.5 h-[28px] px-3 rounded-full bg-[#1a2010] border border-[#c9ff29]/35 text-[var(--lime)] text-[12px] font-bold">
                <Sparkles size={11} strokeWidth={2.4} />
                ¥{PRICE_PER_CREDIT}/积分
              </span>
              <p className="text-[12px] text-[#8b8e85]">拖动选择积分数量</p>
            </div>

            <div className="w-[280px] shrink-0 border-l border-white/10 pl-8 py-2">
              <p className="text-[40px] leading-none font-extrabold tabular-nums">¥{fmt(price)}</p>
              <div className="my-5 border-t border-white/10" />
              <p className="text-[13px] font-bold text-[#c6c9bf]">最多可创作：</p>
              <div className="mt-2.5 space-y-1.5 text-[13.5px]">
                <p>
                  <span className="font-extrabold tabular-nums">~{dramaCount}</span>{" "}
                  <span className="text-[#c6c9bf]">条 15s 短剧视频</span>
                </p>
                <p>
                  <span className="font-extrabold tabular-nums">~{fmt(credits)}</span>{" "}
                  <span className="text-[#c6c9bf]">张图片</span>
                </p>
              </div>
              <p className="mt-3 text-[11.5px] text-[#8b8e85] leading-relaxed">
                短剧默认 15 秒 · 消耗 210 积分（约 0.1 元/秒），实际消耗视模型参数而定
              </p>
              <button
                type="button"
                onClick={onPurchased}
                className="mt-5 w-full h-11 rounded-full bg-white text-[#101208] text-[14px] font-extrabold cursor-pointer hover:opacity-90 transition-opacity"
              >
                立即购买
              </button>
            </div>
          </div>

          {/* 底部说明 */}
          <div className="px-7 py-3.5 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11.5px] text-[#8b8e85]">
            <Info size={12} className="shrink-0" />
            加量积分永不过期，但需在订阅有效期内才能使用；加量包购买后不支持退款。
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
