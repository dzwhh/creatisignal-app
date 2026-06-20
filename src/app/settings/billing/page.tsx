"use client"

import { useState } from "react"
import { CheckCircle2, CreditCard, Download, MapPin, Receipt, ScrollText, Sparkles } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { cn } from "@/lib/utils"

type Invoice = {
  id: string
  date: string
  amount: string
  status: "paid" | "pending" | "failed"
}

const INVOICES: Invoice[] = [
  { id: "INV-2026-06", date: "2026-06-15", amount: "$39.00", status: "paid"    },
  { id: "INV-2026-05", date: "2026-05-15", amount: "$39.00", status: "paid"    },
  { id: "INV-2026-04", date: "2026-04-15", amount: "$39.00", status: "paid"    },
  { id: "INV-2026-03", date: "2026-03-15", amount: "$39.00", status: "paid"    },
  { id: "INV-2026-02", date: "2026-02-15", amount: "$39.00", status: "paid"    },
  { id: "INV-2026-01", date: "2026-01-15", amount: "$39.00", status: "paid"    },
  { id: "INV-2025-12", date: "2025-12-15", amount: "$0.00",  status: "pending" },
  { id: "INV-2025-11", date: "2025-11-15", amount: "$0.00",  status: "failed"  },
]

const STATUS_META: Record<Invoice["status"], { label: string; bg: string; color: string }> = {
  paid:    { label: "已支付", bg: "#dcfce7", color: "#15803d" },
  pending: { label: "待支付", bg: "#fef3c7", color: "#a16207" },
  failed:  { label: "失败",   bg: "#fee2e2", color: "#b91c1c" },
}

