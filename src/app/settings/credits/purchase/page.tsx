"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, Sparkles, Check, Coins, Gift, Play, CreditCard, Info, SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Topbar } from "@/components/layout/topbar"
import { CreditSlider } from "@/components/credits/credit-slider"
import { ContactSales } from "@/components/credits/contact-sales"
import {
  CREDIT_PACKS, CREDIT_TOTAL, FLEX,
  flexPrice, flexNextTier, videosFrom, imagesFrom, fmt,
} from "@/lib/credits/data"

const FLEX_TICKS = [
  { at:  20_000, label: "2万" },
  { at:  50_000, label: "5万" },
  { at: 100_000, label: "10万" },
]

export default function PurchaseCreditsPage() {
  /** 选中固定档的 id，或 "flex" 表示第 4 档弹性包 */
  const [selected, setSelected] = useState<string>(CREDIT_PACKS[1].id)
  /** 弹性档数量。卡片上不预告数值，故从区间起点开始，由用户拖动决定 */
  const [flexCredits, setFlexCredits] = useState(FLEX.min)

  const isFlex = selected === FLEX.id
  const pack = CREDIT_PACKS.find((p) => p.id === selected)

  // 统一口径：不论固定档还是弹性档，都归一成「实付 / 到账 / 赠送」
  const amount = isFlex ? flexPrice(flexCredits) : pack!.price
  const credits = isFlex ? flexCredits : pack!.base + pack!.bonus
  const bonus = isFlex ? 0 : pack!.bonus
  // 单价小到 0.0886，必须保留 4 位小数，取 3 位会显示成 ¥0.089
  const unit = (amount / credits).toFixed(4)

  return (
    <>
      <Topbar title="积分" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[1180px] mx-auto px-8 py-6 pb-16">
          <Link
            href="/settings/credits"
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-4"
          >
            <ArrowLeft size={14} strokeWidth={2.4} />
            返回积分
          </Link>

          <h1 className="text-[26px] font-[850] leading-snug text-[var(--text)] mb-5">积分加量包</h1>

          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl bg-[#1a1f14] px-7 py-7 mb-6">
            <div className="pointer-events-none absolute -right-20 -top-28 h-[320px] w-[320px] rounded-full bg-[radial-gradient(closest-side,rgba(201,255,41,0.16),transparent)]" />
            <div className="relative flex items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full bg-[var(--lime)] text-[#20251a] text-[12px] font-extrabold">
                  <Sparkles size={12} strokeWidth={2.6} />
                  积分永久有效
                </span>
                <h2 className="mt-4 text-[24px] font-[850] text-white leading-tight">
                  创作不中断，积分随用随充
                </h2>
                <p className="mt-2 text-[13px] text-white/45">
                  一次性购买，不订阅、不续费，积分买了就一直在。
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-white/[0.06] border border-white/[0.08] px-6 py-4 text-right backdrop-blur">
                <p className="text-[12px] text-white/45">当前可用积分</p>
                <p className="mt-1.5 text-[28px] font-[850] text-white tabular-nums leading-none">
                  {fmt(CREDIT_TOTAL)}
                  <span className="ml-1.5 text-[12px] font-bold text-white/45">积分</span>
                </p>
              </div>
            </div>
          </section>

          {/* 四档:前 3 固定 + 第 4 弹性 */}
          <h3 className="text-[14px] font-extrabold text-[var(--text)] mb-3">选择加量包</h3>
          <div className="grid grid-cols-4 gap-3.5">
            {CREDIT_PACKS.map((p) => {
              const active = p.id === selected
              const total = p.base + p.bonus
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelected(p.id)}
                  className={cn(
                    "relative text-left rounded-2xl border-2 p-4 transition-all cursor-pointer",
                    active
                      ? "border-[var(--lime)] bg-[#fbffee] shadow-[0_4px_16px_rgba(201,255,41,0.2)]"
                      : "border-[var(--line)] bg-white hover:border-[var(--line-strong)]"
                  )}
                >
                  {p.recommended && (
                    <span className="absolute -top-2.5 left-4 h-[20px] px-2 rounded-full bg-[var(--lime)] text-[#20251a] text-[10px] font-extrabold flex items-center">
                      推荐
                    </span>
                  )}
                  <CardHead name={p.name} active={active} />
                  <p className="mt-2 text-[24px] font-[850] text-[var(--text)] tabular-nums leading-none">
                    ¥{fmt(p.price)}
                  </p>

                  <div className="my-3.5 border-t border-dashed border-[var(--line)]" />

                  <p className="text-[11.5px] text-[var(--muted)]">到账积分</p>
                  <p className="mt-1 text-[17px] font-extrabold text-[var(--text)] tabular-nums leading-none">
                    {fmt(total)}
                  </p>
                  <span className="mt-2 inline-flex h-[20px] px-2 rounded-full bg-[var(--lime-soft)] text-[#3f6212] text-[10.5px] font-extrabold items-center tabular-nums">
                    含赠送 +{fmt(p.bonus)}
                  </span>

                  <p className="mt-3.5 text-[11.5px] text-[var(--muted-2)] leading-relaxed">{p.desc}</p>
                </button>
              )
            })}

            {/* 第 4 档:弹性 */}
            <button
              type="button"
              onClick={() => setSelected(FLEX.id)}
              className={cn(
                "relative text-left rounded-2xl border-2 p-4 transition-all cursor-pointer",
                isFlex
                  ? "border-[var(--lime)] bg-[#fbffee] shadow-[0_4px_16px_rgba(201,255,41,0.2)]"
                  : "border-[var(--line)] bg-white hover:border-[var(--line-strong)]"
              )}
            >
              <span className="absolute -top-2.5 left-4 h-[20px] px-2 rounded-full bg-[var(--near-black)] text-[var(--lime)] text-[10px] font-extrabold flex items-center gap-1">
                <SlidersHorizontal size={9} strokeWidth={2.8} />
                按需自选
              </span>
              <CardHead name={FLEX.name} active={isFlex} />
              <p className="mt-2 text-[24px] font-[850] text-[var(--text)] leading-none">按量计价</p>

              <div className="my-3.5 border-t border-dashed border-[var(--line)]" />

              <p className="text-[11.5px] text-[var(--muted)]">到账积分</p>
              <p className="mt-1 text-[13px] font-extrabold text-[var(--muted)] leading-snug">
                点击后在下方拖动选择
              </p>
              <span className="mt-2 inline-flex h-[20px] px-2 rounded-full bg-[var(--lime-soft)] text-[#3f6212] text-[10.5px] font-extrabold items-center tabular-nums">
                低至 ¥{FLEX.tiers[FLEX.tiers.length - 1].unit.toFixed(4)}/积分
              </span>

              <p className="mt-3.5 text-[11.5px] text-[var(--muted-2)] leading-relaxed">{FLEX.desc}</p>
            </button>
          </div>

          {/* 已选 + 确认 */}
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-[11.5px] text-[var(--muted)]">已选择</p>
                  <p className="mt-1 text-[19px] font-[850] text-[var(--text)]">
                    {isFlex ? FLEX.name : pack!.name}
                  </p>
                </div>
                <span className="h-[24px] px-2.5 rounded-full bg-[var(--lime-soft)] text-[#3f6212] text-[11px] font-extrabold flex items-center shrink-0">
                  一次性购买 · 永久有效
                </span>
              </div>

              {/* 弹性档:横向拖动选择 */}
              {isFlex && (
                <div className="mb-5 pb-5 border-b border-[var(--line)]">
                  <CreditSlider
                    value={flexCredits}
                    onChange={setFlexCredits}
                    min={FLEX.min}
                    max={FLEX.max}
                    step={FLEX.step}
                    ticks={FLEX_TICKS}
                  />
                </div>
              )}

              <div className="grid grid-cols-4 gap-2.5">
                <MiniStat icon={Coins} label="到账积分" value={fmt(credits)} />
                <MiniStat
                  icon={Gift}
                  label={isFlex ? "平均单价" : "赠送积分"}
                  value={isFlex ? `¥${unit}` : `+${fmt(bonus)}`}
                />
                <MiniStat icon={Play} label="约可生成15s视频" value={`${fmt(videosFrom(credits))} 条`} />
                <MiniStat icon={Sparkles} label="约可生成图片" value={`${fmt(imagesFrom(credits))} 张`} />
              </div>

              <p className="mt-4 rounded-lg bg-[var(--soft-2)] border border-[var(--line)] px-3.5 py-3 text-[11.5px] leading-relaxed text-[var(--muted)]">
                {isFlex
                  ? (() => {
                      const next = flexNextTier(flexCredits)
                      return next && next.upTo < FLEX.max
                        ? `超过 ${fmt(next.upTo)} 积分的部分按更低单价计费，买得越多均价越低。约可生成量以 Seedance 2.0-720P 为例，实际消耗以生成参数为准。`
                        : "已享最优均价。约可生成量以 Seedance 2.0-720P 为例，实际消耗以生成参数为准。"
                    })()
                  : "到账积分 = 购买积分 + 赠送积分。约可生成量以 Seedance 2.0-720P 为例，实际消耗以生成参数为准。"}
              </p>
            </div>

            {/* 确认面板 */}
            <div className="rounded-2xl border-2 border-[var(--lime)] bg-[#fbffee] p-5">
              <p className="text-[13px] font-extrabold text-[var(--text)]">充值确认</p>

              <div className="mt-4 flex items-end justify-between gap-3">
                <span className="text-[12.5px] text-[var(--muted)] pb-1.5">实付金额</span>
                <span className="text-[34px] font-[850] text-[var(--text)] tabular-nums leading-none">
                  ¥{fmt(amount)}
                </span>
              </div>

              <div className="my-4 border-t border-[#dff0a8]" />

              <ul className="space-y-2.5">
                <ConfirmRow label="到账积分" value={fmt(credits)} />
                {!isFlex && <ConfirmRow label="其中赠送" value={`+${fmt(bonus)}`} lime />}
                <ConfirmRow label="有效期" value="永久有效" />
              </ul>

              <button
                type="button"
                className="mt-5 h-12 w-full rounded-xl bg-[var(--near-black)] text-white text-[14px] font-extrabold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <CreditCard size={15} strokeWidth={2.2} />
                立即充值
              </button>

              <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--muted-2)]">
                <Info size={11} strokeWidth={2.2} className="shrink-0 mt-0.5" />
                加量积分永久有效，随时可用；购买后不支持退款。
              </p>
            </div>
          </div>

          <div className="mt-6">
            <ContactSales />
          </div>
        </div>
      </main>
    </>
  )
}

// ─── 小组件 ──────────────────────────────────────────────────────────────────

function CardHead({ name, active }: { name: string; active: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-[13px] font-extrabold text-[var(--text)]">{name}</p>
      <span
        className={cn(
          "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
          active ? "border-[#20251a] bg-[#20251a]" : "border-[var(--line-strong)]"
        )}
      >
        {active && <Check size={11} strokeWidth={3.2} className="text-[var(--lime)]" />}
      </span>
    </div>
  )
}

function MiniStat({
  icon: Icon, label, value,
}: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--soft-2)] px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
        <Icon size={11} strokeWidth={2.2} className="shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1.5 text-[15px] font-extrabold text-[var(--text)] tabular-nums leading-none">{value}</p>
    </div>
  )
}

function ConfirmRow({ label, value, lime }: { label: string; value: string; lime?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 text-[12.5px]">
      <span className="text-[var(--muted)]">{label}</span>
      <span className={cn("font-extrabold tabular-nums", lime ? "text-[#3f6212]" : "text-[var(--text)]")}>
        {value}
      </span>
    </li>
  )
}
