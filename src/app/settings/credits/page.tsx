"use client"

import { useState } from "react"
import Link from "next/link"
import { Sparkles, Wallet, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Topbar } from "@/components/layout/topbar"
import {
  CREDIT_BALANCE,
  CREDIT_LEDGER,
  CREDIT_TOTAL,
  fmt,
  type CreditTx,
} from "@/lib/credits/data"

type LedgerFilter = "all" | "spend" | "earn"

const FILTERS: { id: LedgerFilter; label: string }[] = [
  { id: "all",   label: "全部" },
  { id: "spend", label: "消耗" },
  { id: "earn",  label: "获得" },
]

export default function CreditsPage() {
  const [filter, setFilter] = useState<LedgerFilter>("all")

  const rows = CREDIT_LEDGER.filter((t: CreditTx) =>
    filter === "all" ? true : filter === "spend" ? t.delta < 0 : t.delta > 0
  )

  return (
    <>
      <Topbar title="积分" />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[960px] mx-auto px-8 py-7 pb-16">
          {/* 页头 */}
          <div className="mb-6">
            <h1 className="text-[24px] font-[850] leading-snug text-[var(--text)] flex items-center gap-2">
              积分
              <Info size={14} strokeWidth={2} className="text-[var(--muted-2)]" />
            </h1>
            <p className="mt-1.5 text-[14px] text-[var(--muted)]">
              查看积分余额、购买充值积分与最近的积分明细。
            </p>
          </div>

          {/* 积分余额 */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 mb-5">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-[14px] font-extrabold text-[var(--text)] flex items-center gap-2">
                <Sparkles size={15} strokeWidth={2} className="text-[var(--muted)]" />
                积分余额
              </h2>
              <Link
                href="/settings/credits/purchase"
                className="h-[34px] rounded-full bg-[var(--lime)] text-[#20251a] px-[18px] text-[13px] font-extrabold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                <Sparkles size={13} strokeWidth={2.4} />
                加量包
              </Link>
            </div>

            {/* 剩余 = 赠送 + 充值 */}
            <div className="flex items-center justify-center gap-8 pb-2">
              <BalanceCol label="剩余积分" value={CREDIT_TOTAL} />
              <Operator>=</Operator>
              <BalanceCol label="赠送积分" value={CREDIT_BALANCE.gift} />
              <Operator>+</Operator>
              <BalanceCol label="充值积分" value={CREDIT_BALANCE.paid} />
            </div>
          </section>

          {/* 积分流水 */}
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5">
            <h2 className="text-[14px] font-extrabold text-[var(--text)] flex items-center gap-2 mb-4">
              <Wallet size={15} strokeWidth={2} className="text-[var(--muted)]" />
              积分流水
            </h2>

            {/* 筛选 */}
            <div className="flex items-center gap-1 rounded-lg bg-[var(--soft)] p-1 mb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  data-state={filter === f.id ? "active" : "inactive"}
                  className={cn(
                    "h-8 px-4 rounded-md text-[13px] font-bold transition cursor-pointer",
                    filter === f.id
                      ? "bg-white text-[var(--text)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {rows.length > 0 ? (
              <ul className="divide-y divide-[var(--line)]">
                {rows.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-[var(--text)]">{t.title}</p>
                      <p className="mt-1 text-[12px] text-[var(--muted-2)] tabular-nums">{t.ts}</p>
                    </div>
                    <span
                      className={cn(
                        "text-[15px] font-extrabold tabular-nums shrink-0",
                        t.delta > 0 ? "text-[#2563eb]" : "text-[var(--text)]"
                      )}
                    >
                      {t.delta > 0 ? "+" : "-"}{fmt(Math.abs(t.delta))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-14 text-center text-[13px] text-[var(--muted-2)]">
                暂无{filter === "spend" ? "消耗" : "获得"}记录
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}

function BalanceCol({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-[12.5px] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-[34px] font-[850] leading-none text-[var(--text)] tabular-nums tracking-tight">
        {fmt(value)}
      </p>
    </div>
  )
}

function Operator({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[22px] font-bold text-[var(--muted-2)] pt-6 select-none">{children}</span>
  )
}