export default function BillingPage() {
  const [address, setAddress] = useState({
    line1: "200 Spear St",
    city:  "San Francisco",
    state: "CA",
    zip:   "94105",
    country: "United States",
  })

  return (
    <>
      <Topbar title="账单" />
      <SettingsShell title="账单" subtitle="管理你的订阅、支付方式与账单地址。">
        {/* 当前套餐 */}
        <SettingsCard icon={Sparkles} title="当前套餐">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center h-5 px-1.5 rounded-md bg-[#dbeafe] text-[#1d4ed8] text-[10.5px] font-extrabold">CURRENT</span>
                <h3 className="text-[16px] font-extrabold text-[var(--text)]">Pro Monthly</h3>
              </div>
              <p className="text-[28px] font-extrabold text-[var(--text)] leading-none mt-1">
                $39<span className="text-[13px] text-[var(--muted-2)] font-bold ml-1">/ 月</span>
              </p>
              <p className="text-[11.5px] text-[var(--muted)] mt-2">下次扣费日 · <span className="font-extrabold text-[var(--text)]">2026-07-15</span></p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <RainbowButton type="button" className="h-9 px-4 rounded-full text-[12.5px]">
                立即升级到 Team
                <Sparkles size={12} strokeWidth={2.4} className="ml-1.5" />
              </RainbowButton>
              <button
                type="button"
                className="h-9 px-3.5 rounded-full text-[12px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
              >
                取消订阅
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[11.5px]">
            {[
              "200 视频生成 / 月",
              "1000 图片生成 / 月",
              "GPT-5 + Claude Sonnet 4.6",
              "20,000 API 调用 / 月",
              "100 GB 存储",
              "邮件 + 站内通知",
            ].map((b) => (
              <div key={b} className="flex items-center gap-1.5 text-[var(--muted)]">
                <CheckCircle2 size={11} className="text-[#16a34a]" />
                {b}
              </div>
            ))}
          </div>
        </SettingsCard>

        {/* 支付方式 */}
        <SettingsCard
          icon={CreditCard}
          title="支付方式"
          description="主卡用于每月自动续费。"
          actions={
            <button
              type="button"
              className="h-8 px-3 rounded-full border border-[var(--line)] text-[11.5px] font-bold text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
            >
              + 添加支付方式
            </button>
          }
        >
          <div className="rounded-lg border border-[var(--line)] bg-[var(--soft-2)] p-3 flex items-center gap-3">
            <div className="w-10 h-7 rounded-md bg-gradient-to-r from-[#1a1f71] to-[#2236bf] flex items-center justify-center text-white text-[10px] font-extrabold tracking-wide shrink-0">
              VISA
            </div>
            <div className="flex-1">
              <p className="text-[12.5px] font-extrabold text-[var(--text)] font-mono">
                <span className="tracking-[0.2em]">···· ···· ····</span> 4242
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">Alex Deng · 12/2028</p>
            </div>
            <span className="inline-flex items-center h-5 px-1.5 rounded-md bg-[#dcfce7] text-[#15803d] text-[10.5px] font-extrabold">默认</span>
          </div>
        </SettingsCard>

        {/* 账单地址 */}
        <SettingsCard
          icon={MapPin}
          title="账单地址"
          description="发票将显示此地址。"
          actions={
            <button
              type="button"
              className="h-8 px-3 rounded-full bg-[#18181b] text-white text-[11.5px] font-extrabold cursor-pointer hover:opacity-90"
            >
              保存
            </button>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <BillingField label="街道" value={address.line1} onChange={(v) => setAddress((p) => ({ ...p, line1: v }))} />
            <BillingField label="城市" value={address.city}  onChange={(v) => setAddress((p) => ({ ...p, city: v }))} />
            <BillingField label="州 / 省" value={address.state} onChange={(v) => setAddress((p) => ({ ...p, state: v }))} />
            <BillingField label="邮编"    value={address.zip}   onChange={(v) => setAddress((p) => ({ ...p, zip: v }))} />
            <BillingField label="国家 / 地区" value={address.country} onChange={(v) => setAddress((p) => ({ ...p, country: v }))} fullWidth />
          </div>
        </SettingsCard>

        {/* 历史账单 */}
        <SettingsCard icon={ScrollText} title="历史账单" description="点击下载 PDF 发票。" noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5">发票号</th>
                  <th className="text-left px-5 py-2.5">日期</th>
                  <th className="text-right px-5 py-2.5">金额</th>
                  <th className="text-center px-5 py-2.5">状态</th>
                  <th className="text-right px-5 py-2.5">操作</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv, i) => {
                  const meta = STATUS_META[inv.status]
                  return (
                    <tr key={inv.id} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                      <td className="px-5 py-2.5 font-mono text-[var(--text)] font-bold">{inv.id}</td>
                      <td className="px-5 py-2.5 text-[var(--muted)]">{inv.date}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums font-extrabold text-[var(--text)]">{inv.amount}</td>
                      <td className="px-5 py-2.5 text-center">
                        <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold" style={{ backgroundColor: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center gap-1 h-7 px-2.5 rounded-md text-[11px] font-bold cursor-pointer",
                            inv.status === "paid"
                              ? "border border-[var(--line)] text-[var(--text)] hover:bg-[var(--soft-2)]"
                              : "text-[var(--muted-2)] cursor-not-allowed"
                          )}
                          disabled={inv.status !== "paid"}
                        >
                          <Download size={10} strokeWidth={2.6} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SettingsCard>

        <div className="rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] px-4 py-3 flex items-center gap-3">
          <Receipt size={14} className="text-[var(--muted)] shrink-0" />
          <p className="text-[12px] text-[var(--muted)] leading-relaxed flex-1">
            支付有问题？联系 <a href="mailto:billing@creatisignal.com" className="text-[var(--text)] font-bold underline decoration-dotted underline-offset-2">billing@creatisignal.com</a>，平均 1 个工作日内回复。
          </p>
        </div>
      </SettingsShell>
    </>
  )
}

function BillingField({
  label,
  value,
  onChange,
  fullWidth,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? "col-span-2" : undefined}>
      <p className="text-[11.5px] font-bold text-[var(--text)] mb-1">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[var(--text)]"
      />
    </div>
  )
}
