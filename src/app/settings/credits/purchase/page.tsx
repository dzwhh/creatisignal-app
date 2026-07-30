"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft, Sparkles, Check, Coins, Gift, Clock3, Play, CreditCard, Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Topbar } from "@/components/layout/topbar"
import { CreditGauge } from "@/components/credits/credit-gauge"
import { ContactSales } from "@/components/credits/contact-sales"
import {
  CREDIT_PACKS, CREDIT_TOTAL, FLEX, COST,
  flexPrice, flexUnitPrice, flexNextTier, videosFrom, imagesFrom, fmt,
  type CreditPack,
} from "@/lib/credits/data"

type Tab = "packs" | "flex"

const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "packs", label: "月度套餐",  hint: "按档位一次购买，赠送比例更高" },
  { id: "flex",  label: "按需自选",  hint: "拖动选择数量，用多少买多少" },
]

export default function PurchaseCreditsPage() {
  const [tab, setTab] = useState<Tab>("packs")
  const [packId, setPackId] = useState(CREDIT_PACKS[0].id)
  const [flexCredits, setFlexCredits] = useState(1_000)

  const pack = CREDIT_PACKS.find((p) => p.id === packId) ?? CREDIT_PACKS[0]

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

          <h1 className="text-[26px] font-[850] leading-snug text-[var(--text)] mb-5">购买积分</h1>

          {/* Hero */}
          <section className="relative overflow-hidden rounded-2xl bg-[#1a1f14] px-7 py-7 mb-6">
            <div className="pointer-events-none absolute -right-20 -top-28 h-[320px] w-[320px] rounded-full bg-[radial-gradient(closest-side,rgba(201,255,41,0.16),transparent)]" />
            <div className="relative flex items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 h-[26px] px-3 rounded-full bg-[var(--lime)] text-[#20251a] text-[12px] font-extrabold">
                  <Sparkles size={12} strokeWidth={2.6} />
                  积分加量包
                </span>
                <h2 className="mt-4 text-[24px] font-[850] text-white leading-tight">
                  创作不中断，积分随用随充
                </h2>
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

          {/* Tabs */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="inline-flex h-10 items-center rounded-lg bg-[var(--soft)] p-1 gap-0.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  data-state={tab === t.id ? "active" : "inactive"}
                  className={cn(
                    "h-8 px-4 rounded-md text-[13px] font-extrabold transition cursor-pointer",
                    tab === t.id
                      ? "bg-white text-[var(--text)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-[12.5px] text-[var(--muted-2)]">
              {TABS.find((t) => t.id === tab)!.hint}
            </p>
          </div>

          {tab === "packs" ? (
            <PacksTab pack={pack} packId={packId} onSelect={setPackId} />
          ) : (
            <FlexTab credits={flexCredits} onChange={setFlexCredits} />
          )}

          <div className="mt-6">
            <ContactSales />
          </div>
        </div>
      </main>
    </>
  )
}

// ─── 月度套餐 ────────────────────────────────────────────────────────────────

function PacksTab({
  pack, packId, onSelect,
}: { pack: CreditPack; packId: string; onSelect: (id: string) => void }) {
  const total = pack.base + pack.bonus
  return (
    <>
      <h3 className="text-[14px] font-extrabold text-[var(--text)] mb-3">选择加量包</h3>
      <div className="grid grid-cols-4 gap-3.5">
        {CREDIT_PACKS.map((p) => {
          const active = p.id === packId
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
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
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-extrabold text-[var(--text)]">{p.name}</p>
                <span
                  className={cn(
                    "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
                    active ? "border-[#20251a] bg-[#20251a]" : "border-[var(--line-strong)]"
                  )}
                >
                  {active && <Check size={11} strokeWidth={3.2} className="text-[var(--lime)]" />}
                </span>
              </div>
              <p className="mt-2 text-[24px] font-[850] text-[var(--text)] tabular-nums leading-none">
                ¥{fmt(p.price)}
                {p.from && <span className="ml-1 text-[13px] font-bold">起</span>}
              </p>

              <div className="my-3.5 border-t border-dashed border-[var(--line)]" />

              <p className="text-[11.5px] text-[var(--muted)]">到账积分</p>
              <p className="mt-1 text-[17px] font-extrabold text-[var(--text)] tabular-nums leading-none">
                {fmt(p.base + p.bonus)}
              </p>
              <span className="mt-2 inline-flex h-[20px] px-2 rounded-full bg-[var(--lime-soft)] text-[#3f6212] text-[10.5px] font-extrabold items-center tabular-nums">
                含赠送 +{fmt(p.bonus)}
              </span>

              <p className="mt-3.5 text-[11.5px] text-[var(--muted-2)] leading-relaxed">{p.desc}</p>
            </button>
          )
        })}
      </div>

      {/* 已选 + 确认 */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[11.5px] text-[var(--muted)]">已选择</p>
              <p className="mt-1 text-[19px] font-[850] text-[var(--text)]">{pack.name}</p>
            </div>
            <span className="h-[24px] px-2.5 rounded-full bg-[var(--lime-soft)] text-[#3f6212] text-[11px] font-extrabold flex items-center shrink-0">
              一次性充值
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <MiniStat icon={Coins}  label="购买积分"     value={fmt(pack.base)} />
            <MiniStat icon={Gift}   label="赠送积分"     value={`+${fmt(pack.bonus)}`} />
            <MiniStat icon={Clock3} label="预计到账秒数" value={`${Math.round(total * COST.secPerCredit)}s`} />
            <MiniStat icon={Play}   label="约可生成15s视频" value={`${videosFrom(total)} 条`} />
          </div>

          <p className="mt-4 rounded-lg bg-[var(--soft-2)] border border-[var(--line)] px-3.5 py-3 text-[11.5px] leading-relaxed text-[var(--muted)]">
            到账积分 = 购买积分 + 赠送积分。预计到账秒数与约可生成 15s 视频均以 Seedance 2.0-720P 为例，实际消耗以生成参数为准。
          </p>
        </div>

        <ConfirmPanel
          amount={pack.price}
          rows={[
            { label: "到账积分", value: fmt(total) },
            { label: "其中赠送", value: `+${fmt(pack.bonus)}`, lime: true },
          ]}
        />
      </div>
    </>
  )
}

// ─── 按需自选 ────────────────────────────────────────────────────────────────

function FlexTab({ credits, onChange }: { credits: number; onChange: (v: number) => void }) {
  const price = flexPrice(credits)
  const unit = flexUnitPrice(credits)
  const nextTier = flexNextTier(credits)

  return (
    <>
      <h3 className="text-[14px] font-extrabold text-[var(--text)] mb-3">选择积分数量</h3>
      <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          <div className="flex flex-col items-center pt-1">
            <CreditGauge
              value={credits}
              onChange={onChange}
              min={FLEX.min}
              max={FLEX.max}
              step={FLEX.step}
              theme="light"
            />
            <span className="mt-3 inline-flex items-center gap-1.5 h-[28px] px-3.5 rounded-full bg-[var(--lime-soft)] text-[#3f6212] text-[12px] font-extrabold tabular-nums">
              <Sparkles size={12} strokeWidth={2.6} />
              均价 ¥{unit}/积分
            </span>
            <p className="mt-2 text-[12px] text-[var(--muted-2)]">拖动选择积分数量</p>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2.5">
            <MiniStat icon={Coins}  label="购买积分"       value={fmt(credits)} />
            <MiniStat icon={Play}   label="约可生成15s视频" value={`${videosFrom(credits)} 条`} />
            <MiniStat icon={Sparkles} label="约可生成图片"  value={`${fmt(imagesFrom(credits))} 张`} />
            <MiniStat icon={Clock3} label="预计到账秒数"    value={`${Math.round(credits * COST.secPerCredit)}s`} />
          </div>

          <p className="mt-4 rounded-lg bg-[var(--soft-2)] border border-[var(--line)] px-3.5 py-3 text-[11.5px] leading-relaxed text-[var(--muted)]">
            {nextTier
              ? `超过 ${fmt(nextTier.upTo)} 积分的部分按更低单价计费，买得越多均价越低。按需自选为一次性充值，积分永不过期，需在订阅有效期内使用。`
              : "已享最优均价。按需自选为一次性充值，积分永不过期，需在订阅有效期内使用。"}
          </p>
        </div>

        <ConfirmPanel
          amount={price}
          rows={[
            { label: "到账积分", value: fmt(credits) },
            { label: "平均单价", value: `¥${unit}/积分` },
          ]}
        />
      </div>
    </>
  )
}

// ─── 共用小组件 ──────────────────────────────────────────────────────────────

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

function ConfirmPanel({
  amount, rows,
}: { amount: number; rows: { label: string; value: string; lime?: boolean }[] }) {
  return (
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
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-3 text-[12.5px]">
            <span className="text-[var(--muted)]">{r.label}</span>
            <span className={cn("font-extrabold tabular-nums", r.lime ? "text-[#3f6212]" : "text-[var(--text)]")}>
              {r.value}
            </span>
          </li>
        ))}
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
        加量积分永不过期，但需在订阅有效期内使用；购买后不支持退款。
      </p>
    </div>
  )
}
